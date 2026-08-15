# Changelog — LMS Platform

All notable changes to this project are documented here.

---

## [1.0.0-rc1] — 2026-08-16

### Added — Full Stack Core Implementation

#### Database & Models (SQLAlchemy 2.x Async)
- **User Models**: `User`, `UserSettings`, `RefreshToken`, `AuditLog`.
- **Module Models**: `Module`, `ModulePrerequisite`, `ModuleRating`.
- **Session & Content Models**: `ModuleSession`, `SessionContent`, `ContentWatchProgress`.
- **Assessment Models**: `Question`, `QuestionOption`.
- **Token & Access Models**: `ModuleToken`, `TokenUsage`.
- **Progress & Tracking Models**: `UserModuleProgress`, `SessionProgress`, `UserAnswer`, `Certificate`, `SessionFlag`.
- **Cohort & Assignment Models**: `Cohort`, `CohortMember`, `ModuleAssignment`.
- **Notification Models**: `Notification`.
- **Media Models**: `MediaFile` (dengan status lifecycle: `uploading` -> `processing` -> `ready`).

#### Storage & File Serving Architecture
- Storage interface `StorageBackend` dengan driver `LocalDiskStorageBackend` (default) & `S3StorageBackend` (siap aktif via env).
- Streaming upload (1MB per chunk) mencegah kehabisan memory RAM pada file video besar.
- Endpoint serving file privat terlindungi HMAC signature (`/files/{key:path}` -> `X-Accel-Redirect` Nginx).

#### API Services & Endpoints
- **Auth**: Registrasi, login JWT, refresh token cookie httpOnly, get user me, role guard `require_admin`.
- **Media**: Upload multipart streaming, generate signed URL 300s, serve file via Nginx redirect.
- **Modules & Token**: Listing modul published, verifikasi token 8-digit, unlock akses otomatis.
- **Sessions & Quiz**: Ambil materi sesi, tracking watched video percent (throttled), submit jawaban kuis pilihan ganda & kalkulasi skor real-time.
- **Admin CMS**: CRUD Modul, CRUD User, generate & toggle token akses, dashboard statistics analitik.

#### Background Workers (Celery)
- Task pemrosesan metadata video & transcode thumbnail.
- Task pembuatan sertifikat PDF.
- Task pengiriman email notifikasi.
- Periodic beat task pembersihan file upload yatim (orphan/expired).

#### Database Utilities & Testing
- Script `seed.py` untuk inisialisasi akun Superadmin (`admin@lms.local`), User Peserta (`peserta@lms.local`), serta Modul & Token Uji Coba (`NET2026X`).
- Unit test Pytest untuk hashing bcrypt, token JWT flow, dan signed URL HMAC validation.
