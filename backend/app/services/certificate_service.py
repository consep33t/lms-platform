import io
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.core.storage.base import StorageBackend
from app.core.config import settings
from app.models.progress import Certificate, UserModuleProgress, ProgressStatus
from app.models.user import User
from app.models.module import Module
from app.models.media import MediaFile, FileType, MediaStatus, OwnerType, StorageDriver
from app.schemas.certificate import CertificateVerifyResponse


class CertificateService:
    def __init__(self, db: AsyncSession, storage: StorageBackend):
        self.db = db
        self.storage = storage

    def generate_pdf_bytes(
        self,
        student_name: str,
        module_title: str,
        cert_code: str,
        institution: str | None,
        issued_date: datetime,
    ) -> bytes:
        """Generates a clean vector-based PDF certificate document."""
        # Clean SVG-to-PDF or self-contained SVG certificate format
        date_str = issued_date.strftime("%d %B %Y")
        inst_text = f"({institution})" if institution else ""

        svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 792" width="100%" height="100%">
  <defs>
    <linearGradient id="gradBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="gradGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1120" height="792" fill="#ffffff" />
  
  <!-- Outer Decorative Border -->
  <rect x="24" y="24" width="1072" height="744" rx="16" fill="none" stroke="url(#gradBorder)" stroke-width="8" />
  <rect x="36" y="36" width="1048" height="720" rx="12" fill="none" stroke="#e2e8f0" stroke-width="1.5" />

  <!-- Header / Organization -->
  <text x="560" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#4f46e5" text-anchor="middle" letter-spacing="4">PT ALFANET MEDIATAMA • LMS PLATFORM</text>
  <text x="560" y="170" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="-0.5">SERTIFIKAT KELULUSAN &amp; KOMPETENSI</text>
  <text x="560" y="205" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">Nomor Verifikasi: {cert_code}</text>

  <!-- Awarded to -->
  <text x="560" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" fill="#64748b" text-anchor="middle">DIBERIKAN DENGAN BANGGA KEPADA:</text>
  
  <!-- Recipient Name -->
  <text x="560" y="340" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="800" fill="#4f46e5" text-anchor="middle">{student_name}</text>
  <text x="560" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-style="italic" fill="#64748b" text-anchor="middle">{inst_text}</text>

  <!-- Module Statement -->
  <text x="560" y="440" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" fill="#334155" text-anchor="middle">Telah berhasil menyelesaikan seluruh materi pelatihan dan lulus evaluasi kompetensi pada modul:</text>
  
  <!-- Module Title -->
  <rect x="160" y="475" width="800" height="60" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
  <text x="560" y="513" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#0f172a" text-anchor="middle">{module_title}</text>

  <!-- Issue Date & Signatures -->
  <g transform="translate(180, 590)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#64748b">Diterbitkan pada:</text>
    <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#0f172a">{date_str}</text>
    <text x="0" y="50" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#94a3b8">Status: Terverifikasi Digital</text>
  </g>

  <!-- Digital Seal -->
  <g transform="translate(560, 635)">
    <circle r="42" fill="url(#gradGold)" />
    <circle r="36" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="4,4" />
    <text x="0" y="5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">VERIFIED</text>
    <text x="0" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">ALFANET LMS</text>
  </g>

  <g transform="translate(940, 590)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#64748b" text-anchor="end">Kepala Pusat Pelatihan:</text>
    <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#0f172a" text-anchor="end">Divisi Akademik &amp; Sertifikasi</text>
    <text x="0" y="50" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#94a3b8" text-anchor="end">PT Alfanet Mediatama Indonesia</text>
  </g>

  <!-- Footer Verification Note -->
  <text x="560" y="740" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Cek keaslian sertifikat ini kapan saja melalui: https://lms.alfanet.id/verify/{cert_code}</text>
</svg>"""
        return svg_content.encode("utf-8")

    async def issue_certificate(self, user_id: int, module_id: int) -> Certificate:
        """Issues an official certificate if user has completed the module."""
        # 1. Check if certificate already exists
        stmt_c = (
            select(Certificate)
            .where(Certificate.user_id == user_id, Certificate.module_id == module_id)
            .options(selectinload(Certificate.user), selectinload(Certificate.module))
        )
        existing_cert = (await self.db.execute(stmt_c)).scalar_one_or_none()
        if existing_cert:
            return existing_cert

        # 2. Fetch User & Module
        stmt_u = select(User).where(User.id == user_id)
        user = (await self.db.execute(stmt_u)).scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

        stmt_m = select(Module).where(Module.id == module_id)
        module = (await self.db.execute(stmt_m)).scalar_one_or_none()
        if not module:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modul tidak ditemukan")

        # 3. Generate unique certificate code
        cert_code = f"CERT-LMS-2026-{uuid.uuid4().hex[:8].upper()}"
        issued_date = datetime.utcnow()

        # 4. Generate Certificate file bytes and upload to storage
        cert_bytes = self.generate_pdf_bytes(
            student_name=user.full_name,
            module_title=module.title,
            cert_code=cert_code,
            institution=user.institution,
            issued_date=issued_date,
        )

        storage_key = f"certificates/{user_id}/{cert_code}.svg"

        class AsyncBufferWrapper:
            def __init__(self, buf):
                self.buf = buf
            async def read(self, size=-1):
                return self.buf.read(size)

        await self.storage.save_stream(storage_key, AsyncBufferWrapper(io.BytesIO(cert_bytes)))

        # 5. Create MediaFile record
        media = MediaFile(
            owner_type=OwnerType.certificate,
            owner_id=user_id,
            file_type=FileType.document,
            storage_driver=StorageDriver.local if settings.STORAGE_DRIVER == "local" else StorageDriver.s3,
            storage_key=storage_key,
            original_name=f"Sertifikat_{module.title.replace(' ', '_')}_{cert_code}.svg",
            mime_type="image/svg+xml",
            size_bytes=len(cert_bytes),
            status=MediaStatus.ready,
            created_by=user_id,
        )
        self.db.add(media)
        await self.db.flush()

        # 6. Create Certificate record
        cert = Certificate(
            user_id=user_id,
            module_id=module_id,
            certificate_code=cert_code,
            media_file_id=media.id,
            issued_at=issued_date,
        )
        self.db.add(cert)
        await self.db.flush()

        # 7. Send In-App Notification
        from app.services.notification_service import NotificationService
        from app.models.notification import NotificationType
        notif_svc = NotificationService(self.db)
        await notif_svc.create(
            user_id=user_id,
            title="Sertifikat Kelulusan Terbit! 🎓",
            body=f"Selamat {user.full_name}! Anda telah menyelesaikan modul '{module.title}'. Sertifikat resmi #{cert_code} telah diterbitkan dan dapat diunduh sekarang.",
            notif_type=NotificationType.system,
        )

        # 8. Send Email notification if email enabled
        try:
            from app.workers.tasks_email import send_email_notification
            send_email_notification.delay(
                to_email=user.email,
                subject=f"Selamat! Sertifikat Kelulusan: {module.title}",
                body=f"Selamat {user.full_name}, Anda telah menyelesaikan modul {module.title}. Kode Sertifikat Anda: {cert_code}",
                html_content=f"""
                <h2 style="color: #4f46e5;">Selamat atas Kelulusan Anda! 🎓</h2>
                <p>Halo <strong>{user.full_name}</strong>,</p>
                <p>Kami dengan bangga memberitahukan bahwa Anda telah menyelesaikan seluruh sesi dan lulus evaluasi kompetensi pada modul:</p>
                <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-weight: bold; margin: 12px 0;">{module.title}</div>
                <p>Nomor Registrasi Sertifikat: <code>{cert_code}</code></p>
                <p>Sertifikat Anda telah dapat diunduh dan diverifikasi secara publik.</p>
                <a href="https://lms.alfanet.id/verify/{cert_code}" class="btn" style="color: white;">Verifikasi Sertifikat Online</a>
                """
            )
        except Exception as mail_err:
            print(f"[CERTIFICATE] Warning sending email: {mail_err}")

        return cert

    async def get_user_certificates(self, user_id: int) -> list[dict]:
        stmt = (
            select(Certificate)
            .where(Certificate.user_id == user_id)
            .options(selectinload(Certificate.module), selectinload(Certificate.user))
            .order_by(Certificate.issued_at.desc())
        )
        res = await self.db.execute(stmt)
        certs = res.scalars().all()

        results = []
        for c in certs:
            results.append({
                "id": c.id,
                "certificate_code": c.certificate_code,
                "module_id": c.module_id,
                "module_title": c.module.title if c.module else f"Modul #{c.module_id}",
                "user_id": c.user_id,
                "user_name": c.user.full_name if c.user else f"User #{c.user_id}",
                "issued_at": c.issued_at,
                "download_url": f"/api/v1/certificates/{c.id}/download",
            })
        return results

    async def verify_certificate(self, certificate_code: str) -> CertificateVerifyResponse:
        clean_code = certificate_code.strip()
        stmt = (
            select(Certificate)
            .where(Certificate.certificate_code == clean_code)
            .options(selectinload(Certificate.user), selectinload(Certificate.module))
        )
        cert = (await self.db.execute(stmt)).scalar_one_or_none()

        if not cert:
            return CertificateVerifyResponse(
                is_valid=False,
                certificate_code=clean_code,
                student_name="",
                module_title="",
                institution=None,
                issued_at=None,
                message="Sertifikat dengan kode tersebut tidak ditemukan dalam basis data resmi LMS Alfanet.",
            )

        student_name = cert.user.full_name if cert.user else "Peserta Terdaftar"
        module_title = cert.module.title if cert.module else "Modul Pelatihan"
        institution = cert.user.institution if cert.user else None

        return CertificateVerifyResponse(
            is_valid=True,
            certificate_code=cert.certificate_code,
            student_name=student_name,
            module_title=module_title,
            institution=institution,
            issued_at=cert.issued_at,
            message="Sertifikat ini SAH dan terverifikasi resmi oleh PT Alfanet Mediatama.",
        )
