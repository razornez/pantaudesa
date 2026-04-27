# Sprint 04B Task 1 Detail First View Report

Date: 2026-04-27
Owner instruction: Sprint 04B UI-only Task 1
Commit: to be reported after commit

## Scope Completed

- Added a guided first view for desa detail through `DesaDetailFirstView`.
- Replaced the old first-fold hero/progress emphasis with an identity-first layout.
- Added `Yang perlu kamu tahu dulu` summary:
  - status data,
  - source availability,
  - document availability.
- Added a top data status banner using `Data demo` framing.
- Added safe civic framing: source, status, and documents first before any conclusion.
- Added a small curiosity hook: `Kenapa halaman ini perlu dibaca?`
- Kept all data from existing mock data and current detail page props.

## Changed Files

- `src/app/desa/[id]/page.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `docs/product/11-sprint-04b-task-1-detail-first-view-report.md`

## First-View Changes

- First 5 seconds now show:
  - desa name and location,
  - `Data demo` badge,
  - website/source availability,
  - document availability,
  - guidance that APBDes numbers are not final conclusions.
- Primary action links to the document area.
- Secondary action links to the status explanation banner.

## Data Status Handling

- Active status shown as `Data demo`.
- Copy states that this is not official/final data.
- Copy avoids verified claims and avoids accusatory terms.
- APBDes is framed as document/reference material, not final numeric conclusion.

## QA Results

- `npx tsc --noEmit`: pass.
- `npm run test`: initial sandbox run failed with `spawn EPERM` from esbuild; rerun outside sandbox passed, 3 test files and 42 tests passed.
- `npm run lint`: failed due existing lint debt outside this task scope:
  - `src/app/desa-admin/dokumen/page.tsx`
  - `src/components/desa/SuaraWargaSection.tsx`
  - `src/components/ui/OtpInput.tsx`
  - `src/components/ui/PinInput.tsx`
  - `src/lib/use-countdown.ts`
  - plus existing unused-var / unused-expression warnings.

## Guardrails

- No dependency added.
- No schema, DB, Prisma, migration, seed, or read path changes.
- No seed execution.
- No API, auth, voice, scheduler, scraper, or data automation changes.
- No desa detail/APBDes detail numeric extraction.
- No verified claims.
- No scraper/import UI or admin verification workflow.

## Blockers

- No blocker for Sprint 04B Task 1.
- Lint remains blocked by existing project debt unrelated to this UI-only detail first-view change.

## Follow-Up Prompt For Iwan

Iwan, Sprint 04B Task 1 detail first view sudah selesai. Tolong review apakah first fold detail desa sekarang lebih mudah dipahami warga biasa: identitas desa, status Data demo, sumber/dokumen tersedia, dan framing aman sudah terlihat dalam 5 detik. Data layer tidak disentuh.
