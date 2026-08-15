# Changelog

All notable changes to LMS Platform will be documented in this file.

## [1.5.0] - 2026-08-16
### Added & Enhanced (Slide Sequencer, Live Countdown Timer & Dynamic Quiz Math)
- **Slide Sequencer Interaktif:**
  - Struktur sesi kini disajikan secara bertahap (slide demi slide) mencakup teks materi mendalam, blueprint gambar diagram high-res, pemutar video demonstrasi streaming, serta checkpoint kuis evaluasi di sela-sela slide.
- **Live Countdown Timer & Auto-Timeout Handler:**
  - Timer hitungan mundur aktif (format MM:SS) dengan indikator visual dinamis (Hijau, Kuning, dan Merah Berkedip saat waktu menipis).
  - Jika waktu sesi berakhir (timeout), sistem secara otomatis mencatat persentase slide yang telah berhasil diselesaikan peserta dan mengunci sesi dengan akumulasi nilai kuis yang telah dijawab hingga detik tersebut.
- **Kalkulasi Nilai Kuis Dinamis Matematis:**
  - Setiap kuis di sela slide bernilai bobot proporsional (100% / N kuis).
  - Jika terdapat soal yang salah pada salah satu kuis, nilai kuis tersebut dibagi secara proporsional dari jumlah butir soal kuis tersebut.
  - Skor akhir sesi merupakan akumulasi otomatis dari seluruh kuis checkpoint yang berhasil dikerjakan.

## [1.4.0] - 2026-08-16
### Added & Security Hardened
- Proteksi integritas kuis tanpa kebocoran kunci jawaban (Anti-Answer Leaks).
- Generasi Modul Enterprise: Cloud Native, Kubernetes Orchestration & GitOps.
- Standarisasi .env.example, .gitattributes (LF), dan GitHub Actions CI.
