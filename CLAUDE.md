# LMS Platform � Claude/Cursor Rules

## FIRST ACTION IN EVERY SESSION
Read AGENT.md ? PROGRESS.md ? then proceed.

## THIS PROJECT
Learning Management System. Tech: FastAPI + React 18 + MSSQL + Redis + Celery.
Storage: LocalDiskStorageBackend (default), S3 driver dormant.
See full spec: PROJECT_SPEC.md

## KEY RULES
- All file I/O through StorageBackend interface only
- Heavy jobs via Celery, never sync in request
- File serving: X-Accel-Redirect (Nginx), not Python streaming
- Update PROGRESS.md + CHANGELOG.md after every task
- Anti-hallucination: always view_file before edit, always grep before assuming
