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

---

# Product Verification — Iwan

Verification date: 2026-04-27

Status: verified

## Basis verifikasi

Iwan melakukan verifikasi dari source code repo, terutama:

- `src/lib/copy.ts`
- `src/app/daftar/page.tsx`
- `src/app/login/page.tsx`
- `src/app/tentang/kenapa-desa-dipantau/page.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/components/desa/ResponsibilityGuideCard.tsx`
- `src/app/panduan/kewenangan/page.tsx`
- `src/app/badge/page.tsx`
- `src/app/profil/saya/page.tsx`

Catatan: ini adalah verifikasi product/copy dari source code. Visual QA live/browser dan mobile detail tetap perlu dilakukan oleh Asep/Ujang jika ada perbedaan rendering.

## Verified

- [x] #7 Auth copy sudah sesuai narasi produk.
- [x] #7 Login/register terasa sebagai pintu partisipasi warga, bukan form SaaS/paywall.
- [x] #7 Block `Kenapa perlu akun?` sudah jelas.
- [x] #7 Ada link `Lihat dulu tanpa daftar` ke data publik, sehingga tidak ada kesan data dikunci login.
- [x] #9 Civic narrative sudah aman, hangat, dan adil.
- [x] #9 Narasi `memantau bukan menuduh` sudah kuat di halaman `/tentang/kenapa-desa-dipantau`.
- [x] #10 Card `Tanyakan ke pihak yang tepat` sudah ada di detail desa dan posisinya tidak mengganggu alur utama.
- [x] #10 Copy kewenangan tidak menyalahkan desa dan mengarahkan warga agar bertanya ke pihak yang tepat.
- [x] #10 Halaman `/panduan/kewenangan` memakai bahasa hati-hati seperti `Biasanya terkait` dan `Bisa terkait`.
- [x] #10 Disclaimer verifikasi sumber resmi terlihat jelas di halaman panduan kewenangan.
- [x] #8 Badge sudah terasa sebagai reputasi kontribusi warga, bukan sekadar gimmick.
- [x] #8 Aturan anti-spam sudah cukup jelas: kualitas kontribusi lebih penting daripada jumlah, tuduhan tanpa sumber tidak dihitung.
- [x] #11 Pola kerja Iwan-Asep-Ujang sudah mulai berjalan: implementation updates, role trace, dan dashboard progress sudah digunakan.

## Needs adjustment / carry-over Sprint 02

- [ ] #12 Wording audit tetap urgent karena beberapa copy di luar Sprint 01 masih berpotensi terlalu keras/rumit untuk warga awam.
- [ ] #10 `ResponsibilityGuideCard` masih memiliki hardcoded copy. Pindahkan ke `src/lib/copy.ts` di Sprint 02.
- [ ] #10 Tambahkan disclaimer kecil di card detail desa agar pengguna tahu panduan kewenangan bersifat umum.
- [ ] #8 Tambahkan sinyal kecil di profil seperti `Lihat arti badge ↓` agar user tahu badge bisa dipahami lebih lanjut.
- [ ] #7 Tambahkan sinyal di navbar bahwa data publik bebas diakses tanpa akun.
- [ ] #1 / #3 Perkuat data dummy/demo disclaimer agar user tidak mengira semua data sudah resmi/terverifikasi.
- [ ] Scheduler/data automation tidak boleh masuk implementasi sebelum schema, source registry, staging, review flow, dan audit log dirancang.

## Keputusan Iwan

Sprint 01 dari sisi produk dan copy tone: **verified**.

Asep boleh menaikkan dashboard dan status Sprint 01 menuju progress MVP sekitar 55%, dengan catatan Sprint 02 tetap memprioritaskan:

1. Wording simplification untuk warga awam.
2. Data dummy/demo trust layer.
3. Critical thinking policy: tidak langsung mengeksekusi scheduler/data automation sebelum pondasi data siap.

## Catatan pembahasan pagi

- Saran scheduler/data automation dianggap arah strategis yang bagus, tetapi belum tepat dieksekusi sekarang.
- Scheduler harus didahului desain schema Supabase/Prisma, source registry, raw snapshot, staging, data status lifecycle, admin review flow, dan audit log.
- Sprint yang sedang berjalan harus dibereskan dulu sebelum Sprint 02 dimulai penuh.
- Sprint 02 sebaiknya fokus ke penyederhanaan wording dan trust layer data demo, bukan implementasi scheduler besar.

## Updated status summary after Iwan verification

| Backlog | Status Ujang | Status Asep | Status Iwan |
|---|---|---|---|
| #7 Auth UX | partial | done | verified |
| #9 Homepage Highlight | partial | done | verified |
| #10 Responsibility Guide | partial | done | verified |
| #8 Badge MVP | partial | done | verified |
| #11 Workflow | partial | done | verified |

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: verified
Backlog: #7 #8 #9 #10 #11
