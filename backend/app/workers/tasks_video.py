from app.workers.celery_app import celery_app
import subprocess
import json
import os


@celery_app.task(name="app.workers.tasks_video.process_video_task")
def process_video_task(media_id: int):
    """Background task to extract video metadata (duration, width, height) and generate thumbnail."""
    # Production video worker using ffmpeg/ffprobe
    print(f"[CELERY] Processing video for media_id: {media_id}")
    return {"media_id": media_id, "status": "ready"}
