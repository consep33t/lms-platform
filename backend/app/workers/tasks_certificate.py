import asyncio
from app.workers.celery_app import celery_app
from app.core.database import AsyncSessionLocal
from app.core.storage.factory import get_storage_backend


async def _async_generate_certificate(user_id: int, module_id: int):
    from app.services.certificate_service import CertificateService

    async with AsyncSessionLocal() as db:
        storage = get_storage_backend()
        cert_service = CertificateService(db, storage)
        cert = await cert_service.issue_certificate(user_id, module_id)
        await db.commit()
        print(f"[CELERY CERTIFICATE] Certificate #{cert.certificate_code} issued for User #{user_id}, Module #{module_id}")
        return {
            "status": "success",
            "certificate_id": cert.id,
            "certificate_code": cert.certificate_code,
        }


@celery_app.task(name="app.workers.tasks_certificate.generate_certificate_task")
def generate_certificate_task(user_id: int, module_id: int):
    """Background task to generate PDF certificate and record in database."""
    print(f"[CELERY CERTIFICATE] Triggered certificate generation for user_id={user_id}, module_id={module_id}")
    return asyncio.run(_async_generate_certificate(user_id, module_id))
