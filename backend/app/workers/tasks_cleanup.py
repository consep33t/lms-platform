import asyncio
from datetime import datetime, timedelta
from app.workers.celery_app import celery_app
from app.core.database import AsyncSessionLocal
from app.models.media import MediaFile, MediaStatus
from app.models.token import ModuleToken
from sqlalchemy import select, update


async def _async_cleanup_sweep():
    async with AsyncSessionLocal() as db:
        now = datetime.utcnow()

        # 1. Sweep orphan/stuck uploading files older than 24 hours
        yesterday = now - timedelta(hours=24)
        stmt_media = (
            update(MediaFile)
            .where(
                MediaFile.status == MediaStatus.uploading,
                MediaFile.created_at < yesterday
            )
            .values(status=MediaStatus.failed)
        )
        media_res = await db.execute(stmt_media)

        # 2. Deactivate expired module tokens
        stmt_tokens = (
            update(ModuleToken)
            .where(
                ModuleToken.is_active == True,
                ModuleToken.expired_at.is_not(None),
                ModuleToken.expired_at < now
            )
            .values(is_active=False)
        )
        token_res = await db.execute(stmt_tokens)

        await db.commit()

        print(f"[CELERY CLEANUP] Sweep finished. Expired tokens deactivated, orphan uploads swept.")
        return {
            "status": "completed",
            "media_swept": media_res.rowcount if hasattr(media_res, 'rowcount') else 0,
            "tokens_deactivated": token_res.rowcount if hasattr(token_res, 'rowcount') else 0,
        }


@celery_app.task(name="app.workers.tasks_cleanup.cleanup_orphan_files")
def cleanup_orphan_files():
    """Periodic task to remove unconfirmed/expired uploading files and deactivate expired tokens."""
    print("[CELERY BEAT] Running orphan file and expired token cleanup sweep...")
    return asyncio.run(_async_cleanup_sweep())
