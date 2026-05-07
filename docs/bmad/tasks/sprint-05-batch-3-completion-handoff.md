# Sprint 05 Batch 3 Completion Handoff

## Status
READY FOR UJANG EXECUTION.

## Purpose

This is the single handoff task for completing all remaining Sprint 05 Batch 3 work before Batch 4.

Ujang should read and execute this file. Do not rely on long chat instructions.

## Required Source Documents

Read these first:

```text
docs/bmad/tasks/sprint-05-batch-3-versioning-intake-mapping-review.md
docs/bmad/tasks/sprint-05-batch-3-fix-pack-before-batch-4.md
docs/bmad/tasks/sprint-05-data-desa-flexible-model-and-detail-template.md
docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md
```

## Owner Context

Owner wants Sprint 05 Batch 3 completed before Batch 4.

The target is not docs-only. The target is owner-test-ready MVP for:

```text
upload / paste / file / photo / document
-> local extract or OpenAI dynamic read
-> mapping draft
-> coverage against public village detail fields
-> validation
-> diff
-> internal admin review
-> publish only after explicit review
```

## Important Environment Context

Owner has already configured this env in local and Vercel:

```text
OPENAI_API_KEY
```

Use it server-side only.

Do not hardcode, log, print, expose, or commit the key.

If OpenAI is unavailable, quota-limited, rate-limited, or missing in any environment, the app must degrade gracefully to local parser/manual paste with a clear message.

## Required Work

### 1. Fix Diff Engine

File:

```text
src/lib/intake/diff-engine.ts
```

Problem:
Current scalar diff cannot be fully trusted.

Required fix:

- Do not rely on jsondiffpatch root array interpretation for scalar fields.
- Use manual scalar compare:
  - previous equals next -> `unchanged`
  - previous empty and next filled -> `added`
  - previous filled and next empty -> `removed`
  - otherwise -> `updated`
- Keep output shape stable for existing UI.
- Document smoke test or add helper test if test pattern exists.

Acceptance:

- Diff correctly shows field changes in intake/review UI.

---

### 2. Align Intake Mapping With Public Village Detail

Problem:
Current intake mapping covers too few fields compared to the public village detail page.

Required:

- Inspect current public village detail implementation and data used there.
- Create field coverage matrix in the Batch 3 report:
  - public detail section
  - field label/key
  - current model/source
  - current value filled/empty when desa is selected
  - currently mappable yes/no
  - AI-detectable yes/no
  - publishable now yes/no
  - deferred reason if not publishable
  - source requirement
  - validation requirement
- Intake review UI must show:
  - fields already filled
  - fields still empty
  - fields covered by uploaded document
  - fields detected but not yet publishable
  - unknown useful fields
- Do not force unsupported fields into the wrong table/model.
- Do not fake data.
- Do not use dummy data as real data.

Acceptance:

- Owner can see which detail-page fields the upload covers and which are still missing.

---

### 3. Implement/Document Flexible `DataDesa` + `DetailFieldStandard` Direction

Read:

```text
docs/bmad/tasks/sprint-05-data-desa-flexible-model-and-detail-template.md
```

Architecture direction:

- `Desa` remains stable identity/core table.
- `DataDesa` becomes one-to-many flexible village data layer.
- `DetailFieldStandard` becomes the registry/standard for current public village detail page fields.
- If public detail layout changes, update `DetailFieldStandard`, not hardcode every field into `Desa`.
- OpenAI mapping must be template-aware.
- Review UI should eventually preview mapping using a layout similar to the public detail page.

Output required:

- ERD/proposal or migration-ready design.
- Mapping of current public detail page fields to `DetailFieldStandard` candidates.
- Mark fields as publishable now, detected-but-not-publishable, or future support.
- Migration may be draft/proposal only.
- Do not apply shared/production migration without owner approval.

Acceptance:

- Flexible data model direction is clear enough for implementation planning.

---

### 4. Compact UI / Quiet Luxury Cleanup

Owner feedback:
Current intake/review UI is too bulky, scattered, and tiring.

Required UI direction:

- More compact layout.
- Reduce oversized cards.
- Remove repeated summaries.
- Make flow linear:
  1. Input
  2. Result summary
  3. Detail field coverage
  4. Mapping/diff
  5. Review action
  6. Technical/history details collapsed
- Move parser/OpenAI technical detail into accordion/collapsed section.
- Keep history compact.
- Make main action obvious.
- Simple copywriting for non-technical users.
- Mobile-friendly, especially iPhone 12 mini.

Acceptance:

- Owner can complete the intake/review flow without reading too much technical text.
- UI feels lighter, less scattered, and more efficient.

---

### 5. Implement OpenAI Dynamic Mapping Path

OpenAI is preferred for image/photo/scanned document/difficult document understanding.

Local OCR is not the primary direction.

Required:

- Use `OPENAI_API_KEY` from env, server-side only.
- Local parser remains first-pass for TXT/DOCX/XLSX/PDF text/CSV.
- Use OpenAI when:
  - input is image/photo/scanned document,
  - PDF/local extraction fails or is weak,
  - user explicitly chooses AI mapping,
  - heuristic mapping confidence is low.
- OpenAI response must be structured JSON, not prose only.
- Do not log full prompt/response.
- Do not log sensitive document content.
- AI output must be draft-only.
- Internal admin remains final reviewer.
- No auto-publish.

Suggested response categories:

```text
knownPublishableFields
detectedButNotPublishable
unknownUsefulFields
confidence
warnings
evidence/snippet/sourceReference if safe
```

If OpenAI unavailable/missing/quota-limited/rate-limited:

- return clear UI message,
- fallback to local parser/manual paste,
- do not crash,
- do not publish anything.

Acceptance:

- Owner can test OpenAI mapping when env is present.
- Owner can see honest fallback if OpenAI fails.

---

### 6. Dynamic Mapping Must Be Flexible

Do not limit AI mapping to only the old small allowlist:

```text
websiteUrl
kategori
tahunData
jumlahPenduduk
kecamatan
kabupaten
provinsi
```

AI may detect raw village data such as:

- kepala desa
- perangkat desa
- anggaran
- BLT
- fasilitas
- potensi
- kontak
- dokumen publik
- alamat/kanal resmi
- other relevant village facts

But classify output into:

1. known publishable fields,
2. detected but not yet publishable,
3. unknown useful fields.

Unsupported fields must not be published to the wrong model.

---

### 7. Keep No-Cost / Free Mode Working

Owner does not want paid Supabase or paid infrastructure just to test Batch 3.

Required:

- Do not require Supabase paid branch.
- Do not apply shared/production migration without owner approval.
- Fallback versioning/audit must remain honest and safe.
- UI/report must clearly say dedicated tables are inactive when fallback is used.
- OpenAI may be used because env is now available, but local parser/manual paste must still work when OpenAI errors/quota/rate-limit happens.

Acceptance:

- Owner can test with current DB/env without paid Supabase feature.

---

### 8. Public Source Availability Check

Perform a small bounded public-source availability check.

Prioritize:

- SID Kemendesa IDM
- SID Kemendesa Profil
- Satu Data Indonesia Jumlah Penduduk Desa
- SID Dana Desa

Rules:

- public non-login only,
- no BNBA/personal/restricted data,
- no aggressive scraping,
- no public publishing of source sample data,
- document fields found, access method, limitation, and future adapter fit.

Acceptance:

- Batch 3 report states what was checked and what data shape was found.

---

### 9. Close Batch 1/2 Carry-over If Still Open

Ensure these are done or document exact blocker:

- Prisma duration unit in `src/lib/perf.ts` uses `Math.round(event.duration)`.
- Mapping timers in `src/lib/data/desa-read.ts` and `src/lib/data/voice-read.ts` are not misleading.
- Batch 1 report includes owner manual test numbers:
  - `/desa` routeDataReady about `1235ms`
  - `/desa/[id]` routeDataReady about `2169ms`
  - `/suara-warga` routeDataReady about `1281ms`
- Batch 2 report has QA section.

---

### 10. Update Batch 3 Report

Update:

```text
docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md
```

Must include:

- fixes completed,
- diff engine fix,
- fields added/deferred,
- `DataDesa` + `DetailFieldStandard` proposal/status,
- OpenAI dynamic mapping result,
- OpenAI unavailable/quota/rate-limit fallback behavior,
- UI cleanup summary,
- no-cost/free mode clarification,
- public source check result,
- QA result,
- guardrails respected,
- owner test checklist,
- short report for Rangga and owner in copy-paste format.

## Hard Guardrails

Do not:

- auto-publish parser/OpenAI/admin-desa output,
- bypass auth/permission,
- apply shared/production DB migration without owner approval,
- require paid Supabase,
- publish unsupported detected fields to the wrong model,
- use dummy data as real data,
- log sensitive document content,
- log full prompt/response,
- log token, DB URL, storage key, email, API key, or raw sensitive identifiers,
- commit `.env` or `.env.local`,
- change production env from code.

## QA Required

Run and report:

```bash
npm run lint
npx tsc --noEmit
npx prisma generate
npm run build
```

If Prisma Windows EPERM persists:

- write the exact error,
- state whether lint/tsc pass,
- do not hide the blocker.

## Final Output Required From Ujang

Return a short report containing:

1. branch,
2. commit SHA,
3. files changed,
4. summary of changes,
5. what was fixed from Batch 3,
6. remaining carry-over if any,
7. OpenAI mapping status,
8. `DataDesa` / `DetailFieldStandard` status,
9. QA result,
10. guardrails respected,
11. owner test checklist:
    - route/page to open,
    - file types to test,
    - photo/scanned document behavior,
    - OpenAI available behavior,
    - OpenAI unavailable/quota/rate-limit behavior,
    - how to check detail field coverage,
    - how to check filled/empty fields,
    - how to check detected-but-not-publishable fields,
    - how to check diff,
    - how to submit to review,
    - what must not happen,
    - screenshots/logs owner should send back,
12. short report for Rangga and owner in copy-paste format.

## Final Acceptance

Batch 3 is not complete until this handoff task is complete or any remaining blocker is explicitly documented with a concrete next action.
