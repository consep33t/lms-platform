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

        for s in sessions:
            is_comp = False
            sess_score = None

            if ump:
                stmt_sp = select(SessionProgress).where(
                    SessionProgress.user_module_progress_id == ump.id,
                    SessionProgress.session_id == s.id
                )
                sp = (await self.db.execute(stmt_sp)).scalar_one_or_none()
                if sp:
                    is_comp = (sp.status == ProgressStatus.completed)
                    sess_score = sp.score
                    if is_comp:
                        completed_sessions_count += 1
                    if sp.score is not None:
                        total_score += sp.score
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
        token = await self.repo.get_token_by_code(token_code)
        if not token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token tidak valid atau telah kadaluarsa")

        if not token.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token ini telah dinonaktifkan")

        if token.expired_at and token.expired_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Masa berlaku token ini telah kadaluarsa")

        if token.max_uses > 0 and token.current_uses >= token.max_uses:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Batas kuota penggunaan token ini telah habis")

        # Strict Module Verification
        if target_module_id is not None and token.module_id != target_module_id:
            token_mod_title = token.module.title if token.module else f"Modul #{token.module_id}"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Token '{token_code}' bukan untuk modul ini, melainkan khusus untuk '{token_mod_title}'."
            )

        # Record usage in database
        await self.repo.record_token_usage(token, user_id)

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

        return {
            "valid": True,
            "module_id": token.module_id,
            "module_title": token.module.title if token.module else f"Modul #{token.module_id}",
            "message": f"Token berhasil diverifikasi! Akses modul '{token.module.title if token.module else ''}' telah terbuka."
        }
