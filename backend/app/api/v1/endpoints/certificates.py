from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import FileResponse, RedirectResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.dependencies import get_current_user_id, get_storage
from app.core.storage.base import StorageBackend
from app.core.config import settings
from app.models.progress import Certificate
from app.models.media import MediaFile, StorageDriver
from app.services.certificate_service import CertificateService
from app.schemas.certificate import CertificateListItem, CertificateVerifyResponse

router = APIRouter()


@router.get("/my", response_model=list[CertificateListItem])
async def list_my_certificates(
    current_user_id: int = Depends(get_current_user_id),
    storage: StorageBackend = Depends(get_storage),
    db: AsyncSession = Depends(get_db),
):
    service = CertificateService(db, storage)
    return await service.get_user_certificates(current_user_id)


@router.get("/verify/{code}", response_model=CertificateVerifyResponse)
async def verify_certificate_public(
    code: str,
    storage: StorageBackend = Depends(get_storage),
    db: AsyncSession = Depends(get_db),
):
    """Publicly accessible endpoint to verify the authenticity of a certificate."""
    service = CertificateService(db, storage)
    return await service.verify_certificate(code)


@router.get("/{certificate_id}/download")
async def download_certificate(
    certificate_id: int,
    current_user_id: int = Depends(get_current_user_id),
    storage: StorageBackend = Depends(get_storage),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Certificate)
        .where(Certificate.id == certificate_id)
        .options(selectinload(Certificate.media_file), selectinload(Certificate.module))
    )
    cert = (await db.execute(stmt)).scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sertifikat tidak ditemukan")

    # Authorize: user is owner or admin
    if cert.user_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses sertifikat ditolak")

    if not cert.media_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File sertifikat belum di-generate")

    media = cert.media_file

    if media.storage_driver == StorageDriver.s3:
        signed_url = await storage.get_signed_url(media.storage_key, expires_in=1800)
        return RedirectResponse(url=signed_url)

    # Local Disk
    base_path = Path(settings.STORAGE_LOCAL_BASE_PATH)
    file_path = base_path / media.storage_key
    if not file_path.exists():
        alt_path = Path("/data/uploads") / media.storage_key
        if alt_path.exists():
            file_path = alt_path
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File sertifikat tidak ditemukan di server")

    filename = f"Sertifikat_{cert.certificate_code}.svg"
    return FileResponse(
        path=str(file_path),
        media_type="image/svg+xml",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
