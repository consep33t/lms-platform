# Changelog

All notable changes to LMS Platform will be documented in this file.

## [3.9.0] - 2026-08-16
### 📱 Tier 12: Progressive Web App (PWA) Offline First, Download Cache & Web Push Engine

#### 🗄️ Mobile & PWA Database Models (Fase 1: PWA Database Architect)
- **[DB] `PushSubscription`** — Pengelolaan endpoint langganan browser Web Push (VAPID key, auth key, p256dh) per user/tenant.
- **[DB] `OfflineSyncQueueLog`** — Pencatatan riwayat event outbox sinkronisasi offline (`progress_heartbeat`, `note_save`, `quiz_answer`).

#### ⚙️ Background Sync & Web Push Services (Fase 2: PWA Backend Engineer)
- **[Service] `pwa_service.py`** — Pengolah batch event mutasi offline dengan resolusi konflik idempoten dan gateway notifikasi Web Push VAPID.
- **[API] Endpoints RESTful** — `GET /api/v1/pwa/vapid-public-key`, `POST /api/v1/pwa/push/subscribe`, `POST /api/v1/pwa/push/unsubscribe`, `POST /api/v1/pwa/sync/batch`.

#### 🎨 Service Worker, IndexedDB Storage & Offline UI (Fase 3: Senior Frontend PWA Engineer)
- **[PWA] `manifest.json` & `sw.js`** — Dukungan instalasi aplikasi standalone, strategi CacheFirst untuk aset, NetworkFirst untuk API, dan listener background sync/push.
- **[Storage] `offlineStorage.ts`** — Wrapper IndexedDB untuk penyimpanan luring blob video materi, dokumen PDF, dan antrean mutasi event outbox.
- **[Component] `OfflineIndicator.tsx` & `DownloadLessonButton.tsx`** — Indikator status jaringan real-time dengan counter antrean dan tombol unduh materi luring.

## [3.8.0] - 2026-08-16

### 🔐 Tier 11: Enterprise Single Sign-On (SSO SAML 2.0 / OIDC) & LDAP Directory Sync

#### 🗄️ Enterprise Identity Database Models (Fase 1: SSO Database Architect)
- **[DB] `SSOProvider`** — Konfigurasi multi-protokol IdP per tenant (`SAML_2_0`, `OIDC`, `LDAP`), X.509 certs, endpoints IdP, dan pemetaan atribut klaim (*attribute mapping*).
- **[DB] `SSOAuditLog`** — Audit trail aktivitas otentikasi korporat (`login_success`, `login_failed`, `jit_provisioned`, `ldap_sync`).

#### ⚙️ Identity Services & JIT Provisioning (Fase 2: SSO Backend Engineer)
- **[Service] `sso_service.py`** — Generator AuthnRequest SAML 2.0 & OIDC Auth URL, pemroses klaim atribut, JIT user provisioning otomatis, dan sinkronisasi direktori LDAP.
- **[API] Endpoints RESTful** — `GET /api/v1/sso/providers`, `POST /api/v1/sso/providers`, `GET /api/v1/sso/login/{id}`, `POST /api/v1/sso/saml/callback`, `POST /api/v1/sso/oidc/callback`, `POST /api/v1/sso/ldap/sync/{id}`.

#### 🎨 Corporate SSO Login & Admin Config UI (Fase 3: Frontend SSO Engineer)
- **[Page] `LoginPage.tsx`** — Tombol dinamis "🔐 Login dengan SSO Korporat" saat tenant memiliki konfigurasi IdP aktif.
- **[Page] `AdminSSOConfigPage.tsx`** — Dashboard admin organisasi untuk konfigurasi SAML/OIDC/LDAP, visual attribute claim mapper, dan tool uji koneksi.

## [3.7.0] - 2026-08-16

### 📦 Tier 10: SCORM & xAPI (Tin Can) E-Learning Standards Engine

#### 🗄️ E-Learning Standards Database Models (Fase 1: SCORM Database Architect)
- **[DB] `ScormPackage`** — Pengelolaan paket konten SCORM 1.2 / 2004 / xAPI dengan metadata manifest terurai, storage path, dan URL SCO.
- **[DB] `ScormTracking`** — Data runtime CMI (`lesson_status`, `score_raw`, `suspend_data`, `total_time`, `cmi_data` JSON store) dengan unique constraint `(user_id, package_id)`.
- **[DB] `XAPIStatement`** — Penyimpanan LRS activity stream standar xAPI (`actor`, `verb`, `object`, `result`, `statement_json`).

#### ⚙️ XML Manifest Parser & CMI Services (Fase 2: SCORM Backend Engineer)
- **[Service] `scorm_service.py`** — Parser otomatis `imsmanifest.xml` (ekstraksi judul, identifier, dan file entry SCO menggunakan `xml.etree.ElementTree`), sinkronisasi CMI status, dan LRS ingestion.
- **[API] Endpoints RESTful** — `POST /api/v1/scorm/upload`, `GET /api/v1/scorm/packages/{id}`, `GET /api/v1/scorm/packages/{id}/tracking`, `POST /api/v1/scorm/packages/{id}/tracking`, `POST /api/v1/scorm/xapi/statements`.

#### 🎨 Runtime CMI JavaScript Bridge & Player UI (Fase 3: Frontend SCORM Engineer)
- **[Component] `ScormPlayer.tsx`** — Runtime player interaktif dengan jembatan global `window.API` (SCORM 1.2) dan `window.API_1484_11` (SCORM 2004), penanganan event `LMSInitialize`, `LMSSetValue`, `LMSCommit`, dan sandboxed iframe.
- **[Page] `AdminScormManagerPage.tsx`** — Dashboard admin untuk upload ZIP paket e-learning, inspeksi manifest, dan uji coba launch player.

## [3.6.0] - 2026-08-16

### 💳 Tier 9: Monetization, Payment Gateways & Automated Invoicing

#### 🗄️ Financial & Payment Database Models (Fase 1: Payment Database Architect)
- **[DB] `Order` & `OrderItem`** — Pengelolaan pesanan modul dengan nomor order unik index (`order_number`), rincian diskon, dan status transaksi berjenjang.
- **[DB] `Transaction`** — Pencatatan log transaksi gateway (`midtrans`, `stripe`), metode pembayaran (`qris`, `bank_transfer`, `credit_card`), dan raw response.
- **[DB] `Coupon`** — Mesin kode promo dinamis (diskon persentase/nominal tetap, batas pembelian minimal, capping diskon maksimal, batas kuota, dan masa berlaku).

#### ⚙️ Payment Service & Webhook Handlers (Fase 2: Payment Backend Engineer)
- **[Service] `payment_service.py`** — Generator token Midtrans Snap, sesi Stripe Checkout, kalkulator diskon kupon, dan penyusun data invoice resmi.
- **[API] Endpoints RESTful** — `POST /api/v1/payments/orders`, `POST /api/v1/payments/coupons/validate`, `POST /api/v1/payments/webhooks/midtrans`, `POST /api/v1/payments/webhooks/stripe`, `GET /api/v1/payments/orders/my`, `GET /api/v1/payments/orders/{id}/invoice`.

#### 🎨 Checkout, Invoicing & Financial Analytics UI (Fase 3: Frontend Payment Engineer)
- **[Page] `CheckoutPage.tsx`** — Alur pembayaran modern dengan ringkasan harga, validasi kupon instan, dan pemilih gateway (Midtrans Snap QRIS / Stripe).
- **[Page] `OrderHistoryPage.tsx`** — Riwayat transaksi siswa dengan badge status real-time dan unduh invoice.
- **[Page] `AdminOrdersPage.tsx`** — Dashboard keuangan omzet penjualan, daftar pesanan, dan form pembuat kupon diskon.

## [3.5.0] - 2026-08-16

### 🏢 Tier 8: Multi-Tenancy Enterprise & White-Label Customization Engine

#### 🗄️ Multi-Tenancy Database Models (Fase 1: Multi-Tenancy Database Architect)
- **[DB] `Tenant`** — Entitas organisasi/klien korporat dengan subdomain slug index unik, kustomisasi warna hex (`primary_color`, `secondary_color`), logo media ref, dan metadata zero-DDL.
- **[DB] `TenantUser`** — Pemetaan pengguna organisasi dengan peran berjenjang (`tenant_admin`, `instructor`, `member`) dan compound unique constraint `(tenant_id, user_id)`.

#### ⚙️ Middleware & Tenant API Services (Fase 2: Multi-Tenancy Backend Engineer)
- **[Middleware] `tenant_middleware.py`** — Resolusi otomatis tenant dari Subdomain (`Host` header) atau `X-Tenant-ID` header.
- **[API] Endpoints RESTful** — `GET /api/v1/tenants/current`, `GET /api/v1/tenants`, `POST /api/v1/tenants`, `PUT /api/v1/tenants/{id}/branding`, `POST /api/v1/tenants/{id}/users`.

#### 🎨 Dynamic Theming & Superadmin UI (Fase 3: Senior Frontend Tenant Engineer)
- **[Context] `TenantContext.tsx`** — Injeksi dinamis CSS variables `--primary` & `--secondary` pada `:root` dan kustomisasi judul aplikasi serta favicon.
- **[Page] `TenantManagementPage.tsx`** — Dashboard Superadmin untuk mengelola organisasi klien, live color picker preview, dan konfigurasi branding korporat.
- **[Navbar] `Navbar.tsx`** — Render logo dan nama organisasi aktif secara dinamis.

## [3.4.0] - 2026-08-16

### 🧪 Tier 7: Automated End-to-End Testing, Load Testing & Production Hardening Runbook

#### 🎭 Automated E2E Testing Suite (Fase 1: Senior E2E Test Engineer)
- **[Playwright] `playwright.config.ts`** — Konfigurasi multi-browser (Chromium, Firefox, WebKit, Mobile Viewports) dengan BaseURL & webServer integration.
- **[E2E] `auth.spec.ts`** — Pengujian alur registrasi akun baru, login, validasi token cookie httpOnly, proteksi rute admin, dan logout.
- **[E2E] `learning-journey.spec.ts`** — Pengujian alur belajar lengkap: klaim modul, tonton video, drawer catatan, tanya AI Tutor, submit kuis adaptif, dan modal selebrasi lencana kelulusan.
- **[E2E] `realtime-study-room.spec.ts`** — Pengujian multi-user browser context untuk pembuatan ruang belajar cohort dan live chat instan.

#### ⚡ High-Concurrency Load Testing (Fase 2: Load Testing Specialist)
- **[k6] `k6_api_benchmark.js`** — Uji beban 500 Virtual Users (VUs) pada REST API (`/modules`, `/sessions`, `/leaderboard`, `/notes`) dengan threshold $p_{95} < 200\text{ms}$.
- **[k6] `k6_websocket_load.js`** — Uji beban 1,000 koneksi concurrent WebSocket dengan threshold $p_{95} < 100\text{ms}$ latency dan zero dropped connections.

#### 🛡️ Production Hardening & Operations Runbook (Fase 3: Production DevOps Engineer)
- **[Docker] `docker-compose.prod.yml`** — Konfigurasi produksi dengan multi-worker FastAPI, Celery worker, Redis, Nginx reverse proxy, healthchecks, dan resource limits.
- **[Scripts] `scripts/backup_database.sh` & `scripts/restore_database.sh`** — Skrip otomatisasi backup dan restore database dengan kompresi gzip.
- **[Docs] `docs/PRODUCTION_RUNBOOK.md`** — Panduan operasional komprehensif untuk deployment zero-downtime, SOP insiden, dan checklist keamanan pre-flight.

## [3.3.0] - 2026-08-16

### 🤖 Tier 6: AI-Powered Learning Assistant & Adaptive Quiz Engine

#### ⚙️ AI Engine, Schemas & Endpoints (Fase 1: AI Backend Engineer)
- **[AI] `AITutorService`** — Konteks materi sesi dinamis dengan dukungan generator jawaban pedagogis dan saran pertanyaan lanjutan (*suggested follow-ups*).
- **[AI] `AdaptiveQuizService`** — Algoritma pemilihan tingkat kesulitan soal adaptif (Hard >=80%, Medium 50-79%, Easy <50%).
- **[API] Endpoints RESTful** — `POST /api/v1/ai/tutor/ask`, `POST /api/v1/ai/quiz/explain`, `POST /api/v1/ai/quiz/adaptive-next`.

#### 🎨 Frontend AI Components & Integration (Fase 2: Frontend AI Engineer)
- **[Component] `AITutorChatDrawer.tsx`** — Drawer chat AI mengambang di sisi kanan dengan chip prompt cepat ("💡 Rangkum Materi", "🔍 Contoh Nyata").
- **[Modal] `AIQuestionExplanationModal.tsx`** — Dialog modal penjelasan mendalam mengenai alasan mengapa suatu opsi kuis benar atau salah.
- **[Integration] `SessionPage.tsx`** — Tombol "🤖 AI Tutor" di top bar header dan tombol "💡 Tanya AI Penjelasan" di setiap soal review kuis.

## [3.2.0] - 2026-08-16

### ⚡ Tier 5: Realtime Multi-User Collaboration & WebSocket Live Engine

#### 🗄️ Realtime Database Models (Fase 1: Realtime Architect)
- **[DB] `StudyRoom`** — Ruang belajar bersama per cohort/modul dengan kuota peserta, status aktif, dan metadata zero-DDL.
- **[DB] `StudyRoomMember`** — Manajemen peran (host/member) dengan `UniqueConstraint('room_id', 'user_id')`.
- **[DB] `StudyRoomMessage`** — Pesan chat live, cuplikan kode, dan shared notes dengan indeks `(room_id, created_at)`.

#### ⚙️ WebSocket Manager & Study Room Services (Fase 2: WebSocket Systems Engineer)
- **[WS] `RealtimeConnectionManager`** — FastAPI WebSocket connection registry dengan dukungan Redis Pub/Sub multi-instance channel broadcasting (`presence:session:{id}`, `discussions:session:{id}`, `room:{id}`).
- **[API] REST & WS Endpoints** — `/api/v1/study-rooms`, `/api/v1/ws/session/{session_id}`, `/api/v1/ws/study-rooms/{room_id}`.

#### 🎨 Frontend Realtime Components (Fase 3: Frontend Realtime Engineer)
- **[Hook] `useWebSocket.ts`** — Custom auto-reconnect hook dengan exponential backoff dan heartbeat ping/pong.
- **[Component] `ActiveLearnerPresence.tsx`** — Indikator live avatar dan counter siswa aktif pada top bar `SessionPage.tsx`.
- **[Page] `StudyRoomsPage.tsx`** — Lobi ruang belajar cohort dengan kartu ruangan, tag topik, dan modal buat ruang baru.
- **[Modal] `LiveStudyRoomModal.tsx`** — Ruang belajar interaktif dengan chat live, sidebar peserta, dan shared notes board.

## [3.1.0] - 2026-08-16

### 🏆 Fullstack Multi-Skill Orchestration: 8 Analytical Skills, 7 Database Skills, 10 Backend & Storage Skills, and 8 Frontend & GSAP Skills

#### 🔬 Fase 1: Riset Analisis & Penemuan Fitur (8 Subagent Analitis)
- **[PM Toolkit & Discovery]** — Opportunity Solution Tree (OST) & Matriks RICE memetakan 6 inisiatif fitur dengan North Star metric (30-Day Completion Rate & DALR).
- **[UX Research & Personas]** — Menemukan titik friksi *anti-cheat tab-switch trap* saat mencatat materi dan kelelahan visual malam hari.
- **[Market Benchmarking & Growth Loops]** — Merumuskan *Daily Streak habit loop*, *Contextual Q&A community*, dan *Milestone Badge GSAP celebrations* terinspirasi dari Duolingo, Canvas, dan Coursera.

#### 🗄️ Fase 2: Audit & Hardening Basis Data (7 Subagent Basis Data)
- **[Models]** — Model ORM baru: `DiscussionTopic`, `DiscussionReply`, `DiscussionVote`, `UserNote`, `BadgeDefinition`, `UserBadge`, `UserXPLog`.
- **[Indexes & Constraints]** — Compound unique constraint `(session_id, user_module_progress_id)` pada `SessionProgress` dan `(session_progress_id, session_content_id)` pada `ContentWatchProgress`.
- **[Cross-DB Dialect]** — Standardisasi `MetaData(naming_convention=...)` untuk kompatibilitas penuh MSSQL dan PostgreSQL.

#### ⚙️ Fase 3: Backend API, Gamifikasi, & WebSocket Gateway (10 Subagent Backend & Storage)
- **[Services & Schemas]** — `DiscussionService`, `NoteService`, dan `GamificationService` dengan integrasi Pydantic v2 schemas.
- **[Endpoints]** — Endpoints RESTful baru di `/api/v1/discussions`, `/api/v1/notes`, `/api/v1/gamification`, `/api/v1/reviews`, dan `/api/v1/ws/notifications/{user_id}`.
- **[MinIO S3 Attachments]** — Dukungan lampiran dokumen forum (`discussion_attachment`) dan ikon lencana gamifikasi (`badge_icon`).
- **[Automated Testing]** — 14 automated unit tests lulus 100% tanpa regresi.

#### 🎨 Fase 4: Frontend UI/UX, Theme Engine & GSAP Animasi (8 Subagent Frontend & GSAP)
- **[Dual-Pane Notes Drawer]** — `SessionNotesDrawer.tsx` mengambang dengan 500ms debounced auto-save ke backend & local storage, anti-cheat safe.
- **[Threaded Q&A Forum]** — `SessionDiscussionTab.tsx` terintegrasi langsung di tab samping slide materi dengan fitur upvote dan status *Resolved*.
- **[GSAP Badge Celebration Modal]** — `BadgeCelebrationModal.tsx` dengan animasi GSAP confetti particles, scale-up bounce, dan glowing pulse saat kelulusan sesi.
- **[Theme Switcher Engine]** — `ThemeToggle.tsx` pada `Navbar.tsx` dengan transisi halus icon sun/moon dan persistensi theme dark/light.

## [3.0.0] - 2026-08-16

### 💎 Enterprise Database Redesign, Zero-DDL Extensibility, Composite Indexing & MinIO Storage Overhaul

#### Enterprise Database Redesign & Zero-DDL Extensibility (Fase 1: Data Architect & Performance Indexer)
- **[DB] `meta_data: JSON` Hybrid Pattern** — Implemented across core tables (`User`, `Module`, `ModuleSession`, `SessionContent`, `Question`, `Certificate`, `Cohort`) to enable storing arbitrary custom attributes, rubrics, and settings without requiring future table DDL mutations.
- **[DB] Standardized Soft-Delete & Timestamps** — Standardized `deleted_at: DateTime | None` across all primary entities alongside `is_deleted`.
- **[DB] Polymorphic Question Types** — Added `question_type: String(50)` supporting `multiple_choice`, `multi_select`, `code`, `essay`.
- **[DB] Structured Audit Trail** — Upgraded `AuditLog` to store structured `changes_diff: JSON` for granular historical audits.
- **[DB] High-Performance Composite Indexing**:
  - `user_module_progress`: `(user_id, status)`, `(module_id, status)`, Unique `(user_id, module_id)`.
  - `session_progress`: `(user_module_progress_id, status)`, `(session_id, user_module_progress_id)`.
  - `user_answers`: Unique index on `(session_progress_id, question_id)` preventing race conditions.
  - `session_contents`: `(session_id, order)`.
  - `questions`: `(session_id, order)`.
  - `certificates`: `(user_id, module_id)`, `(certificate_code)`.
  - `audit_logs`: `(entity_type, entity_id, created_at)`, `(user_id, created_at)`.
  - `media_files`: `(owner_type, owner_id)`.
  - Enforced explicit `CASCADE` / `SET NULL` / `NO ACTION` rules on all ForeignKeys.

#### Fullstack API & Storage Engine Overhaul (Fase 2: Backend, Frontend, MinIO Architect)
- **[BE] Schema & Query Optimization** — Updated Pydantic schemas with `meta_data` and `question_type` defaults. Refactored admin reporting queries to utilize scalar subqueries that leverage composite indexes.
- **[FE] Dynamic Question & Metadata UI** — Upgraded `SessionBuilderPage.tsx` and `SessionPage.tsx` with dynamic question type selectors, JSON metadata editor, multi-select checkboxes, and code/essay challenge inputs.
- **[STORAGE] MinIO S3 Multipart & Resumable Video Streaming** — Enhanced `s3_driver.py` with presigned multipart uploads (`create_multipart_upload`, `generate_presigned_part_url`, `complete_multipart_upload`, `abort_multipart_upload`) and automated CORS headers (`Content-Range`, `Accept-Ranges`, `ETag`) enabling smooth HTTP 206 partial video streaming.

## [2.0.7] - 2026-08-16

### 🧪 Import Soal CSV, Automated Test Suite & CI/CD Pipeline (T4-04, T4-06, T4-07)

#### Import Soal Kuis CSV Massal (T4-04)
- **[BE] `admin/questions.py`** — Added `POST /admin/questions/session/{session_id}/import-csv` endpoint supporting `utf-8-sig` encoding, auto-assigning question orders, creating options with correct key mapping (A/B/C/D), and batch committing.
- **[FE] `admin/SessionBuilderPage.tsx`** — Added **"Import Soal (.CSV)"** button and interactive modal dialog featuring instant sample CSV template download (`template_soal_kuis_sesi_X.csv`) and file upload.

#### Automated Pytest Test Suite (T4-06)
- **[BE] `tests/conftest.py`** — Configured modular test fixtures for user payload and JWT token mocks.
- **[BE] `tests/test_auth.py`** — Verified bcrypt password hashing, token creation, sub extraction, and invalid token rejection.
- **[BE] `tests/test_certificates.py`** — Verified `CertificateVerifyResponse` schema serialization and `CERT-LMS-2026-` code conventions.
- **[BE] `tests/test_leaderboard.py`** — Verified `LeaderboardUserItem` ranking calculations and response contracts.
- **[BE] `tests/test_search.py`** — Verified `SearchResultItem` and `GlobalSearchResponse` schema contracts.
- **[BE] `tests/test_questions.py`** — Verified `QuestionCreate` schema, options ordering, and CSV parser logic.
- **[BE] `tests/test_storage.py`** — Verified HMAC signature generation on local and S3 signed URLs.
- **[BE] `app/core/config.py`** — Added resilient default fallback values for database connection parameters during testing and discovery.

#### GitHub Actions CI/CD Pipeline (T4-07)
- **[CI] `.github/workflows/ci.yml`** — Configured multi-job automated CI pipeline:
  - `backend-validation`: Python 3.11 setup, dependencies installation, bytecode compilation check, and pytest test suite execution.
  - `frontend-validation`: Node.js 20.x setup, npm caching, typecheck, and production Vite build bundle validation.

## [2.0.6] - 2026-08-16

### 🏆 Leaderboard, Global Search, Admin Audit Logs & Announcements (T3-01, T3-02, T3-04, T3-03)

#### Leaderboard & Papan Peringkat Prestasi (T3-01)
- **[BE] `schemas/leaderboard.py`** — Added `LeaderboardUserItem`, `GlobalLeaderboardResponse`, `ModuleLeaderboardResponse`.
- **[BE] `api/v1/endpoints/leaderboard.py`** — Implemented `GET /leaderboard` and `GET /leaderboard/module/{module_id}` ranking top participants by completed modules, quiz average scores, and official certificates.
- **[FE] `LeaderboardPage.tsx`** — Created interactive leaderboard page featuring Top 3 Podium (Gold, Silver, Bronze badges), module-specific filter dropdown, and top learners rankings table.

#### Global Search Engine (T3-02)
- **[BE] `schemas/search.py`** — Added `SearchResultItem`, `GlobalSearchResponse`.
- **[BE] `api/v1/endpoints/search.py`** — Implemented `GET /search?q=...` searching across active published modules and session topics.
- **[FE] `GlobalSearchModal.tsx`** — Created instant search modal dialog with `Ctrl+K` keyboard shortcut, debounced query, and instant navigation.

#### Admin Audit Log UI (T3-04)
- **[FE] `admin/AuditLogsPage.tsx`** — Created administrative audit log monitoring dashboard featuring action type filtering (`CREATE`, `UPDATE`, `DELETE`, `BROADCAST`), IP address inspection, and timestamp tracking.

#### Admin Announcements & Broadcasting (T3-03)
- **[BE] `api/v1/endpoints/admin/announcements.py`** — Implemented `POST /admin/announcements` broadcasting messages via `NotificationService` and optional transactional emails via Celery.
- **[FE] `admin/AnnouncementsPage.tsx`** — Created administrative broadcast panel with role targeting, email dispatch checkbox, and audit logging.

## [2.0.5] - 2026-08-16

### 📊 User Dashboard Aggregated, Admin Analytics & Quiz Review Modal (T2-03, T2-02, T2-04)

#### User Dashboard & Resume Learning (T2-03)
- **[BE] `schemas/user.py`** — Added `UserDashboardResponse`, `LastActiveSession`, `UpcomingDeadlineItem`.
- **[BE] `api/v1/endpoints/users.py`** — Added `GET /users/me/dashboard` aggregated endpoint returning total enrolled, completed, certificates, average quiz score, last active session with progress, and upcoming cohort deadlines.
- **[FE] `DashboardPage.tsx`** — Upgraded user dashboard:
  - Hero quick metric cards (Enrolled Modules, Completed Modules, Certificates, Average Score).
  - 1-click **"Lanjutkan Pembelajaran"** interactive widget returning directly to the active session.
  - **Upcoming Deadlines Alert** showing days left until cohort assignment deadlines.

#### Admin Dashboard Analytics & Trends (T2-02)
- **[BE] `api/v1/endpoints/admin/reports.py`** — Added `GET /admin/reports/analytics` endpoint:
  - `enrollment_trend_7d`: 7-day daily participant enrollment trend.
  - `score_distribution`: Categorized quiz score distribution (0-50%, 51-70%, 71-85%, 86-100%).
  - `top_modules`: Top 5 most active modules by enrollment and completion rate.
  - `recent_activities`: Real-time feed of recently completed sessions with user names and scores.
- **[FE] `admin/DashboardPage.tsx`** — Upgraded admin dashboard:
  - Interactive SVG/CSS 7-day bar trend chart.
  - Color-coded score distribution progress meters.
  - Top 5 modules leaderboard.
  - Live activity feed table.

#### Session Quiz Review Modal (T2-04)
- **[BE] `schemas/progress.py`** — Added `QuizReviewResponse`, `QuestionReviewItem`, `OptionReviewItem`.
- **[BE] `services/session_service.py`** — Implemented `get_session_quiz_review(session_id, user_id)` mapping user choices, correct answers, points, and score summary.
- **[BE] `api/v1/endpoints/sessions.py`** — Added `GET /sessions/{session_id}/review`.
- **[FE] `HistoryPage.tsx`** — Upgraded history page:
  - Module session expansion accordion.
  - Interactive **"Review Kuis & Pembahasan"** modal dialog with per-question breakdown, user choice indicators (green/red), correct answer badges, and point details.

## [2.0.4] - 2026-08-16

### 🎓 Workers, Certificates, Anti-Cheat & Export Reports (T1-03, T1-02, T1-04, T2-01)

#### Production Celery Workers (T1-03)
- **[BE] `workers/tasks_video.py`** — Implementasi nyata ekstraksi durasi & resolusi video serta pembuatan thumbnail otomatis frame ke-5 detik menggunakan `ffprobe`/`ffmpeg` dan update status `MediaFile.status = ready`.
- **[BE] `workers/tasks_email.py`** — Pengiriman email transaksional SMTP dengan template HTML modern ber-branding LMS Alfanet Mediatama.
- **[BE] `workers/tasks_cleanup.py`** — Pembersihan berkala otomatis (Celery Beat) untuk upload berkas yatim (*orphan uploads*) dan penonaktifan token kedaluwarsa.
- **[BE] `workers/tasks_certificate.py`** — Background task pembuatan sertifikat kelulusan modul.

#### Certificate Generation & Public Verification (T1-02)
- **[BE] `schemas/certificate.py`** — Schema Pydantic `CertificateResponse`, `CertificateVerifyResponse`, `CertificateListItem`.
- **[BE] `models/progress.py`** — Relasi ORM `Certificate.user`, `Certificate.module`, dan `Certificate.media_file`.
- **[BE] `services/certificate_service.py`** — Service pembuatan sertifikat berformat SVG/PDF resmi dengan nomor seri `CERT-LMS-2026-XXXX`, penyimpanan berkas ke storage driver, dan auto-dispatch notifikasi in-app + email.
- **[BE] `api/v1/endpoints/certificates.py`** — Endpoint `GET /certificates/my`, `GET /certificates/{id}/download`, dan endpoint publik `GET /certificates/verify/{code}`.
- **[BE] `services/session_service.py`** — Auto-trigger penerbitan sertifikat saat peserta menuntaskan 100% modul.
- **[FE] `CertificatesPage.tsx`** — Dashboard sertifikat pengguna dengan tombol unduh berkas dan tautan verifikasi online.
- **[FE] `VerifyPage.tsx`** — Portal verifikasi publik untuk memeriksa keabsahan dan detail sertifikat secara terbuka.
- **[FE] `HistoryPage.tsx` & `Navbar.tsx`** — Tautan cepat ke sertifikat kelulusan.

#### Anti-Cheat System (T1-04)
- **[BE] `api/v1/endpoints/sessions.py`** — Endpoint `POST /sessions/{id}/flag` untuk mencatat pelanggaran selama sesi kuis.
- **[BE] `services/session_service.py`** — Metode `record_session_flag` dengan pencatatan ke model `SessionFlag`.
- **[FE] `SessionPage.tsx`** — Event listener `visibilitychange` (deteksi perpindahan tab browser saat kuis aktif) dengan peringatan bertahap (*warning toast* "Peringatan X dari 3").

#### Admin Export Reports (T2-01)
- **[BE] `api/v1/endpoints/admin/reports.py`** — Endpoint `GET /admin/reports/export/module-completion` & `GET /admin/reports/export/users` dalam format `.CSV` UTF-8 dengan BOM.
- **[FE] `ReportsPage.tsx`** — Tombol download instan laporan kelulusan modul dan laporan data pengguna.

## [2.0.3] - 2026-08-16

### 🎯 Tier 1 Foundation Completion (T1-01, T2-05, T1-05)

#### Cohorts & Assignments (T1-01)
- **[BE] `schemas/cohort.py`** — Added schemas for Cohort CRUD, Member Management (`CohortMemberAdd`, `CohortMemberItem`), and Module Assignments (`ModuleAssignmentCreate`, `ModuleAssignmentResponse`).
- **[BE] `models/cohort.py`** — Added ORM relationships for `Cohort.assignments`, `CohortMember.user`, and `ModuleAssignment.module`.
- **[BE] `api/v1/endpoints/admin/cohorts.py`** — Implemented complete REST endpoints:
  - `GET/PUT/DELETE /admin/cohorts/{id}`
  - `GET/POST/DELETE /admin/cohorts/{id}/members` (with user search and bulk add)
  - `GET/POST/DELETE /admin/cohorts/{id}/assignments` (assign module with deadline)
- **[FE] `CohortsPage.tsx`** — Upgraded to full interactive dashboard:
  - Cohort cards with member and assignment counts
  - Create and Edit cohort modal forms
  - Manage Members drawer/modal with live user search and multi-select add
  - Module Assignment modal with module selector, deadline date picker, and unassign action

#### Token Verification & Progress Integration (T2-05)
- **[BE] `services/module_service.py`** — Refactored `verify_and_unlock_token`:
  - Validates and redeems tokens using `TokenService`
  - Automatically initializes `UserModuleProgress` (status `in_progress`)
  - Dispatches automated in-app notification via `NotificationService`
  - Atomic transaction flush (`await self.db.flush()`)

#### Interactive Profile & Password Management (T1-05)
- **[BE] `schemas/user.py`** — Updated `UserUpdate` with `phone_number` and `institution`.
- **[BE] `services/user_service.py`** — Aligned `update_profile` with model columns.
- **[BE] `api/v1/endpoints/users.py`** — Added `PUT /users/me/password` and updated `PUT /users/me`.
- **[FE] `ProfilePage.tsx`** — Converted from static view to interactive tabbed interface:
  - Tab 1: Edit Full Name, Phone, Institution with Save button and instant Zustand store sync
  - Tab 2: Change Password with current password verification and length validation

## [2.0.2] - 2026-08-16
### 🚀 Feature Implementation & Security Hardening (Audit Follow-Through)

#### New Implementations (Stub → Production Code)
- **[BE] `NotificationService`** — Implementasi penuh: `create`, `get_for_user`, `get_unread_count`, `mark_read`, `mark_all_read`, `broadcast` untuk kirim ke banyak user sekaligus.
- **[BE] `/notifications` Endpoints** — Endpoint aktif: `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/{id}/read`, `PATCH /notifications/read-all`.
- **[BE] `TokenService`** — Implementasi penuh: `validate` (cek expired/uses/active), `redeem` (idempotent), `generate_unique_code` (collision-retry), `has_user_redeemed`.
- **[BE] `UserService`** — Implementasi penuh: `update_profile`, `change_password` (verify current + hash new), `get_settings`, `update_settings`.
- **[BE] `BaseRepository`** — Generic async CRUD: `get_by_id`, `get_all`, `count`, `create`, `update_fields`, `delete`. Siap diwariskan oleh repo konkrit.

#### Security Fixes
- **[BE] JWT Blacklist Logout** — Logout kini mem-blacklist JTI access token di Redis dengan TTL sisa masa berlaku. Token lama otomatis ditolak oleh `get_current_user_id` setelah logout.
- **[BE] `dependencies.py`** — Tambahkan cek `jti_blacklist:{jti}` di Redis pada setiap request.
- **[INFRA] `docker-compose.prod.yml`** — Hapus SEMUA hardcoded secrets:
  - `MSSQL_SA_PASSWORD=LmsProdSecret2026!` → `${MSSQL_SA_PASSWORD}`
  - `S3_SECRET_KEY=SuperSecretPassword123` → `${S3_SECRET_KEY}`
  - `S3_ACCESS_KEY=admin` → `${S3_ACCESS_KEY}`
  - Redis diberi password: `--requirepass ${REDIS_PASSWORD}`
  - REDIS_URL backend/worker diupdate: `redis://:${REDIS_PASSWORD}@lms_redis:6379/0`

#### MinIO / Storage Fixes
- **[BE] `S3StorageBackend.ensure_bucket_exists()`** — Auto-buat bucket MinIO saat pertama kali dijalankan (head_bucket → create_bucket jika 404). Error handling robust.
- **[BE] `StorageBackend` base class** — Tambahkan `ensure_bucket_exists()` default (no-op, return True) agar local driver tidak perlu implement.
- **[BE] `main.py` startup** — Lifespan sekarang memanggil `ensure_bucket_exists()` saat `STORAGE_DRIVER=s3`. Log startup yang informatif (Redis status, bucket status).

#### Frontend Fixes
- **[FE] `lib/api.ts`** — Fix stale auth state:
  - Request interceptor baca token dari Zustand (`useAuthStore.getState().accessToken`) bukan `localStorage`.
  - Token refresh ter-deduplicate (hanya 1 refresh call meskipun banyak request 401 bersamaan).
  - Setelah refresh: sync token baru ke Zustand + localStorage secara bersamaan.
  - Logout/refresh-fail: memanggil `clearAuth()` bukan `localStorage.removeItem` langsung.
- **[FE] `store/authStore.ts`** — Fix persist: `partialize` kini menyimpan `accessToken` + `user`. Tambah helper `isAuthenticated()`. Zustand menjadi single source of truth.


### 🔒 Security & Bug Fixes (Full Codebase Audit)

#### CRITICAL Fixes
- **[BE] Soft-Delete Email Lock Bug** — `admin_delete_user` kini men-scramble email/custom_lms_email dengan UUID prefix saat soft-delete. Sebelumnya, email yang ter-soft-delete memblokir unique constraint secara permanen dan tidak bisa digunakan kembali.
- **[INFRA] `.env.example` Mismatch** — Koreksi menyeluruh: `JWT_SECRET_KEY→SECRET_KEY`, `JWT_ALGORITHM→ALGORITHM`, `STORAGE_PROVIDER→STORAGE_DRIVER`, `LOCAL_STORAGE_PATH→STORAGE_LOCAL_BASE_PATH`, `REDIS_HOST/PORT→REDIS_URL`. Tambahkan variabel yang hilang: `STORAGE_SIGNING_SECRET`, `EMAILS_ENABLED`, `WA_GATEWAY_URL`, `FRONTEND_URL`.

#### HIGH Fixes
- **[BE] Admin Update User IntegrityError** — `admin_update_user` kini mengecek email duplikat sebelum update untuk mencegah HTTP 500 dari DB IntegrityError.
- **[BE] S3/MinIO Multipart Abort Crash** — Fix `KeyError` saat `create_multipart_upload` gagal; `upload_id` hanya direferensikan setelah berhasil dibuat. Abort juga di-wrap try/except agar error asli tidak tertutupi.
- **[BE] Session Submit Score Tidak Tersimpan** — Tambah `await self.db.flush()` di `submit_session_quiz()`, `submit_quiz_step()`, dan `update_watch_progress()` agar perubahan skor/status terpersist dalam transaksi.
- **[BE] Legacy Submit Hardcoded `session_id=1`** — Endpoint `/sessions/submit` (legacy) tidak lagi fallback ke session #1; raise HTTP 422 jika `session_id` tidak disediakan.

#### MEDIUM Fixes
- **[BE] Redis Cache: No Error Handling** — Rewrite `cache.py` total dengan graceful degradation; jika Redis down, API tetap berjalan tanpa crash. Tambah TTL constants, helper functions `cache_get/set/delete/delete_pattern`, connection timeout 2 detik.
- **[BE] Profile Update Tidak Di-flush** — `update_my_profile` kini memanggil `await db.flush()` agar perubahan nama tersimpan.
- **[BE] Progress Completion Count Ambiguous** — Komentar klarifikasi ditambahkan bahwa hanya session `is_deleted=False` yang dihitung sebagai `total_sessions`.

## [2.0.0] - 2026-08-16
### Major Milestone Release: 10 Enterprise Modules & 150 Deep Sessions
- **Massive Curriculum Expansion (10 Modules x 15 Sessions = 150 Sessions):**
  - Modul 1: Modern Backend Engineering & High-Performance Distributed Systems (`BACKEND-PRO-2026`)
  - Modul 2: Cloud Native Architecture, Kubernetes Orchestration & GitOps (`K8S-GITOPS-2026`)
  - Modul 3: Advanced DevOps, CI/CD Automation & Observability Engineering (`DEVOPS-OBS-2026`)
  - Modul 4: Database Internals, High-Availability Clustering & Distributed SQL (`DATABASE-CORE-2026`)
  - Modul 5: Enterprise Network Infrastructure, BGP Routing & SD-WAN Architecture (`NETWORK-ENTERPRISE-2026`)
  - Modul 6: Cybersecurity Defense, Threat Hunting & Zero Trust Architecture (`CYBERSEC-SHIELD-2026`)
  - Modul 7: Microservices Architecture, Event-Driven Systems & Kafka Streaming (`MICROSERVICES-KAFKA-2026`)
  - Modul 8: Modern Frontend Engineering, Web Performance & Micro-Frontends (`FRONTEND-ULTRA-2026`)
  - Modul 9: AI Engineering, Large Language Models (LLM) & RAG Architecture (`AI-ENGINEERING-2026`)
  - Modul 10: Site Reliability Engineering (SRE), Chaos Engineering & Zero Downtime (`SRE-RESILIENCE-2026`)
- **Rich Multimedia Assets:**
  - 10 Arsitektur Blueprint SVG resolusi tinggi.
  - 10 Video demonstrasi MP4 berstandar streaming *HTTP 206 Partial Content*.
  - Penyimpanan tersinkronisasi pada disk lokal `/data/uploads` dan MinIO S3 bucket `lms`.
- **Interspersed Dynamic Quizzes:**
  - Setiap sesi dilengkapi bank soal kuis berbobot proporsional di sela-sela materi slide.
- **Admin Full CRUD Suite:**
  - CRUD Modul, Sesi, Konten Slide, Bank Soal Kuis, Pengguna, Token Akses, dan Grup Angkatan (Cohorts).

## [1.5.0] - 2026-08-16
### Added
- Slide Sequencer, Live Countdown Timer, and Auto-Timeout Progress Calculation.
