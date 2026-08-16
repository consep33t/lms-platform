# 🎓 LMS Enterprise Platform (v3.9.0)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=flat&logo=redis)](https://redis.io)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-45ba4b?style=flat&logo=playwright)](https://playwright.dev)
[![PWA](https://img.shields.io/badge/PWA-Offline%20First-5A0FC8?style=flat&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Platform Pembelajaran Digital (**Learning Management System / LMS**) berskala Enterprise yang dirancang untuk mendukung skalabilitas tinggi, multi-tenancy korporat, interaktivitas *real-time*, standar e-learning global (SCORM & xAPI), serta kapabilitas *offline-first* PWA.

---

## 🏛️ Arsitektur Sistem

```
                                  ┌───────────────────────────────┐
                                  │      Client Applications      │
                                  │  (Web Browser / Mobile PWA)   │
                                  └──────────────┬────────────────┘
                                                 │ HTTPS / WSS
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │         Nginx Gateway         │
                                  │ (Reverse Proxy, SSL, Gzip)    │
                                  └──────────────┬────────────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   ▼                                                           ▼
    ┌──────────────────────────────┐                            ┌──────────────────────────────┐
    │     FastAPI Core Backend     │                            │     Realtime WebSocket Hub   │
    │  - REST API & Endpoints      │                            │  - Presence & Room Heartbeat │
    │  - JWT & SSO SAML/OIDC Auth  │                            │  - Live Q&A Broadcast        │
    │  - Payment Webhooks          │                            │  - Study Room Peer Messaging │
    │  - SCORM / xAPI Engine       │                            └──────────────┬───────────────┘
    └──────────────┬───────────────┘                                           │
                   │                                                           │
         ┌─────────┴─────────┐                                                 │
         ▼                   ▼                                                 ▼
┌─────────────────┐ ┌─────────────────┐                               ┌─────────────────┐
│   PostgreSQL    │ │    MinIO S3     │                               │   Redis Cache   │
│  - Relational   │ │  - Video Media  │                               │  - Session Keys │
│  - Zero-DDL JSON│ │  - Certificates │                               │  - Pub/Sub Chan │
│  - Audit Logs   │ │  - SCORM Assets │                               │  - Rate Limiter │
└─────────────────┘ └─────────────────┘                               └────────┬────────┘
                                                                               │
                                                                               ▼
                                                              ┌─────────────────────────────────┐
                                                              │       Celery Async Workers      │
                                                              │  - PDF Certificate Generator    │
                                                              │  - Video Transcoding & HLS      │
                                                              │  - Transaction Email Dispatcher │
                                                              └─────────────────────────────────┘
```

---

## 🚀 Fitur Enterprise (Tier 1 s/d Tier 12)

| Tier | Modul | Ringkasan Kemampuan |
| :--- | :--- | :--- |
| **Tier 1** | **Core Foundation & Security** | Otentikasi aman JWT `httpOnly`, role-based access (Student, Instructor, Superadmin), sertifikat PDF ber-QR code unik, anti-cheat tab-switch detection. |
| **Tier 2** | **Analytics & Batch Management** | Dashboard analitik admin dengan metrik kelulusan, rating & review bintang, serta batch CSV question generator. |
| **Tier 3** | **Storage & Zero-DDL Database** | Skema database *Zero-DDL Extensible* (`meta_data` JSON), MinIO S3 Multipart Upload, dan HTTP 206 Partial Content Video Streaming. |
| **Tier 4** | **Product Discovery & Intel** | Sintesis riset produk komprehensif, analisis friksi persona pembelajar, dan pohon peluang pengembangan. |
| **Tier 5** | **Realtime Multi-User Engine** | WebSocket live presence, polling interaktif, broadcast pengumuman instan, dan Virtual Study Rooms. |
| **Tier 6** | **AI Tutor & Adaptive Quizzes** | Asisten belajar AI in-session, penjelasan mendalam pembahasan kuis, dan penyesuaian tingkat kesulitan dinamis (Hard/Medium/Easy). |
| **Tier 7** | **E2E Testing & Production Runbook** | Suite pengujian Playwright E2E lintas browser, benchmark beban k6 (1.000+ VUs), konfigurasi `docker-compose.prod.yml`, dan SOP mitigasi insiden. |
| **Tier 8** | **B2B Multi-Tenancy & White-Label** | Routing otomatis berbasis subdomain (`host`), isolasi data per tenant, injeksi tema CSS dinamis (`--primary`, `--secondary`), dan panel branding logo. |
| **Tier 9** | **Monetization & Invoicing** | Integrasi payment gateway ganda (**Midtrans Snap QRIS/VA** & **Stripe Checkout**), promo kupon diskon persentase/flat, dan invoice PDF otomatis. |
| **Tier 10** | **SCORM & xAPI E-Learning Engine** | Parser manifest XML (`imsmanifest.xml`), jembatan JavaScript runtime CMI (`window.API` & `window.API_1484_11`), pemutar sandboxed iframe, dan LRS Store xAPI. |
| **Tier 11** | **Enterprise SSO & Directory Sync** | Otentikasi korporat **SAML 2.0** & **OpenID Connect (OIDC)** (Azure AD, Okta, Keycloak), *Just-In-Time (JIT) Provisioning*, dan sinkronisasi direktori LDAP. |
| **Tier 12** | **PWA Offline-First & Web Push** | Service Worker caching, penyimpanan lokal blob video & PDF via IndexedDB, *Background Mutation Sync Queue*, dan Web Push VAPID notifications. |

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2, Alembic, Celery, ReportLab.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Database & Cache**: PostgreSQL 16, Redis 7.
- **Storage**: MinIO S3 Compatible Object Storage.
- **Testing & QA**: Pytest, pytest-asyncio, Playwright, k6 Load Tester.
- **DevOps & Containers**: Docker, Docker Compose, Nginx, PowerShell & Bash automation scripts.

---

## 💻 Panduan Instalasi Lokal (Development)

### 1. Prasyarat Sistem
- **Node.js** >= 18.x
- **Python** >= 3.11
- **Docker & Docker Compose** (Opsional untuk PostgreSQL, Redis, MinIO lokal)

### 2. Setup Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Jalankan server FastAPI
uvicorn app.main:app --reload --port 8000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Akses aplikasi melalui browser di `http://localhost:5173`.

---

## 🐳 Deployment Produksi (Docker Compose)

Jalankan seluruh ekosistem (FastAPI 4-workers, PostgreSQL, Redis, Celery, Nginx) dengan satu perintah:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🧪 Pengujian Otomatis

### Menjalankan Master Pytest Suite (47+ Tests)
```bash
cd backend
pytest tests/ -v
```

### Menjalankan Playwright End-to-End Tests
```bash
cd frontend
npx playwright test
```

### Menjalankan k6 Load Testing Benchmarks
```bash
# Uji beban REST API (500 Concurrent VUs)
k6 run tests/load/k6_api_benchmark.js

# Uji beban WebSocket Realtime (1,000 Concurrent Connections)
k6 run tests/load/k6_websocket_load.js
```

---

## 📄 Lisensi
Didistribusikan di bawah lisensi **MIT License**. Lihat file `LICENSE` untuk informasi selengkapnya.
