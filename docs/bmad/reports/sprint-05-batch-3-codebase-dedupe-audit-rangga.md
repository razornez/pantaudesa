# Sprint 05 Batch 3 - Rangga Codebase Dedupe Audit Notes

## Status
RANGGA INITIAL AUDIT - reviewed manually from GitHub branch `feat/sprint-05-batch-3-completion-handoff`.

## Scope Reviewed

Branch compared against `main` after Batch 3 freeze.

Reviewed areas:

- `src/components/internal-admin/IntakeWorkbench.tsx`
- `src/components/internal-admin/intake/**`
- `src/lib/intake/**`
- `src/lib/admin-claim/ai-mapping.ts`
- `src/app/api/internal-admin/intake/**`
- `src/components/internal-admin/InternalDocumentReviewQueue.tsx`
- Batch 3 report snippets and commit summaries

## Executive Summary

Owner concern is valid.

Batch 3 now has several overlapping layers that are not all wrong individually, but together they create maintainability risk and possible duplicate source-of-truth confusion.

Main finding:

```text
The feature has been split into files, but ownership boundaries are still unclear.
Some logic was extracted, then partially reimplemented in the parent component instead of reused.
Some domain types exist twice: once in lib/intake and once in UI component types.
Review queue already has focus/highlight behavior, while the new intake history risks becoming a second review surface.
```

This means the next step should not be more UX feature work. The next step should be consolidation.

## Findings By Severity

## Critical

No critical security finding found in the reviewed snippets.

Guardrails still appear intact:

- no auto-publish from intake,
- OpenAI API key remains server-side,
- no shared/production migration in the feature branch,
- OpenAI image path is now gated by explicit AI request.

## High Findings

### H1 - `Riwayat Intake` risks duplicating the review queue as a second work surface

Evidence:

- `src/app/api/internal-admin/intake/history/route.ts` reads `AdminDesaDocument` where `category = "intake_workbench"`.
- `InternalDocumentReviewQueue.tsx` already renders the document review queue and includes `document-card-${doc.id}` target cards plus highlight behavior.

Risk:

- Intake page and document review queue can both become places where the same review items are surfaced.
- Owner/admin may not know whether to continue review from intake history or review queue.
- This violates single source of truth for review work items.

Decision recommendation:

```text
Review queue must remain the source of truth for work items.
Riwayat Intake should become a compact shortcut/launcher only:
- last submitted item(s)
- link to review queue with focus param
- no long activity feed as a competing review surface
```

Cleanup recommendation:

- Keep `/api/internal-admin/intake/history` only if it powers a compact shortcut.
- Do not display it as a full history surface on the intake page.
- Reuse existing review queue focus/highlight behavior instead of inventing another history UX.

---

### H2 - Parent `IntakeWorkbench.tsx` still duplicates hooks that were extracted

Evidence:

- `src/components/internal-admin/intake/hooks/useIntakePipeline.ts` implements `runPipeline` and `submitToReview` wrappers.
- But `src/components/internal-admin/IntakeWorkbench.tsx` still implements its own `handleRunPipeline`, `handleSubmitReview`, local loading/error/result state, and fetch calls.
- `src/components/internal-admin/intake/hooks/useDesaOptions.ts` implements debounced desa search and selection.
- But `IntakeWorkbench.tsx` still keeps its own desa search/options/loading and `handleSearchDesa`, `handleSelectDesa`.

Risk:

- This is classic DRY/SOLID violation: extracted hooks exist but parent does not use them.
- Any future fix to API error behavior may be applied to one path but not the other.
- The refactor reduced line count but did not fully centralize behavior.

Decision recommendation:

```text
Either use the extracted hooks in IntakeWorkbench or delete the unused hooks.
Do not keep both.
```

Preferred cleanup:

- Make `IntakeWorkbench.tsx` use:
  - `useIntakePipeline`
  - `useDesaOptions`
  - `useIntakeHistory`
  - `useVersionHistory`
- Move error tone classification into the pipeline hook or a shared UI helper if used across forms.

---

### H3 - Two type systems now describe the same intake domain

Evidence:

- `src/lib/intake/types.ts` defines domain/server types: `OpenAIResult`, `DetectedDetailField`, `UnknownUsefulField`, `DetailFieldCoverageSummary`, etc.
- `src/components/internal-admin/intake/types.ts` duplicates many of the same shapes: `OpenAIResult`, `DetectedDetailField`, `UnknownUsefulField`, `DetailFieldCoverageSummary`, `DiffResult`, `ValidationResult`, etc.

Risk:

- Server response contract and UI type contract can drift.
- A future backend field change may compile in one place but break runtime UI assumptions.
- This violates single source of truth for DTOs.

Decision recommendation:

```text
Create one shared intake DTO contract, preferably in `src/lib/intake/types.ts` or `src/lib/intake/dto.ts`, and have UI import that.
UI-only types should only describe UI state, not duplicate server response DTOs.
```

Cleanup recommendation:

- Keep UI-only types in component folder:
  - `IntakeStep`
  - `IntakeMode`
  - UI badge props
- Move/consume all API/domain response shapes from `src/lib/intake/types.ts`.

---

## Medium Findings

### M1 - Mapping ownership is split across old admin-claim and new intake modules

Evidence:

- `src/lib/admin-claim/ai-mapping.ts` owns `AI_MAPPABLE_DESA_FIELDS`, sanitization, draft reader, and publish update data.
- `src/lib/intake/auto-mapping.ts` imports the same allowlist and maps text to those fields.
- `src/lib/intake/openai-mapping.ts` also imports sanitization from admin-claim.
- `src/lib/intake/detail-field-coverage.ts` also imports `AI_MAPPABLE_DESA_FIELDS` and defines a separate `DETAIL_FIELD_STANDARDS` registry.

Risk:

- The name `admin-claim/ai-mapping` no longer represents its actual role; it has become shared village-data mapping infrastructure.
- Future DataDesa / DetailFieldStandard work will become messy if this remains under admin-claim.

Decision recommendation:

```text
Promote shared mapping primitives out of `admin-claim` into a neutral module:
`src/lib/village-data/mapping-contract.ts` or `src/lib/intake/mapping-contract.ts`.
```

Suggested canonical split:

- Known publishable scalar fields: `village-data/mapping-contract.ts`
- Heuristic text mapping: `intake/auto-mapping.ts`
- OpenAI dynamic mapping: `intake/openai-mapping.ts`
- Detail page registry: future `village-data/detail-field-standard.ts`
- Admin claim specific read/write wrapper: keep in `admin-claim` only if tied to old admin-claim flow.

---

### M2 - `DETAIL_FIELD_STANDARDS` is a hardcoded future template, not yet a canonical registry

Evidence:

- `src/lib/intake/detail-field-coverage.ts` defines a large hardcoded `DETAIL_FIELD_STANDARDS` array.
- This is conceptually the same role that owner described as `DetailFieldStandard` table/registry.

Risk:

- Public detail field standard becomes hardcoded in intake module.
- If public detail page changes, developers may forget to update this array.
- It may drift from actual detail page rendering.

Decision recommendation:

```text
Short term: keep this hardcoded registry but mark it as temporary canonical seed.
Medium term: move to `src/lib/village-data/detail-field-standard.ts` and make public detail + intake read from the same registry.
Long term: DB-managed DetailFieldStandard if owner approves schema.
```

---

### M3 - Formatting utilities are duplicated between components and existing queue code

Evidence:

- `src/components/internal-admin/intake/utils.ts` has `formatBytes`, `formatDateTime`, `formatDiffValue`.
- `InternalDocumentReviewQueue.tsx` also has local `formatBytes`, `formatReviewValue`, `formatReviewStatusLabel`, etc.

Risk:

- Low functional risk but growing maintainability risk.
- UI labels/status may drift between intake and queue.

Decision recommendation:

- Create shared internal-admin UI formatting helpers only if used in at least two places.
- Do not over-abstract everything, but move obvious duplicates such as bytes/date/status labels.

---

### M4 - `IntakeWorkbench.tsx` still contains review/history list subcomponents inline

Evidence:

- `IntakeWorkbench.tsx` still includes inline `WorkflowGuide`, `IntakeHistoryList`, and `DesaVersionHistoryList`.

Risk:

- The file is smaller now, but it is still mixing orchestration and presentational details.
- This is not urgent, but inconsistent with the modularization goal.

Decision recommendation:

- Move `IntakeHistoryList`, `DesaVersionHistoryList`, and `WorkflowGuide` into `src/components/internal-admin/intake/` if they remain.
- If history becomes compact launcher only, implement that as a small component.

---

## Low Findings

### L1 - Some extracted files may be scaffolding not used by parent

Evidence:

- `useIntakePipeline` and `useDesaOptions` exist but parent still uses local implementation.

Risk:

- Dead code / false sense of refactor.

Recommendation:

- Either wire them or delete them.

### L2 - Naming is still misleading around AI mapping

Evidence:

- `admin-claim/ai-mapping.ts` comment says AI provider not yet configured, while OpenAI dynamic mapping now exists in `intake/openai-mapping.ts`.

Recommendation:

- Update comments/naming after consolidation so future developer does not think AI is absent.

## Recommended Canonical Ownership

| Area | Canonical owner recommended | Notes |
|---|---|---|
| Review work items | `InternalDocumentReviewQueue` + document APIs | Queue remains source of truth |
| Intake page history | Compact shortcut only | Link to queue/focused card, not full second review list |
| Intake pipeline API | `/api/internal-admin/intake` and `/submit-review` | Keep server-side auth/business logic here |
| Client pipeline calls | `useIntakePipeline` OR parent handlers | Choose one; recommended hook |
| Desa picker | `useDesaOptions` | Parent should not duplicate |
| Domain DTOs | `src/lib/intake/types.ts` or shared `dto.ts` | UI should import shared types |
| Known publishable fields | new neutral mapping contract | Do not keep under `admin-claim` long-term |
| Detail page standard | `village-data/detail-field-standard.ts` then DB later | Avoid hardcoded inside intake forever |
| Diff engine | `src/lib/intake/diff-engine.ts` | OK as canonical for scalar diff |
| OpenAI mapping | `src/lib/intake/openai-mapping.ts` | OK as adapter |
| Heuristic mapping | `src/lib/intake/auto-mapping.ts` | OK as fallback adapter |

## Proposed Cleanup Order

### Cleanup 1 - Stop duplicate review surfaces

- Make review queue the source of truth.
- Change `Riwayat Intake` into compact shortcut/link to queue item.
- Restore/reuse highlight/focus behavior.

### Cleanup 2 - Use or delete extracted hooks

- Wire `useIntakePipeline` and `useDesaOptions` into parent, or delete them.
- Keep one client-side implementation for fetch/error/loading behavior.

### Cleanup 3 - Unify DTO types

- UI imports API/domain DTOs from shared `src/lib/intake/types.ts` or new `dto.ts`.
- Component `types.ts` only keeps UI-only state/props.

### Cleanup 4 - Move mapping contract out of admin-claim

- Create neutral mapping contract module.
- Update imports gradually.
- Keep backward-compatible exports temporarily if needed.

### Cleanup 5 - Move detail field standard to canonical module

- Move `DETAIL_FIELD_STANDARDS` out of `detail-field-coverage.ts` into a module that can later be DB-backed.
- Document it as temporary seed for `DetailFieldStandard`.

### Cleanup 6 - UI polish after dedupe

Only after cleanup above:

- P0-2 preview hero / coverage visualization,
- P0-3 diff as main surface,
- review modal polish,
- review queue gallery polish.

## Does P0-1A Still Matter?

Yes, but it should be absorbed into Cleanup 1.

P0-1A should not be a separate long feature task. It is the first dedupe cleanup:

```text
Review queue is source of truth. Intake history becomes compact shortcut to queue with focus/highlight.
```

## Final Recommendation

Do not continue P0-2 yet.

Next task should be:

```text
Cleanup 1: consolidate intake history with review queue and restore focus/highlight.
```

Then continue with hook/type dedupe before new visual redesign work.

## Short Report For Owner

```text
Rangga checked the branch directly.
Owner concern is valid: there are duplicate/overlapping layers.

Biggest issues:
1. Riwayat Intake risks duplicating the review queue.
2. IntakeWorkbench still duplicates hooks that were already extracted.
3. API/domain types are duplicated between lib/intake and components/internal-admin/intake.
4. Mapping contract still lives under admin-claim even though it is now shared intake/village-data infrastructure.
5. DetailFieldStandard is currently hardcoded inside intake coverage, not a canonical registry yet.

Decision:
Stop P0-2. First cleanup duplicate ownership.
Queue must be source of truth. Intake history should become compact shortcut to queue with card highlight.
Then wire/delete duplicated hooks and unify DTO types.
```
