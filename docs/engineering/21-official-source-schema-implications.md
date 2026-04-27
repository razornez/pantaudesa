# Official Source Schema Implications

Date: 2026-04-27
Status: draft-for-iwan-asep-review
Prepared-by: ChatGPT Freelancer / Rangga acting as Ujang backup
Sprint: 02.5 — Data Source Strategy and Backlog Hygiene
Task: H-03

## Context

Dokumen ini menerjemahkan strategi official source yang sudah dibuat Rangga ke implikasi engineering untuk Sprint 03 Data Foundation.

References:

- `docs/project-management/18-iwan-review-rangga-docs-and-sprint-025.md`
- `docs/project-management/14-sprint-02-closure-report.md`
- `docs/engineering/14-official-desa-data-source-and-scraping-strategy.md`
- `docs/project-management/13-sprint-03-data-foundation-plan.md`

## Scope

Ini bukan implementasi schema.

Tidak ada perubahan:

- `prisma/schema.prisma`
- migration
- database
- Supabase table
- API
- auth
- scraper
- scheduler
- read path

Dokumen ini hanya menjawab implikasi schema sebelum Sprint 03 dibuka kembali.

## Main conclusion

Sprint 03 tidak boleh hanya membuat model berdasarkan shape `src/lib/mock-data.ts`.

Schema Sprint 03 perlu mempertimbangkan realita official source:

- data bisa berasal dari website desa,
- website kecamatan,
- website kabupaten,
- file PDF,
- Excel/CSV,
- HTML page,
- dokumen scan/gambar,
- manual discovery,
- sumber yang tidak lengkap atau sudah usang.

Karena itu, minimal Sprint 03 perlu punya konsep `DataSource` yang lebih serius daripada hanya `sumberData` string.

## Mandatory source registry fields for Sprint 03

Rekomendasi: `DataSource` wajib masuk Sprint 03 minimal.

Field minimal yang harus dipertimbangkan:

- `id`
- `scopeType`
- `scopeName`
- `desaId` optional
- `sourceName`
- `sourceUrl` optional
- `sourceType`
- `accessStatus`
- `dataAvailability`
- `discoveredAt`
- `lastCheckedAt` optional
- `notes` optional
- `dataStatus`
- `createdAt`
- `updatedAt`

## Field explanation

### `scopeType`

Menjelaskan level sumber:

- `desa`
- `kecamatan`
- `kabupaten`
- `provinsi`
- `national`
- `other`

Reason:

Tidak semua sumber berasal langsung dari website desa. Ada kemungkinan data APBDes/dokumen dipublikasikan oleh kecamatan, kabupaten, atau portal lain.

### `scopeName`

Nama cakupan sumber, misalnya nama desa/kecamatan/kabupaten.

Reason:

Berguna saat `desaId` belum tersedia atau source masih discovery.

### `desaId` optional

Tidak semua source bisa langsung dipetakan ke model `Desa` saat discovery.

Reason:

Saat pilot source discovery, website atau dokumen mungkin ditemukan dulu sebelum record `Desa` final dibuat.

### `sourceName`

Nama sumber yang bisa dibaca manusia.

Contoh:

- Website Resmi Desa Sukamaju
- Portal Kecamatan Ciawi
- Dokumen APBDes Desa Sukamaju 2024

### `sourceUrl`

URL halaman/dokumen jika tersedia.

Reason:

Trust layer dan audit membutuhkan asal data yang jelas.

### `sourceType`

Draft values:

- `demo`
- `manual`
- `official_website`
- `official_document`
- `html`
- `pdf`
- `excel`
- `csv`
- `api`
- `other`

Recommendation:

Untuk Sprint 03, minimal cukup:

- `demo`
- `manual`
- `official_website`
- `official_document`
- `other`

Value detail seperti `pdf/excel/html` bisa disimpan sebagai field terpisah `contentType` jika RawSnapshot nanti dibuat.

### `accessStatus`

Draft values:

- `unknown`
- `accessible`
- `unreachable`
- `blocked`
- `requires_manual_review`

Reason:

Website desa bisa mati, berubah, atau tidak jelas aksesnya.

### `dataAvailability`

Draft values:

- `none`
- `profile_only`
- `documents_only`
- `budget_summary`
- `budget_detail`
- `mixed`

Reason:

Source registry harus membantu tim memilih source mana yang layak diprioritaskan.

### `dataStatus`

Wajib ada.

Draft values:

- `demo`
- `imported`
- `needs_review`
- `verified`
- `outdated`
- `rejected`

Reason:

Mencegah data imported tampil seperti verified.

## Does Sprint 03 need RawSourceSnapshot?

Recommendation:

- Sprint 03 minimal: belum wajib membuat table `RawSourceSnapshot`.
- Sprint 03 schema should leave room for it.
- Sprint 03 docs should define it as next-step model.

Reason:

Sprint 03 target utama masih database-backed demo data. Raw snapshot akan lebih penting saat scraping/import prototype mulai berjalan. Namun jika source registry sudah ada, `RawSourceSnapshot` bisa ditambahkan di Sprint 04 atau Sprint 03.5 tanpa merombak published model.

If included later, draft fields:

- `id`
- `sourceId`
- `url`
- `contentType`
- `fetchedAt`
- `httpStatus`
- `contentHash`
- `storagePath` optional
- `rawText` optional
- `processingStatus`
- `notes`

## Does Sprint 03 need staging tables?

Recommendation:

- Sprint 03 minimal: staging tables are not mandatory.
- Sprint 03 should document staging strategy.
- Do not publish imported records directly without review once import/scraping exists.

Reason:

Staging tables become necessary when real data extraction starts. If Sprint 03 only seeds demo data and builds public models, staging can wait. But schema design must not make staging impossible later.

Potential future staging models:

- `StagedDesaProfile`
- `StagedBudgetDocument`
- `StagedBudgetRecord`

## Which dataStatus values must exist from day one?

Recommendation:

Prisma enum should support all lifecycle values from day one if schema is opened:

- `demo`
- `imported`
- `needs_review`
- `verified`
- `outdated`
- `rejected`

Reason:

Even if UI only uses `demo` at first, schema should not need enum migration immediately when import/source discovery starts.

Important product rule:

- `demo` is not official.
- `imported` is not verified.
- `needs_review` must not be treated as trusted.
- `verified` should be the only status shown as trusted data.

## How published models connect to source/staging

Published models should have optional source references.

Recommended public models:

- `Desa`
- `AnggaranDesaSummary`
- `APBDesItem`
- `DokumenPublik`
- `DataSource`

Recommended relation idea:

- `Desa` can have many `DataSource` records.
- `AnggaranDesaSummary` can optionally reference `DataSource`.
- `APBDesItem` can optionally reference `DataSource`.
- `DokumenPublik` can optionally reference `DataSource`.

Potential fields on published records:

- `sourceId` optional
- `dataStatus`
- `verifiedAt` optional
- `verifiedById` optional later
- `lastCheckedAt` optional
- `sourceNote` optional

Do not force `sourceId` required during early DB demo seed.

Reason:

Demo data can have a demo source, but requiring source on every nested record too early may slow Sprint 03. Optional source relation keeps flexibility while allowing trust layer to grow.

## How to avoid imported data looking verified

Rules:

1. Default imported records to `needs_review` or `imported`, not `verified`.
2. UI copy must display status labels from dataStatus.
3. Detail page must show cautious wording if any section is not verified.
4. Leaderboard and alert sections should not mix verified and demo/imported without visible status.
5. Imported APBDes/dokumen should retain source URL and last checked date.
6. Verification should be explicit, not automatic.

## Sprint 03 minimal schema recommendation

If Sprint 03 is reopened, recommended minimum:

### Must have

- `Desa`
- `AnggaranDesaSummary`
- `APBDesItem`
- `DokumenPublik`
- `DataSource`
- `DataStatus` enum
- `StatusSerapan` enum or safe equivalent
- `DokumenStatus` enum or safe equivalent
- `SourceType` enum or safe equivalent

### Should have

- `sourceId` optional on summary/APBDes/dokumen
- `dataStatus` on all public models
- `lastCheckedAt` optional on source and/or public records
- `notes` optional for source trust context

### Can wait

- `RawSourceSnapshot`
- staging tables
- scheduler metadata
- scraper job table
- admin review workflow table
- audit log production-level

## Risk notes for Asep/CTO

### Risk 1 — Model too simple

If `DataSource` is just a string field, later import/scraping will become messy.

Mitigation:

Make `DataSource` a real model from Sprint 03.

### Risk 2 — Source too strict too early

If every record requires source relation immediately, demo seed and migration become heavier.

Mitigation:

Use optional `sourceId`, but require `dataStatus`.

### Risk 3 — Enum naming conflict

Existing Prisma enum style currently uses uppercase for some enums and lowercase values for others are in TS/mock. Asep must decide naming convention.

Mitigation:

Decide Prisma enum style before schema implementation.

### Risk 4 — Voice relation too early

`Voice.desaId` is still string. Forcing relation to new `Desa` model could break existing voice flow.

Mitigation:

Keep `Voice.desaId` unchanged in initial Sprint 03 unless Asep explicitly approves migration strategy.

## Open questions for Iwan/Asep

1. Should `DataSource` be mandatory in Sprint 03?
2. Should `RawSourceSnapshot` be deferred to Sprint 04?
3. Should staging tables be deferred until import/scraping prototype?
4. Should UI show imported data publicly, or only demo/verified?
5. Who can mark data as verified?
6. Should `sourceId` be optional or required on public records?
7. Should `DataStatus` enum use lowercase or uppercase in Prisma?
8. Should source registry support non-desa sources from day one?
9. Should `DokumenPublik` store file type/content type from day one?
10. Should summary percentages be stored or computed in service layer?

## Recommendation from Rangga acting as Ujang backup

Best path:

1. Keep Sprint 03 blocked until this doc is reviewed.
2. Include `DataSource` and `DataStatus` in Sprint 03 minimal schema.
3. Defer `RawSourceSnapshot` and staging tables unless Asep wants a stronger foundation immediately.
4. Do not implement scraper/scheduler yet.
5. Do manual source discovery first.
6. Keep source relations optional but dataStatus mandatory.
7. Keep `Voice.desaId` unchanged for now.

## Completion note

H-03 complete as documentation only.

No schema/database/API/auth/scraper/scheduler/read path/migration/Supabase table changes were made.

Initiated-by: Iwan / Asep direction
Reviewed-by: Pending Iwan/Asep
Executed-by: ChatGPT Freelancer / Rangga as Ujang backup
Status: draft-for-review
