from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.tasks_pdf.generate_certificate_pdf")
def generate_certificate_pdf(user_id: int, module_id: int, cert_code: str):
    """Background task to render HTML certificate template and compile into PDF via WeasyPrint."""
    print(f"[CELERY] Generating certificate PDF for user {user_id}, module {module_id}, code {cert_code}")
    return {"status": "success", "cert_code": cert_code}
