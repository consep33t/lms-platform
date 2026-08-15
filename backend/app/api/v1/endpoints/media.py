import hmac
import hashlib
import time
import os
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Response
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user_id, get_storage
from app.core.storage.base import StorageBackend
from app.core.config import settings
from app.services.media_service import MediaService
from app.schemas.media import MediaUploadResponse, SignedUrlResponse
from app.models.media import OwnerType
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


@router.get("/{media_id}/stream")
async def stream_media_by_id(
    media_id: int,
    db: AsyncSession = Depends(get_db),
):
    repo = MediaRepository(db)
    media = await repo.get_by_id(media_id)
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media tidak ditemukan")

    base_path = Path(settings.STORAGE_LOCAL_BASE_PATH)
    file_path = base_path / media.storage_key

    if not file_path.exists():
        # check fallback in /data/uploads or ./uploads
        alt_path = Path("/data/uploads") / media.storage_key
        if alt_path.exists():
            file_path = alt_path
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File media tidak ditemukan di server")

    return FileResponse(path=str(file_path), media_type=media.mime_type, filename=media.original_name)


@router.get("/files/{key:path}")
async def serve_protected_file(key: str, expires: int, signature: str):
    # Verify HMAC signature
    expected = hmac.new(
        settings.STORAGE_SIGNING_SECRET.encode(),
        f"{key}:{expires}".encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Signature tidak valid")
    if int(time.time()) > expires:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Link akses telah kadaluarsa")

    base_path = Path(settings.STORAGE_LOCAL_BASE_PATH)
    file_path = base_path / key
    if not file_path.exists():
        file_path = Path("/data/uploads") / key

    if file_path.exists():
        return FileResponse(path=str(file_path))

    resp = Response(status_code=status.HTTP_200_OK)
    resp.headers["X-Accel-Redirect"] = f"/protected/{key}"
    resp.headers["Content-Disposition"] = "inline"
    return resp
