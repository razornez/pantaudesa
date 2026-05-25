# Sprint 05 - Template Runtime Config-Driven Refactor Report

## Status

Partial implementation checkpoint. This report records the first execution slice of `docs/bmad/tasks/sprint-05-template-runtime-config-driven-refactor.md`.

## Completed

- Added operational guide: `docs/engineering/village-template-system-guide.md`.
- Added catalog runtime metadata schema fields to `VillageComponentCatalog`:
  - `isDefaultVisible`
  - `displayOrder`
  - `rendererType`
  - `previewVariant`
  - `detailSlot`
  - `navLabel`
  - `anchorId`
  - `publicGroupKey`
  - `publicTabKey`
  - `highlightFieldKeys`
  - `renderConfigJson`
- Added migration file:
  - `prisma/migrations/20260525100000_component_catalog_runtime_metadata/migration.sql`
- Updated template sync paths so catalog seed writes runtime metadata:
  - `prisma/seed-templates.mjs`
  - `src/lib/village-data/default-template-sync.ts`
- Added script-first entrypoints:
  - `npm run template:sync`
  - `npm run template:validate`
  - `npm run template:move-field`
  - `npm run template:move-component`
  - `npm run template:backfill-demo`
- Added runtime metadata to manifest contract and runtime manifest output.
- Added `TemplateRuntimeContract`, `RuntimeComponentContract`, and `RuntimeFieldContract` aliases over the existing runtime manifest model.
- Updated template management service to read runtime metadata from DB catalog when available.
- Added guardrail validation script:
  - validates component metadata presence
  - validates duplicate field ownership in catalog manifest
  - validates current public/preview registry coverage
  - scans key UI/read-model paths for known hardcoded template count patterns
- Added runtime manifest tests for DB metadata hydration and fallback metadata.

## Architecture Impact

This checkpoint starts moving the system from `componentKey`-driven UI mapping toward a runtime contract model:

- Catalog now has a place to store render metadata instead of relying only on source manifest fallback.
- Runtime manifest now carries render metadata (`rendererType`, `previewVariant`, `detailSlot`, `publicTabKey`, etc.).
- Template management can surface DB-backed render metadata once migration is applied.
- Script-first workflows are now named and available in `package.json`.

The public detail page, intake coverage, desa-data API, and field-standards API are not fully refactored yet. They still need follow-up phases to consume `TemplateRuntimeContract` exclusively and remove remaining duplicate mapping logic.

## Blocker

`npx prisma migrate deploy` could not apply the new metadata migration because an older migration is currently unresolved in the target database:

```text
Migration name: 20260519120000_batch4_source_backed_submission_ingestion_mvp
Database error code: 42701
ERROR: column "inputMode" of relation "admin_desa_documents" already exists
```

This means the metadata migration file is present in source, but the remote database migration history needs repair before it can be applied through Prisma migrate.

No `migrate resolve` was run in this checkpoint because resolving migration history on the remote database is a higher-risk operation and should be handled deliberately.

## QA Evidence

Passed:

```bash
npm run template:validate
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Notes:

- `npm run build` passed.
- Build emitted existing Turbopack/NFT warning around Prisma import tracing.
- During static page generation, the database pool hit `EMAXCONNSESSION`; build still completed successfully, but this remains a runtime resilience concern already aligned with BMAD back-office resilience standards.

## Residual Risk

- DB metadata columns are not applied yet due to the older failed migration state.
- `template:sync`, `template:move-field`, and `template:move-component` require the metadata migration to exist in DB before they can be relied on end-to-end.
- Public detail still has component-specific slot logic in places and needs the next refactor slice.
- Intake coverage still has fallback hardcoded standards and should be moved fully onto `TemplateRuntimeContract`.
- Current validator still allows registry coverage by `componentKey`; after renderer simplification, it should validate `rendererType`/`previewVariant` coverage instead.

## Recommended Next Slice

1. Resolve the existing Prisma migration state safely.
2. Apply `20260525100000_component_catalog_runtime_metadata`.
3. Run `npm run template:sync`.
4. Refactor public detail slot rendering to consume `TemplateRuntimeContract` metadata.
5. Refactor `desa-data`, `field-standards`, and intake coverage to consume the same contract.
6. Tighten `template:validate` so no component-specific mapping can be reintroduced outside the contract layer.
