# Final Sprint 03 Schema Recommendation

Date: 2026-04-27
Status: draft-for-iwan-owner-technical-gate-review
Prepared-by: ChatGPT Freelancer / Rangga

## Context

Iwan/Owner accepted the full Arjasari manual discovery and approved the next planning step: prepare final Sprint 03 schema recommendation.

This document is a recommendation only, not implementation.

Inputs used:

- `docs/engineering/32-iwan-review-arjasari-full-discovery.md`
- `docs/engineering/31-manual-discovery-arjasari-full-11-desa.md`
- `docs/engineering/21-official-source-schema-implications.md`
- `docs/project-management/13-sprint-03-data-foundation-plan.md`
- `docs/engineering/03-prisma-model-notes.md`
- `docs/engineering/04-data-service-layer-plan.md`

## Boundary

This document does not authorize implementation.

Do not yet:

- change `prisma/schema.prisma`,
- create migration,
- change database,
- create/modify Supabase table,
- change API,
- change auth,
- change read path,
- touch Prisma runtime implementation,
- implement scraper,
- implement scheduler,
- publish discovery data to UI,
- mark any imported/needs_review data as verified.

Sprint 03 implementation gate remains closed until Iwan/Owner explicitly approve this recommendation.

## Executive recommendation

Sprint 03 should focus on **database-backed demo/data foundation with source governance**, not scraping and not full real-data publication.

The schema should support:

1. public village identity,
2. annual budget summary,
3. APBDes line items when available,
4. document registry,
5. data source/source registry,
6. mandatory data status lifecycle,
7. safe read service layer later.

Key conclusion:

> `DataSource` and `DataStatus` must be included from Sprint 03. Raw snapshot and staging are important but can be deferred unless the technical gate wants a heavier foundation immediately.

## Why this is necessary

Full Arjasari discovery shows:

- 10 of 11 sampled desa have active official desa websites observed.
- 1 desa, Mekarjaya, remains a source-status validation case.
- APBDes/realisasi evidence exists for several desa, but not all.
- Public data appears as HTML pages, articles, archives, images/infographics, and PDF references.
- Some source URLs can be stale or typo-like.
- Public visibility does not equal verified trust.

Therefore, Sprint 03 schema must not simply copy the current `mock-data.ts` shape.

## Sprint 03 must-have models

## 1. `Desa`

Purpose:

Store village identity and stable public routing metadata.

Must-have fields:

- `id`
- `kodeDesa` optional
- `nama`
- `slug`
- `kecamatan`
- `kabupaten`
- `provinsi`
- `tahunData` optional
- `jumlahPenduduk` optional
- `kategori` optional
- `websiteUrl` optional
- `dataStatus`
- `createdAt`
- `updatedAt`

Recommended constraints:

- `slug` unique.
- `kodeDesa` optional and unique only if present.
- `dataStatus` required.

Reason:

Village identity exists before complete budget data. Some desa may have only profile/contact available.

## 2. `DataSource`

Purpose:

Record where data came from, because source is not just a string.

Must-have fields:

- `id`
- `desaId` optional
- `scopeType`
- `scopeName`
- `sourceName`
- `sourceUrl` optional
- `sourceType`
- `accessStatus`
- `dataAvailability`
- `lastCheckedAt` optional
- `notes` optional
- `dataStatus`
- `createdAt`
- `updatedAt`

Required relation:

- Optional relation to `Desa`.

Reason:

Sources can be:

- desa website homepage,
- kecamatan detail page,
- article page,
- archive page,
- document URL,
- typo/stale URL needing review,
- demo seed.

`DataSource` must exist from Sprint 03 because Arjasari discovery proves source variability is real.

## 3. `AnggaranDesaSummary`

Purpose:

Store annual budget summary for list/homepage/detail cards.

Must-have fields:

- `id`
- `desaId`
- `tahun`
- `totalAnggaran` optional initially
- `totalRealisasi` optional initially
- `persentaseRealisasi` optional initially
- `statusSerapan` optional initially
- `sourceId` optional
- `dataStatus`
- `createdAt`
- `updatedAt`

Required relation:

- Required relation to `Desa`.
- Optional relation to `DataSource`.

Reason:

Not all desa have budget numbers confirmed. Sprint 03 must allow demo data and partial imported/needs_review data without pretending all records are complete.

## 4. `APBDesItem`

Purpose:

Store APBDes line items per year/bidang when structured numeric data exists.

Must-have fields:

- `id`
- `desaId`
- `tahun`
- `kodeBidang` optional
- `namaBidang`
- `anggaran` optional
- `realisasi` optional
- `persentase` optional
- `sourceId` optional
- `dataStatus`
- `createdAt`
- `updatedAt`

Required relation:

- Required relation to `Desa`.
- Optional relation to `DataSource`.

Reason:

Some sources provide article/infographic-level budget information, but full numeric extraction should not be assumed. This model is necessary for future compatibility but should be populated carefully.

## 5. `DokumenPublik`

Purpose:

Store public document registry before full numeric extraction.

Must-have fields:

- `id`
- `desaId`
- `tahun` optional
- `namaDokumen`
- `jenisDokumen`
- `status`
- `url` optional
- `fileType` optional
- `sourceId` optional
- `publishedAt` optional
- `lastCheckedAt` optional
- `dataStatus`
- `createdAt`
- `updatedAt`

Required relation:

- Required relation to `Desa`.
- Optional relation to `DataSource`.

Reason:

Arjasari discovery shows APBDes/realisasi often appears as article pages, archives, infographics, or PDF references. A document registry is safer than rushing numeric extraction.

## Sprint 03 proposed enums

## `DataStatus`

Must exist from day one.

Values:

- `demo`
- `imported`
- `needs_review`
- `verified`
- `outdated`
- `rejected`

Rules:

- `demo`: seed/demo/illustrative data only.
- `imported`: collected from public source but not reviewed.
- `needs_review`: requires human review before trust claim.
- `verified`: only after explicit review.
- `outdated`: source is old/stale.
- `rejected`: source/data rejected.

Important:

> Sprint 03 seed should mostly use `demo`. Manual discovery findings should stay `imported` or `needs_review`, never `verified`.

## `SourceType`

Recommended values:

- `demo`
- `manual`
- `official_website`
- `official_document`
- `kecamatan_page`
- `article_page`
- `archive_page`
- `other`

Reason:

The pilot found multiple source shapes beyond a simple website URL.

## `ScopeType`

Recommended values:

- `desa`
- `kecamatan`
- `kabupaten`
- `provinsi`
- `national`
- `other`

Reason:

Some source data may come from kecamatan/kabupaten, not only desa website.

## `AccessStatus`

Recommended values:

- `accessible`
- `unreachable`
- `broken`
- `unknown`
- `requires_review`

Reason:

Mekarjaya and Wargaluyu demonstrate source URL validation problems.

## `DataAvailability`

Recommended values:

- `none`
- `profile_only`
- `documents_only`
- `budget_summary`
- `budget_detail`
- `mixed`
- `unknown`

Reason:

Some desa have only profile/contact. Some have budget/realisasi. Some need deeper review.

## `StatusSerapan`

Recommended values:

- `baik`
- `sedang`
- `rendah`
- `unknown`

Reason:

Existing UI uses status serapan, but imported/partial data may not have enough numbers yet.

## `DocumentStatus`

Recommended values:

- `tersedia`
- `belum`
- `unknown`
- `needs_review`

Reason:

Document availability should not be boolean only.

## `DocumentType`

Recommended values:

- `apbdes`
- `realisasi`
- `rkpdes`
- `rpjmdes`
- `perdes`
- `lppd`
- `profile`
- `other`

Reason:

Manual discovery found APBDes, realisasi, perdes/archive/document patterns.

## Deferred models

These should be documented but not necessarily implemented in first Sprint 03 schema unless explicitly approved.

## 1. `RawSourceSnapshot`

Purpose later:

Store raw fetched source/content metadata for audit and reprocessing.

Defer because:

- Sprint 03 is still data foundation, not scraper/import pipeline.
- No crawler/scraper is authorized yet.

Add later when:

- import/scraper prototype begins,
- source reprocessing is needed,
- raw content storage policy is clear.

## 2. Staging models

Potential later models:

- `StagedDesaProfile`
- `StagedBudgetDocument`
- `StagedBudgetRecord`

Defer because:

- no real import/scraper is being implemented in Sprint 03,
- manual discovery outputs are still review notes,
- published demo data can start without staging.

Add later when:

- CSV/manual import starts,
- scraper/importer starts,
- admin review workflow starts.

## 3. `AuditLog`

Defer because:

- admin workflow is not yet implemented,
- verification workflow is not yet implemented.

## 4. Scheduler / scraper / job tables

Defer completely.

Do not include in Sprint 03.

## 5. Full `SkorTransparansi` model

Defer unless needed for current UI parity.

Reason:

- scoring methodology must be finalized first,
- trust risk is high if score looks official without verified data.

## 6. `PerangkatDesa` model

Defer unless Iwan/Owner require public profile completeness in Sprint 03.

Reason:

- many sites show aparatur data, but it may include people-level data and needs privacy/trust review.

## DataStatus rules

Mandatory rules:

1. Every must-have public model must include `dataStatus`.
2. Default seed/demo records use `demo`.
3. Manual discovery findings are `imported` or `needs_review` only.
4. No discovery finding can become `verified` automatically.
5. `verified` requires explicit future review workflow.
6. UI must not present `imported` or `needs_review` as trusted official data.
7. Aggregated homepage/list metrics should clearly handle mixed statuses.
8. If data is incomplete, status should be `needs_review`, `outdated`, or `unknown`, not guessed.

## DataSource/source registry design

## Required source design behavior

`DataSource` should support:

- one desa with many sources,
- one source used by multiple public records,
- source not yet linked to a desa,
- source URL typo/stale/unreachable state,
- kecamatan/kabupaten-level source,
- article/archive/document source,
- demo source.

## Recommended relation strategy

- `Desa` has many `DataSource`.
- `AnggaranDesaSummary` optionally references `DataSource`.
- `APBDesItem` optionally references `DataSource`.
- `DokumenPublik` optionally references `DataSource`.

Why optional source links?

- Demo seed must stay simple.
- Some manual discovery records may not map cleanly yet.
- Source registry should grow without blocking public demo models.

## Document registry before numeric extraction

Sprint 03 should prioritize `DokumenPublik` before full APBDes numeric extraction.

Reason:

Arjasari evidence shows public data commonly appears as:

- article pages,
- archives,
- infographics,
- PDF references,
- historical APBDes/realisasi pages,
- incomplete pages.

Safer approach:

1. Capture document/source existence.
2. Mark `dataStatus` as `imported` or `needs_review`.
3. Only extract numeric APBDes fields later after review.
4. Avoid presenting partial numbers as verified budget facts.

## Seed/demo strategy

Sprint 03 seed should not use full Arjasari discovery as verified production data.

Recommended seed plan:

- Seed 5–11 demo desa records.
- Use `dataStatus = demo` for demo data.
- Add one demo `DataSource` like `PantauDesa demo seed`.
- Optionally add `DataSource` records for discovered public sources with `imported` or `needs_review`, but do not connect them to verified metrics.
- Use clearly fake/demo summary numbers unless manually reviewed.
- Include `DokumenPublik` samples as `demo` or `needs_review` only.

Recommended first demo seed subset:

- Patrolsari
- Wargaluyu
- Lebakwangi
- Mangunjaya
- Pinggirsari

Reason:

These have stronger document/budget evidence for later manual review patterns.

## Read path recommendation

Implementation is not approved yet, but when Sprint 03 opens:

### Phase 1

Create read-only service layer first.

Suggested functions from prior plan:

- `getHomeStats()`
- `getFeaturedDesa()`
- `getDesaList(params)`
- `getDesaByIdOrSlug(idOrSlug)`
- `getDesaStaticParams()` only after build strategy is approved

### Phase 2

Move low-risk read path first:

1. Data service mapping tests.
2. Desa list data source.
3. Homepage stats/featured data.
4. Detail page last, because it has the richest nested data.

### Avoid early risk

Do not move `generateStaticParams()` to DB until build-time DB dependency is reviewed.

Reason:

Prior validation noted build risk around Prisma/generate/build environment.

## QA plan before schema implementation

Before changing schema, complete this checklist:

- [ ] Iwan/Owner approve this recommendation.
- [ ] Confirm `DataSource` is must-have Sprint 03 model.
- [ ] Confirm `DataStatus` enum values.
- [ ] Confirm `RawSourceSnapshot` is deferred or included.
- [ ] Confirm staging is deferred or included.
- [ ] Confirm `Voice.desaId` remains unchanged.
- [ ] Confirm generated Prisma client path remains unchanged.
- [ ] Confirm seed/demo data will not be labeled verified.
- [ ] Confirm build strategy for detail routes.
- [ ] Confirm local commands to run after implementation.

## QA plan after schema implementation

After implementation is approved and done, run:

- `npx prisma validate`
- `npx tsc --noEmit`
- `npm run test`
- `npm run lint`
- `npm run build`

Known caveat:

- Past validation showed lint/build risks existed, including Prisma generate/build environment issue. Do not claim green unless actually run successfully.

Functional QA should verify:

- seed works,
- Prisma client generates,
- homepage still renders,
- desa list still renders,
- desa detail still renders or explicitly remains on mock until ready,
- dataStatus displays safely,
- imported/needs_review not shown as verified,
- no auth/voice regression.

## Stop conditions

Stop implementation immediately if any of these happen:

1. Prisma validate fails.
2. Migration generation is destructive or ambiguous.
3. Existing auth/NextAuth models are affected unexpectedly.
4. `Voice` relation requires migration not approved.
5. Build requires DB at build time unexpectedly.
6. Seed cannot run safely.
7. UI would show imported/needs_review data as verified.
8. DataSource relation creates circular or overly strict dependency.
9. Lint/typecheck/test failures appear outside known existing issues.
10. Team is unsure whether a discovered source is official/public.

## Owner/Iwan approval checklist

Before Sprint 03 implementation starts, approve these decisions:

- [ ] Include `Desa`.
- [ ] Include `DataSource`.
- [ ] Include `AnggaranDesaSummary`.
- [ ] Include `APBDesItem`.
- [ ] Include `DokumenPublik`.
- [ ] Include full `DataStatus` lifecycle.
- [ ] Keep `RawSourceSnapshot` deferred.
- [ ] Keep staging models deferred.
- [ ] Keep scraper/scheduler out of Sprint 03.
- [ ] Keep `Voice.desaId` unchanged for now.
- [ ] Use document registry before numeric extraction.
- [ ] Keep all manual discovery findings as imported/needs_review.
- [ ] Require explicit approval before touching `prisma/schema.prisma`.

## Final recommendation

Approve Sprint 03 schema implementation only after accepting this scope:

Must-have:

- `Desa`
- `DataSource`
- `AnggaranDesaSummary`
- `APBDesItem`
- `DokumenPublik`
- Data/source/document/status enums

Deferred:

- `RawSourceSnapshot`
- staging tables
- scheduler/scraper/job tables
- audit log
- admin verification workflow
- full transparency score model
- perangkat desa model unless explicitly prioritized

Implementation posture:

- read-only first,
- seed/demo first,
- service layer before broad UI read path switch,
- document registry before numeric extraction,
- no verified claim from discovery data.

## Completion note

This is a planning/recommendation document only.

No schema/database/API/auth/read path/Prisma/runtime changes were made.

Initiated-by: Iwan/Owner direction
Reviewed-by: Pending Iwan/Owner technical gate
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-review
