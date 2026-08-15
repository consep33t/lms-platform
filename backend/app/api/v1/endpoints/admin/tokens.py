import secrets
import string
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.token import ModuleToken
from app.models.module import Module
from app.schemas.token import TokenGenerateRequest, TokenResponse

router = APIRouter()


def generate_random_token(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


@router.get("", response_model=list[TokenResponse])
async def list_all_tokens(
    module_id: int | None = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ModuleToken)
    if module_id:
        stmt = stmt.where(ModuleToken.module_id == module_id)
    stmt = stmt.order_by(ModuleToken.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def generate_token(
    data: TokenGenerateRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    module = await db.get(Module, data.module_id)
    if not module or module.is_deleted:
        raise HTTPException(status_code=404, detail="Modul tidak ditemukan")

    token_code = data.token_code.strip().upper() if data.token_code else generate_random_token()

    # Check collision
    existing = await db.scalar(select(ModuleToken).where(ModuleToken.token_code == token_code))
    if existing:
        raise HTTPException(status_code=400, detail="Kode token sudah digunakan. Gunakan kode lain.")

    token = ModuleToken(
        module_id=data.module_id,
        token_code=token_code,
        max_uses=data.max_uses,
        current_uses=0,
        expired_at=data.expired_at,
        is_active=True,
        created_by=admin.id,
    )
    db.add(token)
    await db.commit()
    await db.refresh(token)
    return token


@router.patch("/{token_id}/deactivate", response_model=TokenResponse)
async def deactivate_token(
    token_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    token = await db.get(ModuleToken, token_id)
    if not token:
        raise HTTPException(status_code=404, detail="Token tidak ditemukan")

    token.is_active = False
    await db.commit()
    await db.refresh(token)
    return token


@router.patch("/{token_id}/activate", response_model=TokenResponse)
async def activate_token(
    token_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    token = await db.get(ModuleToken, token_id)
    if not token:
        raise HTTPException(status_code=404, detail="Token tidak ditemukan")

    token.is_active = True
    await db.commit()
    await db.refresh(token)
    return token
