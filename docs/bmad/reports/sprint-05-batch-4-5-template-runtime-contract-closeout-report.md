# Sprint 05 Batch 4.5 - Template Runtime Contract Closeout Report

Status: implemented, QA passed with noted residual risks  
Date: 2026-05-26

## Summary

Batch ini menutup pekerjaan runtime template agar consumer utama tidak lagi bergantung pada mapping component-key lokal yang tersebar. Source of truth runtime tetap:

- DB template aktif untuk composition, order, visibility, dan assignment desa.
- `VillageComponentCatalog` untuk metadata render, preview, slot, nav, tab, dan ownership field.
- `TemplateRuntimeContract` sebagai read-model bersama untuk public detail, intake coverage, template preview, dan guardrail validator.

Target arsitektur yang dicapai: perubahan normal seperti reorder, show/hide, switch template, dan pemindahan slot/tab tidak perlu mengubah page publik. Consumer membaca contract yang sama, sedangkan registry hanya menjadi katalog renderer/presenter.

## Core Architecture Changes

- Public detail tidak lagi menyusun render plan dari `componentKey -> slot` di page.
- Public detail membaca `runtimeManifest.visibleComponents`, lalu memakai `detailSlot` dan `rendererType` dari `TemplateRuntimeContract`.
- Legacy visual shell publik tetap dipakai, tetapi klasifikasi shell sekarang berdasarkan `rendererType`, bukan nama komponen.
- Registry publik dipersempit menjadi renderer registry berbasis `rendererType`.
- Preview Kelola Template dipersempit menjadi preview registry berbasis `previewVariant`.
- Supabase fallback resolver sekarang ikut mengambil metadata catalog DB: `rendererType`, `previewVariant`, `detailSlot`, `navLabel`, `anchorId`, `publicGroupKey`, `publicTabKey`, `highlightFieldKeys`, dan `renderConfigJson`.
- Intake coverage untuk DB template sekarang membentuk entries dari runtime manifest, termasuk hidden component fields, bukan dari cross-reference lama yang berdiri sendiri.

## Related Surfaces

- Public detail `/desa/[id]`
  - Render order, slot visibility, and registry-only component render now come from runtime manifest metadata.
- Kelola Template
  - Mini preview receives `previewVariant` from catalog/runtime contract.
- Intake coverage
  - Visible and hidden component field coverage now reads the same runtime component list.
- Template validator
  - Guards renderer coverage, preview coverage, hardcoded field counts, and component-specific mappings in target consumers.
- Template sync
  - Sync writes catalog runtime metadata and keeps DB catalog aligned with source manifest.

## Migration Resolution Notes

No `migrate reset` was run.

Inspection result:

- `_prisma_migrations` contains a rolled-back row and a finished row for `20260519120000_batch4_source_backed_submission_ingestion_mvp`.
- Actual schema was inspected before deciding not to resolve manually.
- Objects from the old migration are present:
  - `admin_desa_documents.inputMode`, `sourceTypeCode`, `sourceUrl`, `sourceRegistryId`, `sourceEvidenceJson`, `structuredValuesJson`, `normalizedSourceText`.
  - `data_desa.reviewNote`, `sourceDocumentId`, `sourceEvidenceJson`, `sourceLabel`, `sourceRegistryId`, `sourceTypeCode`, `sourceUrl`.
  - `detail_field_standards.sourcePolicyJson`.
  - `village_detail_components.sourcePolicyJson`.
  - `data_source_fetch_runs` table and expected indexes/FKs.
- Metadata migration `20260525100000_component_catalog_runtime_metadata` is present in migration history.
- Actual `village_component_catalog` schema contains metadata columns:
  - `rendererType`
  - `previewVariant`
  - `detailSlot`
  - `navLabel`
  - `anchorId`
  - `publicGroupKey`
  - `publicTabKey`
  - `highlightFieldKeys`
  - `renderConfigJson`
  - `isDefaultVisible`
  - `displayOrder`

Final migration command:

```bash
npx prisma migrate deploy
```

Result: passed, 14 migrations found, no pending migrations to apply.

Because the ledger and actual schema were consistent enough for Prisma to report clean status, no `migrate resolve` was executed.

## QA Result

Passed:

```bash
npm run db:doctor
npx prisma migrate deploy
npm run template:sync
npm run template:validate
npm run qa:static
npm run qa:runtime
npm run build
```

Detailed evidence:

- `npm run db:doctor`: passed. `DATABASE_URL` runtime pooler, `DIRECT_URL`, Prisma `SELECT 1`, and migrate status all healthy. On May 26, 2026 the doctor also confirmed local runtime pool tuning is active: effective `connection_limit=5` and `pool_timeout=20`.
- `npx prisma migrate deploy`: passed. No pending migrations.
- `npm run template:sync`: passed outside sandbox with stage logs.
- `npm run template:validate`: passed for 12 components.
- `npm run qa:template-runtime`: passed. Template validator, runtime manifest/component/admin-desa notification unit tests, and Playwright template E2E all passed.
- `npm run qa:static`: passed. TypeScript, lint, 46 test files, 257 tests, and template validator all passed.
- `npm run qa:runtime`: passed when dev server was started in the same escalated runtime context. `/desa/batukarut` returned `200`. Internal admin API smoke skipped because `QA_INTERNAL_ADMIN_COOKIE` was not set.
- `npm run build`: passed.
- Local smoke after build/restart: `/desa/batukarut` returned `200`; `/internal-admin/village-data?tab=standards` returned `200`.
- Playwright E2E: `npm run test:e2e:template` passed. The browser flow verified Agenda Desa propagation to field count, admin desa structured form, upload category, and notifications.

Known QA notes:

- `qa:runtime` without an active dev server fails with `fetch failed`; this is expected because the script assumes `QA_RUNTIME_BASE_URL` is reachable.
- A sandboxed runtime attempt hit `EACCES` for Supabase network/path access. Re-running outside sandbox passed.
- `npm run template:sync` timed out once inside sandbox without useful stage output. Re-running outside sandbox passed with full stage logging.
- A Playwright run exposed Prisma `P2024` connection starvation in local Next dev. Root cause was an unsafe local pooler URL with a single runtime connection. Runtime now normalizes local Supabase pooler URLs above `connection_limit=1`; production/Vercel URLs are not rewritten.

## Guardrail Changes

- `template:validate` now validates public renderer coverage by `rendererType`.
- `template:validate` now validates preview coverage by `previewVariant`.
- `template:validate` still blocks hardcoded field count drift such as stale `31` or `37` literals in UI/read paths.
- `template:validate` now scans critical consumer targets for component-specific mappings outside the contract layer:
  - public detail page
  - desa-data API
  - field-standards API
  - intake coverage
  - internal-admin village-data API client
- Public detail composition tests now verify:
  - registry-only components follow contract order.
  - registry-only components remain renderable when a legacy slot owner is hidden.
  - legacy shell classification is based on `rendererType`, not `componentKey`.
- Public template registry tests now verify:
  - all manifest renderer types are covered.
  - all manifest preview variants are covered.
  - compatibility component registry remains aligned with catalog metadata.
- DB runtime guardrails now verify:
  - Prisma pool timeouts are classified as degraded database connectivity.
  - local Supabase pooler URLs are normalized away from single-connection starvation.
  - `db:doctor` reports whether local pool tuning is active without printing secrets.
- Playwright guardrail now covers:
  - Agenda Desa added to a QA template changes total field count.
  - Admin desa structured form and upload categories come from the active template contract.
  - Affected admin desa notification is created after template composition changes.

## Residual Risks

- Runtime DB connectivity can still fluctuate on local networks. Guardrail is now explicit: run `npm run db:doctor` before debugging UI symptoms.
- Public detail smoke passed, but dev logs show route data can be slow when multiple DB-backed reads occur. This remains a performance follow-up, not a contract blocker.
- Authenticated internal-admin runtime smoke still requires `QA_INTERNAL_ADMIN_COOKIE`.
- Build passes, but Turbopack still reports one NFT tracing warning through `next.config.ts -> src/generated/prisma/index.js -> review-candidate-submission -> source-candidates route`.
- ESLint still warns that `.eslintignore` is deprecated under the current ESLint version.
- The contract layer is now stronger, but future visual renderer additions still require disciplined updates to registry and tests.
- Windows build still needs the local Next dev server stopped first if Prisma DLL is locked. After build, restart `npm run dev` so port 3000 is available for manual smoke.

## Operational Guidance

For future template work:

- Reorder/show-hide/switch template should go through UI/API and must not edit public page composition.
- Moving a component between slots/tabs should use catalog metadata sync or `template:move-component`.
- Moving a field should use catalog ownership sync or `template:move-field`.
- Adding a component with an existing visual should only need catalog metadata plus sync/validate.
- Adding a new visual shape requires a new `rendererType`, a new `previewVariant` if needed, and matching registry/test coverage.
