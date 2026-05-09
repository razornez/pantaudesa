# Sprint 05 Batch 3 - Intake V2 Full Page Redesign

## Status
READY FOR EXECUTION AFTER OWNER APPROVAL.

## Reference File

Owner provided the reference prototype:

```text
intake-v2.html
```

Use it as the main UX/layout reference.

Important: do not copy the prototype blindly. Implement the same UX direction inside the current app using PantauDesa's existing quiet luxury styling and component patterns.

## Branch Rule

Create a new branch from `main`:

```text
p02-intake-v2-full-page-redesign
```

Do not commit directly to `main`.
Do not merge to `main`.
Show visual result to owner before final commit/merge.

## Goal

Redesign the `/internal-admin/intake` result/preview experience so it follows the `intake-v2.html` direction:

```text
sticky action bar
-> source ribbon file-to-desa narrative
-> diff theatre as the main decision surface
-> coverage lens and validation side-by-side
-> detected-not-publishable gallery
-> compact technical info
-> optional inspector drawer
```

The current implementation feels like scattered cards. The new implementation must feel like a guided review cockpit.

## Design Direction

Keep current PantauDesa style:

- quiet luxury
- clean
- calm
- premium but simple
- soft white/off-white surfaces
- subtle borders
- soft shadows
- strong hierarchy
- not noisy
- not a debug dashboard
- mobile-friendly

Use the prototype as structure and UX inspiration, but adapt colors, spacing, typography, and components to the current app.

## Mandatory Architecture Rule

The redesign must be split into small components.

Do not put everything back into `IntakeWorkbench.tsx`.

Suggested component structure:

```text
src/components/internal-admin/intake/v2/
  IntakeV2ActionBar.tsx
  IntakeV2SourceRibbon.tsx
  IntakeV2DiffTheatre.tsx
  IntakeV2DiffRow.tsx
  IntakeV2CoverageLens.tsx
  IntakeV2ValidationPanel.tsx
  IntakeV2DetectedGallery.tsx
  IntakeV2InfoStrip.tsx
  IntakeV2InspectorDrawer.tsx
  IntakeV2EmptyState.tsx
  intake-v2-utils.ts
  intake-v2-types.ts
```

Rules:

- `IntakeWorkbench.tsx` remains orchestrator only.
- Presentational components should be small and reusable.
- Data derivation should be in helper/utils or hooks.
- Avoid duplicate DTOs if shared types already exist.
- Do not create a second source of truth.

## Scope

This task focuses on the intake preview/result experience.

Do not:

- change publish/review business rules,
- auto-publish,
- change permissions/auth,
- change production env,
- apply migrations,
- redesign unrelated pages,
- create new APIs unless absolutely needed.

Use existing result data as much as possible:

- extraction metadata
- selected desa
- detail field coverage
- validation result
- diff result
- OpenAI/local parser status
- detected but not publishable
- unknown useful fields
- submit review status

## Required Sections

### 1. Sticky Action Bar

Inspired by the prototype top action bar.

Must include:

- breadcrumb/context text
- workflow step indicator: current step is preview/check result
- clear actions:
  - `Kembali ke input`
  - `Ulangi pipeline`
  - `Kirim ke antrean review`

Rules:

- CTA must be easy to find.
- On mobile, action layout must not be cramped.
- Do not hide primary action in the middle of content.
- Guardrail copy must still make clear that this does not publish.

### 2. Source Ribbon

Build a source-to-target narrative:

```text
uploaded file / pasted text -> target desa
```

Must show:

Left side:

- file/input name
- input type
- parser/extractor
- file size if available
- fields read
- AI status if AI was used

Right side:

- target desa
- kecamatan/kabupaten/provinsi
- latest public/version hint if available
- change desa action if still relevant

Middle desktop:

- arrow or flow indicator
- short impact label such as `X dari Y field detail tersentuh`

Mobile:

- stack file and desa cleanly
- avoid decorative elements that waste space

### 3. Diff Theatre - Main Decision Surface

This is the most important section.

Owner explicitly wants diff/perubahan to become the `ujung tombak` so reviewer can immediately see:

```text
ini berubah
ini tidak berubah
ini baru
ini dihapus
```

Required:

- section title like `Diff · ujung tombak review`
- headline summary:
  - `N field akan berubah di halaman desa`
- short explanation of color/status meaning
- filter tabs:
  - Semua
  - Berubah
  - Baru
  - Update
  - Hapus
  - Tidak berubah if needed
- before/after layout:
  - current public value
  - arrow
  - proposed value after review/publish
- group by public detail section if possible:
  - Identitas
  - Demografi
  - Pemerintahan
  - Anggaran
  - Kontak
  - Dokumen
  - etc.
- changed/added/removed must appear before unchanged.
- unchanged fields must be collapsed or secondary.

Visual direction:

- calm colored left strip per diff type
- clear before/after columns
- compact rows
- no endless card stack
- no tiny unreadable text

Fallback:

- if there is no selected desa/no diff, show clear empty state and explain that selecting a desa enables comparison.

### 4. Coverage Lens

Coverage must become visual and meaningful, not just counters.

Required:

- donut/ring or stacked visual summary
- show:
  - publishable now
  - detected but not publishable
  - missing/not covered
- show total field coverage percentage
- show `X / Y field detail`
- section breakdown bars by public detail section

Formula must be documented in the report.

Do not fake data. If the exact category is not available, derive honestly from current coverage summary.

### 5. Validation Panel

Validation must be visible without forcing user to open a collapsed card.

Required:

- compact status headline:
  - `Aman untuk dikirim ke review` or appropriate warning/error text
- status chip:
  - Lolos
  - Perlu dicek
  - Ada error
- show actionable issues only
- if no issues, keep it short
- if warnings exist, show small list
- if errors exist, show blockers near CTA or validation panel

Avoid wasting a full large card for `validasi aman`.

### 6. Detected Not Publishable Gallery

Use a gallery/card layout for fields detected from the upload but not yet safely publishable.

Show:

- field label
- detected value
- reason it cannot be published now
- category/status badge such as:
  - format
  - source
  - tipe baru
  - narasi

Rules:

- Do not publish these fields into the wrong model.
- Keep this section helpful, not scary.
- If empty, show compact empty state or hide if not useful.

### 7. Compact Info Strip

Technical/parser/AI information should not dominate the page.

Show compact info cards only:

- document type
- pipeline path
- technical details launcher

Technical detail must be optional.

### 8. Inspector Drawer / Collapsed Technical Detail

Parser local, OpenAI proof, extraction metadata, evidence snippets, and troubleshooting detail should move into an optional inspector drawer or collapsed detail section.

Rules:

- collapsed by default
- do not show API key
- do not show full prompt/response
- do not log or display full document content
- evidence snippets must be short and safe

## Mobile Requirements

Mobile around 375px must be usable.

Required:

- sticky action bar does not crowd the screen
- source ribbon stacks cleanly
- diff rows become readable stacked before/after blocks
- coverage and validation stack vertically
- primary CTA is obvious
- no horizontal scroll
- no dense tiny text walls

## Relationship With Existing Sections

The new layout should replace the current scattered result cards.

Avoid duplicate summaries.

Clear ownership:

- Source ribbon = what was read and target desa
- Diff theatre = what changes
- Coverage lens = how much page detail is covered
- Validation = can it move to review
- Detected gallery = useful but not publishable yet
- Inspector = technical details

## Data/Formula Guidance

Suggested derived metrics:

- `totalDetailFields = coverage.entries.length`
- `coveredFields = coverage.coveredCount`
- `detectedNotPublishable = coverage.detectedNotPublishableCount`
- `missingFields = totalDetailFields - coveredFields - detectedNotPublishable`
- `coveragePercent = round((coveredFields + detectedNotPublishable) / totalDetailFields * 100)` or document if using only publishable coverage
- `publishableCoveragePercent = round(coveredFields / totalDetailFields * 100)`
- `changedCount = diff entries where deltaType !== unchanged`
- `addedCount = deltaType added`
- `updatedCount = deltaType updated`
- `removedCount = deltaType removed`
- `unchangedCount = deltaType unchanged`
- `emptyFilledCount = coverage entries where currentValueStatus empty and uploadedCoverageStatus covered`

Document exact formula used.

## Guardrails

Do not:

- auto-publish,
- change review/publish flow,
- bypass auth/permission,
- expose sensitive data,
- log full prompt/response/document,
- create duplicate history/review surfaces,
- apply migration,
- commit env files.

## Required Report Update

Update:

```text
docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md
```

Add section:

```text
Intake V2 Full Page Redesign
```

Include:

- branch name
- files changed
- component split summary
- mapping from `intake-v2.html` sections to implemented components
- coverage formula
- diff formula
- mobile notes
- QA result
- owner test checklist

## QA

Run and report:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If build is blocked by Prisma Windows EPERM, document exact error and whether lint/tsc pass.

## Output Before Final Commit / Merge

Report back with:

1. branch name
2. files changed
3. component split summary
4. desktop screenshot
5. mobile screenshot
6. coverage formula
7. known limitations
8. QA result

Wait for owner/Rangga visual review before final merge.

## Acceptance Criteria

- page follows the `intake-v2.html` UX direction closely
- current PantauDesa quiet luxury style is preserved
- code is split into maintainable components
- diff becomes the main decision surface
- coverage becomes visual and meaningful
- validation is immediately understandable
- technical details are optional, not dominant
- mobile view is comfortable
- no business logic regression
