# Sprint 03 Plan — Data Foundation

## Status

Draft plan from Iwan.

**Updated gate note — 2026-04-27:**

Sprint 03 schema/database implementation is currently **blocked** until Sprint 02.5 outputs are reviewed.

Reason:

- Official desa/kecamatan/kabupaten source strategy changes the schema requirements.
- Schema must not only follow current mock data.
- Sprint 03 needs review of source registry, data status, raw snapshot/staging implications, and backlog hygiene first.

Required review inputs before Sprint 03 schema/database starts:

- `docs/project-management/18-iwan-review-rangga-docs-and-sprint-025.md`
- `docs/engineering/21-official-source-schema-implications.md`
- `docs/engineering/22-pilot-source-discovery-plan.md`
- `docs/project-management/19-backlog-hygiene-plan.md`

Until those are reviewed, do not change:

- `prisma/schema.prisma`
- migration
- database
- Supabase table
- API
- auth
- scraper
- scheduler
- read path

Sprint 03 belum boleh langsung dieksekusi Ujang tanpa Asep/CTO review, karena menyentuh database, Prisma, Supabase, dan data access layer.

Namun Sprint 03 harus menjadi prioritas setelah Sprint 02.5, karena kita dikejar deadline dan tidak bisa terlalu lama bergantung pada data statis dari file mock.

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

- Prisma/Supabase schema design after Sprint 02.5 review.
- Minimal table/model untuk desa dan ringkasan anggaran.
- Seed data dummy ke database.
- Service layer membaca data dari database.
- Fallback ke mock jika database belum siap, jika diperlukan.
- Data status field: demo/imported/needs_review/verified/outdated/rejected.
- DataSource/source registry consideration based on Sprint 02.5 review.

### Out of scope

- Scheduler.
- Scraper.
- Data automation pipeline penuh.
- Admin CRUD lengkap.
- CSV import production.
- Verification workflow penuh.
- Audit log production-level.
- Raw snapshot/staging implementation unless explicitly approved by Asep/CTO.

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
- dataStatus: demo/imported/needs_review/verified/outdated/rejected
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
- sourceId optional after Sprint 02.5 review
- sumberData optional if source model deferred
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
- sourceId optional after Sprint 02.5 review
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
- fileType/contentType optional after Sprint 02.5 review
- sourceId optional after Sprint 02.5 review
- dataStatus
- updatedAt

### 5. DataSource

Purpose:
Mencatat asal data, walau masih demo.

Fields draft:

- id
- desaId optional
- scopeType optional or required based on Sprint 02.5 review
- scopeName optional
- sourceName
- sourceType: demo/manual/official_website/official_document/other
- sourceUrl optional
- accessStatus optional
- dataAvailability optional
- notes optional
- discoveredAt optional
- lastCheckedAt optional
- dataStatus
- createdAt
- updatedAt

## Data status enum

Gunakan enum sederhana:

- demo
- imported
- needs_review
- verified
- outdated
- rejected

Important rule:

> Imported data must not be treated as verified automatically.

Untuk Sprint 03, minimal UI mungkin memakai `demo`, tetapi schema direction harus mempertimbangkan lifecycle lengkap agar tidak cepat perlu enum migration baru.

## Suggested Sprint 03 tasks

## T-11 — Prisma schema proposal

Owner: Asep / CTO review required
Status: blocked-until-sprint-02.5-review

Goal:
Asep review dan finalisasi model minimal setelah membaca Sprint 02.5 outputs.

Output:
- Proposal schema dulu, atau update `prisma/schema.prisma` hanya setelah approval.
- Tentukan apakah model langsung diimplement atau dicatat dulu.

## T-12 — Seed dummy data to database

Owner: Ujang/Rangga after Asep approval
Status: blocked-until-cto-review

Goal:
Dummy data masuk database supaya app tidak terlalu bergantung pada static mock.

Output:
- seed script atau Prisma seed.
- beberapa desa demo masuk DB.

## T-13 — Data service layer

Owner: Ujang/Rangga after Asep approval
Status: blocked-until-cto-review

Goal:
Buat service layer agar UI tidak langsung tergantung `mock-data.ts`.

Contoh function:

- getDesaList()
- getDesaByIdOrSlug()
- getHomeStats()
- getFeaturedDesa()

## T-14 — Switch read path to database demo mode

Owner: Ujang/Rangga after Asep approval
Status: blocked-until-cto-review

Goal:
Halaman utama dan detail desa membaca data dari DB demo jika tersedia.

Requirement:
- Jika DB error atau belum ready, fallback harus jelas atau build tetap aman.

## T-15 — Data source/status display connection

Owner: Ujang/Rangga after Asep approval
Status: blocked-until-cto-review

Goal:
Trust layer yang dibuat di Sprint 02 mulai membaca dataStatus dari data, bukan hanya static demo label.

## Critical warning

Sprint 03 menyentuh area teknis besar. Karena itu:

- Harus menunggu Asep available atau CTO review pengganti.
- Harus menunggu Sprint 02.5 review.
- Jangan langsung implement schema tanpa review.
- Jangan membuat scheduler di Sprint 03.
- Jangan scraping di Sprint 03.

## Deadline strategy

Karena kita dikejar deadline, jalur paling realistis:

1. Sprint 02 ditutup sebagai partial-complete.
2. Sprint 02.5 menyelesaikan data source strategy, schema implications, pilot discovery plan, dan backlog hygiene.
3. Sprint 03 buat database-backed demo data setelah gate review.
4. Sprint 04 baru admin/import MVP atau source registry expansion.
5. Scheduler/scraper tetap belakangan setelah pipeline stabil.

## Commissioner note

Pertanyaan Bapak: "task skema/table data desa ada di sprint mana?"

Jawaban updated:

> Masuk Sprint 03 — Data Foundation, tetapi saat ini diblok sampai Sprint 02.5 direview. Kita perlu memastikan schema tidak hanya cocok untuk mock data, tapi juga siap untuk official website desa/kecamatan/kabupaten source strategy.

## Prompt future for Asep

```text
Asep, review `docs/project-management/13-sprint-03-data-foundation-plan.md` bersama Sprint 02.5 outputs:
- docs/engineering/21-official-source-schema-implications.md
- docs/engineering/22-pilot-source-discovery-plan.md
- docs/project-management/19-backlog-hygiene-plan.md

Tolong tentukan apakah Sprint 03 schema boleh dibuka, dan apakah DataSource, RawSnapshot, staging, serta dataStatus lifecycle masuk scope sekarang atau ditunda.
Jangan masuk scheduler/scraper dulu.
```

## Prompt future for Ujang/Rangga

```text
Jangan mulai Sprint 03 Data Foundation sebelum Asep/CTO review Sprint 02.5 outputs.
Setelah Asep approve schema direction, kerjakan task T-11 sampai T-15 sesuai instruksi.
Targetnya: data masih dummy/demo, tapi mulai dibaca dari database, bukan static mock file, dengan trust/dataStatus/source strategy yang jelas.
```

Initiated-by: Iwan (CEO)
Reviewed-by: Pending Iwan/Asep after Sprint 02.5
Executed-by: ChatGPT Freelancer / Rangga as Ujang backup for H-06 update
Status: blocked-until-sprint-02.5-review
Backlog: #4 #13 #11 #12
