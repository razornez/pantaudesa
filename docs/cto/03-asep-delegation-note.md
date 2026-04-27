# Asep Delegation Note

## Status

Asep sedang tidak available sementara.
Ujang report langsung ke Iwan selama periode ini.

Delegation date: 2026-04-27

---

## Yang sudah selesai dan aman dilanjutkan Ujang

Semua instruksi untuk task aktif sudah terdokumentasi lengkap di:

- `docs/project-management/07-ujang-task-queue.md`

Ujang tidak perlu review Asep untuk task yang instruksinya sudah ada di file tersebut.

---

## Task aktif yang tersisa

### T-06 Langkah 2 — Wording update 6 item critical

Status: `in-progress` — instruksi sudah lengkap di task queue.

Semua keputusan teknis sudah diambil Asep sebelum delegasi:
- 6 item critical sudah disetujui, kode before/after sudah ada.
- Medium/low items tidak dikerjakan Sprint 02.
- Semua update wajib ke `copy.ts`, tidak hardcode di JSX.
- Iwan review tone setelah Ujang selesai.

Ujang boleh langsung kerjakan. Report ke Iwan setelah selesai.

---

## Yang tidak boleh dikerjakan tanpa Asep

Task berikut memerlukan keputusan arsitektur dan harus menunggu Asep kembali:

- **#13 Data automation / scheduler** — belum ada schema, source registry, staging table. Jangan implementasi apapun.
- **Perubahan Prisma schema** — apapun yang menyentuh `schema.prisma`.
- **Perubahan auth flow** — apapun yang menyentuh `src/lib/auth.ts` atau NextAuth config.
- **Perubahan API routes** yang bukan copy/UI.

---

## Cara Iwan menangani task baru selama Asep tidak ada

Jika Iwan perlu membuka task baru untuk Ujang:

1. Buka `docs/project-management/07-ujang-task-queue.md`.
2. Tambahkan task baru di bagian "Antrian aktif" dengan format yang sama.
3. Pastikan instruksinya cukup jelas untuk dikerjakan tanpa review teknis.
4. Jika task menyentuh area teknis yang perlu Asep — tandai sebagai `blocked — menunggu Asep` dan jangan buka ke Ujang dulu.

---

## Cara Iwan review hasil Ujang

Iwan fokus pada:
- **Copy tone** — apakah wording sudah adil, tidak menuduh, mudah dipahami warga?
- **Product alignment** — apakah hasil sesuai arah produk di docs?

Iwan tidak perlu review kode teknis — itu tugas Asep saat kembali.

Format verifikasi Iwan:

```
## Product Verification — Iwan
Task: T-XX
Status: verified / needs-adjustment

Verified:
- [x] Copy tone sudah benar
- [x] Tidak menuduh desa

Needs adjustment:
- [ ] ...
```

---

## Saat Asep kembali

Asep perlu:
1. Baca `docs/cto/02-asep-worklog.md` untuk konteks terakhir.
2. Review commit Ujang selama periode delegasi.
3. Lanjutkan dari task queue — cek mana yang `done` dan mana yang `blocked`.
4. Update `docs/cto/01-asep-command-center.md` dengan instruksi terbaru.
