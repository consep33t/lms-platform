from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User, AuditLog
from app.models.notification import NotificationType
from app.services.notification_service import NotificationService

router = APIRouter()


class AnnouncementBroadcastRequest(BaseModel):
    title: str
    body: str
    send_email: bool = False
    target_role: str | None = None


@router.post("")
async def broadcast_announcement(
    req: AnnouncementBroadcastRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Menyiarkan pengumuman massal ke seluruh pengguna via notifikasi in-app dan email."""
    # 1. Fetch target users
    stmt = select(User).where(User.is_deleted == False, User.is_active == True)
    if req.target_role:
        stmt = stmt.where(User.role == req.target_role)

    users = list((await db.execute(stmt)).scalars().all())
    if not users:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tidak ada pengguna aktif ditemukan.")

    user_ids = [u.id for u in users]

    # 2. In-App Notification Broadcast
    notif_svc = NotificationService(db)
    notifs = await notif_svc.broadcast(
        title=f"📢 {req.title}",
        body=req.body,
        user_ids=user_ids,
        notif_type=NotificationType.announcement,
    )

    # 3. Optional Transactional Email Delivery via Celery
    emails_dispatched = 0
    if req.send_email:
        try:
            from app.workers.tasks_email import send_email_notification
            for u in users:
                if u.email:
                    send_email_notification.delay(
                        to_email=u.email,
                        subject=f"[Pengumuman LMS] {req.title}",
                        body=f"Halo {u.full_name},\n\n{req.body}\n\nSalam,\nTim LMS Alfanet",
                        html_content=f"""
                        <h2 style="color: #4f46e5;">📢 {req.title}</h2>
                        <p>Halo <strong>{u.full_name}</strong>,</p>
                        <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 16px 0; border-radius: 4px; line-height: 1.6;">
                          {req.body.replace(chr(10), '<br/>')}
                        </div>
                        <p style="font-size: 13px; color: #64748b;">Pengumuman ini dikirimkan oleh Administrator LMS Alfanet.</p>
                        """
                    )
                    emails_dispatched += 1
        except Exception as mail_err:
            print(f"[ANNOUNCEMENTS] Warning dispatching email broadcast: {mail_err}")

    # 4. Record Audit Log
    audit = AuditLog(
        user_id=admin.id,
        action="BROADCAST_ANNOUNCEMENT",
        entity_type="announcement",
        entity_id=None,
        details=f"Broadcast '{req.title}' to {len(user_ids)} users. Email sent: {req.send_email}"
    )
    db.add(audit)
    await db.commit()

    return {
        "status": "success",
        "recipients_count": len(user_ids),
        "emails_dispatched": emails_dispatched,
        "message": f"Pengumuman berhasil disiarkan ke {len(user_ids)} pengguna."
    }
