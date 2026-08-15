# Changelog

All notable changes to LMS Platform will be documented in this file.

## [1.4.0] - 2026-08-16
### Added & Security Hardened
- **Proteksi Integritas Kuis (Anti-Answer Leaks):**
  - Menghilangkan pembocoran kunci jawaban (`correct_option_id` dan `explanation`) pada response API submit kuis (`POST /api/v1/sessions/{id}/submit`) dan antarmuka frontend (`SessionPage.tsx`).
  - Peserta hanya menerima status kelulusan, persentase nilai akhir, dan jumlah soal benar/salah tanpa mengetahui opsi mana yang menjadi kunci jawaban yang bocor, mencegah eksploitasi hafalan kunci jawaban.
- **Generasi Modul Baru Enterprise (Cloud Native, Kubernetes & GitOps):**
  - Modul baru: *"Arsitektur Cloud Native: Kubernetes Orchestration, Docker & GitOps Enterprise"*.
  - Sesi 1: Fundamental Docker & Kernel Linux Namespaces/cgroups dengan Diagram Resolusi Tinggi.
  - Sesi 2: Orkestrasi Kubernetes Cluster dengan Pemutar Video Demonstrasi Streaming MP4 (HTTP 206 Partial Content).
  - Sesi 3: GitOps CI/CD Pipeline & Zero-Downtime Deployment dengan Diagram Alur High-Res.
  - Token Akses Modul Khusus: `CLOUDNATIVE-PRO-2026` & `K8S-DEVOPS-2026`.
  - Integrasi penuh ke database MSSQL dan MinIO S3 Object Storage.

## [1.3.0] - 2026-08-16
### Fixed & Hardened
- Pengikatan token akses ketat per modul (Strict Module Token Binding).
- Kalkulasi progres kumulatif modul dari database (Real-time Live Sync).
- Implementasi Admin Cohorts & Reports CMS.

## [1.2.0] - 2026-08-16
### Fixed
- Evaluasi kuis server-side dengan skema relasi ForeignKey SessionProgress -> UserModuleProgress.
- Eager loading selectinload pada async SQLAlchemy.

## [1.1.0] - 2026-08-15
### Added
- Integrasi Cloudflare Tunnel domain https://lms.consep33t.my.id.
- Nginx dynamic DNS resolver dan HTTP 206 chunked range streaming.
