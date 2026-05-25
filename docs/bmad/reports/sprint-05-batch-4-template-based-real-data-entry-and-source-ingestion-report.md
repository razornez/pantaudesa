# Sprint 05 Batch 4 - Template-Based Real Data Entry & Source Ingestion Report

## Status
IN PROGRESS - core Batch 4 runtime paths are now working locally after schema sync, but work is still not committed or pushed and public/source-attribution polish is still partial.

## Branch / Commit
- Branch: `sprint-05-batch-4-template-based-real-data-entry`
- Commit: not created yet by instruction

## Final Implemented Flow So Far
1. Active template is resolved once and reused as the field engine for:
   - Admin Desa structured submission
   - internal source-backed candidate input
   - source ingestion preview + candidate creation
   - internal review candidate build
   - public detail overlay
2. All new non-public data paths converge into the existing review envelope using `AdminDesaDocument`.
3. Final publish/reject remains in `/internal-admin/intake/[documentId]`.
4. Public detail starts reading `DataDesa` published rows first, then falls back to legacy `Desa` values only where needed.

## Plan Changes During Development
### Change 1 - Reuse `AdminDesaDocument` as the review envelope
- What changed:
  - Instead of introducing a brand-new `ReviewCandidate` table in MVP, Batch 4 reuses and generalizes `AdminDesaDocument`.
- Why:
  - Faster convergence to the existing Step 2 review flow.
  - Lower UI duplication risk.
  - Keeps one publish/review surface.
- User flow impact:
  - Admin Desa uploads, structured submissions, internal source-backed input, and source ingestion all end in the same review page.
- Governance impact:
  - Review-first rule stays intact and auditable.

### Change 2 - Structured Admin Desa input moved into existing Dokumen page
- What changed:
  - Structured submission is implemented as a second mode inside `/profil/admin-desa/dokumen`, not as a separate page.
- Why:
  - Matches owner clarification and reduces route sprawl.
- User flow impact:
  - Admin Desa can switch between `Unggah Dokumen` and `Isi Data Terstruktur`.
- Governance impact:
  - Structured data still becomes a review candidate, not public data.

### Change 3 - Internal source-backed workbench lives inside Village Data Center
- What changed:
  - Source-backed input and ingestion MVP are implemented inside `/internal-admin/village-data?tab=source-workbench`.
- Why:
  - Better fit for internal command-center usage and future completeness workflows.
- User flow impact:
  - Internal admin works from one dense back-office workspace instead of another isolated route.
- Governance impact:
  - Keeps internal admin in source-mapping role, not direct free-typing publisher role.

## Technical Suggestions Made And Accepted
- Reuse `AdminDesaDocument` as a hybrid review candidate envelope for MVP.
- Store source-backed public provenance directly in `DataDesa`.
- Add manual ingestion run logging via `DataSourceFetchRun`.
- Add schema-mismatch degraded behavior for runtime safety while migration is not yet applied.

## Template-Driven Field Engine Summary
- Added shared field engine and view-model path:
  - `src/lib/village-data/field-engine.ts`
  - `src/lib/village-data/template-engine-view.ts`
  - `src/lib/village-data/template-field-contract.ts`
- Effective template now carries:
  - visible fields
  - hidden components
  - value type
  - required/public flags
  - source policy metadata
  - publishability metadata
- This engine is the single source for Batch 4 field rendering and validation.

## Admin Desa Structured Submission Summary
- Added new endpoint:
  - `POST /api/admin-claim/documents/structured-submit`
- Added Admin Desa dual-entry UI in:
  - `/profil/admin-desa/dokumen`
- Flow:
  - Admin Desa fills active template fields
  - system sanitizes values by template field type
  - evidence/source is required when policy demands it
  - submission becomes `STRUCTURED_SUBMISSION`
  - LIMITED -> `WAITING_VERIFIED_APPROVAL`
  - VERIFIED -> `PROCESSING`
- Current degraded behavior:
  - if Batch 4 migration columns are missing in local DB, page falls back to safe read-only list + warning notice instead of crashing

## Internal Admin Source-Backed Input Summary
- Added new tab in Village Data Center:
  - `source-workbench`
- Added endpoints:
  - `GET /api/internal-admin/village-data/template-fields`
  - `POST /api/internal-admin/village-data/source-candidates`
- Internal admin flow:
  - choose desa
  - resolve active template
  - choose source type
  - provide source URL/name/evidence note
  - fill candidate fields
  - submit to review envelope
- No source-less factual candidate is allowed.

## Source Ingestion / Scraping MVP Summary
- Added endpoint:
  - `POST /api/internal-admin/village-data/source-ingestion`
- Added ingestion helper:
  - `src/lib/internal-admin/source-ingestion.ts`
- Current MVP scope:
  - 1 URL
  - validate allowed public URL
  - fetch text/html
  - extract readable text
  - auto-suggest mapped values
  - persist preview fetch run
  - allow reviewer to turn it into a review candidate
- Safety guard:
  - blocks localhost/private IP
  - blocks login/protected-looking URLs
  - blocks non-http(s)
  - no auto-publish

## Review Candidate Storage Strategy
- Chosen strategy:
  - hybrid reuse of `AdminDesaDocument`
- New envelope metadata added to `AdminDesaDocument`:
  - `inputMode`
  - `sourceTypeCode`
  - `sourceUrl`
  - `sourceRegistryId`
  - `sourceEvidenceJson`
  - `structuredValuesJson`
  - `normalizedSourceText`
- Result:
  - file upload and non-file candidate now share one review pipeline

## Unified Review Flow Summary
- Step 2 loader now builds a `reviewCandidate` model from:
  - structured values
  - pipeline mapping snapshot
  - current `DataDesa`
  - legacy `Desa`
- Final review section in Step 2 now:
  - shows current vs proposed field values
  - marks valid / invalid / held / blocked
  - publishes only valid fields
  - keeps terminal states read-only

## Publish Guard / Validation Summary
- Added sanitization/coercion for:
  - numbers
  - JSON
  - trimmed strings
- Review candidate validation currently blocks:
  - empty values
  - non-publishable fields
  - missing evidence for evidence-required fields
  - invalid URLs
  - invalid emails
  - invalid numbers
  - out-of-range year
  - invalid JSON
- Publish now writes only candidate fields marked `valid`.

## Public Partial Real Data Render Summary
- Public detail now starts overlaying `DataDesa` published values over legacy `Desa`.
- Active `DataDesa` is treated as the source-backed layer.
- Legacy `Desa` remains compatibility fallback for not-yet-migrated or not-yet-published fields.
- This is intentionally partial-first, not all-or-nothing.

## Source Attribution Summary
- `DataDesa` now stores:
  - `sourceDocumentId`
  - `sourceUrl`
  - `sourceRegistryId`
  - `sourceTypeCode`
  - `sourceEvidenceJson`
  - `sourceLabel`
  - `reviewNote`
- Public rendering/source badge polish is still partial and should be reviewed again before close.

## Completeness / Progress Summary
- Foundation is now available through the effective template field count.
- Batch 4 has not yet added a dedicated completeness UI surface.
- Current progress exposure is architectural, not yet fully surfaced as a polished feature.

## Audit / Governance Summary
- Added audit events for:
  - admin desa structured submission
  - internal source-backed candidate creation
  - source ingestion preview captured
- Publish continues writing:
  - internal audit event
  - desa data audit event
  - notifications for affected admin desa users
- Review mode also distinguishes internal fallback publish for `WAITING_VERIFIED_APPROVAL`.

## Performance / Runtime Resilience Notes
- Followed back-office runtime resilience principle by adding degraded schema behavior for Admin Desa dokumen page.
- Local runtime blocker discovered and resolved:
  - Batch 4 migration was missing in the active Supabase project
  - missing column example confirmed directly: `admin_desa_documents.inputMode`
- Resolution:
  - Prisma Windows engine lock was cleared by stopping local `next dev`
  - Batch 4 migration was applied directly to the active Supabase project
  - schema existence was re-verified on:
    - `admin_desa_documents`
    - `data_desa`
    - `data_source_fetch_runs`
- Degraded fallback behavior remains in code as a safety net:
  - if schema drifts again, Admin Desa dokumen page falls back to safe read-only state with honest warning
- Known local runtime issue remains:
  - Prisma pool timeouts can still appear intermittently in local environment during build/runtime, but current static QA still passes

## QA Results So Far
### Static QA
- `npx tsc --noEmit` ✅
- `npm run lint` ✅
- `npm test` ✅ (25 files, 195 tests)
- `npm run prisma:generate` ✅ after releasing Windows Prisma engine lock
- `npm run build` ✅ before latest report update

### Focused New Tests Added
- `src/tests/lib/field-submission.test.ts`
- `src/tests/lib/source-ingestion.test.ts`
- Focused run:
  - `npm test -- src/tests/lib/field-submission.test.ts src/tests/lib/source-ingestion.test.ts` ✅

### Manual / Browser QA
- Internal admin source workbench loaded and rendered with active template fields ✅
- Selecting desa in source workbench loaded template name and active field sections ✅
- Admin Desa dokumen page originally failed due local schema mismatch ❌
- After migration apply and auth automation fix:
  - Admin Desa LIMITED can open `/profil/admin-desa/dokumen` and see both entry modes ✅
  - structured submission UI renders all active fields from template ✅
  - direct API structured submission succeeds and creates `WAITING_VERIFIED_APPROVAL` candidate ✅
  - internal admin can open Step 2 for structured candidate at `/internal-admin/intake/[documentId]` ✅
  - internal source-backed candidate API succeeds and creates `PROCESSING` review envelope ✅
  - source ingestion MVP preview succeeds for 1 URL and writes fetch run metadata ✅

## Playwright / Browser Notes
- Browser automation was used for local page verification.
- Login verification for QA now uses the real app flow:
  - `/api/auth/login` with PIN
  - `loginToken`
  - NextAuth callback provider `pin`
- Full end-to-end structured submission -> internal review -> publish -> public detail is still not fully closed yet, but the chain is now proven up to:
  - candidate creation
  - Step 2 review page load
  - source-backed internal candidate creation
  - source ingestion preview fetch

## Known Limitations
- Batch 4 migration is now applied in the active Supabase project, but `_prisma_migrations` visibility through Supabase tooling did not reflect local migration naming cleanly and should be rechecked later from the primary Prisma workflow.
- `prisma:generate` on Windows still depends on releasing local engine locks before rerun; this is an environment habit, not a code bug.
- Public source attribution presentation is still partial, not yet final-polished.
- Completeness/progress UI is not yet surfaced as a dedicated internal feature.
- Full end-to-end QA for:
  - Admin Desa structured submit -> review -> publish -> public detail render
  - source ingestion -> candidate -> review -> publish -> public detail render

## Update 2026-05-21 (runtime manifest field-count sync)
- New owner concern resolved:
  - template/catalog code had already moved to `37` template-backed fields
  - but `desa-data` row count could still show `0/31`
  - root cause: some runtime surfaces still read DB/template structure directly while others relied on the newer manifest path
- Final decision locked:
  - DB active template remains the runtime source of truth
  - manifest/catalog code is used to **synchronize** the default runtime template and to provide developer fallback/guardrails
  - all count-bearing surfaces must read from the same runtime template manifest helper
- New shared helper added:
  - `src/lib/village-data/runtime-template-manifest.ts`
  - responsibilities:
    - normalize visible + hidden component order
    - expose component order
    - expose field map
    - expose `visibleFieldCount`
    - expose `totalFieldCount`
    - expose `publishableCount`
    - provide one progress-source shape reused by count/progress logic
- New runtime sync helper added:
  - `src/lib/village-data/default-template-sync.ts`
  - behavior:
    - ensures the default template record exists in DB
    - synchronizes the default runtime template structure to the manifest-backed 37-field target
    - upserts missing components/fields
    - archives stale default-template components/fields that are no longer part of the manifest
    - optionally syncs catalog relations when the catalog tables are available
    - uses TTL/inflight guards to avoid repeated sync work per request burst
- Surface changes completed:
  - `src/lib/village-data/template-resolver.ts`
    - now runs default template sync before reading active template runtime structure
  - `src/app/api/internal-admin/village-data/desa-data/route.ts`
    - row aggregate count now reads from the shared runtime manifest
    - removed old hard fallback behavior such as `?? 7`
  - `src/app/api/internal-admin/village-data/field-standards/route.ts`
    - component panel and default-template view now read field totals from the same runtime manifest
  - `src/lib/village-data/template-engine-view.ts`
    - intake field engine view model now carries:
      - `visibleFieldCount`
      - `totalFieldCount`
      - `publishableCount`
  - `src/components/internal-admin/intake/IntakeSourceModeStep.tsx`
    - active field count now reads from the same manifest-backed view model instead of recomputing ad hoc in the component
  - `src/app/desa/[id]/page.tsx`
    - visible section ordering now explicitly reads from the same runtime manifest path before mapping to the public renderer registry
- Guardrails added:
  - `src/tests/lib/runtime-template-manifest.test.ts`
    - visible-field count stays separate from hidden-field count
    - publishable count is derived from the same manifest field map
  - `src/tests/lib/template-engine-view.test.ts`
    - intake-facing view model count is derived from the same runtime manifest path as other surfaces
- Latest QA for this sync pass:
  - `npx tsc --noEmit` OK
  - `npm run lint` OK
  - `npm test` OK (`38 files, 233 tests`)
- Remaining blocker:
  - `npm run build` still cannot close while local dev runtime is holding `src/generated/prisma/query_engine-windows.dll.node`
  - the current failure in this pass happens before app build starts, at Prisma generate, and is an environment lock issue rather than a logic/type issue in the field-count sync code

## Update 2026-05-21 (hot-read performance fix for `desa-data`)
- After the first field-count sync rollout, `/internal-admin/village-data?tab=desa-data` became too slow and could fail to load villages.
- Root cause:
  - the read path for:
    - `GET /api/internal-admin/village-data/desa-data`
    - `GET /api/internal-admin/village-data/field-standards`
    - public template resolver
  - was still calling `ensureDefaultTemplateSynchronized()`
  - this made hot read requests perform DB write/upsert work before returning data
- Fix applied:
  - removed template sync from hot read paths
  - kept template sync only in template-management/service path where it is acceptable operationally
  - preserved count consistency by overlaying the default template runtime structure with the registered component manifest **at read time**, but only for the active public default template
- Safety refinement:
  - catalog overlay now applies only to `CURRENT_PUBLIC_DETAIL_TEMPLATE`
  - non-default / custom templates continue to use their own exact DB structure and are not silently expanded
- Practical result:
  - `desa-data` stays on a read-only hot path again
  - field counts can still reconcile to the target public template shape
  - custom template behavior is preserved
- Latest QA after this performance fix:
  - `npx tsc --noEmit` OK
  - `npm run lint` OK
  - `npm test` OK (`38 files, 233 tests`)
  - route smoke check:
    - `/internal-admin/village-data?tab=desa-data` -> `200`

## Update 2026-05-21 (initial-load de-burst fix for `desa-data`)
- Even after the hot-read sync fix, the `desa-data` tab could still fail on localhost because the page was firing too many back-office requests at once during the first render.
- Root cause:
  - `DesaDataTab` initial effect fetched:
    - village rows
    - template workspace
  - `AdminDesaFilterBar` also fetched filter options immediately on mount
  - `ComponentVisibilityPanel` used an initial effect pattern that was vulnerable to duplicated fetches in React dev/Strict mode
  - together these created a noisy request burst against internal-admin auth + DB on local runtime
- Fix applied:
  - `DesaDataTab` now loads only village rows on first render
  - template workspace is lazy-loaded only when the user opens `Ganti template`
  - `AdminDesaFilterBar` now supports deferred option loading and no longer fetches filter options on mount for `desa-data`
  - `ComponentVisibilityPanel` now guards its first fetch by `desaId`, preventing duplicate first-load calls in dev mode
- Practical result:
  - first render for `desa-data` now uses a smaller, cleaner request set
  - template-switch metadata and filter metadata are still available, but only when actually needed
  - localhost dev is less likely to hit transient `Gagal memuat data desa` failures from request pileups
- QA:
  - `npx tsc --noEmit` OK
  - `npm run lint` OK

## Update 2026-05-21 (resilient fallback for `desa-data` list route)
- The village list route still risked returning `503 Database tidak tersedia sementara.` when Prisma local runtime lost DB connectivity, even after the initial request burst was reduced.
- Fix applied:
  - `GET /api/internal-admin/village-data/desa-data` now falls back to Supabase Data API when Prisma connectivity degrades
  - the fallback reads:
    - village list rows
    - active template assignment
    - default template
    - template components + field standards
    - per-desa component visibility
    - published `data_desa` rows
    - per-desa version counts
  - the fallback then reuses the same runtime manifest + progress-lens logic so field counts remain aligned with the template-driven UI
  - client fetch now surfaces the actual API error message instead of always collapsing to generic `Gagal memuat data desa.`
- Practical result:
  - if Prisma local reads fail, the tab should degrade to Supabase-backed reads instead of collapsing the whole village list
  - the list remains template-aware even in fallback mode
- QA:
  - `npx tsc --noEmit` OK
  - `npm run lint` OK

## Update 2026-05-21 (Kelola Template + public detail 100% template-driven foundation)
- Owner direction locked for this pass:
  - tab `standards` in Village Data Center is no longer `Standar Detail`
  - the tab is now the main `Kelola Template` workspace
  - public detail, internal `desa-data`, and intake must all read from the same template/component source of truth
  - no TSX/component source is stored in DB; DB only stores template/catalog metadata
- Schema foundation added:
  - `VillageComponentCatalog`
  - `VillageComponentCatalogField`
  - optional catalog linkage on:
    - `VillageDetailComponent.catalogComponentId`
    - `DetailFieldStandard.catalogFieldId`
- New manifest foundation added:
  - `prisma/template-catalog.manifest.mjs`
  - `src/lib/village-data/component-catalog-manifest.ts`
- Current unified component catalog now formalizes:
  - `11` template component keys
  - `37` template-backed fields
  - zero-field derived components remain explicit:
    - `sumber_dokumen`
    - `panduan_warga`
    - `suara_warga`
- Template management service added:
  - `src/lib/internal-admin/template-management-service.ts`
  - capabilities:
    - list workspace data
    - create template from empty canvas
    - edit template meta
    - replace/reorder/remove template components
    - hard-delete template with guards
    - switch template per desa
- Important guardrails implemented:
  - template delete is blocked if:
    - there is still a desa assigned to that template
    - there are component visibility overrides still tied to that template
    - there are `data_desa` / field-history references that would become unsafe
  - invalid / unknown component keys are sanitized out before save
  - runtime can still fall back to manifest mode if catalog tables are not yet available locally
- New internal APIs added:
  - `GET/POST /api/internal-admin/village-data/templates`
  - `PATCH/DELETE /api/internal-admin/village-data/templates/[templateId]`
  - `PUT /api/internal-admin/village-data/templates/[templateId]/components`
  - `POST /api/internal-admin/village-data/template-assignment`
- `Village Data Center` UI changes:
  - `Standar Detail` tab is replaced by `Kelola Template`
  - split workspace implemented:
    - left rail: template list
    - right panel: editor + minimal preview canvas
  - create template starts from empty canvas
  - drag-and-drop reorder/add/remove is supported at UI level
  - per-desa `Ganti template` action is added inside expanded `desa-data`
- Public detail refactor completed to a template-driven rendering path:
  - `src/components/desa/public-template-registry.tsx`
  - `src/lib/data/desa-template-public-view.ts`
  - `src/app/desa/[id]/page.tsx`
- Public detail rendering contract now is:
  - iterate visible template components in template order
  - map each `componentKey` to a code-based renderer registry
  - read published values from `DataDesa`
  - use derived payloads only for the officially zero-field components
- Important public-detail cleanup achieved:
  - removed the old hard-coded/static ownership pattern where field data leaked into unrelated cards
  - removed `ProfilDesaSection` as a separate duplicated surface
  - `DetailSectionNav` is now dynamic from visible components instead of a static array
  - component order between public detail and internal `desa-data` is now aligned by the same template manifest
- Intake / resolver sync:
  - template fallback no longer relies on the stale hardcoded `DETAIL_FIELD_STANDARDS`
  - intake-facing template reads now resolve through the same component/field manifest path
- Positive/negative/unit QA added for this pass:
  - `src/tests/lib/template-management-service.test.ts`
    - template name normalization
    - component key sanitization
  - `src/tests/lib/public-template-registry.test.ts`
    - every manifest component has a renderer
    - registry keys match template catalog keys
  - `src/tests/lib/desa-template-public-view.test.ts`
    - no static fallback profile data is fabricated
    - published values are read exactly from the field map
    - `kepalaDesa` + `perangkatDesa` parsing stays template-aware
- Smoke/runtime verification done locally:
  - `http://localhost:3000/desa/batukarut` -> `200`
  - `http://localhost:3000/internal-admin/village-data?tab=standards` -> `200`
  - `http://localhost:3000/internal-admin/village-data?tab=desa-data` -> `200`
- Latest QA for this update:
  - `npx prisma generate --no-engine` OK
  - `npx tsc --noEmit` OK
  - `npm run lint` OK
  - `npm test` OK (`36 files, 230 tests`)
- Known blocker after this update:
  - `npx next build` still does not close fully, but current failure is on older public/runtime paths outside this feature surface:
    - datasource validation / `P6001`
    - `/suara` prerender path
    - `TypeError: a.getTime is not a function` while prerendering `/suara`
  - compilation and type-check phase for the new template-management/public-detail code path itself is already passing
  still needs final rerun.
- Some older files still contain mojibake text artifacts and should be cleaned before final closeout.

## Owner Test Checklist
- Run migration `20260519120000_batch4_source_backed_submission_ingestion_mvp`.
- Login as Admin Desa VERIFIED and LIMITED.
- Test `/profil/admin-desa/dokumen`:
  - upload mode
  - structured submission mode
  - status clarity
  - verified approve/reject
- Test `/internal-admin/village-data?tab=source-workbench`:
  - desa selection
  - template field load
  - source ingestion preview
  - source-backed candidate submit
- Test `/internal-admin/intake/[documentId]`:
  - non-file candidate review
  - valid/invalid/held field behavior
  - publish and reject
- Test public desa detail:
  - published `DataDesa` overlays legacy values
  - unpublished/rejected data does not leak
  - source indication remains safe

## Suggested Next Enhancement
1. Apply migration locally and rerun end-to-end Batch 4 QA.
2. Finish public source attribution UI polish so important sections show source context clearly.
3. Add completeness/progress helper API or compact internal view based on effective template field count.
4. Add Playwright regression for:
   - structured submission -> review -> publish -> public detail
   - invalid field blocked from publish
   - hidden/outside-template field excluded safely

## Files / Areas Touched
- Prisma schema + Batch 4 migration
- Admin Desa dokumen page and client
- internal Village Data Center source workbench
- Step 2 intake review loader and final review section
- publish service to `DataDesa`
- source ingestion helper + APIs
- template field engine / field submission / source policy / source registry
- public desa detail overlay

## Update 2026-05-19
- Added template snapshot persistence for new Batch 4 review envelopes:
  - Admin Desa upload
  - Admin Desa structured submission
  - internal source-backed candidate submit
- Purpose:
  - Step 2 review/publish for newly created candidates can reuse `componentId`, `fieldStandardId`, and field source policy from persisted evidence instead of always re-resolving template metadata from DB.
  - This reduces local fragility when Prisma pooler is sempit.
- New focused test coverage:
  - `src/tests/lib/template-resolver.test.ts`
  - `src/tests/lib/template-field-snapshot.test.ts`
  - `src/tests/lib/review-candidate.test.ts`
- Latest static QA:
  - `npx tsc --noEmit` OK
  - `npm run lint` OK
  - `npm test` OK (28 files, 201 tests)
  - `npm run prisma:generate` OK
  - `npm run build` OK
- Latest local environment blocker:
  - final E2E rerun for login -> submit -> publish is still blocked intermittently by Supabase connectivity / Prisma pooler behavior in this environment
  - `POST /api/auth/login` intermittently returned `503`
  - heavier local build/runtime activity still surfaced `P2024` on read paths outside the core Batch 4 logic
- Practical meaning:
  - code path and static QA are significantly more complete than before
  - final close still needs one more clean local/runtime rerun when Supabase connectivity is stable

## Update 2026-05-19 (runtime resilience follow-up)
- Strengthened database connectivity classification in `src/lib/db-connectivity.ts`:
  - Prisma pool timeout `P2024` now counts as connectivity degradation
  - expired / missing transaction `P2028` now counts as connectivity degradation
- Impact:
  - existing `handleApiError(...)` surfaces can now return the honest `503 database unavailable` response more consistently
  - existing read paths that already branch on `isDatabaseConnectivityError(...)` can now enter their fallback logic instead of failing as generic server errors
- Step 2 / review candidate follow-up:
  - `getPublishedDataDesa(...)` now tries Supabase admin fallback when Prisma published-field reads degrade
  - review candidate legacy desa read now also falls back to Supabase admin read when Prisma times out
  - practical result: current-vs-proposed comparison in Intake Step 2 is more likely to stay usable during local Prisma pool stress
- New/updated focused tests:
  - `src/tests/lib/db-connectivity.test.ts`
  - `src/tests/lib/template-resolver.test.ts`
  - `src/tests/lib/review-candidate.test.ts`
- Latest QA after this follow-up:
  - `npm test -- src/tests/lib/db-connectivity.test.ts src/tests/lib/template-resolver.test.ts src/tests/lib/review-candidate.test.ts` OK
  - `npx tsc --noEmit` OK
  - `npm run lint` OK

## Update 2026-05-20 (Source Workbench moved into Intake Step 1)
- Refactor direction changed:
  - `Source Workbench` is no longer an active tab inside `/internal-admin/village-data`
  - source-backed internal review entry now starts from `/internal-admin/intake` as a third Step 1 mode beside `Upload file` and `Tempel teks`
  - preview endpoint lama `/api/internal-admin/village-data/source-ingestion` ikut dibersihkan karena tidak lagi punya caller setelah workbench lama dihapus
- UI / flow changes:
  - Intake Step 1 now has mode `Sumber resmi`
  - source-backed mode collects:
    - desa target
    - review title
    - source type
    - source name
    - source URL
    - evidence note
    - active template field inputs
  - `sourceName` now auto-fills from `sourceType + namaDesa` but remains editable
  - old `SourceWorkbenchTab` component was removed so there is no duplicate entry surface
- Review model changes:
  - Step 2 now auto-fetches source content once on first open for `INTERNAL_SOURCE_ENTRY` / `SOURCE_INGESTION`
  - fetch result is persisted into `sourceEvidenceJson.sourceFetch`
  - Step 2 final review now supports:
    - manual candidate value
    - fetched candidate value
    - reviewer choice per field: manual / fetch / skip
  - conflicting field values are intentionally marked `held` until reviewer makes an explicit choice
- Publish behavior follow-up:
  - publish service now respects reviewer-selected values from request payload, not only the default candidate snapshot
  - this is required so `manual vs fetch` choices actually propagate into `DataDesa`
- New supporting code:
  - `src/components/internal-admin/intake/IntakeSourceModeStep.tsx`
  - `src/components/internal-admin/intake/source-mode.ts`
  - `src/lib/internal-admin/source-review-fetch.ts`
  - `POST /api/internal-admin/documents/[documentId]/refresh-source`
- New tests added:
  - `src/tests/components/intake-source-mode.test.ts`
  - `src/tests/lib/review-candidate.test.ts` conflict coverage extended
- QA after this refactor:
  - `npx tsc --noEmit` OK
  - `npm run lint` OK
  - `npm test` OK (`30 files, 209 tests`)
  - `npm run build` blocked only by Windows Prisma engine file lock:
    - `EPERM rename ... query_engine-windows.dll.node`
    - this is the same local environment blocker, not a new TypeScript / lint / test failure
- Remaining manual QA still needed:
  - verify the new `Sumber resmi` mode visually on `/internal-admin/intake`
  - verify first-open auto-fetch and manual refresh on `/internal-admin/intake/[documentId]`
  - verify final publish with a manual-vs-fetch conflict field and confirm the chosen branch is what lands in `DataDesa`

## Update 2026-05-20 (publish unlock for `kepalaDesa`)
- Root cause from real QA:
  - reviewer could already choose `Pakai manual` for `Nama kepala desa`
  - but publish still stopped with `aktif untuk review tetapi belum dibuka ke publik`
  - this was not a selection bug; the field was still marked `isPublishableNow = false` in the fallback template registry, and older source-backed documents could still carry the same locked state inside persisted `templateSnapshot`
- Fixes applied:
  - `kepalaDesa` is now marked publishable in the fallback field registry
  - outdated `templateSnapshot` data is now reconciled against the latest live field policy when Step 2 rebuilds review candidates, so older source-backed documents can inherit current publishability rules without losing their original template context
  - public desa page now merges published `kepalaDesa` into the `Perangkat` tab, so publish does not silently succeed without a public read path
- User-facing effect:
  - existing source-backed documents should stop asking reviewer to `skip` `Nama kepala desa` just because of stale template policy
  - choosing `Pakai manual` for `Nama kepala desa` can now produce a publishable candidate when evidence is valid
  - after publish, the public desa detail page can show the published kepala desa name even when legacy `desa.perangkat` rows are still empty or outdated
- New tests added:
  - `src/tests/lib/desa-public-view.test.ts`
  - `src/tests/lib/review-candidate.test.ts` extended with snapshot-policy reconciliation coverage
- Latest QA for this fix:
  - `npx tsc --noEmit` OK
  - `npm run lint` OK
  - `npm test -- src/tests/lib/review-candidate.test.ts src/tests/lib/desa-public-view.test.ts src/tests/lib/template-resolver.test.ts` OK

## Update 2026-05-20 (all current template fields publishable + Batukarut public example)
- Owner direction for this follow-up:
  - current active template fields should no longer be partially held back
  - Batukarut should become the concrete example where all current template fields can be seen publicly
  - dummy data is acceptable for this example as long as it is stored in the database and read through the public path
- Code changes applied:
  - `src/lib/data/desa-public-view.ts`
    - extended public overlay beyond `kepalaDesa` only
    - now merges published template values into:
      - profile/contact metadata
      - transparency score
      - output fisik
      - riwayat APBDes
    - added fallback profile builder so public page can still render `Profil Batukarut` even when legacy `desa.profil` is absent from the DB read path
  - `src/app/desa/[id]/page.tsx`
    - now applies the broader overlay when building `desaView`
    - now renders `ProfilDesaSection` before `KelengkapanDesa` for visible `profil_desa`
  - `src/components/desa/KelengkapanDesa.tsx`
    - compact summary strip now surfaces `jumlahKK`, `jumlahDusun`, `RT/RW`, contact, and potensi so profile-backed template fields are visible quickly without requiring deep tab exploration
  - `prisma/seed-templates.mjs`
    - active template definitions now align with the new rule: current public template fields are publishable after review
    - `fasilitasUmum` value type corrected to `json`
    - upsert update path now also syncs `valueType`, not only label / order / publishable flag
- Database changes applied directly on the active Supabase project:
  - all active template field standards now have `isPublishableNow = true`
  - `fasilitasUmum` was normalized to `valueType = json` in active template rows
  - Batukarut (`demo-desa-batukarut`) now has 31 active `PUBLISHED` `data_desa` rows covering the full current template:
    - identitas
    - demografi
    - transparansi
    - perangkat
    - anggaran
    - pendapatan
    - kinerja
    - profil desa
  - seed label used for this example:
    - `Seed dummy contoh Batukarut`
    - `sourceTypeCode = SYSTEM_GENERATED_METADATA`
  - legacy summary columns on `desa` were also refreshed for Batukarut:
    - `websiteUrl`
    - `kategori`
    - `tahunData`
    - `jumlahPenduduk`
    - `dataSourceLabel`
    - `dataPublishedAt`
- Batukarut example values now stored in DB include:
  - kepala desa
  - telepon / email desa
  - potensi unggulan
  - aset desa
  - fasilitas umum
  - lembaga desa
  - BUMDes
  - output fisik
  - riwayat APBDes
  - skor transparansi
  - demografi detail (`KK`, `dusun`, `RT`, `RW`)
- Public runtime verification after cache refresh:
  - header chip now shows `Seed dummy contoh Batukarut`
  - public page now shows:
    - `Profil Batukarut`
    - telepon dan email
    - BUMDes dummy
    - aset dummy
    - fasilitas dummy
    - lembaga dummy via tab
    - kepala desa via tab `Perangkat`
    - skor transparansi via tab `Transparansi`
  - practical meaning:
    - the example is no longer limited to budget + a few legacy fields
    - current active template fields now have a real public rendering path
- Additional test coverage:
  - `src/tests/lib/desa-public-view.test.ts`
    - now covers fallback profile creation when legacy profile shape is missing
    - keeps overlay assertions for profile / output / history / transparency
- Latest QA for this follow-up:
  - `npx tsc --noEmit` OK
  - `npm run lint` OK
  - `npm test -- src/tests/lib/desa-public-view.test.ts src/tests/lib/review-candidate.test.ts src/tests/lib/template-resolver.test.ts` OK
  - browser/runtime verification on `http://localhost:3000/desa/batukarut` OK after restarting local dev server to clear the 5-minute `unstable_cache` detail cache
- Additional end-of-check QA:
  - `npm test` OK (`31 files, 216 tests`)
  - `npm run prisma:generate` blocked only by the known Windows Prisma engine file lock while `next dev` is intentionally running on port `3000`
  - `npm run build` blocked for the same reason because it begins with `npm run prisma:generate`
- Remaining limitation:
  - some non-template legacy profile metadata shown in `ProfilDesaSection` still comes from synthesized fallback defaults when the old legacy profile source is absent
  - this is acceptable for the current Batukarut dummy example because the owner explicitly allowed dummy data, but later rollout for real villages should replace fallback defaults with real source-backed records where needed

## Update 2026-05-20 (temporary one-template unification for all desa)
- Owner simplification decision:
  - stop using multiple active template assignments for now
  - all desa temporarily use one active template first so actual data rollout is consistent
  - template CRUD / per-desa specialization is deferred to next enhancement phase
- Database changes applied:
  - every desa now has active assignment to `CURRENT_PUBLIC_DETAIL_TEMPLATE`
  - old per-desa assignments to `DESA_WISATA_TEMPLATE` / `DESA_TRANSPARAN_TEMPLATE` are no longer active in practice
  - all rows in `desa_detail_component_visibility` were cleared so there is no leftover component-level divergence from the previous demo phase
- Seed behavior updated:
  - `prisma/seed-templates.mjs` now treats `CURRENT_PUBLIC_DETAIL_TEMPLATE` as the unified active assignment target for all desa
  - `DESA_WISATA_TEMPLATE` and `DESA_TRANSPARAN_TEMPLATE` remain stored only as legacy compatibility templates until CRUD template phase is built
  - visibility overrides are intentionally empty in the unified-template phase
- User-facing effect:
  - back-office village data screens should stop showing mixed template identities across desa
  - coverage / field count / publishability discussions now refer to one shared active template surface
  - this reduces ambiguity while real `DataDesa` rollout is still being stabilized
- Verification:
  - active assignment query on Supabase now shows all desa pointing to `CURRENT_PUBLIC_DETAIL_TEMPLATE`
  - visibility override count is now `0`
  - `npx tsc --noEmit` OK
  - `npm run lint` OK

## Update 2026-05-20 (component progress lens in internal village data)
- Owner UX direction for `/internal-admin/village-data`:
  - `field terisi` at the desa row level should no longer feel abstract
  - the component panel should explain *which parts are filled* and *which are still empty*
  - component rows should be expandable, but remain ringkas and easy to scan
- Decisions locked and implemented:
  - progress is based on active `PUBLISHED` `data_desa` only
  - progress colors apply only to visible components
  - hidden components remain neutral/slate
  - expand pattern uses a single active accordion
  - non-field components use derived real signals:
    - `Sumber & Dokumen` from source/doc counts
    - `Panduan Warga` as system-ready
    - `Suara Warga` from actual voice count
- Code changes applied:
  - added `src/lib/internal-admin/component-progress-lens.ts`
    - central helper for per-component completion status, teaser labels, missing labels, and aggregate visible-field counts
    - shared by the desa row coverage path and the expanded component panel path so they do not drift apart
  - updated `src/app/api/internal-admin/village-data/desa-data/route.ts`
    - row-level `filledFieldCount/totalFieldCount` is now computed from active template components + published field keys
    - no longer relies on the old coarse published row count logic
  - updated `src/app/api/internal-admin/village-data/field-standards/route.ts`
    - per-desa payload now includes:
      - `filledFieldCount`
      - `totalFieldCount`
      - `completionStatus`
      - `filledFieldLabels`
      - `missingFieldLabels`
      - `teaserLabels`
      - `derivedSignals`
  - updated `src/lib/village-data/template-resolver.ts`
    - hidden components now keep their field metadata too, so hidden rows can still show honest progress detail while staying visually neutral
  - updated `src/components/internal-admin/village-data-center/ComponentVisibilityPanel.tsx`
    - panel reframed from plain visibility list into `Kelengkapan Komponen`
    - each row now shows:
      - completion badge
      - `filled/total`
      - teaser of filled fields
      - subtle expand affordance
      - compact expanded detail for filled vs missing fields
  - updated client contracts in `src/components/internal-admin/village-data-center/types.ts` and `api.ts`
- UX result:
  - internal admin can immediately see whether a component is empty, partial, or complete
  - the top `x/y` desa count stays in place, but now matches the component breakdown below it
  - users no longer need to guess why a desa shows low coverage
- New tests added:
  - `src/tests/lib/component-progress-lens.test.ts`
    - field-based `empty/partial/complete`
    - hidden component excluded from aggregate visible count
    - `Sumber & Dokumen` derived rule
    - `Panduan Warga` system-ready rule
    - `Suara Warga` voice-based rule
- Latest QA for this enhancement:
  - `npx tsc --noEmit` OK
  - `npm run lint` OK
  - `npm test` OK (`32 files, 220 tests`)
  - `npm run build` still blocked by the existing Windows Prisma engine lock because `prisma:generate` cannot rename `query_engine-windows.dll.node` while the local Next dev/runtime process is holding the file

## Update 2026-05-20 (progress lens synchronization + local Prisma stabilization)
- New root cause found after progress lens rollout:
  - Batukarut showed `31/31` at the desa row level, but most component cards still looked empty
  - this was not a UI-only bug
  - the real cause was **legacy `data_desa` published rows still pointing to old `componentId` values from the pre-unification template assignment**
  - the old row aggregate path was too permissive because it counted published `fieldKey` rows without proving they still belonged to the active template component
- Engineering decision locked:
  - row aggregate and detail panel must use **one source of truth**
  - only published active rows whose `fieldKey` still matches the expected component in the active template are allowed to count as valid filled fields
  - local Prisma runtime should use `DIRECT_URL` by default in development because the Supabase transaction pooler path on `6543` was too fragile for dense back-office reads
- Code changes applied:
  - `src/lib/internal-admin/component-progress-lens.ts`
    - added `matchPublishedRowsToComponents(...)`
    - this helper now diagnoses:
      - valid published rows
      - mismatched published rows
      - unknown published rows
  - `src/app/api/internal-admin/village-data/desa-data/route.ts`
    - row-level `filledFieldCount/totalFieldCount` now uses the same validated field set as the component panel
    - added `mismatchPublishedFieldCount`
    - added warning log when legacy published rows do not match the active template component relation
  - `src/app/api/internal-admin/village-data/field-standards/route.ts`
    - component detail view now reads the same validated published-row match snapshot
    - added `mismatchPublishedFieldCount`
    - added warning log for mismatched/unknown published rows
  - `src/components/internal-admin/village-data-center/DesaDataResults.tsx`
    - desa card now surfaces an amber warning if legacy published rows are not synchronized
  - `src/components/internal-admin/village-data-center/ComponentVisibilityPanel.tsx`
    - component panel now surfaces the same amber warning inside the expanded detail panel
  - `src/lib/db.ts`
    - local runtime now prefers `DIRECT_URL` whenever `PANTAUDESA_LOCAL_DB_USE_DIRECT_URL !== false`
    - dev log now prints `route=db step=localDirectUrlRuntime enabled=true` when this path is active
  - `.env.local`
    - added `PANTAUDESA_LOCAL_DB_USE_DIRECT_URL=true` for this local workspace
- Data repair executed for example village:
  - Batukarut (`demo-desa-batukarut`) had `31` active published rows
  - before repair:
    - `matchingRows = 0`
    - `mismatchedRows = 31`
  - repair action:
    - remapped `templateId`, `componentId`, and `fieldStandardId` on all `31` Batukarut rows to the current unified active template
  - verification after repair through `DIRECT_URL`:
    - `totalRows = 31`
    - `matchingRows = 31`
    - `mismatchedRows = 0`
    - `unknownRows = 0`
- Global verification after repair:
  - all active `PUBLISHED` `data_desa` rows across all desa were audited against the current active template assignment
  - result:
    - `totalPublishedRows = 31`
    - `mismatchCount = 0`
    - `mismatchDesaCount = 0`
- Future-write guard added:
  - publish flow in `src/lib/internal-admin/document-review-service.ts` no longer trusts stale candidate `componentId` / `fieldStandardId` blindly
  - every published field is now rebound to the **current active template field binding** by `fieldKey` before `data_desa` is written
  - practical meaning:
    - old review snapshots may still exist
    - but new publish writes will still land on the right `templateId`, `componentId`, and `fieldStandardId`
    - this prevents new mismatches from silently reappearing on other desa later
- Additional guard coverage:
  - `src/lib/village-data/field-engine.ts`
    - added `createActiveTemplateFieldBindingMap(...)`
  - `src/tests/lib/field-engine.test.ts`
    - verifies active template field bindings resolve to the latest component and field-standard ids
- Practical result:
  - if a desa row now shows full coverage, the component progress panel must agree
  - if published rows still belong to stale template relations, the internal UI now warns honestly instead of silently acting empty
  - local back-office runtime is more stable because Prisma no longer defaults to the constrained Supabase pooler path in this workspace
- UX sync refinement after owner review:
  - another confusion surfaced on villages such as `Desa Baru Makmur`
  - row summary showed `0/31` while detail cards correctly showed non-field progress like:
    - `Sumber & Dokumen`
    - `Panduan Warga`
    - `Suara Warga`
  - root cause:
    - row aggregate counted only template-backed `data_desa` fields
    - detail cards also included derived non-field signals
  - fix applied:
    - aggregates now explicitly separate:
      - `filledFieldCount / totalFields`
      - `filledSignalCount / totalSignalCount`
    - row list and component panel both surface the same dual summary
    - this keeps field counts honest without hiding that non-field operational signals are already complete
- Latest QA for this follow-up:
  - `npx tsc --noEmit` OK
  - `npm run lint` OK
  - `npm test` OK (`32 files, 220 tests`)
  - local dev log confirms `localDirectUrlRuntime enabled=true`
  - direct DB verification for Batukarut through `DIRECT_URL` confirms the repair is clean

## Follow-up: perangkat ownership moved into `profil_desa`

- Owner decision:
  - standalone `perangkat` component should be removed from the public template
  - `kepalaDesa` and `perangkatDesa` now belong to `profil_desa` / `Profil & Kelengkapan Desa`
  - public detail should surface perangkat inside the `Kelengkapan Desa` section, not as a separate component
- Template/catalog changes applied:
  - removed `perangkat` from the default component catalog manifest
  - moved `kepalaDesa` and `perangkatDesa` into `profil_desa`
  - active default template now has `10` components and still `37` template-backed fields
  - active template DB verification confirms:
    - no active `perangkat` component remains
    - `profil_desa` now contains both `kepalaDesa` and `perangkatDesa`
- Public detail changes applied:
  - `KelengkapanDesa` now includes a dedicated `Perangkat` tab
  - `perangkatDesa` payload is read from published `DataDesa` in `profil_desa`
  - Batukarut public detail verification via HTML confirms:
    - `Perangkat` tab renders
    - `R. Hidayat Somantri`
    - `Sunarti`
    - `Sigit Raharjo`
    - `Tutik Handayani`
- Data repair / backfill:
  - reseeded template structures with `npm run seed:templates`
  - normalized `perangkatDesa` JSON payloads so the embedded `Kepala Desa` entry follows the active published `kepalaDesa` value
  - direct DB verification for `demo-desa-batukarut` confirms:
    - `data_desa.fieldKey = perangkatDesa` is stored under component `profil_desa`
    - payload now contains 4 perangkat rows
    - embedded `Kepala Desa` item now matches the active `kepalaDesa` field value
- Coverage/guardrail updates:
  - intake coverage metadata no longer treats perangkat as a separate section owner
  - added unit guard to ensure perangkat stays mapped into `profil`
  - verification:
    - `npm test -- src/tests/lib/component-catalog-manifest.test.ts src/tests/lib/desa-template-public-view.test.ts src/tests/lib/detail-field-coverage.test.ts` OK

## Follow-up: composition-only template management and 1:1 preview contract

- Root cause for the brittle `Kelola Template` experience:
  - reordering components still behaved like a partial schema rewrite
  - save flow updated component order **and** attempted to rewrite catalog-linked field structure in the same request
  - this made a simple drag-reorder operation too expensive, too fragile, and too dependent on schema rollout timing
- Architecture refinement applied:
  - component catalog manifest is now enriched with stable UI metadata:
    - `rendererType`
    - `previewVariant`
    - `detailSlot`
    - `highlightFieldKeys`
  - template management keeps using the catalog as the field ownership source
  - template save is narrowed toward **composition-only intent**:
    - duplicate component keys are rejected
    - unknown component keys are rejected
    - reorder no longer rewrites field standards for existing active components
- Preview UX improvement:
  - `Kelola Template` no longer uses generic cards that all felt similar
  - preview cards now mimic the real public detail sections with:
    - the same visual section character
    - compact static content
    - explicit `Field DB` highlights for dynamic fields
  - a client-safe preview registry was added so the admin UI does not accidentally import server-only public read logic
- Backward compatibility guard:
  - local DBs that do not yet have `catalogComponentId` / `catalogFieldId` relation columns no longer break reorder saves
  - template management now checks column availability before writing those optional relations
  - this closes the concrete runtime error:
    - `P2022 column village_detail_components.catalogComponentId does not exist`
- Ownership drift reduction:
  - intake coverage now derives field→component ownership from catalog field metadata first, and only falls back to the old section mapping for legacy cases
  - this reduces the chance of `public detail`, `desa-data`, and intake disagreeing after a future component move
  - Guardrail verification added:
  - component manifest metadata coverage test
  - public template registry contract test
  - public preview registry coverage test
  - template composition helper test for duplicate/unknown component keys
  - latest targeted verification:
    - `npm test -- src/tests/lib/component-catalog-manifest.test.ts src/tests/lib/public-template-registry.test.ts src/tests/lib/template-management-service.test.ts src/tests/lib/detail-field-coverage.test.ts src/tests/lib/runtime-template-manifest.test.ts src/tests/components/public-template-preview-registry.test.ts` OK
    - `npm run lint` OK
    - public Batukarut page still responds `200`

## Follow-up: restore old public detail shell without rolling back runtime template sync

- Clarification locked:
  - the product request was **not** to restore the old data/config path
  - the request was to restore the **old visual composition** while keeping:
    - runtime template manifest
    - component visibility
    - component order
    - published field ownership
    - derived component payloads
    as the current source of truth
- Public detail implementation updated:
  - `src/app/desa/[id]/page.tsx` now renders the old shell again:
    - `DesaDetailFirstView`
    - `SourceDocumentSnapshotSection`
    - `TransparansiCard`
    - inline budget summary block
    - `KinerjaAnggaranCard`
    - `KelengkapanDesa`
    - old `Panduan Warga` block
    - old `Suara Warga` block
  - slot visibility and order still come from the active runtime manifest
  - no rollback to old hardcoded public config was reintroduced
- Slot mapping now stays explicit and synchronized:
  - `identitas` + `demografi` -> first view shell
  - `sumber_dokumen` -> source/doc shell
  - `transparansi` -> transparansi shell
  - `anggaran` + `pendapatan` -> budget summary shell
  - `kinerja` -> kinerja shell
  - `profil_desa` -> `KelengkapanDesa`
  - `panduan_warga` -> old panduan shell
  - `suara_warga` -> old suara shell
- `Kelola Template` preview density refined:
  - miniature preview typography was reduced again so cards read like compact previews instead of near full-size sections
  - slot labels, description copy, badges, and inner section text are now smaller and less likely to overflow
  - dynamic DB-backed fields remain highlighted with `Field DB`
- Verification:
  - `npm run lint` OK
  - targeted vitest suite OK (`6 files, 11 tests`)
  - browser automation verification on `/desa/batukarut` confirms the old shell is back with live runtime data:
    - `Kartu Identitas Desa`
    - `Sumber dan dokumen yang sudah terlihat`
    - `Perangkat, Aset & Organisasi Desa`
    - old panduan and suara blocks
  - admin `Kelola Template` visual verification via browser automation is still blocked by unauthenticated redirect to `/masuk?error=unauthorized`, but source-level preview changes and targeted tests are in place

## Follow-up: template save compatibility, section ordering, and admin UX tightening

- Root cause for template save failure:
  - `PUT /api/internal-admin/village-data/templates/[templateId]/components` still hit a local DB without `catalogComponentId` / `catalogFieldId`
  - even after earlier guards, the save path could still end up issuing an update that referenced `catalogComponentId`
  - result: generic client error and a broken `Kelola Template` save experience
- Hardening applied:
  - `replaceTemplateComponents()` now retries once without catalog relation writes if Prisma returns `P2022` for `catalogComponentId` / `catalogFieldId`
  - this keeps the composition save working on local DBs that have not rolled out the optional relation columns yet
  - template mutation paths now also clear the template resolver cache globally so public detail does not keep rendering stale component order after template edits
- Public order fix:
  - the restored public page shell was still rendering sections in a hardcoded sequence
  - the page now renders slot sections from the ordered runtime manifest slot list, so template order once again controls public section order
- `Kelola Template` UX tightened:
  - save/delete/create actions now have explicit loading state with spinner + disabled button treatment while the request is in flight
  - delete no longer silently does nothing when blocked; clicking it surfaces the actual block reason
  - miniature previews now sit in a horizontal overflow container to avoid crushing wide shell previews into unreadable proportions
  - the `profil_desa` preview title was synchronized with the actual public detail shell (`Perangkat, Aset & Organisasi Desa`)
- Verification:
  - `npm run lint` OK
  - `npm test -- src/tests/lib/template-management-service.test.ts src/tests/components/public-template-preview-registry.test.ts src/tests/lib/public-template-registry.test.ts src/tests/lib/runtime-template-manifest.test.ts` OK
  - browser automation on `/desa/batukarut` confirms the public page still responds `200` and renders the old-shell headings from live runtime data

## Follow-up: mutation feedback consistency and preview scroll ergonomics

- Admin feedback consistency refined:
  - `Kelola Template` no longer mixes inline success notices with button mutations
  - create/save/delete now use the shared back-office toast pattern (`ToastContainer` + `useToast`) already used in other admin surfaces
  - blocked delete actions now emit an explicit warning toast instead of appearing inert
- Preview scroll ergonomics improved:
  - `Preview urutan komponen publik` now exposes a synchronized horizontal scrollbar at the top and bottom of the preview canvas
  - the scrollbar lives at the preview-space level, not inside each miniature component card
  - narrow desktop/tablet users no longer need to scroll to the bottom first just to pan the preview sideways
- Guardrail verification:
  - `npx eslint src/components/internal-admin/village-data-center/StandardsTab.tsx` OK
  - `npm test -- src/tests/lib/template-management-service.test.ts src/tests/components/public-template-preview-registry.test.ts src/tests/lib/public-template-registry.test.ts src/tests/lib/runtime-template-manifest.test.ts` OK

## Follow-up: mobile-first `Kelola Template` workspace

- Root cause for the mobile breakage:
  - the `Kelola Template` page was still fundamentally desktop-first
  - mobile inherited:
    - a multi-panel workspace shown all at once
    - desktop-oriented `min-width` preview assumptions
    - drag-first interaction expectations
  - result: cramped cards, awkward overflow, and an admin flow that felt broken on `375px`
- Mobile workspace re-architecture applied:
  - on `< sm`, `StandardsTab` now uses a segmented workspace with three steps:
    - `Template`
    - `Catalog`
    - `Preview`
  - only one primary surface is shown at a time on mobile, while editor state stays shared across steps
  - desktop (`sm:` and up) keeps the richer split layout
- Mobile interaction improvements:
  - template metadata and CTA buttons are stacked and compressed for narrow screens
  - preview/canvas no longer forces desktop `min-width` behavior on portrait mobile
  - mobile preview cards fit the column instead of requiring permanent horizontal scroll
  - canvas cards now expose explicit `naik/turun` controls on mobile so reorder does not depend on drag-and-drop
- Behavior kept stable:
  - save/update/delete still use the same APIs and toast feedback
  - reorder remains composition-only
  - switching between `Template`, `Catalog`, and `Preview` does not discard draft state
- Verification:
  - `npx eslint src/components/internal-admin/village-data-center/StandardsTab.tsx` OK
  - `npm test -- src/tests/lib/template-management-service.test.ts src/tests/components/public-template-preview-registry.test.ts src/tests/lib/public-template-registry.test.ts src/tests/lib/runtime-template-manifest.test.ts` OK
  - visual end-to-end verification for the authenticated admin page is still limited by the local automation session not carrying internal-admin login cookies, but the responsive structure and state flow are now updated at the source level
