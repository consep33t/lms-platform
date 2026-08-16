from typing import Any, Generic, TypeVar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Generic async CRUD repository. Inherit and set `model` class attribute."""

    model: type[ModelType]

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, record_id: int) -> ModelType | None:
        stmt = select(self.model).where(self.model.id == record_id)  # type: ignore[attr-defined]
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_all(
        self,
        *filters: Any,
        limit: int = 100,
        offset: int = 0,
        order_by: Any = None,
    ) -> list[ModelType]:
        stmt = select(self.model).where(*filters).offset(offset).limit(limit)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def count(self, *filters: Any) -> int:
        stmt = select(func.count(self.model.id)).where(*filters)  # type: ignore[attr-defined]
        res = await self.db.execute(stmt)
        return res.scalar() or 0

    async def create(self, instance: ModelType) -> ModelType:
        self.db.add(instance)
        await self.db.flush()
        await self.db.refresh(instance)
        return instance

    async def update_fields(self, instance: ModelType, **kwargs: Any) -> ModelType:
        for field, val in kwargs.items():
            setattr(instance, field, val)
        await self.db.flush()
        return instance

    async def delete(self, instance: ModelType) -> None:
        await self.db.delete(instance)
        await self.db.flush()