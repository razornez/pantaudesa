# PantauDesa Project Dashboard

Last updated: 2026-04-27
Owner: Iwan (CEO / Business Analyst / Designer)
Last review: Asep (CTO) — Sprint 01 verified oleh Iwan pada 2026-04-27

## Executive summary

Sprint 01 selesai dan **verified** oleh seluruh tim. Auth civic copy, civic narrative, responsibility guide, badge MVP, dan workflow adoption sudah live dan aman sebagai MVP static. Sprint 02 siap dimulai dengan fokus wording awam dan data trust layer — bukan scheduler atau data automation dulu.

Status saat ini:

- Sprint 01: `verified` oleh Iwan, `done` oleh Asep.
- Product direction: kuat dan terdokumentasi lengkap.
- Team operating system: aktif — role trace di semua commit Sprint 01.
- Sprint 02: siap dimulai. Fokus: plain language dan data trust layer.
- Data/admin/scheduler: masuk roadmap fase berikutnya, belum boleh dieksekusi sebelum schema dan data pipeline siap.

## Current overall progress

Estimated overall project progress: **32%**

Estimated MVP progress: **55%**

Catatan:
- Sprint 01 #7, #8, #9, #10, #11 status `verified` per 2026-04-27.
- MVP naik dari 45% ke 55% setelah verified.
- Sprint 02 carry-over (#7 navbar, #8 badge hint, #10 card copy, #11 env) masuk hitungan Sprint 02.

## Progress calculation

Status score:

- `todo` = 0%
- `needs-review` = 10%
- `ready` = 20%
- `in-progress` = 40%
- `partial` = 60%
- `blocked` = nilai terakhir tetapi risiko tinggi
- `done` = 90%
- `verified` = 100%

## Epic progress

| Epic | Related issues | Weight | Status | Progress | Notes |
|---|---:|---:|---|---:|---|
| Company/project operating system | #11 | 10% | verified | 100% | Role trace, worklog, dashboard aktif. Carry-over: .env.example di Sprint 02. |
| Product/business/design foundation | #1 | 15% | partial | 70% | README dan docs lengkap. Carry-over: env.example, data disclaimer UI. |
| MVP citizen dashboard polish | #2 | 20% | in-progress | 40% | UI ada. Sprint 02 fokus polish wording dan trust layer. |
| Trust layer and data disclaimer | #3 | 12% | ready | 20% | Masuk Sprint 02 sebagai prioritas utama. |
| Data model/admin/import | #4 | 15% | todo | 5% | Belum. Perlu schema + source registry sebelum implementasi. |
| Civic action and participation | #5 | 10% | todo | 5% | Belum. Masuk fase berikutnya. |
| Monetization and sales offer | #6 | 8% | partial | 55% | Sales kit ada. Pitch deck dan outreach belum. |
| Auth meaning | #7 | 5% | verified | 100% | Selesai. Carry-over Sprint 02: NAVBAR_COPY + sinyal Navbar. |
| Badge reputation | #8 | 3% | verified | 100% | Selesai. Carry-over Sprint 02: UX hint BadgePill di profil. |
| Civic narrative highlight | #9 | 1% | verified | 100% | Selesai. Tidak ada carry-over. |
| Responsibility guide | #10 | 1% | verified | 100% | Selesai. Carry-over Sprint 02: hardcode card copy ke copy.ts, disclaimer card. |

## MVP definition

MVP PantauDesa dianggap siap demo publik awal jika:

- Warga bisa memahami misi PantauDesa dalam 30 detik.
- Warga bisa mencari desa.
- Warga bisa membuka detail desa.
- Warga bisa memahami status serapan anggaran.
- Warga tahu data masih demo/ilustrasi jika belum resmi.
- Warga tahu kenapa desa perlu dipantau tanpa merasa website ini menyerang desa.
- Warga tahu batas kewenangan desa dan pihak lain.
- Auth page menjelaskan manfaat akun.
- Badge basic bisa dipahami sebagai reputasi kontribusi.
- Mobile view nyaman.

## Done / verified — Sprint 01

- Auth copy civic participation: login dan register bukan lagi form SaaS generik.
- Block "Kenapa perlu akun?" ada di login dan register.
- Homepage civic narrative: `PondasiTransparansiSection` dan halaman `/tentang/kenapa-desa-dipantau`.
- Card "Tanyakan ke pihak yang tepat" di detail desa.
- Halaman `/panduan/kewenangan` dengan disclaimer verifikasi.
- Badge labels sesuai product docs: Warga Peduli → Penggerak Desa Terbuka.
- Halaman `/badge` dengan aturan anti-spam.
- Section "Apa arti badge kamu?" di profil.
- Role trace aktif di semua commit Sprint 01.

## Sprint 02 — Carry-over dan fokus baru

### Carry-over Sprint 01 (kecil, tidak blocking)

- `NAVBAR_COPY` + sinyal "Data publik bebas diakses" di Navbar — #7
- Hardcode copy `ResponsibilityGuideCard` dipindah ke `copy.ts` — #10
- Disclaimer kecil di card detail desa — #10
- Label "Lihat arti badge ↓" di profil saya — #8
- `.env.example` di root project — #11

### Sprint 02 fokus utama

1. **Wording simplification** — audit copy yang terlalu teknis atau keras untuk warga awam (#12)
2. **Data trust layer** — disclaimer data demo lebih visible di homepage dan detail desa (#3)
3. **Tidak boleh masuk Sprint 02:** scheduler, data automation, admin import — perlu schema + source registry + staging + audit log dulu

## Current risks

### Risk 1 — Data masih mock tanpa disclaimer yang cukup prominent

Footer sudah ada disclaimer tapi tidak cukup terlihat di tengah halaman.

Mitigation: Sprint 02 prioritaskan trust layer dan data disclaimer di UI.

### Risk 2 — Wording masih teknis di beberapa halaman

Beberapa copy di luar Sprint 01 belum diaudit untuk warga awam.

Mitigation: Sprint 02 wording audit (#12).

### Risk 3 — Scheduler/data automation terlalu dini

Sudah ada analisis dan docs untuk scheduler, tapi eksekusi terlalu awal tanpa fondasi data.

Mitigation: Tidak masuk Sprint 02. Harus didahului schema Supabase/Prisma, source registry, raw snapshot, staging, dan audit log.

## Instructions for Asep — Sprint 02

1. Review Sprint 02 plan di `docs/project-management/06-sprint-02-plan.md` jika sudah dibuat Iwan.
2. Beri CTO Review untuk carry-over Sprint 01 dan issue #12 wording audit.
3. Pastikan data trust layer tidak memerlukan perubahan database — cukup UI/copy dulu.
4. Konfirmasi scheduler/data automation tidak masuk scope Sprint 02.

## Instructions for Ujang — Sprint 02

Mulai dengan carry-over Sprint 01 dulu, lalu masuk fokus Sprint 02.

Urutan:
1. Carry-over: NAVBAR_COPY, card copy ke copy.ts, badge hint, .env.example.
2. Data disclaimer lebih prominent di homepage dan detail desa.
3. Wording audit setelah Asep review #12.

## Next commissioner report format

Saat Komisaris bertanya progress, Iwan menjawab dengan:

- Overall progress: 32%.
- MVP progress: 55%.
- Sprint 01: verified.
- Sprint 02: dimulai, fokus wording + trust layer.
- Risks: data disclaimer belum prominent, wording masih perlu audit.
- Next: Ujang mulai carry-over + Sprint 02 task.
