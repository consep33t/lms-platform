# Changelog � LMS Platform

All notable changes to this project are documented here.

---

## [1.1.0] � 2026-08-16

### Fixed & Hardened � High Availability, Media Pipeline & Zero-Copy Streaming
- **Dynamic Docker DNS Resolver in Nginx**: Menambahkan directif `resolver 127.0.0.11 valid=5s` dan dynamic upstream variable pada `deploy/nginx.prod.conf` untuk mengeliminasi Cloudflare Error 502 saat container backend di-recreate.
- **RFC 1123 MinIO Compatibility**: Memperbaiki network alias `shared-minio` pada Docker Compose untuk mencegah strict host header rejection.
- **aioboto3 Context Manager**: Memperbarui `s3_driver.py` dengan per-request async session generation dan abort multipart handler.
- **Non-Destructive Image Optimization**: Menambahkan pipeline kompresi non-destruktif Pillow (LANCZOS resampling, WebP, Progressive JPEG) untuk format PNG, JPG, dan WebP guna menghemat 30-70% bandwidth tanpa mengurangi ketajaman visual.
- **HTTP 206 Partial Content Range Streaming**: Streaming video MP4 chunked byte ranges untuk playback instan dan zero RAM spike.
- **Interactive Frontend Learning & Quiz**: Frontend terhubung dinamis ke database, video player HTML5 streaming, diagram topologi, dan evaluasi kuis pilihan ganda dengan skor otomatis & pembahasan.

---

## [1.0.0-rc1] � 2026-08-16

### Added � Full Stack Core Implementation

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
