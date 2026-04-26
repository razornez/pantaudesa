# PantauDesa Project Dashboard

Last updated: 2026-04-26
Owner: Iwan (CEO / Business Analyst / Designer)

## Executive summary

PantauDesa sudah memiliki fondasi produk, bisnis, desain, roadmap, sales kit, launch plan, dan operating system tim. Dari sisi implementasi fitur produk, sebagian pekerjaan MVP mulai bergerak: `PondasiTransparansiSection` untuk civic narrative homepage sudah selesai menurut catatan Asep, tetapi belum tercatat sebelumnya di issue #9.

Status saat ini:

- Product direction: kuat dan sudah terdokumentasi.
- Team operating system: sudah mulai terbentuk.
- Codebase: sudah ada aplikasi Next.js dengan scope dashboard warga, mock data, chart, auth dependencies, dan testing scripts.
- MVP polish: mulai berjalan, tetapi belum selesai.
- Auth meaning, badge reputation, civic narrative, dan responsibility guide: sudah didefinisikan di docs; civic narrative homepage sudah mulai diimplementasikan melalui `PondasiTransparansiSection`.
- Data/admin/monetization: sudah masuk roadmap, belum fase implementasi utama.

## Current overall progress

Estimated overall project progress: **23%**

Estimated MVP progress: **36%**

Catatan:
- Angka ini adalah baseline awal versi Iwan berdasarkan docs, README, issue backlog, informasi repo yang sudah terbaca, dan update dari Asep.
- Update terbaru: issue #9 dinaikkan dari 20% menjadi 40% dengan status `partial` karena `PondasiTransparansiSection` di homepage sudah selesai, tetapi page edukasi/CTA dan pencatatan issue belum lengkap.
- Angka harus diperbarui lagi setelah Asep memberi CTO review formal dan Ujang melakukan update issue/commit yang lengkap.

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
| Auth meaning | #7 | 5% | partial | 60% | Auth copy MVP sudah diimplementasikan, butuh review Asep/Iwan |
| Badge reputation | #8 | 3% | partial | 60% | Badge page dan profile explanation sudah ada, masih static MVP |
| Civic narrative highlight | #9 | 1% | partial | 60% | Homepage CTA dan page edukasi sudah dibuat, butuh review copy |
| Responsibility guide | #10 | 1% | partial | 60% | Detail desa card dan page panduan kewenangan sudah dibuat |

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
- Issue #9 sekarang partial: homepage civic narrative sudah mulai terlihat melalui `PondasiTransparansiSection`, namun page edukasi, CTA, dan status issue masih perlu dirapikan.
- Sprint 01 issues #7, #8, #9, #10, dan #11 sudah punya implementation update lokal di `docs/project-management/05-sprint-01-implementation-updates.md`.

## Not started / needs execution

- `.env.example`.
- Build/lint/test report.
- Data demo disclaimer in UI.
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

Ujang mulai implementasi setelah Asep review. Jika belum ada review Asep, Ujang boleh mulai copy-only MVP untuk #7 dengan status partial.

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
