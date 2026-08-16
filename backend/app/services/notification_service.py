from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.models.notification import Notification, NotificationType


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        user_id: int,
        title: str,
        body: str,
        notif_type: NotificationType = NotificationType.system,
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            type=notif_type,
            title=title,
            body=body,
            is_read=False,
        )
        self.db.add(notif)
        await self.db.flush()
        return notif

    async def get_for_user(
        self,
        user_id: int,
        limit: int = 50,
        unread_only: bool = False,
    ) -> list[Notification]:
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        if unread_only:
            stmt = stmt.where(Notification.is_read == False)
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_unread_count(self, user_id: int) -> int:
        stmt = select(func.count(Notification.id)).where(
            Notification.user_id == user_id,
            Notification.is_read == False,
        )
        return (await self.db.execute(stmt)).scalar() or 0

    async def mark_read(self, notification_id: int, user_id: int) -> bool:
        stmt = (
            update(Notification)
            .where(Notification.id == notification_id, Notification.user_id == user_id)
            .values(is_read=True)
        )
        result = await self.db.execute(stmt)
        return result.rowcount > 0

    async def mark_all_read(self, user_id: int) -> int:
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        result = await self.db.execute(stmt)
        return result.rowcount

    async def broadcast(
        self,
        user_ids: list[int],
        title: str,
        body: str,
        notif_type: NotificationType = NotificationType.system,
    ) -> int:
        """Send the same notification to multiple users at once."""
        for uid in user_ids:
            self.db.add(Notification(
                user_id=uid,
                type=notif_type,
                title=title,
                body=body,
                is_read=False,
            ))
        await self.db.flush()
        return len(user_ids)