# ?? Panduan Kontribusi LMS Platform

Terima kasih atas ketertarikan Anda untuk berkontribusi pada **LMS Platform Enterprise**!

---

## ?? Kode Etik
Kami berkomitmen untuk menyediakan lingkungan yang terbuka, ramah, dan bebas dari diskriminasi bagi seluruh kontributor.

---

## ?? Alur Kerja Kontribusi

1. **Fork Repositori**
   Klik tombol *Fork* di pojok kanan atas repositori `consep33t/lms-platform`.

2. **Clone & Buat Branch Baru**
   ```bash
   git clone https://github.com/USERNAME/lms-platform.git
   cd lms-platform
   git checkout -b feature/nama-fitur-baru
   ```

3. **Standar Kode & Komitmen**
   * Gunakan konvensi penamaan yang jelas (FastAPI PEP8 untuk backend, TypeScript strict untuk frontend).
   * Pastikan tidak ada kredensial atau rahasia yang ter-hardcode di kode sumber.
   * Gunakan format Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.

4. **Submit Pull Request**
   * Push branch Anda ke repository fork.
   * Buka Pull Request ke branch `main` repositori `consep33t/lms-platform`.
