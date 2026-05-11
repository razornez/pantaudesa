# Sprint 05 - End-to-End Village Data Real Input Stabilization

## Status
READY FOR EXECUTION AFTER OWNER CONFIRMATION.

## Purpose

Close the remaining gaps from the flexible village data foundation so the owner/internal admin can input real data for villages safely and consistently.

This task must make the system end-to-end enough for real village data input, not only template/visibility foundation.

## Owner Goal

Owner must be able to:

```text
1. open Internal Admin Data Desa,
2. select a desa,
3. input or review real data,
4. store it safely as DataDesa,
5. publish only after internal admin review,
6. see latest published data appear on public village detail page,
7. keep villages without custom data/template on the current default detail template,
8. avoid visually inconsistent/belang-belang public pages.
```

## Mandatory Standards

Before coding, read and follow:

```text
docs/bmad/standards/back-office-ui-design-guidelines.md
```

Back-office UI must stay consistent with Intake V2:

```text
quiet luxury
clean
calm
premium but simple
soft border
subtle shadow
strong hierarchy
compact but breathable
decision-oriented
technical detail collapsed
clear primary action
mobile-friendly
```

Do not create a new UI surface with a different vibe.

## Branch Rule

Create a new branch from `main`:

```text
s05-village-data-end-to-end-real-input
```

Do not commit directly to `main`.
Do not merge to `main` without owner/Rangga approval.
No production/shared migration changes unless owner explicitly approves.

## Current Known State

From latest hardening report:

- template/visibility foundation exists,
- migration and seed have been applied,
- public detail page is template-aware for visibility,
- `DataDesa` table exists but has `0` rows,
- DataDesa write pipeline is not implemented,
- DataDesa publish pipeline is not implemented,
- public detail fetches `publishedValues` but does not render them yet,
- build is blocked by `/suara-warga` `getTime` issue,
- Playwright exists but has not been run due to seeded admin session needs.

This task closes those gaps.

---

# P0 - Build Stability

Fix build blocker:

```text
voice-read.ts:207
TypeError: a.getTime is not a function
```

Required:

- add safe Date/null guard,
- no regression to suara warga UI,
- `npm run build` should no longer fail for this reason.

Acceptance:

- `npm run build` passes or any remaining failure is unrelated and clearly documented.

---

# P1 - Default Template Consistency For All Desa

Every desa must resolve to a safe template.

Villages without explicit assignment or custom data must use:

```text
CURRENT_PUBLIC_DETAIL_TEMPLATE
```

This prevents public detail pages from looking inconsistent/belang-belang.

Required behavior:

1. If desa has explicit `DesaDetailTemplateAssignment`, use assigned template.
2. If desa has no explicit assignment, use active default template.
3. If default template is missing or DB unavailable, fallback to existing public detail behavior and hardcoded fallback constants.
4. Public page must never crash because template assignment is missing.
5. Internal Admin Data Desa should clearly show assigned template or `Default template`.

Required checks:

- audit all desa records,
- ensure no desa is left without effective template resolution,
- add fallback logic or seed assignment if needed,
- prefer resolver fallback over forcing unnecessary rows for every desa, unless seed strategy requires explicit assignment.

Acceptance:

- all desa render with current default detail template unless explicitly configured otherwise,
- no visual inconsistency due to missing template,
- `resolveDesaTemplate` works for any desa.

---

# P2 - DataDesa Write Pipeline

When intake/review detects real data that belongs to flexible detail fields, store it in `DataDesa` as reviewable data.

Create or update:

```text
src/lib/versioning/village-data-persistence.ts
```

Responsibilities:

- receive selected desa, resolved template, detected fields, source document/version context,
- map detected fields to `DetailFieldStandard`,
- write `DataDesa` rows for supported fields,
- initial status must be `IN_REVIEW`,
- never auto-publish from intake,
- only write fields that map to active field standards,
- respect active template and component visibility,
- if component is hidden for that desa, do not write as publishable; mark as held/not publishable or store review metadata safely if needed,
- keep relation to source document/version/source if available,
- never expose draft/in-review data publicly.

Field targets must support flexible fields beyond old `Desa` model fields, including:

```text
profil_desa: teleponDesa, emailDesa, potensiUnggulan, fasilitasUmum, asetDesa, lembagaDesa, bumdes
anggaran: totalAnggaran, terealisasi, persentaseSerapan
pendapatan: danaDesa, add, pades, bantuanKeuangan
kinerja: outputFisik, riwayatAPBDes
perangkat: kepalaDesa
```

Acceptance:

- after intake submit, relevant `DataDesa` rows are created with `IN_REVIEW`,
- source/version/document relation is traceable,
- no public render occurs yet,
- duplicate rows are avoided or clearly versioned.

---

# P3 - DataDesa Review/Publish Pipeline

Internal admin can publish reviewed `DataDesa` values safely.

When internal admin approves/publishes:

1. `DataDesa IN_REVIEW` becomes `PUBLISHED`.
2. `isActive=true` for the newly published value.
3. Previous active value for the same `desaId + templateId + componentId + fieldKey` must be set inactive or archived/replaced.
4. Create `DesaDataAuditEvent`.
5. Link to `VillageDataVersion` when available.
6. Draft/rejected/in-review values remain hidden from public page.

When internal admin rejects:

1. `DataDesa` status becomes `REJECTED`.
2. reason/note is saved.
3. audit event is created.
4. public data remains unchanged.

Acceptance:

- publish is explicit and internal-admin controlled,
- no auto-publish,
- previous public value is not lost without audit trail,
- rejected values do not leak publicly.

---

# P4 - Manual Real Data Input In Internal Admin

Owner/internal admin can input real data manually for any desa, not only through document intake.

Inside `/internal-admin/village-data`, tab `Data per Desa` must support:

- select/search desa,
- show effective template used by desa,
- show visible components/sections,
- show active field standards,
- show current latest published value per field,
- allow internal admin to create/edit a draft value,
- require source or internal note where appropriate,
- submit changes to review or publish according to current permission rule.

Rules:

- no dummy values,
- no static prototype data,
- no ugly raw table dump,
- follow back-office UI design guidelines,
- mobile-friendly enough for review.

Acceptance:

- owner can input real data for at least one desa and see it become reviewable/publishable via the safe flow,
- villages with no data show honest empty state, not broken UI,
- all data is dynamic from DB/API.

---

# P5 - Public Detail Hybrid Render

Public village detail page must render latest published `DataDesa` values where available, while preserving existing detail page behavior.

Public detail page should resolve:

```text
desa
-> active template
-> visible components
-> active fields
-> latest PUBLISHED + isActive DataDesa values
-> existing Desa/model fallback values
-> render public sections
```

Rules:

- only `PUBLISHED + isActive=true` may render,
- `DRAFT`, `IN_REVIEW`, `REJECTED`, `ARCHIVED` must not render,
- if DataDesa value exists, it can override or supplement existing model value depending on field mapping,
- if no DataDesa value exists, keep existing public behavior,
- hidden components must not render, even if DataDesa exists,
- empty visible components should use honest empty state or hide based on component policy.

Acceptance:

- published flexible data appears on public detail page,
- villages without data remain consistent using default template and existing data,
- no draft/rejected/in-review leak,
- no visual belang-belang due to missing template/data.

---

# P6 - Intake V2 Template-Aware Verification

Intake V2 must use the same template/data foundation.

Required:

- coverage uses selected desa active template,
- coverage uses visible components,
- hidden component data is marked detected-but-hidden/not publishable,
- diff compares against current published DataDesa + existing fallback values,
- no static prototype/demo data,
- technical details collapsed,
- UI follows Intake V2 / back-office guidelines.

Acceptance:

- intake result reflects the selected desa's actual template,
- if Desa B hides anggaran and upload contains anggaran, intake explains it is detected but hidden/not publishable,
- if Desa A shows anggaran, intake can map it into reviewable DataDesa when supported.

---

# P7 - Data Quality / Source Guardrails

Every DataDesa value must have enough context to be trusted:

- source document or source note,
- actor/reviewer,
- status,
- audit event,
- created/updated timestamps.

Source priority should respect owner rule:

```text
1. official/government/official website source
2. government/province partner source
3. internal admin input
4. admin desa input
5. document upload depending on document credibility
6. citizen voice as signal only
```

Rules:

- admin desa input is not automatically final,
- citizen voice is signal only,
- internal admin has final publish authority,
- correction flow should create new draft/review item, not silently overwrite public data.

Acceptance:

- source/review context exists for new DataDesa writes,
- audit trail is created for publish/reject/manual input,
- no unreviewed source becomes public automatically.

---

# P8 - QA And Playwright

Run and report:

```bash
npm run lint
npx tsc --noEmit
npx prisma generate
npm run build
```

If Playwright is available, add/run coverage for:

1. `/internal-admin/village-data` loads.
2. All tabs load.
3. Desa without explicit assignment uses default template.
4. Toggle component visibility hides/shows public component.
5. Manual DataDesa input creates reviewable data.
6. DataDesa `IN_REVIEW` does not render publicly.
7. DataDesa `PUBLISHED` renders publicly.
8. Hidden component data does not render publicly.
9. Intake detects hidden component data correctly.
10. Mobile/narrow viewport has no horizontal scroll.

If Playwright cannot run due to missing seeded admin session, document clearly and provide manual QA checklist.

---

# Required Report

Create/update:

```text
docs/bmad/reports/sprint-05-village-data-end-to-end-real-input-report.md
```

Report must include:

1. branch name,
2. commits,
3. migration/table status,
4. default template consistency result,
5. DataDesa write pipeline summary,
6. DataDesa publish/reject summary,
7. manual input flow summary,
8. public detail hybrid render summary,
9. intake template-aware verification,
10. source/audit guardrails,
11. UI standard compliance,
12. component reuse/cleanup summary,
13. QA results,
14. Playwright results or reason not run,
15. known limitations,
16. owner test checklist,
17. short report for Rangga and owner.

---

# Component / Flow Cleanup Requirement

Before finishing, audit and clean up:

- unused components,
- superseded scaffolds,
- duplicate field standard constants,
- duplicate history/review surfaces,
- duplicate DTOs in UI folders,
- dead fallback code that is no longer needed.

Do not remove safe fallback paths still needed for DB outage or local dev.

Document what was removed and what intentionally remains.

---

# Owner Test Checklist

Owner should be able to test:

1. Open `/internal-admin/village-data`.
2. Select a desa with no custom assignment/data.
   - Expected: uses current default template.
3. Input real value for a supported field.
   - Expected: saved as reviewable, not immediately public.
4. Publish the value as internal admin.
   - Expected: appears on public detail page.
5. Reject a value.
   - Expected: does not appear publicly.
6. Hide a component for one desa.
   - Expected: component disappears only for that desa.
7. Show component again.
   - Expected: component returns.
8. Upload/input data in Intake for hidden component.
   - Expected: detected but not publishable because component hidden.
9. Check another desa without data.
   - Expected: still uses default template and does not look broken/belang.

---

# Hard Guardrails

Do not:

- auto-publish mapped/manual data,
- render draft/rejected/in-review data publicly,
- hardcode prototype/demo data,
- create duplicate review queues,
- create inconsistent UI style,
- ignore `back-office-ui-design-guidelines.md`,
- change auth/permission rules,
- expose secrets/API keys/DB URLs,
- merge to main without approval.

## Acceptance Criteria

This task is complete only if:

- owner can input real data for another desa,
- data goes through review/publish safely,
- public detail shows only latest published data,
- all desa without custom data/template use current default template,
- no public page appears inconsistent due to missing data/template,
- Intake V2 is template-aware,
- build blocker is resolved,
- QA is documented,
- Playwright is run or honestly deferred,
- no redundant/double components or flows remain.

## Short Instruction For Executor

```text
Pull main. Create branch s05-village-data-end-to-end-real-input. Read this task and the UI guideline. Finish the end-to-end DataDesa flow: build fix, default template consistency, DataDesa write, review/publish, manual real data input, public hybrid render, Intake V2 template-aware verification, QA/Playwright, cleanup. Do not auto-publish. Do not merge main without owner approval.
```
