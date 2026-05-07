# Sprint 05 Batch 3 - Intake Page Owner Feedback Follow-up

## Status
READY FOR EXECUTION - owner feedback after refactor test.

## Context

Owner tested the refactored `/internal-admin/intake` page after the IntakeWorkbench split/refactor. Overall layout is now considered better, but there are functional/UX issues that must be fixed before Batch 3 is considered owner-test ready.

## Owner Feedback Summary

The page is now mostly acceptable visually, but these issues remain:

1. `Riwayat Intake` is empty and shows placeholder text.
2. `Riwayat Versi Desa` is empty and shows placeholder text.
3. Uploading an image while `Coba AI` is not checked still triggers OpenAI quota error:
   `Kuota OpenAI sedang habis. Parser lokal/manual paste tetap bisa dipakai.`
4. This OpenAI quota error is annoying and misleading when the user did not explicitly enable AI.

## Priority

This is a blocker before merging Batch 3 or moving to Batch 4.

## Required Fixes

### 1. Restore / Implement Intake History

Current issue:

```text
Riwayat akan dimuat dari API saat integrated.
```

This should not remain as an empty placeholder if history exists or can be loaded.

Required:

- Check whether existing intake history API/data exists.
- If API exists, wire `Riwayat Intake` to real data using the extracted hook/component.
- If API does not exist, hide the section by default or show a compact honest empty state only when useful.
- Do not show large empty sections that make the page feel unfinished.

Acceptance:

- `Riwayat Intake` either shows real recent intake items or is not visually noisy.
- Empty state must be short and useful.

### 2. Restore / Implement Desa Version History

Current issue:

```text
Riwayat versi untuk [desa] akan dimuat dari API saat integrated.
```

Required:

- Check whether fallback version history API/data exists from Batch 3.
- If available, wire `Riwayat Versi Desa` to real data.
- If dedicated version table is inactive, show clear fallback state:
  - no-cost mode active,
  - dedicated version history not active yet,
  - publish/review still works via existing flow.
- Keep this collapsed by default.
- Avoid large empty placeholders.

Acceptance:

- `Riwayat Versi Desa` is honest and not visually distracting.
- If no data exists, the UI does not look broken or unfinished.

### 3. Fix Image Upload Behavior When `Coba AI` Is Off

Current issue:

When user uploads an image but does not check `Coba AI`, app still triggers OpenAI and shows quota error.

Expected behavior:

- If `Coba AI` is OFF:
  - do not call OpenAI for image/photo input.
  - show local parser limitation message instead:
    `File gambar belum bisa dibaca tanpa bantuan AI. Aktifkan Coba AI atau gunakan DOCX, PDF teks, XLSX, CSV, TXT, atau tempel teks manual.`
  - do not show OpenAI quota/billing/rate-limit error.

- If `Coba AI` is ON:
  - call OpenAI when configured.
  - if quota/rate-limit occurs, show OpenAI error gracefully.
  - keep technical proof collapsed/internal, not as the main user-facing message.

Acceptance:

- OpenAI quota error only appears when AI was actually requested/attempted.
- Image without AI enabled shows a clear non-annoying limitation message.
- No crash.
- No auto-publish.

### 4. Improve Error Copy And Placement

Current error:

```text
Kuota OpenAI sedang habis. Parser lokal/manual paste tetap bisa dipakai.
```

Problems:

- It appears even when AI toggle is off.
- It feels too loud/annoying for a recoverable limitation.
- It appears in the main form area and interrupts the flow.

Required:

- Make message contextual:
  - image + AI off: explain AI is needed for image reading.
  - image + AI on + quota: explain AI service quota/limit is unavailable.
  - text/parser files: do not mention OpenAI unless AI was requested or attempted.
- Use calm copy.
- Put technical details in collapsed section only.

Suggested copy:

For image with AI off:

```text
Gambar belum bisa dibaca tanpa AI. Aktifkan Coba AI, atau gunakan dokumen teks/PDF teks/DOCX/XLSX/CSV/TXT.
```

For AI quota/rate-limit:

```text
AI sedang tidak tersedia karena kuota/limit. Gunakan dokumen teks atau tempel teks manual dulu.
```

## Guardrails

Do not:

- auto-publish from intake,
- call OpenAI unnecessarily when user did not enable AI,
- expose API key or full OpenAI response,
- log full prompt/document content,
- apply shared/production migration,
- add new product scope beyond fixing the page behavior.

## QA Required

Run and report:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If build is blocked by Prisma Windows EPERM, document it honestly.

## Owner Test Checklist

After fix, owner should test:

1. Open `/internal-admin/intake`.
2. Upload image with `Coba AI` OFF.
   - Expected: no OpenAI quota error.
   - Expected: clear message that image needs AI or text-based file/manual paste.
3. Upload image with `Coba AI` ON.
   - Expected: OpenAI attempted.
   - If quota blocked, show calm quota/limit message.
4. Upload DOCX/PDF text/XLSX/CSV/TXT.
   - Expected: local parser works without OpenAI quota error unless AI was explicitly enabled.
5. Select desa.
   - Check `Riwayat Intake` and `Riwayat Versi Desa` are either real data or compact honest empty/fallback state.
6. Confirm no auto-publish.
