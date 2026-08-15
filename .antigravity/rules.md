# LMS Platform � Custom Agent Rules
# Antigravity akan membaca file ini secara otomatis di setiap sesi

## MANDATORY FIRST STEPS (setiap sesi baru)
1. Baca `AGENT.md` untuk konteks project
2. Baca `PROGRESS.md` untuk status terkini
3. Baca `CHANGELOG.md` untuk perubahan terakhir
4. Tentukan fase mana yang sedang dikerjakan

## SKILLS YANG WAJIB DIGUNAKAN
Gunakan skill berikut sesuai task:
- `senior-backend` � saat implementasi FastAPI, SQLAlchemy, Alembic
- `senior-frontend` � saat implementasi React, TypeScript, TanStack
- `database-designer` � saat merancang/modifikasi schema
- `security-and-hardening` � saat implementasi auth, upload, signed URL
- `api-and-interface-design` � saat merancang endpoint baru
- `senior-devops` � saat konfigurasi Docker, Nginx, Celery
- `debugging-and-error-recovery` � saat ada bug/error
- `code-review-and-quality` � sebelum menandai fase selesai
- `incremental-implementation` � selalu deliver incremental, bukan big-bang

## TECH RULES (NON-NEGOTIABLE)
1. Storage abstraction: SELALU lewat `StorageBackend` interface
2. Background jobs: SELALU lewat Celery, tidak pernah sync di request
3. File serving: FastAPI ? X-Accel-Redirect ? Nginx (bukan Python stream)
4. Auth: access token di localStorage, refresh token di httpOnly cookie
5. Validasi: Pydantic v2 di backend, Zod di frontend � SELALU selaras
6. Async: semua endpoint FastAPI WAJIB async, SQLAlchemy async session
7. File names: SELALU UUID, tidak pernah nama asli user

## ANTI-HALLUCINATION RULES
- SELALU `view_file` sebelum edit file
- SELALU `grep_search` sebelum asumsi ada fungsi/class tertentu
- JANGAN asumsi schema database � cek `backend/app/models/` dulu
- JANGAN asumsi env vars � cek `backend/.env.example` dulu

## UPDATE WAJIB SETELAH SELESAI
Setelah setiap sub-task:
1. Update status di `PROGRESS.md` (ganti ? ? ?)
2. Tambah entry di `CHANGELOG.md`
3. Update baris CURRENT STATE di `AGENT.md`

## PORT MAP (JANGAN BENTROK)
- lms_backend: 8000
- lms_frontend: 5173
- lms_nginx: 8080 (local) / 80 (server)
- lms_database: 1434 (local) / 1433 (server, port baru)
- lms_redis: 6380 (local) / 6379 (server)
- MinIO: server only � wifi_minio:9010 (internal) / 9010, 9011 (external)
- wifi-management-app: nginx 80, backend 8080, mssql 1433
