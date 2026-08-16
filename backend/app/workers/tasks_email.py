import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.workers.celery_app import celery_app
from app.core.config import settings


def _build_html_email(subject: str, content_html: str) -> str:
    """Wraps body in an elegant, responsive branded email template."""
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
    .header {{ background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 32px 24px; text-align: center; color: #ffffff; }}
    .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }}
    .header p {{ margin: 6px 0 0 0; opacity: 0.9; font-size: 13px; }}
    .content {{ padding: 32px 24px; line-height: 1.6; font-size: 15px; }}
    .footer {{ background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
    .btn {{ display: inline-block; padding: 12px 24px; background: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LMS Alfanet Platform</h1>
      <p>Sistem Pembelajaran & Sertifikasi Terpadu</p>
    </div>
    <div class="content">
      {content_html}
    </div>
    <div class="footer">
      <p>&copy; 2026 PT Alfanet Mediatama. Hak Cipta Dilindungi.</p>
      <p>Email ini dikirim otomatis oleh sistem notifikasi LMS.</p>
    </div>
  </div>
</body>
</html>"""


@celery_app.task(name="app.workers.tasks_email.send_email_notification")
def send_email_notification(to_email: str, subject: str, body: str, html_content: str | None = None):
    """Background task to send transactional email via SMTP."""
    print(f"[CELERY EMAIL] Preparing email to {to_email}: {subject}")

    if not settings.EMAILS_ENABLED or not settings.SMTP_HOST:
        print(f"[CELERY EMAIL] SMTP not enabled or host not configured. Mock delivery to {to_email}.")
        return {"status": "mocked", "to": to_email, "subject": subject}

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.PROJECT_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email

        # Plain text part
        text_part = MIMEText(body, "plain", "utf-8")
        msg.attach(text_part)

        # HTML part
        formatted_html = _build_html_email(subject, html_content or f"<p>{body}</p>")
        html_part = MIMEText(formatted_html, "html", "utf-8")
        msg.attach(html_part)

        # Connect to SMTP server
        if settings.SMTP_TLS:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
            server.starttls()
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], msg.as_string())
        server.quit()

        print(f"[CELERY EMAIL] Successfully sent email to {to_email}")
        return {"status": "sent", "to": to_email, "subject": subject}
    except Exception as exc:
        print(f"[CELERY EMAIL] Failed to send email to {to_email}: {exc}")
        return {"status": "error", "error": str(exc), "to": to_email}
