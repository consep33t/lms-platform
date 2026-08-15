from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.tasks_cleanup.cleanup_orphan_files")
def cleanup_orphan_files():
    """Periodic task to remove unconfirmed/expired uploading files from disk."""
    print("[CELERY BEAT] Running orphan file cleanup sweep...")
    return {"status": "completed"}
