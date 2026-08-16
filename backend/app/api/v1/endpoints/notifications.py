from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationResponse

router = APIRouter()


@router.get("", response_model=list[NotificationResponse])
async def get_my_notifications(
    limit: int = 50,
    unread_only: bool = False,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Ambil daftar notifikasi milik user yang sedang login."""
    svc = NotificationService(db)
    return await svc.get_for_user(current_user_id, limit=limit, unread_only=unread_only)


@router.get("/unread-count")
async def get_unread_count(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Hitung jumlah notifikasi yang belum dibaca."""
    svc = NotificationService(db)
    count = await svc.get_unread_count(current_user_id)
    return {"unread_count": count}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Tandai satu notifikasi sebagai sudah dibaca."""
    svc = NotificationService(db)
    success = await svc.mark_read(notification_id, current_user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notifikasi tidak ditemukan atau bukan milik Anda.",
        )
    # Fetch updated record to return
    notifications = await svc.get_for_user(current_user_id, limit=1)
    # Re-fetch the specific one
    from sqlalchemy import select
    from app.models.notification import Notification
    stmt = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == current_user_id,
    )
    notif = (await db.execute(stmt)).scalar_one_or_none()
    return notif


@router.patch("/read-all")
async def mark_all_notifications_read(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Tandai semua notifikasi sebagai sudah dibaca."""
    svc = NotificationService(db)
    count = await svc.mark_all_read(current_user_id)
    return {"marked_read": count}