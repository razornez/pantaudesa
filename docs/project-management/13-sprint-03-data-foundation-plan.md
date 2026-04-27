# Sprint 03 Plan — Data Foundation

## Status

Draft plan from Iwan.

Sprint 03 belum boleh langsung dieksekusi Ujang tanpa Asep/CTO review, karena menyentuh database, Prisma, Supabase, dan data access layer.

Namun Sprint 03 harus menjadi prioritas setelah Sprint 02 Batch A, karena kita dikejar deadline dan tidak bisa terlalu lama bergantung pada data statis dari file mock.

## Main goal

Pindahkan pondasi data desa dari static mock file menuju database-backed dummy data.

Target minimal:

> Data masih boleh dummy/demo, tetapi sumbernya mulai dari database, bukan hardcoded static file.

## Why this matters

Saat ini banyak data berasal dari `src/lib/mock-data.ts`. Ini bagus untuk prototyping, tetapi tidak cukup untuk produk yang ingin scalable.

Kita perlu mulai punya:

- schema data desa,
- seed dummy data,
- service layer untuk membaca data,
- mode demo database,
- persiapan data import/automation di fase berikutnya.

## Sprint 03 scope

### In scope

- Prisma/Supabase schema design.
- Minimal table/model untuk desa dan ringkasan anggaran.
- Seed data dummy ke database.
- Service layer membaca data dari database.
- Fallback ke mock jika database belum siap, jika diperlukan.
- Data status field: demo/imported/verified.

### Out of scope

- Scheduler.
- Scraper.
- Data automation pipeline penuh.
- Admin CRUD lengkap.
- CSV import production.
- Verification workflow penuh.
- Audit log production-level.

## Recommended minimal models

### 1. Desa

Purpose:
Menyimpan identitas desa.

Fields draft:

- id
- kodeDesa optional
- nama
- slug
- kecamatan
- kabupaten
- provinsi
- tahunData
- jumlahPenduduk optional
- websiteUrl optional
- dataStatus: demo/imported/verified/outdated
- createdAt
- updatedAt

### 2. AnggaranDesaSummary

Purpose:
Menyimpan ringkasan anggaran yang saat ini tampil di cards.

Fields draft:

- id
- desaId
- tahun
- totalAnggaran
- totalRealisasi
- persentaseRealisasi
- statusSerapan: baik/sedang/rendah
- sumberData optional
- dataStatus
- createdAt
- updatedAt

### 3. APBDesItem

Purpose:
Rincian bidang APBDes.

Fields draft:

- id
- desaId
- tahun
- kodeBidang optional
- namaBidang
- anggaran
- realisasi
- persentase
- dataStatus

### 4. DokumenPublik

Purpose:
Checklist dokumen yang bisa diminta/dilihat warga.

Fields draft:

- id
- desaId
- tahun
- namaDokumen
- status: tersedia/belum/unknown
- url optional
- dataStatus
- updatedAt

### 5. DataSource

Purpose:
Mencatat asal data, walau masih demo.

Fields draft:

- id
- desaId optional
- sourceName
- sourceType: demo/manual/imported/official
- url optional
- notes optional
- lastCheckedAt optional
- dataStatus

## Data status enum

Gunakan enum sederhana:

- demo
- imported
- needs_review
- verified
- outdated
- rejected

Untuk Sprint 03, minimal gunakan:

- demo
- verified

Tapi schema harus siap untuk status lain.

## Suggested Sprint 03 tasks

## T-11 — Prisma schema proposal

Owner: Asep
Status: needs-cto-review

Goal:
Asep review dan finalisasi model minimal.

Output:
- Update `prisma/schema.prisma` atau proposal dulu di docs.
- Tentukan apakah model langsung diimplement atau dicatat dulu.

## T-12 — Seed dummy data to database

Owner: Ujang after Asep approval
Status: blocked-until-cto-review

Goal:
Dummy data masuk database supaya app tidak terlalu bergantung pada static mock.

Output:
- seed script atau Prisma seed.
- beberapa desa demo masuk DB.

## T-13 — Data service layer

Owner: Ujang after Asep approval
Status: blocked-until-cto-review

Goal:
Buat service layer agar UI tidak langsung tergantung `mock-data.ts`.

Contoh function:

- getDesaList()
- getDesaByIdOrSlug()
- getHomeStats()
- getFeaturedDesa()

## T-14 — Switch read path to database demo mode

Owner: Ujang after Asep approval
Status: blocked-until-cto-review

Goal:
Halaman utama dan detail desa membaca data dari DB demo jika tersedia.

Requirement:
- Jika DB error atau belum ready, fallback harus jelas atau build tetap aman.

## T-15 — Data source/status display connection

Owner: Ujang after Asep approval
Status: blocked-until-cto-review

Goal:
Trust layer yang dibuat di Sprint 02 mulai membaca dataStatus dari data, bukan hanya static demo label.

## Critical warning

Sprint 03 menyentuh area teknis besar. Karena itu:

- Harus menunggu Asep available atau CTO review pengganti.
- Jangan langsung minta Ujang implement schema tanpa review.
- Jangan membuat scheduler di Sprint 03.
- Jangan scraping di Sprint 03.

## Deadline strategy

Karena kita dikejar deadline, jalur paling realistis:

1. Sprint 02 selesai trust/copy.
2. Sprint 03 buat database-backed demo data.
3. Sprint 04 baru admin/import MVP atau source registry.
4. Scheduler/scraper tetap belakangan setelah pipeline stabil.

## Commissioner note

Pertanyaan Bapak: "task skema/table data desa ada di sprint mana?"

Jawaban Iwan:

> Masuk Sprint 03 — Data Foundation. Ini penting dan prioritas setelah Sprint 02 Batch A, tapi tidak aman dikerjakan Sprint 02 saat Asep unavailable karena menyentuh Prisma/Supabase/schema. Target Sprint 03 adalah minimal data dummy dari database, bukan lagi static file.

## Prompt future for Asep

```text
Asep, review `docs/project-management/13-sprint-03-data-foundation-plan.md`.
Kita dikejar deadline dan perlu mulai pindah dari static mock ke database-backed dummy data.
Tolong review model minimal Prisma/Supabase: Desa, AnggaranDesaSummary, APBDesItem, DokumenPublik, DataSource.
Jangan masuk scheduler/scraper dulu. Fokus Sprint 03 adalah data foundation.
```

## Prompt future for Ujang

```text
Ujang, jangan mulai Sprint 03 Data Foundation sebelum Asep review.
Setelah Asep approve schema direction, kerjakan task T-11 sampai T-15 sesuai instruksi.
Targetnya: data masih dummy/demo, tapi mulai dibaca dari database, bukan static mock file.
```

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Direction)
Executed-by: Iwan (CEO)
Status: draft
Backlog: #4 #13
