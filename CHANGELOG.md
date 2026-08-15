# Changelog

All notable changes to LMS Platform will be documented in this file.

## [1.2.0] - 2026-08-16
### Fixed & Hardened (Eliminasi Total Ilusi, Mock & Hutang Teknis)
- **Engine Evaluasi Kuis di Server:**
  - Evaluasi kuis pilihan ganda kini 100% diproses di backend FastAPI + database MSSQL (`POST /api/v1/sessions/{id}/submit`).
  - Menghilangkan mock frontend: kalkulasi skor, kelulusan KKM, penyimpanan `user_answers`, dan feedback pembahasan soal kini bersumber langsung dari database.
  - Relasi `SessionProgress` dan `UserModuleProgress` telah diselaraskan dengan foreign key yang tepat beserta penanganan eager loading `selectinload` untuk mencegah missing greenlet pada async SQLAlchemy.
- **Sinkronisasi Progres Pembelajaran:**
  - Endpoint baru `GET /api/v1/users/me/progress` mengagregasi persentase kemajuan modul, sesi yang telah selesai, dan nilai rata-rata kuis secara real-time.
  - `HistoryPage.tsx` di frontend telah diperbarui untuk menampilkan kemajuan riil pengguna.
- **Admin CMS Dashboard & Manajemen Terintegrasi:**
  - Endpoint `/api/v1/admin/reports/dashboard` dan `/api/v1/admin/reports/dashboard-stats` menyediakan statistik analitik real-time.
  - Halaman Admin (`DashboardPage.tsx`, `ModulesPage.tsx`, `TokensPage.tsx`, `UsersPage.tsx`) terhubung penuh ke REST API live tanpa mock data.
- **Penanganan Berkas Besar (Video & Gambar):**
  - Implementasi HTTP 206 Partial Content Chunked Range Streaming untuk video tanpa lonjakan RAM.
  - Pipeline optimasi gambar non-destruktif Pillow (LANCZOS + WebP + Progressive JPEG).
  - MinIO S3 Driver thread-safe per request.

## [1.1.0] - 2026-08-15
### Added
- Integrasi Cloudflare Tunnel domain `https://lms.consep33t.my.id`.
- Nginx dynamic DNS resolver `127.0.0.11` untuk auto-recovery backend upstream saat container recreate.
- Data kurikulum riil untuk 3 Modul Jaringan & Keamanan Siber, Sesi, Konten Multimedia, Soal Kuis, dan Token Akses.
