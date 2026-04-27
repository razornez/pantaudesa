# Sprint 03 Implementation Start Plan

Date: 2026-04-27
Status: approved-scope-start-plan
Prepared-by: ChatGPT Freelancer / Rangga

## Context

Iwan/Owner approved the final Sprint 03 schema recommendation in:

- `docs/engineering/34-iwan-approval-final-sprint-03-schema-recommendation.md`

This plan is required before modifying schema.

Implementation gate is open with strict scope only.

## Allowed scope

Allowed in this first implementation pass:

- update `prisma/schema.prisma` for approved must-have models/enums,
- keep `Voice.desaId` unchanged,
- keep mock fallback,
- document migration/seed approach,
- report QA status honestly.

## Out of scope

Do not implement:

- scraper,
- scheduler,
- `RawSourceSnapshot`,
- staging tables,
- audit log,
- admin verification workflow,
- full transparency score model,
- perangkat desa model,
- broad read path switch,
- production deploy,
- UI publishing of manual discovery data,
- automatic verified claims.

Also do not change:

- API,
- auth,
- read path,
- existing `Voice.desaId` relation,
- existing NextAuth tables unless required by Prisma formatting only.

## Exact enums to add

### `DataStatus`

Values:

- `demo`
- `imported`
- `needs_review`
- `verified`
- `outdated`
- `rejected`

Rule:

Manual discovery findings remain `imported` or `needs_review`, never `verified`.

### `SourceType`

Values:

- `demo`
- `manual`
- `official_website`
- `official_document`
- `kecamatan_page`
- `article_page`
- `archive_page`
- `other`

### `ScopeType`

Values:

- `desa`
- `kecamatan`
- `kabupaten`
- `provinsi`
- `national`
- `other`

### `AccessStatus`

Values:

- `accessible`
- `unreachable`
- `broken`
- `unknown`
- `requires_review`

### `DataAvailability`

Values:

- `none`
- `profile_only`
- `documents_only`
- `budget_summary`
- `budget_detail`
- `mixed`
- `unknown`

### `StatusSerapan`

Values:

- `baik`
- `sedang`
- `rendah`
- `unknown`

### `DocumentStatus`

Values:

- `tersedia`
- `belum`
- `unknown`
- `needs_review`

### `DocumentType`

Values:

- `apbdes`
- `realisasi`
- `rkpdes`
- `rpjmdes`
- `perdes`
- `lppd`
- `profile`
- `other`

## Exact models to add

## 1. `Desa`

Fields:

- `id String @id @default(cuid())`
- `kodeDesa String? @unique`
- `nama String`
- `slug String @unique`
- `kecamatan String`
- `kabupaten String`
- `provinsi String`
- `tahunData Int?`
- `jumlahPenduduk Int?`
- `kategori String?`
- `websiteUrl String?`
- `dataStatus DataStatus @default(demo)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

Relations:

- `dataSources DataSource[]`
- `anggaranSummaries AnggaranDesaSummary[]`
- `apbdesItems APBDesItem[]`
- `dokumenPublik DokumenPublik[]`

Important:

- Do not link `Voice.desaId` to `Desa` in this pass.

## 2. `DataSource`

Fields:

- `id String @id @default(cuid())`
- `desaId String?`
- `scopeType ScopeType`
- `scopeName String`
- `sourceName String`
- `sourceUrl String?`
- `sourceType SourceType`
- `accessStatus AccessStatus @default(unknown)`
- `dataAvailability DataAvailability @default(unknown)`
- `lastCheckedAt DateTime?`
- `notes String? @db.Text`
- `dataStatus DataStatus @default(needs_review)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

Relations:

- Optional relation to `Desa`.
- Referenced by public records via optional `sourceId`.

## 3. `AnggaranDesaSummary`

Fields:

- `id String @id @default(cuid())`
- `desaId String`
- `tahun Int`
- `totalAnggaran BigInt?`
- `totalRealisasi BigInt?`
- `persentaseRealisasi Decimal? @db.Decimal(5, 2)`
- `statusSerapan StatusSerapan @default(unknown)`
- `sourceId String?`
- `dataStatus DataStatus @default(demo)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

Relations:

- Required relation to `Desa`.
- Optional relation to `DataSource`.

## 4. `APBDesItem`

Fields:

- `id String @id @default(cuid())`
- `desaId String`
- `tahun Int`
- `kodeBidang String?`
- `namaBidang String`
- `anggaran BigInt?`
- `realisasi BigInt?`
- `persentase Decimal? @db.Decimal(5, 2)`
- `sourceId String?`
- `dataStatus DataStatus @default(demo)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

Relations:

- Required relation to `Desa`.
- Optional relation to `DataSource`.

## 5. `DokumenPublik`

Fields:

- `id String @id @default(cuid())`
- `desaId String`
- `tahun Int?`
- `namaDokumen String`
- `jenisDokumen DocumentType @default(other)`
- `status DocumentStatus @default(unknown)`
- `url String?`
- `fileType String?`
- `sourceId String?`
- `publishedAt DateTime?`
- `lastCheckedAt DateTime?`
- `dataStatus DataStatus @default(demo)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

Relations:

- Required relation to `Desa`.
- Optional relation to `DataSource`.

## Migration approach

Recommended local command after schema update:

```bash
npx prisma validate
npx prisma migrate dev --name sprint_03_data_foundation
```

Important:

- Migration must be generated locally or in a reviewed environment.
- If migration is destructive or touches auth/voice tables unexpectedly, stop.
- In this ChatGPT/GitHub-only pass, migration execution may not be possible. If not executed, report honestly.

## Seed approach

Seed implementation is allowed by Iwan/Owner, but recommended as a separate follow-up after schema validates.

Safe seed rules:

- Use `dataStatus = demo` for demo seed records.
- If adding discovered public source URLs later, use `imported` or `needs_review` only.
- Do not mark Arjasari discovery data as `verified`.
- Seed should not remove mock fallback.
- Seed should not require read path switch.

Recommended follow-up seed file:

- create/update Prisma seed only after schema validation and migration plan are confirmed.

## QA commands

Required after schema implementation:

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
npm run lint
npm run build
```

Known caveat:

Previous validation docs reported:

- tests passed before,
- typecheck passed before,
- lint had existing failures,
- build had Prisma generate/permission-related risk in prior local environment.

Do not claim green unless commands actually run successfully.

## Rollback plan

If schema change fails validation:

1. Revert `prisma/schema.prisma` to previous commit.
2. Do not generate migration.
3. Do not update seed.
4. Document the exact validation error.
5. Ask Iwan/Owner/Asep-equivalent for review.

If migration is generated and unsafe:

1. Do not apply migration to shared database.
2. Delete/revert migration files.
3. Revert schema change.
4. Document destructive/ambiguous operation.

## Stop conditions

Stop immediately if:

- `npx prisma validate` fails because of new schema.
- Prisma migration wants to alter/drop existing auth/voice tables unexpectedly.
- Implementing relation requires changing `Voice.desaId`.
- TypeScript imports break because Prisma client output changes unexpectedly.
- DataStatus design would allow imported/needs_review data to appear verified.
- Build requires DB at build time unexpectedly.
- Any command introduces new failures unrelated to known existing lint/build issues.

## Known risks

1. Existing lint/build may already have issues.
2. Prisma generate previously had environment-specific failure risk.
3. Decimal/BigInt values require careful mapping when service layer is implemented later.
4. Optional `sourceId` relations must not become required too early.
5. `Voice.desaId` remains string, so future relation needs separate design.
6. Data source discovery contains unverified public findings; do not seed them as verified.
7. No broad read path switch yet means mock fallback must remain.

## Implementation sequence

1. Create this start plan.
2. Update `prisma/schema.prisma` with approved enums/models only.
3. Do not touch API/auth/read path.
4. Do not create scraper/scheduler/raw snapshot/staging/audit/admin verification.
5. Report that QA commands need to be run locally if GitHub-only environment cannot execute them.
6. Prepare follow-up seed/migration only after schema validation is available.

## Completion criteria for this pass

This pass is complete when:

- start plan exists,
- schema contains approved must-have models/enums,
- `Voice.desaId` remains unchanged,
- no out-of-scope models are added,
- no read path/API/auth changes are made,
- report clearly says whether QA was run or not.

Initiated-by: Iwan/Owner approval
Reviewed-by: Pending Iwan/Owner
Executed-by: ChatGPT Freelancer / Rangga
Status: ready-to-start-schema-update
