from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import uuid4
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserResponse, UserCreate, UserUpdate, UserRejectRequest
from app.repositories.user_repo import UserRepository
from app.services.whatsapp_service import WhatsAppService
from app.services.email_service import EmailService

router = APIRouter()


@router.get("", response_model=list[UserResponse])
async def admin_list_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.is_deleted == False).order_by(User.created_at.desc())
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.get("/pending-approvals", response_model=list[UserResponse])
async def admin_list_pending_approvals(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    repo = UserRepository(db)
    return await repo.get_pending_approvals()


@router.post("/{user_id}/approve", response_model=UserResponse)
async def admin_approve_student(
    user_id: int,
    background_tasks: BackgroundTasks,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    repo = UserRepository(db)
    user = await repo.approve_user(user_id, admin.id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    # Send Notification via WhatsApp Gateway & Email Gateway
    background_tasks.add_task(WhatsAppService.send_approval_notification, user)
    background_tasks.add_task(EmailService.send_approval_email, user)

    return user


@router.post("/{user_id}/reject", response_model=UserResponse)
async def admin_reject_student(
    user_id: int,
    req: UserRejectRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    repo = UserRepository(db)
    user = await repo.reject_user(user_id, req.rejection_reason)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")
    return user


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
        personal_email=req.email,
        full_name=req.full_name,
        hashed_password=get_password_hash(req.password),
        role=req.role,
        is_active=True,
        is_approved=True,
        approval_status="approved",
        registration_source="admin_create",
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

    # FIX: Check email uniqueness before updating to prevent IntegrityError 500
    update_data = req.model_dump(exclude_unset=True)
    if "email" in update_data and update_data["email"] != user.email:
        stmt_email_check = select(User).where(
            User.email == update_data["email"],
            User.is_deleted == False,
            User.id != user_id
        )
        email_conflict = (await db.execute(stmt_email_check)).scalar_one_or_none()
        if email_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{update_data['email']}' sudah digunakan oleh user lain."
            )

    for field, val in update_data.items():
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

    # FIX: Scramble email on soft-delete to free the UNIQUE constraint,
    # allowing the same email to be re-registered in the future.
    deletion_uid = uuid4().hex[:12]
    user.email = f"deleted_{deletion_uid}_{user.email}"
    if user.custom_lms_email:
        user.custom_lms_email = f"deleted_{deletion_uid}_{user.custom_lms_email}"
    user.is_deleted = True
    user.is_active = False
    return {"message": "User berhasil dihapus"}



