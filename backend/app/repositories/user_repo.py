from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
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
        stmt = select(User).where(User.email == email.lower(), User.is_deleted == False)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.flush()
        # Create default user settings
        settings = UserSettings(user_id=user.id)
        self.db.add(settings)
        return user

    async def save_refresh_token(self, token: RefreshToken) -> RefreshToken:
        self.db.add(token)
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
