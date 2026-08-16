from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserSettings
from app.core.security import get_password_hash, verify_password


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> User | None:
        stmt = select(User).where(User.id == user_id, User.is_deleted == False)
        return (await self.db.execute(stmt)).scalar_one_or_none()

    async def update_profile(
        self,
        user: User,
        full_name: str | None = None,
        phone_number: str | None = None,
        institution: str | None = None,
        avatar_media_id: int | None = None,
    ) -> User:
        if full_name is not None:
            user.full_name = full_name
        if phone_number is not None:
            user.phone_number = phone_number
        if institution is not None:
            user.institution = institution
        if avatar_media_id is not None:
            user.avatar_media_id = avatar_media_id
        await self.db.flush()
        return user


    async def change_password(
        self,
        user: User,
        current_password: str,
        new_password: str,
    ) -> tuple[bool, str]:
        """Returns (success, message)."""
        if not verify_password(current_password, user.hashed_password):
            return False, "Password saat ini tidak sesuai."
        if len(new_password) < 8:
            return False, "Password baru minimal 8 karakter."
        user.hashed_password = get_password_hash(new_password)
        await self.db.flush()
        return True, "Password berhasil diubah."

    async def get_settings(self, user_id: int) -> UserSettings | None:
        stmt = select(UserSettings).where(UserSettings.user_id == user_id)
        return (await self.db.execute(stmt)).scalar_one_or_none()

    async def update_settings(
        self,
        user_id: int,
        **kwargs: bool | str | None,
    ) -> UserSettings:
        settings = await self.get_settings(user_id)
        if settings is None:
            settings = UserSettings(user_id=user_id)
            self.db.add(settings)
        for key, val in kwargs.items():
            if hasattr(settings, key) and val is not None:
                setattr(settings, key, val)
        await self.db.flush()
        return settings