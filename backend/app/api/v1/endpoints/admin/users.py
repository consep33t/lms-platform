from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserResponse, UserCreate, UserUpdate

router = APIRouter()


@router.get("", response_model=list[UserResponse])
async def admin_list_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.is_deleted == False).order_by(User.created_at.desc())
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_user(
    req: UserCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    # Check if email already exists
    stmt_check = select(User).where(User.email == req.email)
    existing = (await db.execute(stmt_check)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{req.email}' sudah terdaftar di sistem."
        )

    user = User(
        email=req.email,
        full_name=req.full_name,
        hashed_password=get_password_hash(req.password),
        role=req.role,
        is_active=True,
        is_deleted=False
    )
    db.add(user)
    await db.flush()
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def admin_update_user(
    user_id: int,
    req: UserUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == user_id, User.is_deleted == False)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(user, field, val)

    return user


@router.patch("/{user_id}/toggle-status", response_model=UserResponse)
async def admin_toggle_user_status(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == user_id, User.is_deleted == False)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    user.is_active = not user.is_active
    return user


@router.delete("/{user_id}")
async def admin_delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tidak dapat menghapus akun admin yang sedang aktif")

    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    user.is_deleted = True
    return {"message": "User berhasil dihapus"}
