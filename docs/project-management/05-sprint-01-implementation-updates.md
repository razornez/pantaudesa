# Sprint 01 Implementation Updates

Dokumen ini menjadi pengganti issue comment lokal saat GitHub Issues tidak tersedia di runtime Ujang. Format mengikuti Team Operating System PantauDesa dan bisa disalin langsung ke komentar issue GitHub.

## CTO Review Gate — Asep

Review dilakukan: 2026-04-27

Status semua issue Sprint 01 dinaikkan ke `done` oleh Asep (CTO).
Iwan perlu verifikasi copy tone dan product alignment sebelum status naik ke `verified`.

Carry-over ke Sprint 02:
- `NAVBAR_COPY` + sinyal Navbar — #7
- Pindah hardcode copy `ResponsibilityGuideCard` ke `copy.ts` — #10
- Label "Lihat arti badge ↓" di profil saya — #8
- `.env.example` — #11

---

## Copy-ready GitHub issue comments

### Backlog #7 — Auth UX

```md
## CTO Review — Asep

Status: done

### Verified
- AUTH_COPY nested dan as const di copy.ts.
- Block "Kenapa perlu akun?" ada di register dan login.
- Link "Lihat dulu tanpa daftar" mengarah ke /desa — data publik tidak dikunci.
- Tidak ada middleware atau redirect yang menghalangi halaman publik.

### Carry-over ke Sprint 02
- NAVBAR_COPY dan sinyal "Data publik bebas diakses" di Navbar belum diimplementasi.

### Needs Iwan review
- Verifikasi tone copy auth sesuai narasi produk.
```

---

### Backlog #9 — Homepage Highlight

```md
## CTO Review — Asep

Status: done

### Verified
- WHY_MONITORING_PAGE di copy.ts — tone aman, tidak menuduh.
- Halaman /tentang/kenapa-desa-dipantau ada, narasi hangat dan adil.
- CTA mengarah ke /desa dan /panduan/kewenangan.
- Mobile responsive.
- Tidak ada kata korupsi, penyelewengan, atau menyimpulkan pelanggaran.

### Needs Iwan review
- Issue paling siap verified. Iwan cukup konfirmasi copy tone sudah sesuai product docs.
```

---

### Backlog #10 — Responsibility Guide

```md
## CTO Review — Asep

Status: done

### Verified
- Halaman /panduan/kewenangan ada, AUTHORITY_GUIDE_PAGE dari copy.ts.
- Disclaimer "bersifat panduan umum" tampil di halaman.
- Bahasa kategori memakai "Biasanya terkait", "Bisa terkait" — tidak absolut.
- Card ResponsibilityGuideCard dipasang di desa/[id]/page.tsx.

### Carry-over ke Sprint 02
- ResponsibilityGuideCard masih hardcode 3 string di JSX — perlu dipindah ke copy.ts.
- Card belum punya disclaimer kecil. Tambahkan kalimat dari AUTHORITY_GUIDE_PAGE.disclaimer.

### Needs Iwan review
- Konfirmasi tone kewenangan cukup aman dan tidak terlalu absolut secara hukum.
- Konfirmasi placement card di detail desa tidak mengganggu flow baca data anggaran.
```

---

### Backlog #8 — Badge MVP

```md
## CTO Review — Asep

Status: done

### Verified
- USER_BADGES label sesuai docs: Warga Peduli sampai Penggerak Desa Terbuka.
- Halaman /badge ada, aturan anti-spam jelas.
- BadgeMeaningCard di profil saya menjelaskan arti dan next level.
- Static/deterministic scoring — tidak mendorong spam.

### Carry-over ke Sprint 02
- BadgePill di profil saya tidak ada sinyal bahwa ada penjelasan di bawahnya.
- Tambahkan label kecil "Lihat arti badge ↓" atau arrow di bawah BadgePill.

### Needs Iwan review
- Konfirmasi manfaat badge sudah terasa sebagai reputasi, bukan gimmick.
- Konfirmasi aturan anti-spam sudah cukup jelas untuk warga awam.
```

---

### Backlog #11 — Workflow Status/Progress

```md
## CTO Review — Asep

Status: done

### Verified
- Semua commit Sprint 01 pakai role trace.
- 05-sprint-01-implementation-updates.md sebagai local source of truth — format benar.
- Project dashboard diupdate.

### Carry-over ke Sprint 02
- .env.example masih MISSING — buat di root project.

### Needs Iwan review
- Konfirmasi format local worklog sudah cukup sebagai source of truth sementara.
```

---

## Status summary

| Backlog | Status Ujang | Status Asep | Status Iwan |
|---|---|---|---|
| #7 Auth UX | partial | done | needs-verification |
| #9 Homepage Highlight | partial | done | needs-verification |
| #10 Responsibility Guide | partial | done | needs-verification |
| #8 Badge MVP | partial | done | needs-verification |
| #11 Workflow | partial | done | needs-verification |
