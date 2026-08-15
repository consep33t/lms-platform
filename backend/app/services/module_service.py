from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.module_repo import ModuleRepository
from app.models.module import Module
from app.models.progress import UserModuleProgress, ProgressStatus
from sqlalchemy import select
from datetime import datetime


class ModuleService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ModuleRepository(db)

    async def list_published_modules(self) -> list[Module]:
        return await self.repo.get_published()

    async def get_module_detail(self, module_id: int) -> Module:
        module = await self.repo.get_by_id(module_id)
        if not module:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modul tidak ditemukan")
        return module

    async def verify_and_unlock_token(self, token_code: str, user_id: int) -> dict:
        token = await self.repo.get_token_by_code(token_code)
        if not token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token tidak valid atau telah kadaluarsa")

        if token.max_uses > 0 and token.current_uses >= token.max_uses:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Batas kuota penggunaan token ini telah habis")

        # Record usage
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
            "module_id": token.module.id,
            "module_title": token.module.title,
            "message": "Token berhasil diverifikasi! Akses modul telah terbuka."
        }
