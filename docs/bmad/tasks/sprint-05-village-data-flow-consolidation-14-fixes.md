# Sprint 05 - Village Data Flow Consolidation: 14 Fixes

## Status
READY FOR EXECUTION AFTER OWNER CONFIRMATION.

## Context

This task consolidates owner feedback for Sprint 05 village data, internal admin, intake review, and public village detail flow.

The goal is to fix the current confusing/mixed flow in one batch, not one issue at a time.

## Owner Direction

- Keep `Publikasikan sekarang` in the document review modal if that modal becomes the final review/publish surface.
- Remove the duplicate publish/review role from the `Review Data` tab.
- Convert `Review Data` into historical log/audit trail for all actions in `/internal-admin/village-data` and related village data features.
- Do not add manual internal-admin public data input.
- Public data must always be source-backed.
- For now, all villages should use the current default detail template.
- System must still support changing templates per desa later.
- CRUD for template/data template management is next enhancement, not this batch.

## Mandatory Standards

Read and follow:

```text
docs/bmad/standards/back-office-ui-design-guidelines.md
docs/bmad/tasks/sprint-05-village-data-source-of-truth-governance-addendum.md
docs/bmad/tasks/sprint-05-intake-coverage-template-sync-addendum.md
```

Back-office UI must stay consistent with Intake V2 style:

```text
quiet luxury
clean
calm
premium but simple
decision-oriented
source-backed
technical details secondary
mobile-friendly
no duplicate flows
```

## Branch Rule

Create a new branch from latest `main`:

```text
s05-village-data-flow-consolidation-14-fixes
```

Do not commit directly to `main`.
Do not merge without owner/Rangga approval.

---

# Required Fix Items

## 1. Consolidate publish flow into document review modal

The document review modal may keep `Publikasikan sekarang`, but it must become the final review surface.

Required:

- show source/evidence,
- show desa target,
- show active template,
- show field diffs,
- show before/after values,
- show fields outside template,
- show hidden component fields,
- publish only source-backed values,
- write audit/version history.

Acceptance:

- one clear final publish flow exists,
- user understands that modal publish is final,
- no second publish queue competes with it.

## 2. Convert `Review Data` tab into audit/activity log

The `Review Data` tab must no longer act as a pending publish queue if publish is done in modal.

New role:

```text
Log Historis / Audit Trail / Activity Timeline
```

It should show all actions from `/internal-admin/village-data` and related village data flows:

- template assignment changes,
- component visibility changes,
- data publish from modal,
- data reject/skip,
- source selected,
- mapping correction,
- field outside template detected,
- field hidden detected,
- version created,
- public data updated,
- audit events.

Acceptance:

- no redundant approve/publish button in Review Data tab,
- tab clearly acts as history/audit log,
- copy no longer says pending review queue.

## 3. Remove all manual input wording and affordance

Internal admin must not be positioned as a public data source.

Remove/replace copy such as:

```text
input manual
Input Data Manual
data dari intake dan input manual
```

Correct framing:

```text
Data berasal dari dokumen/sumber terpercaya yang direview.
```

Acceptance:

- no UI suggests internal admin can manually invent public village data,
- internal admin role is reviewer/publisher/source selector only.

## 4. Intake review must highlight active template used by selected desa

When a document enters intake review/modal, clearly show:

- template name,
- template key,
- template source: DB/default/fallback,
- visible component count,
- hidden component count,
- active field count.

Example:

```text
Template dipakai: Template Detail Desa Publik Saat Ini
Key: CURRENT_PUBLIC_DETAIL_TEMPLATE
Source: DB default template
```

Acceptance:

- owner always knows what template the uploaded data is being compared against.

## 5. Show uploaded values outside template in diff

If uploaded/source document contains values that do not exist in the active template, do not hide them.

Show them in the diff/detected area with clear status:

```text
Terdeteksi di luar template
```

Copy:

```text
Data ini terbaca dari dokumen, tetapi tidak dicatat sebagai perubahan karena field tersebut belum ada di template desa ini. Buat atau aktifkan field/template baru di Standar Detail agar data ini dapat ditampilkan.
```

Acceptance:

- outside-template values are visible to reviewer,
- they are not counted as public changes,
- user understands next step.

## 6. Separate hidden component from outside-template field

Two cases must not be mixed.

Case A:

```text
Field exists in template, but component is hidden for this desa.
```

Status:

```text
Terdeteksi, tetapi komponen sedang hidden untuk desa ini.
```

Case B:

```text
Field does not exist in the active template.
```

Status:

```text
Terdeteksi di luar template.
```

Acceptance:

- hidden component and outside-template field have different UI labels, explanations, and handling.

## 7. Sync Intake Coverage with DB active template

Coverage panel must derive sections/components from:

```text
resolvedTemplate.visibleComponents
```

when DB template exists.

Do not rely only on hardcoded `DETAIL_FIELD_STANDARDS` except as fallback.

Acceptance:

- section/component labels match `/internal-admin/village-data`,
- coverage shows the same template/component structure the desa actually uses,
- fallback is clearly labeled.

## 8. Rename coverage labels to avoid misleading auto-publish meaning

Avoid labels like:

```text
Aman dipublish
```

because final publish still needs source/evidence review.

Preferred labels:

```text
Siap direview
Terdeteksi, perlu cek sumber
Tidak terbaca
Terdeteksi tapi komponen hidden
Terdeteksi di luar template
```

Acceptance:

- wording does not imply source-less or automatic publish.

## 9. Replace `Versi & Audit` raw ID filter with reusable village filter

Replace:

```text
Filter berdasarkan ID desa
```

with human-friendly filters:

- desa name,
- kecamatan,
- kabupaten/kota,
- provinsi,
- action/status type if needed,
- date range if needed.

Reuse/extract existing filter pattern from `/desa`.

Acceptance:

- owner does not need to know desa ID,
- filter component is reusable,
- no duplicate filter component is introduced.

## 10. Default template consistency for every desa

All desa without custom assignment must use:

```text
CURRENT_PUBLIC_DETAIL_TEMPLATE
```

Resolution order:

1. explicit active assignment,
2. DB active default template,
3. fallback constants only if DB/default unavailable.

Acceptance:

- no desa page looks broken/belang-belang due to missing template,
- public page never crashes because assignment is missing.

## 11. Support future per-desa template switching, but no template CRUD now

Do not build full template CRUD in this task.

But keep model/runtime ready for:

```text
Desa A -> Template A
Desa B -> Template B
```

Acceptance:

- current default uniform behavior works,
- architecture still supports future template assignment.

## 12. Enforce source-of-truth governance in UI/API

Every public village data value must be source-backed.

Allowed source categories:

- government/official source,
- government/province partner,
- official village website,
- governance source such as Inaproc when relevant,
- trusted uploaded document,
- admin desa submission/upload after review,
- citizen voice only as signal.

Internal admin must not be source of truth.

Acceptance:

- public data requires source/evidence,
- citizen voice is signal only,
- internal admin can review/publish but cannot invent source data.

## 13. Keep public render strict

Public detail may render only:

```text
PUBLISHED
isActive = true
component visible
template active
source/evidence exists
```

Never render:

- draft,
- in review,
- rejected,
- archived,
- outside-template values,
- hidden component values,
- citizen voice as fact,
- internal admin notes.

Acceptance:

- no unreviewed or source-less value leaks publicly.

## 14. Ensure UI/style and component reuse consistency

All modified internal admin/back-office UI must follow:

```text
docs/bmad/standards/back-office-ui-design-guidelines.md
```

Also audit for duplicates:

- duplicate review queues,
- duplicate filters,
- duplicate history panels,
- duplicate DTOs,
- unused superseded components.

Acceptance:

- no inconsistent visual vibe,
- no duplicate components/flows,
- report lists what was reused/removed.

---

# Required Report Format

Update or create:

```text
docs/bmad/reports/sprint-05-village-data-flow-consolidation-14-fixes-report.md
```

The report MUST have exactly these 14 sections, one per item:

```text
1. Consolidate publish flow into document review modal
2. Convert Review Data tab into audit/activity log
3. Remove all manual input wording and affordance
4. Intake review active template highlight
5. Uploaded values outside template in diff
6. Hidden component vs outside-template separation
7. Intake Coverage DB template sync
8. Coverage label governance wording
9. Reusable village filter for Versi & Audit
10. Default template consistency for every desa
11. Future template switching support without CRUD
12. Source-of-truth governance enforcement
13. Strict public render guard
14. UI/style and component reuse consistency
```

Each section must include:

- status: DONE / PARTIAL / BLOCKED,
- files changed,
- implementation summary,
- QA performed,
- known limitation if any.

Do not collapse these into one general summary. Owner needs to verify none were missed.

---

# QA Required

Run and report:

```bash
npm run lint
npx tsc --noEmit
npx prisma generate
npm run build
```

Manual QA:

1. Upload sample document into intake.
2. Open modal review.
3. Confirm active template is shown.
4. Confirm values inside template are shown as changes.
5. Confirm values outside template are shown but not counted as changes.
6. Confirm hidden component values are labeled differently.
7. Publish from modal.
8. Confirm public detail updates only with allowed source-backed values.
9. Confirm audit/activity tab logs the action.
10. Confirm Review Data tab no longer acts as duplicate publish queue.
11. Confirm Versi & Audit filter works by desa name/kecamatan/kabupaten.
12. Confirm desa without custom template uses default template.

Playwright if available:

- add/run tests for the same major flow.
- If Playwright cannot run, document why.

---

# Acceptance Criteria

This batch is complete only if all 14 items are addressed and the report uses the mandatory 14-section format.

No item may be silently skipped.

If an item is not finished, mark it PARTIAL/BLOCKED with a clear reason.
