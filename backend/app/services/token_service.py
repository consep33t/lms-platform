import secrets
import string
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.token import ModuleToken, TokenUsage


def _random_code(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


class TokenService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_code(self, token_code: str) -> ModuleToken | None:
        stmt = select(ModuleToken).where(ModuleToken.token_code == token_code.strip().upper())
        return (await self.db.execute(stmt)).scalar_one_or_none()

    async def validate(
        self,
        token_code: str,
        module_id: int | None = None,
    ) -> tuple[bool, str, ModuleToken | None]:
        """
        Returns (is_valid, reason_message, token_obj).
        Checks: exists → active → not expired → uses not exceeded → optional module_id match.
        """
        token = await self.get_by_code(token_code)
        if not token:
            return False, "Token tidak ditemukan.", None
        if not token.is_active:
            return False, "Token sudah dinonaktifkan.", None
        if token.expired_at < datetime.utcnow():
            return False, "Token sudah kadaluarsa.", None
        if token.max_uses > 0 and token.current_uses >= token.max_uses:
            return False, "Token sudah mencapai batas penggunaan.", None
        if module_id is not None and token.module_id != module_id:
            return False, "Token tidak valid untuk modul ini.", None
        return True, "Token valid.", token

    async def redeem(self, token: ModuleToken, user_id: int) -> TokenUsage:
        """Consume one use of the token and create a usage record."""
        # Check if this user already used this token
        stmt = select(TokenUsage).where(
            TokenUsage.token_id == token.id,
            TokenUsage.user_id == user_id,
        )
        existing = (await self.db.execute(stmt)).scalar_one_or_none()
        if existing:
            return existing  # Idempotent — return existing usage

        token.current_uses += 1
        usage = TokenUsage(token_id=token.id, user_id=user_id)
        self.db.add(usage)
        await self.db.flush()
        return usage

    async def generate_unique_code(self, length: int = 8, max_attempts: int = 10) -> str:
        """Generate a random token code guaranteed to be unique in DB."""
        for _ in range(max_attempts):
            code = _random_code(length)
            existing = await self.get_by_code(code)
            if not existing:
                return code
        raise RuntimeError("Gagal generate kode token unik setelah beberapa percobaan.")

    async def has_user_redeemed(self, module_id: int, user_id: int) -> bool:
        """Check if a user has already unlocked any token for this module."""
        stmt = (
            select(TokenUsage)
            .join(ModuleToken, ModuleToken.id == TokenUsage.token_id)
            .where(
                ModuleToken.module_id == module_id,
                TokenUsage.user_id == user_id,
            )
        )
        result = (await self.db.execute(stmt)).scalar_one_or_none()
        return result is not None