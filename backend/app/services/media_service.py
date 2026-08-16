import io
import os
import uuid
from PIL import Image
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.storage.base import StorageBackend
from app.core.config import settings
from app.models.media import MediaFile, FileType, MediaStatus, OwnerType, StorageDriver
from app.repositories.media_repo import MediaRepository


MIME_TYPE_MAP = {
    # Images (PNG, JPG, JPEG, WEBP - Max 25MB raw upload)
    "image/jpeg": (FileType.image, 25 * 1024 * 1024),
    "image/jpg": (FileType.image, 25 * 1024 * 1024),
    "image/png": (FileType.image, 25 * 1024 * 1024),
    "image/webp": (FileType.image, 25 * 1024 * 1024),
    # Videos (MP4, WEBM - Max 1000MB)
    "video/mp4": (FileType.video, 1000 * 1024 * 1024),
    "video/webm": (FileType.video, 1000 * 1024 * 1024),
    "video/quicktime": (FileType.video, 1000 * 1024 * 1024),
    # Documents (PDF, Word - Max 50MB)
    "application/pdf": (FileType.document, 50 * 1024 * 1024),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (FileType.document, 50 * 1024 * 1024),
    # Archives (ZIP - Max 50MB)
    "application/zip": (FileType.archive, 50 * 1024 * 1024),
    "application/x-zip-compressed": (FileType.archive, 50 * 1024 * 1024),
}


class MediaService:
    def __init__(self, db: AsyncSession, storage: StorageBackend):
        self.db = db
        self.storage = storage
        self.repo = MediaRepository(db)

    def optimize_image_buffer(self, raw_bytes: bytes, original_mime: str) -> tuple[io.BytesIO, str, str]:
        """Optimizes high-resolution PNG/JPG images into high-clarity, lightweight buffers.
        
        Preserves crystal-clear sharpness (88% visual quality, LANCZOS downsampling if > 2560px)
        while reducing server RAM and disk load by 50-80%.
        """
        try:
            img = Image.open(io.BytesIO(raw_bytes))
            # Convert RGBA to RGB if saving as JPEG, keep RGBA for PNG/WEBP
            max_dimension = 2560
            width, height = img.size
            if width > max_dimension or height > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

            out_buffer = io.BytesIO()
            if original_mime == "image/png":
                # Optimize PNG non-destructively
                img.save(out_buffer, format="PNG", optimize=True)
                out_mime = "image/png"
                ext = ".png"
            elif original_mime in ("image/jpeg", "image/jpg"):
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(out_buffer, format="JPEG", quality=88, optimize=True, progressive=True)
                out_mime = "image/jpeg"
                ext = ".jpg"
            elif original_mime == "image/webp":
                img.save(out_buffer, format="WEBP", quality=90, method=6)
                out_mime = "image/webp"
                ext = ".webp"
            else:
                out_buffer.write(raw_bytes)
                out_mime = original_mime
                ext = ".bin"

            out_buffer.seek(0)
            return out_buffer, out_mime, ext
        except Exception:
            # Fallback to original bytes if Pillow encounters non-image raw data
            return io.BytesIO(raw_bytes), original_mime, ".png"

    async def upload_file(
        self,
        file: UploadFile,
        user_id: int,
        owner_type: OwnerType = OwnerType.session_content,
        owner_id: int | None = None
    ) -> tuple[MediaFile, str]:
        mime = (file.content_type or "application/octet-stream").lower()
        if mime == "image/jpg":
            mime = "image/jpeg"

        if mime not in MIME_TYPE_MAP:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Tipe file '{mime}' tidak didukung.")

        file_type, max_size = MIME_TYPE_MAP[mime]
        
        if owner_type == OwnerType.discussion_attachment:
            max_size = min(max_size, 10 * 1024 * 1024)  # 10MB max
            if file_type not in (FileType.image, FileType.document, FileType.archive):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipe file tidak didukung untuk attachment diskusi.")
            if mime not in ("application/pdf", "application/zip", "application/x-zip-compressed") and file_type != FileType.image:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hanya gambar, PDF, dan ZIP yang diizinkan untuk attachment diskusi.")
        
        if owner_type == OwnerType.badge_icon:
            if file_type != FileType.image:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Badge icon harus berupa gambar.")
                
        file_uuid = uuid.uuid4().hex

        # For images: optimize to prevent server memory bloat while preserving crystal-clear clarity
        if file_type == FileType.image:
            raw_data = await file.read()
            if len(raw_data) > max_size:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ukuran file gambar melebihi batas 25MB.")

            opt_buffer, final_mime, ext = self.optimize_image_buffer(raw_data, mime)
            storage_key = f"{owner_type.value}/{user_id}/{file_uuid}{ext}"

            # Save optimized stream
            class AsyncBufferWrapper:
                def __init__(self, buf):
                    self.buf = buf
                async def read(self, size=-1):
                    return self.buf.read(size)

            bytes_written = await self.storage.save_stream(storage_key, AsyncBufferWrapper(opt_buffer))
        else:
            # For large videos and documents: stream directly in 1MB chunks (zero memory spike)
            ext = os.path.splitext(file.filename or "")[1].lower() or ".mp4"
            storage_key = f"{owner_type.value}/{user_id}/{file_uuid}{ext}"
            bytes_written = await self.storage.save_stream(storage_key, file)
            final_mime = mime

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
            mime_type=final_mime,
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
