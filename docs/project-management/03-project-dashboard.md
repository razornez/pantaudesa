# PantauDesa Project Dashboard

Last updated: 2026-04-27
Owner: Iwan (CEO / Business Analyst / Designer)
CTO Review: Asep — Sprint 01 dinaikkan ke `done`, menunggu verifikasi Iwan.

## Executive summary

Sprint 01 selesai di level implementasi. Asep sudah review semua issue dan menaikkan status ke `done`. Iwan perlu verifikasi copy tone dan product alignment sebelum status naik ke `verified`. Ada 4 carry-over kecil ke Sprint 02 yang tidak blocking.

Status saat ini:

- Product direction: kuat dan terdokumentasi lengkap.
- Team operating system: aktif dipakai — role trace di semua commit Sprint 01.
- Sprint 01: `done` oleh Asep, `needs-verification` oleh Iwan.
- Data/admin/monetization: masuk roadmap, belum fase implementasi.

## Current overall progress

Estimated overall project progress: **28%**

Estimated MVP progress: **45%**

Catatan:
- Sprint 01 issues #7, #8, #9, #10, #11 dinaikkan ke `done` oleh Asep (CTO) pada 2026-04-27.
- Angka MVP naik dari 36% ke 45% setelah Sprint 01 `done`.
- Akan naik ke ~55% setelah Iwan verifikasi dan status menjadi `verified`.

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
| Company/project operating system | #11 | 10% | partial | 70% | Docs, implementation update log, dan role trace commit sudah mulai diterapkan |
| Product/business/design foundation | #1 | 15% | partial | 70% | README, product strategy, business model, design brief, roadmap sudah ada; env/build/data demo belum selesai |
| MVP citizen dashboard polish | #2 | 20% | todo | 15% | UI sudah ada sebagian di app, tapi checklist polish belum ditandai selesai |
| Trust layer and data disclaimer | #3 | 12% | todo | 10% | Sudah ada di docs, belum jelas implementasi UI |
| Data model/admin/import | #4 | 15% | todo | 5% | Prisma dependency ada, tapi data/admin workflow belum tervalidasi dari source |
| Civic action and participation | #5 | 10% | todo | 5% | Belum masuk implementasi utama |
| Monetization and sales offer | #6 | 8% | partial | 55% | Sales kit dan launch plan sudah ada; landing page/pitch/prospect belum selesai |
| Auth meaning | #7 | 5% | done | 90% | Auth copy MVP selesai. Carry-over: NAVBAR_COPY. Needs Iwan verification. |
| Badge reputation | #8 | 3% | done | 90% | Badge page dan profile explanation selesai. Carry-over: UX hint BadgePill. |
| Civic narrative highlight | #9 | 1% | done | 90% | Homepage + page edukasi selesai. Paling siap verified. |
| Responsibility guide | #10 | 1% | done | 90% | Card + page kewenangan selesai. Carry-over: hardcode card copy ke copy.ts. |
| Workflow adoption | #11 | 10% | done | 90% | Role trace aktif, worklog lokal lengkap. Carry-over: .env.example. |

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

## Done / completed so far

### Documentation and strategy

- README sudah berubah dari template Next.js menjadi README PantauDesa.
- Product strategy sudah dibuat dan diperluas.
- Business model sudah dibuat.
- Design brief sudah dibuat dan diperluas.
- Roadmap/backlog sudah dibuat.
- Sales kit sudah dibuat.
- 30-day launch plan sudah dibuat.
- Auth, badge, and civic narrative strategy sudah dibuat.
- Team operating system sudah dibuat.
- Next brief for Asep and Ujang sudah dibuat.
- Commissioner reporting system sudah dibuat.

### Product/UI implementation signals

- `PondasiTransparansiSection` di homepage sudah selesai menurut catatan Asep untuk issue #9.

### Backlog

- Issues #1 sampai #11 sudah dibuat sebagai baseline backlog.
- Prioritas produk sudah jelas: auth meaning, badge reputation, civic narrative, responsibility guide.

## In progress / partially done

- Sistem kerja Iwan-Asep-Ujang sudah didefinisikan tetapi belum sepenuhnya diterapkan ke semua issue/commit/PR.
- Progress reporting sudah mulai dibuat tetapi belum otomatis dari issue status.
- Product docs sudah kuat, tetapi implementasi UI masih perlu diverifikasi oleh Asep/Ujang.
- Issue #9 sekarang partial: homepage civic narrative, page edukasi, CTA, dan catatan lokal sudah dirapikan, namun masih perlu review Asep/Iwan dan sinkronisasi ke GitHub Issue.
- Sprint 01 issues #7, #8, #9, #10, dan #11 sudah punya implementation update lokal di `docs/project-management/05-sprint-01-implementation-updates.md`, termasuk blok komentar yang siap disalin ke GitHub Issues.
- Status Sprint 01 tetap `partial` sampai Asep/Iwan memberi review eksplisit.

## Not started / needs execution

- `.env.example`.
- Build/lint/test report.
- Data demo disclaimer in UI.
- Salin implementation update lokal ke komentar GitHub Issues #7, #8, #9, #10, dan #11 saat akses tersedia.
- Auth page final review oleh Asep/Iwan.
- Badge architecture review sebelum scoring engine/data model.
- Homepage highlight final review oleh Iwan.
- Responsibility guide legal/content review oleh Asep/Iwan.
- Admin/import/data model final.
- Civic action form/watchlist/contribution flow.
- Landing page service offer.
- Pitch deck.
- Outreach tracking.

## Current risks

### Risk 1 — Docs stronger than implementation

Banyak fondasi produk sudah terdokumentasi, tetapi belum semuanya terlihat di UI/source code.

Mitigation:
- Sprint berikutnya harus fokus implementasi kecil yang visible.

### Risk 2 — Team AI communication can drift

Iwan, Asep, dan Ujang berjalan di tempat berbeda. Jika tidak mencatat di repo, alignment akan hilang.

Mitigation:
- Semua keputusan harus masuk docs, issue comment, commit message, atau changelog.

### Risk 3 — Auth can feel like generic SaaS

Jika auth copy tidak diperbaiki, pengunjung awam tidak paham kenapa perlu daftar.

Mitigation:
- Prioritaskan #7.

### Risk 4 — Badge can become gimmick

Jika badge tidak punya manfaat dan arti, fitur ini membosankan.

Mitigation:
- Prioritaskan #8 setelah auth/civic narrative.

### Risk 5 — Civic narrative can be misunderstood

Website bisa dianggap menyerang desa jika copy tidak adil.

Mitigation:
- Prioritaskan #9 dan #10. #9 sudah partial melalui `PondasiTransparansiSection`, tetapi tetap perlu verifikasi copy/placement dan penyelesaian page edukasi.

## Next sprint recommendation

Sprint 1 focus:

> Membuat pengunjung memahami misi PantauDesa dan alasan partisipasi warga.

Sprint 1 target issues:

1. #7 Auth UX.
2. #9 Homepage highlight.
3. #10 Responsibility guide.
4. #8 Badge MVP.
5. #11 Workflow labels/status.

## Instructions for Asep

Asep harus membaca:

- `docs/company/01-commissioner-reporting-system.md`
- `docs/project-management/01-team-operating-system.md`
- `docs/project-management/02-next-brief-for-asep-and-ujang.md`
- `docs/project-management/03-project-dashboard.md`
- Issues #7, #8, #9, #10, #11.

Lalu Asep memberi CTO review dengan status ready / needs-adjustment / blocked.

Khusus #9:
- Konfirmasi file/komponen `PondasiTransparansiSection`.
- Pastikan copy tidak menuduh desa.
- Pastikan placement homepage tepat.
- Tentukan apakah page `/tentang/kenapa-desa-dipantau` masih perlu dibuat di sprint ini.

## Instructions for Ujang

Ujang menunggu review Asep/Iwan sebelum menaikkan status. Sambil menunggu, update lokal di `docs/project-management/05-sprint-01-implementation-updates.md` bisa disalin ke komentar issue GitHub sesuai nomor backlog.

Urutan implementasi:

1. #7.
2. #9.
3. #10.
4. #8.
5. #11.

Khusus #9:
- Update issue #9 dengan Implementation Update.
- Sebutkan bahwa `PondasiTransparansiSection` sudah selesai.
- Jelaskan remaining task: CTA/page edukasi/verifikasi copy jika masih ada.

## Next commissioner report format

Saat Komisaris bertanya progress, Iwan harus menjawab dengan:

- Overall progress.
- MVP progress.
- Status per epic.
- Done / in progress / todo.
- Risks.
- Next instruction for Asep.
- Next instruction for Ujang.
- Sprint target.
