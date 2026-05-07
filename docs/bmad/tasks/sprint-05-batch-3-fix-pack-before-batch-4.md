# Sprint 05 Batch 3 Fix Pack - Before Batch 4

## Status
READY FOR EXECUTION.

## Context

Owner reviewed Batch 3 and agreed the intake -> review flow is important, but it must be cleaned up before moving to Batch 4.

This task is a blocking fix pack before Batch 4.

## Owner Feedback To Address

1. Intake review fields are too few compared to the public village detail page.
2. The flow must stay no-cost/free as much as possible; do not require paid Supabase just to test this feature.
3. Intake/review UI is too bulky and visually scattered; it needs to be more efficient and easier on the eyes.
4. Photo/image/scanned document upload must be readable and mappable. The system needs OCR plus AI-assisted interpretation to infer which data fields the document contains.
5. Existing carry-over findings must be fixed before Batch 4.

## Goal

Make Batch 3 owner-test ready by fixing functional gaps, field coverage, UI efficiency, no-cost operation clarity, OCR/AI mapping path, and remaining review findings.

---

## Workstream A - Fix Diff Engine

Fix `src/lib/intake/diff-engine.ts`.

Required:

- Do not rely on jsondiffpatch root array interpretation for scalar fields.
- Use manual scalar comparison:
  - previous equals next -> `unchanged`
  - previous empty and next filled -> `added`
  - previous filled and next empty -> `removed`
  - otherwise -> `updated`
- Keep output shape stable for UI.
- Add/update small helper tests if test pattern exists, or document manual smoke test.

Acceptance:

- Diff is trustworthy for simple field changes.
- Owner can see changed fields correctly in UI.

---

## Workstream B - Align Intake Mapping Fields With Public Village Detail

Problem:

Current intake mapping only covers a small safe allowlist:

- websiteUrl
- kategori
- tahunData
- jumlahPenduduk
- kecamatan
- kabupaten
- provinsi

But the public village detail page contains more sections/fields. Owner expects intake to show what can and cannot be mapped.

Required:

1. Inspect current public village detail implementation and data used there.
2. Create a field coverage matrix:
   - public detail section
   - current source/model
   - currently mappable yes/no
   - should be mappable in Sprint 05 yes/no
   - reason if deferred
   - source requirement
   - validation requirement
3. Expand intake mapping field set where safe.
4. Do not force every public detail field into direct `Desa` update if the correct model is different.
5. If a field belongs to future models, show it as `detected but not yet publishable` or `needs model support`.

Important:

- Do not fake mapping fields.
- Do not add dummy data.
- Do not publish unsupported fields to the wrong table.
- Use clear UI copy so owner understands why some fields are detected but not publishable yet.

Acceptance:

- Intake UI explains field coverage clearly.
- Mappable fields are closer to public detail needs.
- Deferred fields are documented honestly.

---

## Workstream C - No-Cost / Free Runtime Clarification

Owner does not want paid Supabase or paid infrastructure just to test Batch 3.

Required:

- Keep fallback mode working without dedicated version/audit tables.
- Do not require Supabase paid branching.
- Do not apply shared DB migration without explicit owner approval.
- Document what works for free/no-cost mode:
  - intake preview
  - submit review
  - draft review
  - publish through existing flow
  - fallback audit/history
- Document what needs later DB activation:
  - immutable `VillageDataVersion`
  - dedicated `DesaDataAuditEvent`

Acceptance:

- Owner can test using current DB/env without paid Supabase feature.
- UI/report clearly says fallback mode is expected while dedicated tables are inactive.

---

## Workstream D - Compact UI / Quiet Luxury Cleanup

Owner feedback: UI is too bulky, visually scattered, and tiring.

Required UX direction:

- More compact layout.
- Reduce oversized cards and repeated summaries.
- Make flow linear and readable.
- Use progressive disclosure.
- Use fewer competing visual groups.
- Stronger hierarchy:
  1. Input
  2. Result summary
  3. Field mapping/diff
  4. Review action
  5. History/carry-over details collapsed
- Mobile-friendly, especially small screens.
- Keep copy simple for non-technical users.

Specific suggestions:

- Convert long panels into compact sections/accordion.
- Show top summary first:
  - file read status
  - mapped field count
  - validation result
  - diff count
  - next action
- Move technical parser details to collapsed section.
- Keep history panel compact or below main task.
- Highlight only action buttons that matter.

Acceptance:

- UI feels less heavy and less scattered.
- Owner can complete the flow without reading too much technical text.
- No user-facing behavior regression.

---

## Workstream E - Photo / Scanned Document OCR + AI-Assisted Mapping Path

Owner requires the system to handle uploaded photo/scanned document content and infer what data it may contain.

Required:

1. Add free/simple OCR attempt for image/scanned document path if feasible.
2. Evaluate `tesseract.js` or another no-cost local OCR option.
3. If OCR is too heavy for Vercel/server runtime, implement a safe fallback:
   - clear error message,
   - owner-visible limitation,
   - path to paste text manually,
   - report the runtime blocker.
4. Add AI-assisted mapping design/adapter:
   - AI interprets extracted text and suggests field candidates.
   - AI output must remain draft only.
   - Internal admin must review before publish.
   - AI confidence must not be treated as truth.
5. Use current heuristic mapping as fallback if AI is not configured.
6. Do not add paid AI dependency without owner approval.

Suggested approach:

- OCR extracts text from image/scanned file.
- AI or heuristic converts text into candidate field mapping.
- Validation checks candidate fields.
- Diff compares with existing data.
- Internal admin reviews before publish.

Acceptance:

- Image/scanned input path is attempted or clearly documented with exact blocker.
- AI-assisted mapping plan/adapter exists.
- No auto-publish.
- No sensitive document content is logged.

---

## Workstream F - Public Source Availability Check

Carry-over from Batch 3 review.

Required:

- Try a small bounded public-source availability check.
- Use public, non-login, non-personal data only.
- Prioritize:
  - SID Kemendesa IDM
  - SID Kemendesa Profil
  - Satu Data Indonesia Jumlah Penduduk Desa
  - SID Dana Desa
- Record fields available, access method, and limitation.
- Do not publish external source sample data directly.

Acceptance:

- Report shows what source was checked and what data shape was found.
- Gaps are clear.

---

## Workstream G - QA / Build Blocker

Required:

- Try to run:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npx prisma generate`
  - `npm run build`
- If Prisma Windows EPERM persists, document exact error and whether source checks still pass.
- Do not hide build blocker.

Acceptance:

- QA status is honest.
- Build blocker is either fixed or documented as environment issue with next action.

---

## Required Report Update

Update:

```text
docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md
```

Must include:

- fixes completed
- fields added/deferred
- UI cleanup summary
- OCR/AI mapping result
- no-cost mode clarification
- public source check result
- QA result
- owner test checklist update
- short report for Rangga and owner in copy-paste format

## Hard Guardrails

Do not:

- auto-publish parser/OCR/AI/admin-desa output,
- publish unsupported detected fields into the wrong model,
- use dummy data as real public data,
- apply shared/production DB migration without owner approval,
- require paid Supabase feature for owner testing,
- add paid AI service without owner approval,
- log sensitive document content, token, DB URL, storage key, email, or raw sensitive identifiers.

## Owner Test Checklist Required

Final output must tell owner:

- page/route to open,
- file types to test,
- image/scanned doc behavior,
- what fields should appear,
- how to verify diff,
- how to submit to review,
- what must not happen,
- screenshots/logs to send back.
