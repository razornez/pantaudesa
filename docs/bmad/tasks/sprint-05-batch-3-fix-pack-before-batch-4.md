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
4. Photo/image/scanned document upload must be readable and mappable through OpenAI vision/file input if `OPENAI_API_KEY` is available.
5. Mapping must be dynamic because admins will upload raw/unstructured data and should not be forced to match PantauDesa field rules.
6. Review must stay synchronized with the current public village detail structure, including which detail fields are already filled and which are still empty.
7. Existing carry-over findings must be fixed before Batch 4.

## Goal

Make Batch 3 owner-test ready by fixing functional gaps, dynamic field coverage, UI efficiency, no-cost operation clarity, OpenAI-assisted mapping path, and remaining review findings.

---

## Core Product Decision - Dynamic AI Mapping

OCR is no longer the preferred direction.

Preferred direction:

```text
local parser first -> OpenAI vision/file mapping when needed -> structured dynamic draft -> validation -> field coverage/diff -> internal admin review -> publish only after review
```

Why:

- Admin desa/internal users will upload raw data in many formats.
- They should not be forced to format documents according to PantauDesa rules.
- The system should infer what the document contains and map it to available/future village data fields.
- Public village detail fields may change over time, so the mapping contract must be flexible.

Required behavior:

- Local parser remains first-pass for TXT/DOCX/XLSX/PDF text/CSV to reduce cost.
- OpenAI is used when:
  - file is image/photo/scanned document,
  - PDF text extraction fails or text is too poor,
  - owner explicitly chooses AI mapping,
  - local heuristic mapping confidence is low.
- If `OPENAI_API_KEY` is missing, quota is exhausted, or rate limit occurs, show a clear limitation/error and keep the flow usable through local parser/manual paste.
- AI output is draft-only.
- Internal admin remains final reviewer.
- No auto-publish.
- Do not log sensitive document content or full prompt/response.

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
   - current public value filled/empty status if desa is selected
   - currently mappable yes/no
   - AI-detectable yes/no
   - publishable now yes/no
   - should be mappable in Sprint 05 yes/no
   - reason if deferred
   - source requirement
   - validation requirement
3. Expand intake mapping field set where safe.
4. Do not force every public detail field into direct `Desa` update if the correct model is different.
5. If a field belongs to future models, show it as `detected but not yet publishable`, `needs model support`, or `needs owner/schema approval`.
6. The UI should show which public detail fields are still empty and which fields the uploaded document appears to cover.

Important:

- Do not fake mapping fields.
- Do not add dummy data.
- Do not publish unsupported fields to the wrong table.
- Use clear UI copy so owner understands why some fields are detected but not publishable yet.

Acceptance:

- Intake UI explains field coverage clearly.
- Mappable fields are closer to public detail needs.
- Deferred fields are documented honestly.
- Owner can see: uploaded file covers which current detail fields, which empty detail fields remain, and which detected fields need future support.

---

## Workstream C - No-Cost / Free Runtime Clarification

Owner does not want paid Supabase or paid infrastructure just to test Batch 3.

Required:

- Keep fallback mode working without dedicated version/audit tables.
- Do not require Supabase paid branching.
- Do not apply shared DB migration without explicit owner approval.
- Document what works for free/no-cost mode:
  - intake preview
  - local parser mapping
  - OpenAI mapping only when key/quota is available
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
- OpenAI quota/key issues degrade gracefully with clear message.

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
  3. Coverage: public detail filled/empty + uploaded file coverage
  4. Field mapping/diff
  5. Review action
  6. History/carry-over details collapsed
- Mobile-friendly, especially small screens.
- Keep copy simple for non-technical users.

Specific suggestions:

- Convert long panels into compact sections/accordion.
- Show top summary first:
  - file read status
  - mapped field count
  - fields covered from public detail
  - empty fields still missing
  - validation result
  - diff count
  - next action
- Move technical parser/AI details to collapsed section.
- Keep history panel compact or below main task.
- Highlight only action buttons that matter.

Acceptance:

- UI feels less heavy and less scattered.
- Owner can complete the flow without reading too much technical text.
- No user-facing behavior regression.

---

## Workstream E - OpenAI Vision/File Input + Dynamic Mapping Adapter

Owner requires the system to handle uploaded photo/scanned document content and infer what data it may contain.

OCR local is not required as the primary path.

Required:

1. Add OpenAI-assisted mapping adapter if feasible.
2. Use OpenAI for image/photo/scanned document or when local parser confidence is low.
3. AI must return structured JSON, not prose-only text.
4. The JSON should support:
   - known publishable fields,
   - detected fields that match public detail sections but are not publishable yet,
   - unknown but potentially useful fields,
   - evidence snippets/page/section references when possible,
   - confidence,
   - warnings/limitations.
5. If OpenAI key is missing, quota is exhausted, or rate limit/error occurs:
   - return clear UI message,
   - do not crash,
   - keep local parser/manual paste flow usable,
   - document exact limitation in report.
6. Use current heuristic mapping as fallback.
7. Do not add paid AI service dependency beyond OpenAI API usage controlled by env key.

Suggested structured output shape:

```json
{
  "documentType": "profil_desa | anggaran | perangkat_desa | fasilitas | potensi | kontak | unknown",
  "confidence": "low | medium | high",
  "knownFields": {
    "websiteUrl": "https://contoh.desa.id",
    "jumlahPenduduk": 2450,
    "tahunData": 2024
  },
  "detectedButNotPublishable": [
    {
      "section": "Perangkat Desa",
      "label": "Nama Kepala Desa",
      "value": "...",
      "reason": "Model/publish mapping belum aktif"
    }
  ],
  "unknownFields": [
    {
      "label": "...",
      "value": "...",
      "possibleCategory": "..."
    }
  ],
  "warnings": ["..."]
}
```

Acceptance:

- Image/scanned input can attempt OpenAI mapping if configured.
- AI mapping output is dynamic and reviewable.
- Missing/limited OpenAI availability is handled honestly.
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
- OpenAI dynamic mapping result
- OpenAI unavailable/quota/rate-limit fallback behavior
- no-cost mode clarification
- public source check result
- QA result
- owner test checklist update
- short report for Rangga and owner in copy-paste format

## Hard Guardrails

Do not:

- auto-publish parser/OpenAI/admin-desa output,
- publish unsupported detected fields into the wrong model,
- use dummy data as real public data,
- apply shared/production DB migration without owner approval,
- require paid Supabase feature for owner testing,
- require OpenAI to be available for the whole intake flow,
- log sensitive document content, full prompt/response, token, DB URL, storage key, email, or raw sensitive identifiers.

## Owner Test Checklist Required

Final output must tell owner:

- page/route to open,
- file types to test,
- image/scanned doc behavior,
- OpenAI available behavior,
- OpenAI unavailable/quota/rate-limit behavior,
- what fields should appear,
- how to verify public-detail coverage and empty fields,
- how to verify diff,
- how to submit to review,
- what must not happen,
- screenshots/logs to send back.
