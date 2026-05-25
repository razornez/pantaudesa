# Sprint 05 Batch 4 - Template Runtime Architecture Handoff Report

## Status
SHIPPED TO `main`

## Commit Scope
- Primary commit: `f67bf31`
- Commit title:
  - `feat(village-data): ship template-driven public detail and admin management`
- Branch of implementation:
  - `sprint-05-batch-4-template-based-real-data-entry`

## Why This Report Exists
Batch 4 is no longer a small UI improvement. It introduced a new runtime shape for:
- public detail rendering
- internal village data management
- intake/review/publish flow
- template management
- source-backed candidate generation

The blast radius is wide enough that future engineers can easily:
- duplicate an existing helper without realizing it
- reintroduce old field-count drift
- bypass the template runtime contract
- break public detail ordering/visibility by "just changing UI"

This report documents the architecture and the critical paths so future work can extend the system safely.

---

## 1. What Became the Core

### 1.1 Template runtime is now the central contract
The center of the new system is:
- `src/lib/village-data/runtime-template-manifest.ts`
- `src/lib/village-data/component-catalog-manifest.ts`
- `src/lib/village-data/template-resolver.ts`

These three pieces now define:
- which components exist
- which fields belong to which component
- which components are visible/hidden for a desa
- component order
- template-backed field count
- the slot mapping used by public detail and admin surfaces

Important meaning:
- UI should no longer decide its own field ownership
- admin pages should no longer compute counts from ad-hoc section rules
- public detail should no longer infer layout from legacy field buckets

### 1.2 Component catalog owns field membership
The system now treats the component catalog as the field-owner source, not the page UI and not random route logic.

Main files:
- `src/lib/village-data/component-catalog-manifest.ts`
- `prisma/template-catalog.manifest.mjs`
- `src/lib/internal-admin/template-management-service.ts`

The catalog now carries metadata such as:
- `componentKey`
- `rendererType`
- `previewVariant`
- `detailSlot`
- `highlightFieldKeys`

Practical consequence:
- field ownership changes should start here first
- template management is composition-first, not field-schema-first

### 1.3 Public detail is now template-aware, but visually uses the old shell
The public page was deliberately moved to a hybrid model:
- old visual composition
- new runtime/config/data source of truth

Main files:
- `src/app/desa/[id]/page.tsx`
- `src/lib/data/desa-template-public-view.ts`
- `src/components/desa/public-template-registry.tsx`

Important nuance:
- the old public shell is the visual contract
- the current template runtime is the data contract
- future work should not roll back either side independently

---

## 2. Main Architectural Subsystems

## 2.1 Public detail subsystem

### Purpose
Render `/desa/[id]` from published template-backed data while preserving the old public detail visual hierarchy.

### Main files
- `src/app/desa/[id]/page.tsx`
- `src/lib/data/desa-template-public-view.ts`
- `src/lib/data/desa-public-view.ts`
- `src/components/desa/public-template-registry.tsx`
- `src/components/desa/public-template-preview-registry.tsx`

### Actual responsibilities
`page.tsx`
- loads desa
- loads template-aware published view
- builds visible slot order from runtime manifest
- renders old-shell sections in runtime order

`desa-template-public-view.ts`
- converts template-backed published values into public-ready structures
- resolves arrays/JSON payloads such as:
  - perangkat
  - APBDes items
  - output fisik
  - riwayat

`public-template-registry.tsx`
- metadata contract for component-to-slot mapping
- should not become a page composer again

`public-template-preview-registry.tsx`
- admin-only preview contract
- visual parity helper for `Kelola Template`
- should remain client-safe and presentation-focused

### Critical invariant
Public detail order and visibility must come from the runtime template manifest, not hardcoded section order.

If this invariant is broken:
- internal `Kelola Template` order and public order drift again
- show/hide parity breaks
- admins lose trust in template management

---

## 2.2 Internal `desa-data` / progress subsystem

### Purpose
Show desa-level aggregate completeness and component-level breakdown using the same counting basis.

### Main files
- `src/app/api/internal-admin/village-data/desa-data/route.ts`
- `src/app/api/internal-admin/village-data/field-standards/route.ts`
- `src/lib/internal-admin/component-progress-lens.ts`
- `src/components/internal-admin/village-data-center/DesaDataResults.tsx`
- `src/components/internal-admin/village-data-center/ComponentVisibilityPanel.tsx`

### What this subsystem fixed
Previously the system had drift such as:
- row says `31/31`
- expanded detail says all empty
- public detail says something else again

The new core helper is `component-progress-lens.ts`.
It is now the canonical validator/matcher for:
- active published rows
- component match
- field ownership match
- hidden/visible behavior
- derived-signal separation

### Critical invariant
`desa-data` row aggregate and component panel must derive from the same validated match set.

If someone later:
- reimplements field counting in a route
- counts raw `fieldKey`s without component/template validation
- mixes template fields and derived signals casually

then the old inconsistency will reappear.

---

## 2.3 Intake / review / publish subsystem

### Purpose
Accept structured and source-backed candidate data, normalize it through the template engine, then publish only through review.

### Main files
- `src/lib/village-data/field-engine.ts`
- `src/lib/village-data/field-submission.ts`
- `src/lib/internal-admin/review-candidate.ts`
- `src/lib/internal-admin/review-candidate-submission.ts`
- `src/lib/internal-admin/document-review-service.ts`
- `src/components/internal-admin/intake/IntakeSourceModeStep.tsx`
- `src/components/internal-admin/intake/IntakeFinalReviewSection.tsx`

### Effective flow
1. resolve active template
2. build effective field engine
3. sanitize submitted values
4. convert into review candidate shape
5. review page decides validity/hold/reject
6. publish rebinds fields to active template binding

### The most important protection
Publish no longer trusts stale candidate `componentId` blindly.

Instead it rebinds current ownership using active template field bindings from:
- `field-engine.ts`
- `document-review-service.ts`

This is one of the most critical anti-drift protections in the batch.

### Critical invariant
No direct publish path should bypass review-candidate validation + active-template rebinding.

If bypassed:
- stale component relations can come back
- progress lens and public detail can silently diverge

---

## 2.4 Template management subsystem

### Purpose
Allow internal admin to create, update, reorder, delete, and assign templates without turning each edit into a schema rewrite.

### Main files
- `src/lib/internal-admin/template-management-service.ts`
- `src/lib/internal-admin/template-management-helpers.ts`
- `src/app/api/internal-admin/village-data/templates/*`
- `src/app/api/internal-admin/village-data/template-assignment/route.ts`
- `src/components/internal-admin/village-data-center/StandardsTab.tsx`

### Current design decision
Template management is now intended to be composition-first:
- component order
- component membership
- metadata edits
- delete guard

It should not become a free-form field schema editor.

### Important implementation detail
There is compatibility logic for local DBs that do not yet have some optional catalog relation columns:
- `catalogComponentId`
- `catalogFieldId`

This compatibility branch exists because local development hit real Prisma `P2022` failures during save/reorder.

### Critical invariant
Reorder must remain composition-only.

If future edits make reorder rewrite field structure again:
- simple admin actions become high-risk
- schema rollout timing starts breaking template save
- production-like drift risk increases

---

## 2.5 Source-backed ingestion subsystem

### Purpose
Allow evidence-backed candidate generation from external public sources without auto-publishing.

### Main files
- `src/lib/internal-admin/source-ingestion.ts`
- `src/lib/internal-admin/source-review-fetch.ts`
- `src/lib/internal-admin/source-review-title.ts`
- `src/lib/village-data/source-policy.ts`
- `src/lib/village-data/source-registry.ts`
- `src/app/api/internal-admin/village-data/source-candidates/route.ts`
- `src/app/api/internal-admin/documents/[documentId]/refresh-source/route.ts`

### Why this matters architecturally
This path is not just a scraper utility. It is now one of the supported entry points into the review system.

That means any future work on source ingestion must respect:
- review envelope integrity
- source policy rules
- field sanitization rules
- template ownership rules

### Critical invariant
Source ingestion may create candidates, but must not become a parallel publish system.

---

## 3. Runtime Data Flow Overview

## 3.1 Public detail flow
1. route loads desa base data
2. template resolver loads active template assignment + component visibility
3. runtime manifest builds ordered slot/component view
4. published rows are transformed into public component payloads
5. old shell renders sections in runtime order

Important join points:
- `template-resolver.ts`
- `runtime-template-manifest.ts`
- `desa-template-public-view.ts`
- `page.tsx`

## 3.2 Internal progress flow
1. active template is resolved
2. published rows are validated against active component/field ownership
3. progress lens derives:
  - filled fields
  - total fields
  - mismatch counts
  - derived signal state
4. list row and panel both consume the same lens output

## 3.3 Structured/source-backed review flow
1. candidate enters through admin-desa structured submission or internal source-backed input
2. field submission sanitizer coerces values by field type
3. review candidate builder compares current vs proposed
4. final review page publishes only valid values
5. publish rebinding pins values to current active template structure

## 3.4 Template management flow
1. template workspace loads catalog + selected template
2. editor modifies metadata and ordered component keys
3. save hits template management service
4. compatibility write path persists composition safely
5. template caches are invalidated
6. public/internal runtime re-resolve order and visibility

---

## 4. What Is Especially Critical and Should Not Be Duplicated

### Do not duplicate field ownership mapping
Use:
- `component-catalog-manifest.ts`
- runtime manifest helpers
- `detail-field-coverage.ts` as consumer, not source of truth

Do not create:
- a new hardcoded field-to-section map in UI
- a new count helper inside route handlers
- a second ownership table in client components

### Do not rebuild public detail ordering manually
Use runtime slot order from manifest.

Do not:
- hardcode section order in page render
- reorder sections visually without understanding `detailSlot`
- assume component order is equivalent to old static layout order

### Do not create another template preview system
Use:
- `public-template-preview-registry.tsx`

Do not:
- build another generic card gallery in admin
- create a separate "mock preview" disconnected from public shell structure

### Do not bypass `field-engine` / `field-submission`
If a new source of candidate values is added:
- it should resolve active template
- sanitize through `field-submission`
- build or reuse review candidate flow

Do not:
- write direct `DataDesa` mutation logic from a new feature
- publish based on raw form values

---

## 5. Schema and Persistence Notes

### Major persistence additions
- component catalog foundation
- template component ordering / management endpoints
- source-backed structured submission support
- review-envelope metadata on document flow

Main DB touchpoints:
- `prisma/schema.prisma`
- `prisma/migrations/20260519120000_batch4_source_backed_submission_ingestion_mvp/`
- `prisma/migrations/20260521090000_template_component_catalog_foundation/`
- `prisma/seed-templates.mjs`

### Important caveat
Local runtime may still encounter Windows Prisma file-lock behavior when:
- `prisma:generate` runs while dev server holds the engine DLL

This is not the same as an app logic failure, but it is still a real operational nuisance in local development.

---

## 6. Parts That Are Still Not Perfect

## 6.1 Public detail still has a high-complexity composition layer
Even after restoring the old shell, public detail still bridges:
- old presentation contract
- new runtime manifest
- published template payloads
- compatibility fallback data

This is the right product behavior for now, but it is still a complex seam and should be treated carefully.

Risk:
- easy to introduce subtle drift during future UI refactors

## 6.2 Template preview fidelity is good, but still curated
`Kelola Template` preview is intentionally representative, not a full live render.

That means:
- it is much better than generic placeholders
- but it is still a curated miniature system

Risk:
- future component visual changes may require preview maintenance

## 6.3 Mobile template management is safer, but not the final ideal
The segmented mobile workspace solves the main responsiveness issue.
However:
- drag-and-drop is still desktop-first
- mobile now relies more on explicit up/down controls

This is acceptable for safety and usability, but not yet a perfect cross-device authoring model.

## 6.4 Build ergonomics still have local environment rough edges
Observed during QA:
- `npm run build` can fail when `prisma:generate` hits a Windows file lock
- `npx next build` itself succeeded

Meaning:
- application code is build-clean
- local environment still has a Prisma toolchain rough edge

## 6.5 Some boundaries are still broad
`template-management-service.ts` and some public/template registry files are still fairly large.

That is not necessarily wrong for this batch, but it means:
- they should be treated as critical files
- casual refactors inside them can have wide side effects

---

## 7. Recommended Safety Rules for Future Engineers

1. If changing field ownership, start from the component catalog and runtime manifest path, not from UI.
2. If changing public detail order/visibility, inspect the slot mapping and runtime manifest before editing the page shell.
3. If adding a new candidate source, route it through review-candidate and field submission helpers.
4. If touching template save/reorder, preserve composition-only intent and compatibility fallback behavior.
5. If changing admin preview UI, verify whether the public preview registry already owns that concern.
6. If touching completeness/progress numbers, use `component-progress-lens` and never count raw rows ad hoc.

---

## 8. QA / Guardrail Baseline at Ship Time

Verified during release prep:
- `npx tsc --noEmit` passed
- `npm run lint` passed
- `npm test` passed
- `npx next build` passed

Additional note:
- `npm run build` may still hit Windows Prisma engine lock during `prisma:generate` if local dev server is holding the DLL

---

## 9. Bottom-Line Handoff Summary

This batch created a new architecture center around:
- runtime template manifests
- component catalog ownership
- review-first template-backed data publication
- public detail rendering from template-aware published values
- composition-first template management

The most important thing to understand is:
- this is no longer a "page with some cards"
- it is now a connected system where public detail, internal admin, intake, and template management all share one runtime model

Future work should extend that shared model, not reintroduce isolated local logic.
