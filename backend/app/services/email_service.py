import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def _create_approval_html(user: User) -> str:
        login_url = f"{settings.FRONTEND_URL}/login"
        auth_method = "Akun Google SSO Anda" if user.registration_source == "google" else "Kata sandi yang Anda daftarkan saat registrasi"

        return f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 20px; }}
    .container {{ max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
    .header {{ background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; color: #ffffff; }}
    .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }}
    .header p {{ margin: 6px 0 0; font-size: 13px; opacity: 0.9; }}
    .content {{ padding: 32px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }}
    .card {{ background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 20px 0; }}
    .card-title {{ font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }}
    .info-row {{ display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }}
    .info-label {{ color: #94a3b8; }}
    .info-value {{ color: #f8fafc; font-weight: 600; font-family: monospace; }}
    .highlight-box {{ background: rgba(79, 70, 229, 0.15); border: 1px solid rgba(79, 70, 229, 0.4); border-radius: 8px; padding: 12px; text-align: center; margin: 16px 0; }}
    .lms-email {{ font-size: 16px; font-weight: 700; color: #a5b4fc; font-family: monospace; }}
    .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; text-align: center; margin-top: 16px; font-size: 14px; }}
    .footer {{ background-color: #0f172a; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Selamat! Pendaftaran Anda Disetujui</h1>
      <p>LMS Enterprise Technology & Cloud Academy</p>
    </div>
    <div class="content">
      <p>Halo <strong>{user.full_name}</strong>,</p>
      <p>Kabar gembira! Akun pendaftaran Anda telah berhasil diverifikasi dan disetujui oleh Administrator. Akun Anda kini telah <strong>AKTIF</strong> dan siap digunakan untuk mengikuti seluruh materi praktikum dan modul sertifikasi.</p>

      <div class="card">
        <div class="card-title">Kredensial & Identitas Akun Resmi:</div>
        <div class="highlight-box">
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Email Resmi LMS Peserta Anda:</div>
          <div class="lms-email">{user.custom_lms_email or user.email}</div>
        </div>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Nama:</strong> {user.full_name}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Email Pribadi:</strong> {user.personal_email or user.email}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Metode Autentikasi:</strong> {auth_method}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Status Akun:</strong> <span style="color: #34d399;">Aktif & Terverifikasi</span></p>
      </div>

      <p>Anda dapat masuk ke portal LMS menggunakan <strong>Email Resmi LMS</strong> ataupun <strong>Email Pribadi</strong> Anda.</p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="{login_url}" class="btn">Masuk ke Portal LMS &rarr;</a>
      </div>

      <p style="font-size: 12px; color: #94a3b8;">Jika Anda mengalami kendala saat login, silakan hubungi tim administrator LMS kami.</p>
    </div>
    <div class="footer">
      &copy; 2026 LMS Platform Academy. Hak cipta dilindungi undang-undang.<br>
      Pesan ini dikirimkan otomatis oleh Email Gateway LMS Platform.
    </div>
  </div>
</body>
</html>"""

    @classmethod
    async def send_approval_email(cls, user: User) -> bool:
        """
        Send welcome email with official LMS credentials via SMTP.
        """
        recipient_email = user.personal_email or user.email
        subject = f"🎉 Selamat! Pendaftaran Akun LMS Anda Telah Disetujui ({user.full_name})"
        html_body = cls._create_approval_html(user)

        if not settings.EMAILS_ENABLED or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.info(f"[EMAIL MOCK] Email approval dispatched for {recipient_email} (Subject: {subject})")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = recipient_email

            part = MIMEText(html_body, "html")
            msg.attach(part)

            # Send via SMTP server
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, [recipient_email], msg.as_string())

            logger.info(f"[EMAIL GATEWAY] Email approval berhasil terkirim ke {recipient_email}")
            return True
        except Exception as e:
            logger.error(f"[EMAIL GATEWAY ERROR] Gagal mengirim email ke {recipient_email}: {e}")
            return False
