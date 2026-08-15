from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "lms_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.workers.tasks_video",
        "app.workers.tasks_pdf",
        "app.workers.tasks_email",
        "app.workers.tasks_cleanup",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Jakarta",
    enable_utc=True,
    beat_schedule={
        "cleanup-orphan-files": {
            "task": "app.workers.tasks_cleanup.cleanup_orphan_files",
            "schedule": 3600.0,  # every hour
        },
    },
)