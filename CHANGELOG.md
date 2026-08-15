# Changelog

All notable changes to LMS Platform will be documented in this file.

## [1.3.0] - 2026-08-16
### Fixed & Hardened (Strict Module Token Binding, Cumulative Progress Sync, and Real Admin CMS)
- **Pengikatan Token Akses Ketat per Modul (Strict Module Binding):**
  - Mengatasi celah di mana token satu modul bisa digunakan di modul lain.
  - Endpoint `POST /api/v1/modules/{id}/unlock` dan `POST /api/v1/modules/verify-token` kini memverifikasi kecocokan `token.module_id == target_module_id`. Jika token salah modul dimasukkan, backend menolak dengan pesan jelas dan tidak membuka akses.
- **Kalkulasi & Sinkronisasi Progres Kumulatif Sesi per Modul:**
  - Endpoint `GET /api/v1/modules/{id}/user-status` mengagregasi status kelulusan tiap sesi, skor, dan persentase kemajuan kumulatif modul secara real-time dari database.
  - `ModuleDetailPage.tsx` dan `DashboardPage.tsx` di frontend kini merefleksikan status riil dari database (eliminasi mock `localStorage`).
- **Penilaian Pilihan Ganda & Bank Soal Kuis Lengkap:**
  - Seluruh 6 sesi pembelajaran kini dilengkapi bank soal kuis pilihan ganda terstruktur dengan feedback pembahasan per soal.
  - Evaluasi kuis menghitung rasio kelulusan secara tepat berdasarkan jumlah soal dan standar KKM modul.
- **Admin CMS Terpadu (Cohorts & Reports):**
  - Implementasi halaman `CohortsPage.tsx` dan `ReportsPage.tsx` yang terhubung langsung ke REST API `admin/cohorts` dan `admin/reports/module-completion`.
  - Memperbaiki konstruksi SQLAlchemy `case` pada kalkulasi analitik laporan kelulusan.

## [1.2.0] - 2026-08-16
### Fixed
- Evaluasi kuis server-side dengan skema relasi ForeignKey `SessionProgress` -> `UserModuleProgress`.
- Eager loading `selectinload` untuk mencegah missing greenlet pada SQLAlchemy async.

## [1.1.0] - 2026-08-15
### Added
- Integrasi Cloudflare Tunnel domain `https://lms.consep33t.my.id`.
- Nginx dynamic DNS resolver `127.0.0.11` dan HTTP 206 chunked range streaming.
