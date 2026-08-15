from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.media import MediaFile, MediaStatus


class MediaRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, media_id: int) -> MediaFile | None:
        stmt = select(MediaFile).where(MediaFile.id == media_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def create(self, media: MediaFile) -> MediaFile:
        self.db.add(media)
        await self.db.flush()
        return media

    async def update_status(self, media_id: int, status: MediaStatus) -> None:
        stmt = update(MediaFile).where(MediaFile.id == media_id).values(status=status)
        await self.db.execute(stmt)
