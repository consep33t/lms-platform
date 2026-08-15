from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.models.module import Module, ModuleStatus
from app.models.token import ModuleToken, TokenUsage
from datetime import datetime


class ModuleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_published(self) -> list[Module]:
        stmt = (
            select(Module)
            .where(Module.status == ModuleStatus.published, Module.is_deleted == False)
            .order_by(Module.order)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_by_id(self, module_id: int) -> Module | None:
        stmt = (
            select(Module)
            .options(selectinload(Module.sessions))
            .where(Module.id == module_id, Module.is_deleted == False)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_token_by_code(self, token_code: str) -> ModuleToken | None:
        stmt = (
            select(ModuleToken)
            .options(selectinload(ModuleToken.module))
            .where(
                ModuleToken.token_code == token_code.strip().upper(),
                ModuleToken.is_active == True,
                ModuleToken.expired_at > datetime.utcnow()
            )
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def record_token_usage(self, token: ModuleToken, user_id: int) -> None:
        token.current_uses += 1
        usage = TokenUsage(token_id=token.id, user_id=user_id)
        self.db.add(usage)
