import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.token import ModuleToken
from app.schemas.token import TokenGenerateRequest, TokenResponse

router = APIRouter()


def generate_random_token(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


@router.get("", response_model=list[TokenResponse])
async def list_tokens(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ModuleToken).order_by(ModuleToken.created_at.desc())
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.post("", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def create_token(
    req: TokenGenerateRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    code = req.token_code.strip().upper() if req.token_code else generate_random_token(8)
    token = ModuleToken(
        module_id=req.module_id,
        token_code=code,
        max_uses=req.max_uses,
        expired_at=req.expired_at,
        created_by=admin.id
    )
    db.add(token)
    await db.flush()
    return token


@router.put("/{token_id}/toggle-status", response_model=TokenResponse)
async def toggle_token_status(
    token_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ModuleToken).where(ModuleToken.id == token_id)
    res = await db.execute(stmt)
    token = res.scalar_one_or_none()
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token tidak ditemukan")
    token.is_active = not token.is_active
    return token
