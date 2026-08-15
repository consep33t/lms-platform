from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.tasks_email.send_email_notification")
def send_email_notification(to_email: str, subject: str, body: str):
    """Background task to send transactional email."""
    print(f"[CELERY] Sending email to {to_email}: {subject}")
    return {"status": "sent", "to": to_email}
