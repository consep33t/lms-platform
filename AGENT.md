# LMS Platform — Agent Context File
# ====================================================
# Baca file ini PERTAMA sebelum melakukan apapun.
# Update bagian "CURRENT STATE" setiap kali menyelesaikan fase.

## PROJECT OVERVIEW
Learning Management System (LMS) berbasis token akses modul.
- **Dua role**: User/Peserta & Admin
- **Fitur kunci**: Modul dikunci token (admin generate, ada expired_at)
- **Storage**: Local disk by default, storage abstraction siap migrasi ke S3/MinIO
- **Stack**: FastAPI + React 18 + MSSQL + Redis + Celery + Nginx

## QUICK LINKS
- Spec lengkap: PROJECT_SPEC.md
- Changelog: CHANGELOG.md
- Progress tracker: PROGRESS.md

## TECH STACK (WAJIB DIPATUHI)
| Layer | Tech |
|---|---|
| Backend | FastAPI (Python 3.11+), SQLAlchemy 2.x async, Alembic |
| Database | MSSQL via mssql+aioodbc |
| Auth | JWT access token (15min) + httpOnly refresh cookie (7d) |
| Storage | LocalDiskStorageBackend (default), S3StorageBackend (dormant) |
| File Serving | Nginx X-Accel-Redirect (Python hanya verifikasi signature) |
| Cache | Redis |
| Jobs | Celery + Redis broker |
| Frontend | React 18 + Vite + TypeScript (strict) |
| Styling | TailwindCSS + shadcn/ui (Radix) |
| State | Zustand (client) + TanStack Query (server) |
| Table | TanStack Table |
| Forms | React Hook Form + Zod |
| Upload | react-dropzone + axios (onUploadProgress) |
| Video | video.js atau native <video> |

## ARCHITECTURE RULES (JANGAN DILANGGAR)
1. Semua akses file WAJIB lewat `StorageBackend` interface — tidak boleh `open()` atau boto3 langsung
2. Worker berat (transcode, PDF, email, cleanup) WAJIB lewat Celery — tidak sinkron
3. File serving privat: FastAPI verifikasi HMAC signature ? return X-Accel-Redirect ? Nginx stream
4. Folder upload `/data/uploads/` — SELALU di luar source code
5. Nama file di server = UUID — tidak pernah pakai nama asli user
6. JWT access token disimpan di localStorage (karena SPA), refresh token di httpOnly cookie
7. Jangan campur Zustand (client state) dengan TanStack Query (server state)
8. Semua endpoint admin dilindungi role guard `admin` atau `superadmin`

## SERVER INFO
- **Server**: alfanet (alfa@alfanet)
- **OS**: Ubuntu 26.04 LTS
- **Docker**: v29.6.1
- **MinIO shared** sudah running di server:
  - Container: `wifi_minio` (shared dengan wifi-management-app)
  - API: port 9010 (internal: wifi_minio:9010)
  - Console: port 9011
  - Network: wifi-management-app_wifi_network
  - Bucket LMS: `lms` (buat baru, jangan pakai `products`)
  - Untuk aktifkan: set STORAGE_DRIVER=s3 di .env

## DATABASE SCHEMAS
Lihat PROJECT_SPEC.md §3 untuk semua tabel.
Key tables: users, modules, module_sessions, questions, question_options,
module_tokens, token_usages, user_module_progress, session_progress,
user_answers, media_files, session_contents, content_watch_progress,
cohorts, cohort_members, module_assignments, notifications, audit_logs

## CURRENT STATE — UPDATE INI SETIAP SELESAI FASE
```
Phase  1: [? DONE] Setup awal — scaffold backend + frontend + docker-compose
Phase  2: [? TODO] Database models + Alembic migration awal
Phase  3: [? TODO] Auth (JWT + refresh token + role guard)
Phase  4: [? TODO] Storage abstraction (sudah di-scaffold, perlu implementasi penuh)
Phase  5: [? TODO] Upload endpoint + signed URL + X-Accel-Redirect
Phase  6: [? TODO] CMS modul & sesi: CRUD + upload media
Phase  7: [? TODO] Token modul: generate, expired_at, validasi
Phase  8: [? TODO] Celery worker: transcode video, PDF, cleanup
Phase  9: [? TODO] Flow belajar user: verifikasi token ? sesi ? submit ? skor
Phase 10: [? TODO] Riwayat, modul aktif, profil, pengaturan
Phase 11: [? TODO] Cohort & assignment + deadline
Phase 12: [? TODO] Laporan admin + export PDF/Excel
Phase 13: [? TODO] Notifikasi in-app
Phase 14: [? TODO] Anti-cheat dasar (tab-switch, randomisasi soal)
Phase 15: [? TODO] Polish UI/UX, error handling, responsive
Phase 16: [? TODO] Testing
```

## RULES UNTUK AGENT
1. **Baca PROGRESS.md dulu** sebelum mulai task apapun
2. **Update PROGRESS.md + CHANGELOG.md** setelah selesai setiap sub-task
3. **Jangan skip fase** — pastikan fase sebelumnya bisa dijalankan sebelum lanjut
4. **Anti-halusinasi**: selalu `view_file` sebelum edit, selalu grep sebelum asumsi
5. **Sebelum deploy ke server**: test lokal dulu dengan docker compose up
6. **Port lokal yang digunakan** (jangan bentrok):
   - Backend API: 8000
   - Frontend Vite: 5173
   - Nginx LMS: 8080
   - MSSQL LMS: 1434
   - Redis LMS: 6380
   - MinIO: sudah di server (9010, 9011) — tidak ada di local compose

## HOW TO START WORKING
```bash
# Pertama kali setup
cd C:\Users\User\ageng\lms
docker compose up -d lms_database lms_redis   # start infrastruktur dulu
cd backend && pip install -r requirements.txt  # install deps lokal jika dev tanpa docker
# Buat .env dari .env.example
cp backend/.env.example backend/.env

# Run semua
docker compose up -d

# Cek logs
docker compose logs -f lms_backend
```

## CONTACTS & LINKS
- Wifi Management App (existing): /home/alfa/wifi-management-app/
- WA Gateway: /home/alfa/wa-gateway-api/
