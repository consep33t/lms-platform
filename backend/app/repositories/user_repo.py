from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_
from app.models.user import User, RefreshToken, UserSettings
from datetime import datetime


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> User | None:
        stmt = select(User).where(User.id == user_id, User.is_deleted == False)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        clean_email = email.strip().lower()
        stmt = select(User).where(
            or_(
                User.email == clean_email,
                User.personal_email == clean_email,
                User.custom_lms_email == clean_email
            ),
            User.is_deleted == False
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_pending_approvals(self) -> list[User]:
        stmt = select(User).where(
            User.approval_status == "pending",
            User.is_deleted == False
        ).order_by(User.created_at.desc())
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_all_students(self) -> list[User]:
        stmt = select(User).where(
            User.is_deleted == False
        ).order_by(User.created_at.desc())
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.flush()
        # Create default user settings
        settings = UserSettings(user_id=user.id)
        self.db.add(settings)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def approve_user(self, user_id: int, admin_id: int) -> User | None:
        user = await self.get_by_id(user_id)
        if not user:
            return None
        user.is_approved = True
        user.is_active = True
        user.approval_status = "approved"
        user.approved_at = datetime.utcnow()
        user.approved_by = admin_id
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def reject_user(self, user_id: int, reason: str) -> User | None:
        user = await self.get_by_id(user_id)
        if not user:
            return None
        user.is_approved = False
        user.is_active = False
        user.approval_status = "rejected"
        user.rejection_reason = reason
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def save_refresh_token(self, token: RefreshToken) -> RefreshToken:
        self.db.add(token)
        await self.db.flush()
        return token

    async def get_refresh_token(self, token_str: str) -> RefreshToken | None:
        stmt = select(RefreshToken).where(
            RefreshToken.token == token_str,
            RefreshToken.is_revoked == False,
            RefreshToken.expires_at > datetime.utcnow()
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def revoke_refresh_token(self, token_str: str) -> None:
        stmt = update(RefreshToken).where(RefreshToken.token == token_str).values(is_revoked=True)
        await self.db.execute(stmt)
