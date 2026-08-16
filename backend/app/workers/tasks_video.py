import os
import subprocess
import json
import asyncio
from pathlib import Path
from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.media import MediaFile, MediaStatus, StorageDriver
from sqlalchemy import select


async def _async_process_video(media_id: int):
    async with AsyncSessionLocal() as db:
        stmt = select(MediaFile).where(MediaFile.id == media_id)
        media = (await db.execute(stmt)).scalar_one_or_none()
        if not media:
            print(f"[CELERY VIDEO] Media #{media_id} not found in DB.")
            return {"status": "not_found", "media_id": media_id}

        media.status = MediaStatus.processing
        await db.flush()

        # Resolve video file path
        if media.storage_driver == StorageDriver.local:
            base_path = Path(settings.STORAGE_LOCAL_BASE_PATH)
            file_path = base_path / media.storage_key
            if not file_path.exists():
                alt_path = Path("/data/uploads") / media.storage_key
                if alt_path.exists():
                    file_path = alt_path
        else:
            # For S3 storage in production, local container mount or tmp download
            file_path = Path(settings.STORAGE_LOCAL_BASE_PATH) / media.storage_key

        duration_seconds = 0.0
        width = 1280
        height = 720
        thumb_key = None

        if file_path.exists():
            # 1. Run ffprobe to get exact video metadata
            try:
                cmd_probe = [
                    "ffprobe",
                    "-v", "error",
                    "-select_streams", "v:0",
                    "-show_entries", "stream=width,height,duration:format=duration",
                    "-of", "json",
                    str(file_path)
                ]
                res = subprocess.run(cmd_probe, capture_output=True, text=True, timeout=30)
                if res.returncode == 0:
                    probe_data = json.loads(res.stdout)
                    fmt = probe_data.get("format", {})
                    streams = probe_data.get("streams", [{}])
                    duration_str = fmt.get("duration") or (streams[0].get("duration") if streams else None)
                    if duration_str:
                        duration_seconds = round(float(duration_str), 1)
                    if streams:
                        width = int(streams[0].get("width") or 1280)
                        height = int(streams[0].get("height") or 720)
            except Exception as probe_err:
                print(f"[CELERY VIDEO] ffprobe warning on media #{media_id}: {probe_err}")

            # 2. Run ffmpeg to extract thumbnail frame
            try:
                thumb_filename = f"{Path(media.storage_key).stem}_thumb.jpg"
                thumb_path = file_path.parent / thumb_filename
                cmd_thumb = [
                    "ffmpeg",
                    "-y",
                    "-ss", "00:00:03",
                    "-i", str(file_path),
                    "-vframes", "1",
                    "-q:v", "2",
                    str(thumb_path)
                ]
                res_thumb = subprocess.run(cmd_thumb, capture_output=True, timeout=30)
                if res_thumb.returncode == 0 and thumb_path.exists():
                    thumb_key = str(Path(media.storage_key).parent / thumb_filename).replace("\\", "/")
            except Exception as thumb_err:
                print(f"[CELERY VIDEO] ffmpeg thumbnail warning on media #{media_id}: {thumb_err}")

        # Update media in database
        media.duration_seconds = duration_seconds if duration_seconds > 0 else 120.0
        media.width = width
        media.height = height
        if thumb_key:
            media.thumbnail_key = thumb_key
        media.status = MediaStatus.ready
        await db.commit()

        print(f"[CELERY VIDEO] Media #{media_id} processed successfully: {duration_seconds}s, {width}x{height}")
        return {
            "status": "ready",
            "media_id": media_id,
            "duration": duration_seconds,
            "width": width,
            "height": height,
        }


@celery_app.task(name="app.workers.tasks_video.process_video_task")
def process_video_task(media_id: int):
    """Background task to extract video metadata (duration, width, height) and generate thumbnail."""
    print(f"[CELERY] Processing video for media_id: {media_id}")
    return asyncio.run(_async_process_video(media_id))
