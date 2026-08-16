from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.repositories.module_repo import ModuleRepository
from app.models.module import Module, ModuleStatus
from app.models.session import ModuleSession
from app.models.progress import UserModuleProgress, SessionProgress, ProgressStatus
from app.schemas.module import ModuleUserStatusResponse, SessionProgressStatus


class ModuleService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ModuleRepository(db)

    async def list_published_modules(self) -> list[Module]:
        return await self.repo.get_published()

    async def get_module_detail(self, module_id: int) -> Module:
        stmt = (
            select(Module)
            .options(
                selectinload(Module.sessions)
            )
            .where(Module.id == module_id, Module.is_deleted == False)
        )
        res = await self.db.execute(stmt)
        module = res.scalar_one_or_none()
        if not module:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modul tidak ditemukan")
        return module

    async def get_module_user_status(self, module_id: int, user_id: int) -> ModuleUserStatusResponse:
        module = await self.get_module_detail(module_id)

        # 1. Check user module progress
        stmt_ump = select(UserModuleProgress).where(
            UserModuleProgress.user_id == user_id,
            UserModuleProgress.module_id == module_id
        )
        ump = (await self.db.execute(stmt_ump)).scalar_one_or_none()

        is_unlocked = ump is not None
        overall_status = ump.status if ump else ProgressStatus.not_started

        # 2. Get all sessions for this module
        stmt_sess = (
            select(ModuleSession)
            .where(ModuleSession.module_id == module_id, ModuleSession.is_deleted == False)
            .order_by(ModuleSession.order)
        )
        sessions = list((await self.db.execute(stmt_sess)).scalars().all())
        total_sessions = len(sessions)

        # 3. Get session progress for each session
        session_statuses: list[SessionProgressStatus] = []
        completed_sessions_count = 0
        total_score = 0.0
        scored_sessions_count = 0

        if ump:
            stmt_sp = select(SessionProgress).where(
                SessionProgress.user_module_progress_id == ump.id
            )
            sp_records = list((await self.db.execute(stmt_sp)).scalars().all())
            sp_map = {sp.session_id: sp for sp in sp_records}
        else:
            sp_map = {}

        for s in sessions:
            sp = sp_map.get(s.id)
            is_comp = (sp.status == ProgressStatus.completed) if sp else False
            sess_score = sp.score if sp else None
            if is_comp:
                completed_sessions_count += 1
            if sess_score is not None:
                total_score += sess_score
                scored_sessions_count += 1

            session_statuses.append(SessionProgressStatus(
                session_id=s.id,
                title=s.title,
                order=s.order,
                duration_minutes=s.duration_minutes,
                is_completed=is_comp,
                score=sess_score
            ))

        progress_percent = round((completed_sessions_count / total_sessions * 100.0), 1) if total_sessions > 0 else 0.0
        avg_score = round(total_score / scored_sessions_count, 1) if scored_sessions_count > 0 else 0.0

        if progress_percent >= 100.0:
            overall_status = ProgressStatus.completed

        return ModuleUserStatusResponse(
            module_id=module_id,
            is_unlocked=is_unlocked,
            status=overall_status,
            progress_percent=progress_percent,
            sessions_completed=completed_sessions_count,
            total_sessions=total_sessions,
            average_score=avg_score,
            certificate_url=f"/certificates/mod_{module_id}_user_{user_id}.pdf" if progress_percent >= 100.0 else None,
            sessions=session_statuses
        )

    async def verify_and_unlock_token(
        self, token_code: str, user_id: int, target_module_id: int | None = None
    ) -> dict:
        from app.services.token_service import TokenService
        from app.services.notification_service import NotificationService
        from app.models.notification import NotificationType

        token_svc = TokenService(self.db)
        is_valid, reason, token = await token_svc.validate(token_code, module_id=target_module_id)
        if not is_valid or not token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=reason)

        # Redeem token (increments count and records usage idempotently)
        await token_svc.redeem(token, user_id)

        # Eagerly load module title if needed
        stmt_m = select(Module).where(Module.id == token.module_id)
        module = (await self.db.execute(stmt_m)).scalar_one_or_none()
        module_title = module.title if module else f"Modul #{token.module_id}"

        # Check or create user module progress
        stmt = select(UserModuleProgress).where(
            UserModuleProgress.user_id == user_id,
            UserModuleProgress.module_id == token.module_id
        )
        res = await self.db.execute(stmt)
        progress = res.scalar_one_or_none()

        if not progress:
            progress = UserModuleProgress(
                user_id=user_id,
                module_id=token.module_id,
                status=ProgressStatus.in_progress,
                started_at=datetime.utcnow()
            )
            self.db.add(progress)

        # Dispatch in-app notification
        notif_svc = NotificationService(self.db)
        await notif_svc.create(
            user_id=user_id,
            title="Akses Modul Terbuka",
            body=f"Selamat! Token berhasil diverifikasi. Akses ke materi modul '{module_title}' telah terbuka.",
            notif_type=NotificationType.system,
        )

        await self.db.flush()

        return {
            "valid": True,
            "module_id": token.module_id,
            "module_title": module_title,
            "message": f"Token berhasil diverifikasi! Akses modul '{module_title}' telah terbuka."
        }

