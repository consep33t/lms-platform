import secrets
import string
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.token import ModuleToken
from app.models.module import Module
from app.schemas.token import TokenGenerateRequest, TokenBulkGenerateRequest, TokenResponse

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
    return list(res.scalars().all())


@router.post("", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def generate_token(
    data: TokenGenerateRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt_m = select(Module).where(Module.id == data.module_id, Module.is_deleted == False)
    module = (await db.execute(stmt_m)).scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=404, detail="Modul tidak ditemukan")

    token_code = data.token_code.strip().upper() if data.token_code else generate_random_token()

    stmt_check = select(ModuleToken).where(ModuleToken.token_code == token_code)
    existing = (await db.execute(stmt_check)).scalar_one_or_none()
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
    await db.flush()
    return token


@router.post("/bulk", response_model=list[TokenResponse], status_code=status.HTTP_201_CREATED)
async def bulk_generate_tokens(
    data: TokenBulkGenerateRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt_m = select(Module).where(Module.id == data.module_id, Module.is_deleted == False)
    module = (await db.execute(stmt_m)).scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=404, detail="Modul tidak ditemukan")

    expired_at = datetime.utcnow() + timedelta(days=data.days_valid)
    created_tokens: list[ModuleToken] = []

    for _ in range(data.count):
        code = generate_random_token(10)
        token = ModuleToken(
            module_id=data.module_id,
            token_code=code,
            max_uses=data.max_uses,
            current_uses=0,
            expired_at=expired_at,
            is_active=True,
            created_by=admin.id,
        )
        db.add(token)
        created_tokens.append(token)

    await db.flush()
    return created_tokens


@router.patch("/{token_id}/toggle", response_model=TokenResponse)
async def toggle_token(
    token_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ModuleToken).where(ModuleToken.id == token_id)
    token = (await db.execute(stmt)).scalar_one_or_none()
    if not token:
        raise HTTPException(status_code=404, detail="Token tidak ditemukan")

    token.is_active = not token.is_active
    return token


@router.delete("/{token_id}")
async def delete_token(
    token_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ModuleToken).where(ModuleToken.id == token_id)
    token = (await db.execute(stmt)).scalar_one_or_none()
    if not token:
        raise HTTPException(status_code=404, detail="Token tidak ditemukan")

    await db.delete(token)
    return {"message": "Token berhasil dihapus"}
