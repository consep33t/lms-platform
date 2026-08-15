import logging
import httpx
from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)


class WhatsAppService:
    @staticmethod
    async def send_message(phone_number: str, message: str) -> bool:
        """
        Send WhatsApp message via wa-gateway-api endpoint.
        """
        if not settings.WA_GATEWAY_ENABLED or not phone_number:
            logger.info(f"[WA MOCK] WA Gateway skipped for {phone_number}: {message}")
            return False

        # Format number (remove non-digits, replace leading 08 with 628)
        clean_phone = "".join([c for c in phone_number if c.isdigit()])
        if clean_phone.startswith("08"):
            clean_phone = "628" + clean_phone[2:]
        elif clean_phone.startswith("8"):
            clean_phone = "628" + clean_phone[1:]

        payload = {
            "number": clean_phone,
            "message": message
        }

        gateway_url = f"{settings.WA_GATEWAY_URL.rstrip('/')}/send-message"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(gateway_url, json=payload)
                if res.status_code in [200, 201, 202]:
                    logger.info(f"[WA GATEWAY] Pesan berhasil dikirim ke {clean_phone}")
                    return True
                else:
                    logger.warning(f"[WA GATEWAY] Respon HTTP {res.status_code}: {res.text}")
                    return False
        except Exception as e:
            logger.error(f"[WA GATEWAY ERROR] Gagal mengirim WA ke {clean_phone}: {e}")
            return False

    @classmethod
    async def send_approval_notification(cls, user: User, custom_note: str = "") -> bool:
        """
        Send official student approval message with LMS email credentials.
        """
        if not user.phone_number:
            return False

        login_url = f"{settings.FRONTEND_URL}/login"
        auth_method_text = "Login Google SSO" if user.registration_source == "google" else "Kata sandi yang Anda daftarkan"

        message = (
            f"🎉 *SELAMAT! PENDAFTARAN LMS DISETUJUI*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\n"
            f"Halo *{user.full_name}*,\n\n"
            f"Pendaftaran akun Anda di *LMS Enterprise Platform* telah *DISETUJUI* oleh Administrator dan kini telah *AKTIF*.\n\n"
            f"📋 *INFORMASI KREDENSIAL AKUN:*\n"
            f"• *Nama Lengkap:* {user.full_name}\n"
            f"• *Email Resmi LMS:* `{user.custom_lms_email or user.email}`\n"
            f"• *Email Pribadi:* `{user.personal_email or user.email}`\n"
            f"• *Metode Masuk:* {auth_method_text}\n"
            f"• *Status:* ✅ Aktif & Terverifikasi\n\n"
            f"🔗 *PORTAL LOGIN LMS:*\n"
            f"{login_url}\n\n"
            f"Anda dapat masuk menggunakan *Email Resmi LMS* ataupun *Email Pribadi* Anda.\n"
            f"Selamat belajar dan raih sertifikasi kompetensi Anda!\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\n"
            f"_Pesan otomatis dari Sistem Notifikasi LMS Enterprise_"
        )

        return await cls.send_message(user.phone_number, message)
