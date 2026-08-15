import os
import uuid
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.storage.base import StorageBackend
from app.core.config import settings
from app.models.media import MediaFile, FileType, MediaStatus, OwnerType, StorageDriver
from app.repositories.media_repo import MediaRepository


MIME_TYPE_MAP = {
    # Images (Max 5MB)
    "image/jpeg": (FileType.image, settings.MAX_IMAGE_SIZE),
    "image/png": (FileType.image, settings.MAX_IMAGE_SIZE),
    "image/webp": (FileType.image, settings.MAX_IMAGE_SIZE),
    # Videos (Max 500MB)
    "video/mp4": (FileType.video, settings.MAX_VIDEO_SIZE),
    "video/webm": (FileType.video, settings.MAX_VIDEO_SIZE),
    # Documents (Max 20MB)
    "application/pdf": (FileType.document, settings.MAX_DOCUMENT_SIZE),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (FileType.document, settings.MAX_DOCUMENT_SIZE),
}


class MediaService:
    def __init__(self, db: AsyncSession, storage: StorageBackend):
        self.db = db
        self.storage = storage
        self.repo = MediaRepository(db)

    async def upload_file(
        self,
        file: UploadFile,
        user_id: int,
        owner_type: OwnerType = OwnerType.session_content,
        owner_id: int | None = None
    ) -> tuple[MediaFile, str]:
        mime = file.content_type or "application/octet-stream"
        if mime not in MIME_TYPE_MAP:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Tipe file '{mime}' tidak didukung.")

        file_type, max_size = MIME_TYPE_MAP[mime]
        ext = os.path.splitext(file.filename or "")[1].lower() or ".bin"
        file_uuid = uuid.uuid4().hex

        # Construct safe relative storage key
        storage_key = f"{owner_type.value}/{user_id}/{file_uuid}{ext}"

        # Stream write to storage backend (chunk by chunk)
        bytes_written = await self.storage.save_stream(storage_key, file)

        if bytes_written > max_size:
            await self.storage.delete(storage_key)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ukuran file melebihi batas maksimum ({max_size / (1024 * 1024):.0f} MB)."
            )

        driver = StorageDriver.local if settings.STORAGE_DRIVER == "local" else StorageDriver.s3
        initial_status = MediaStatus.processing if file_type == FileType.video else MediaStatus.ready

        media = MediaFile(
            owner_type=owner_type,
            owner_id=owner_id,
            file_type=file_type,
            storage_driver=driver,
            storage_key=storage_key,
            original_name=file.filename or "unnamed",
            mime_type=mime,
            size_bytes=bytes_written,
            status=initial_status,
            created_by=user_id,
        )
        created_media = await self.repo.create(media)
        signed_url = await self.storage.get_signed_url(storage_key, expires_in=3600)

        # Trigger video processing worker if video
        if file_type == FileType.video:
            from app.workers.tasks_video import process_video_task
            process_video_task.delay(created_media.id)

        return created_media, signed_url
