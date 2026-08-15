import hmac
import hashlib
import time
import os
from pathlib import Path
from typing import Generator
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Response, Request, Header
from fastapi.responses import FileResponse, RedirectResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user_id, get_storage
from app.core.storage.base import StorageBackend
from app.core.config import settings
from app.services.media_service import MediaService
from app.schemas.media import MediaUploadResponse, SignedUrlResponse
from app.models.media import OwnerType, StorageDriver
from app.repositories.media_repo import MediaRepository

router = APIRouter()


@router.post("/upload", response_model=MediaUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    owner_type: OwnerType = Form(OwnerType.session_content),
    owner_id: int | None = Form(None),
    current_user_id: int = Depends(get_current_user_id),
    storage: StorageBackend = Depends(get_storage),
    db: AsyncSession = Depends(get_db),
):
    service = MediaService(db, storage)
    media, url = await service.upload_file(file, current_user_id, owner_type, owner_id)
    resp = MediaUploadResponse.model_validate(media)
    resp.url = url
    return resp


@router.get("/{media_id}/signed-url", response_model=SignedUrlResponse)
async def get_signed_url(
    media_id: int,
    current_user_id: int = Depends(get_current_user_id),
    storage: StorageBackend = Depends(get_storage),
    db: AsyncSession = Depends(get_db),
):
    repo = MediaRepository(db)
    media = await repo.get_by_id(media_id)
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media tidak ditemukan")

    signed_url = await storage.get_signed_url(media.storage_key, expires_in=3600)
    return SignedUrlResponse(media_id=media.id, signed_url=signed_url, expires_in_seconds=3600)


def send_bytes_range_requests(
    file_path: Path,
    start: int,
    end: int,
    chunk_size: int = 1024 * 1024  # 1MB per chunk
) -> Generator[bytes, None, None]:
    """Stream file range in small 1MB chunks to prevent memory spikes on large videos."""
    with open(file_path, "rb") as f:
        f.seek(start)
        remaining = (end - start) + 1
        while remaining > 0:
            read_size = min(remaining, chunk_size)
            data = f.read(read_size)
            if not data:
                break
            remaining -= len(data)
            yield data


@router.get("/{media_id}/stream")
async def stream_media_by_id(
    media_id: int,
    request: Request,
    range: str | None = Header(None),
    storage: StorageBackend = Depends(get_storage),
    db: AsyncSession = Depends(get_db),
):
    repo = MediaRepository(db)
    media = await repo.get_by_id(media_id)
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media tidak ditemukan")

    # If file is stored in S3/MinIO
    if media.storage_driver == StorageDriver.s3:
        signed_url = await storage.get_signed_url(media.storage_key, expires_in=3600)
        return RedirectResponse(url=signed_url)

    # Local Disk file path resolution
    base_path = Path(settings.STORAGE_LOCAL_BASE_PATH)
    file_path = base_path / media.storage_key

    if not file_path.exists():
        alt_path = Path("/data/uploads") / media.storage_key
        if alt_path.exists():
            file_path = alt_path
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File media tidak ditemukan di server")

    file_size = file_path.stat().st_size
    mime_type = media.mime_type or "application/octet-stream"

    # Handle HTTP 206 Partial Content for Video Seeking without RAM load
    if range:
        range_value = range.strip()
        if range_value.startswith("bytes="):
            parts = range_value[6:].split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1

            # Validate range boundary
            start = max(0, start)
            end = min(file_size - 1, end)
            if start > end:
                raise HTTPException(status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE)

            content_length = (end - start) + 1
            headers = {
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(content_length),
                "Content-Type": mime_type,
                "Cache-Control": "public, max-age=86400, immutable",
            }
            return StreamingResponse(
                send_bytes_range_requests(file_path, start, end),
                status_code=status.HTTP_206_PARTIAL_CONTENT,
                headers=headers
            )

    # For non-range or initial image/video requests
    return FileResponse(
        path=str(file_path),
        media_type=mime_type,
        filename=media.original_name,
        headers={
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=86400, immutable",
        }
    )


@router.get("/files/{key:path}")
async def serve_protected_file(key: str, expires: int, signature: str):
    expected = hmac.new(
        settings.STORAGE_SIGNING_SECRET.encode(),
        f"{key}:{expires}".encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Signature tidak valid")
    if int(time.time()) > expires:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Link akses telah kadaluarsa")

    # Delegate to Nginx X-Accel-Redirect for ultra-fast zero-copy serving
    resp = Response(status_code=status.HTTP_200_OK)
    resp.headers["X-Accel-Redirect"] = f"/protected/{key}"
    resp.headers["Content-Disposition"] = "inline"
    resp.headers["Accept-Ranges"] = "bytes"
    resp.headers["Cache-Control"] = "public, max-age=86400, immutable"
    return resp
