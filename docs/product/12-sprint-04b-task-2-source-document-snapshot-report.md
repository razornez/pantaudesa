# Sprint 04B Task 2 Source Document Snapshot Report

Date: 2026-04-27
Owner instruction: Sprint 04B UI-only Task 2
Commit: reported in final handoff after commit

## Scope Completed

- Added a source/document snapshot section on the desa detail page.
- Added four citizen-friendly snapshot cards:
  - Website desa
  - Halaman kecamatan
  - Dokumen APBDes/Realisasi
  - Status review
- Improved the curiosity hook into a separate `Kenapa desa ini perlu dibaca?` panel.
- Kept raw URLs out of the first guided reading flow.
- Used existing mock/current detail props only.

## Changed Files

- `src/app/desa/[id]/page.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/components/desa/SourceDocumentSnapshotSection.tsx`
- `docs/product/12-sprint-04b-task-2-source-document-snapshot-report.md`

## Snapshot Cards

- `Website desa`: shows `Sumber ditemukan` when a website exists, otherwise `Belum tercatat`.
- `Halaman kecamatan`: shown as `Belum tercatat` because no kecamatan source field exists in current mock props.
- `Dokumen APBDes/Realisasi`: checks existing document names and availability, then frames documents as references only.
- `Status review`: shown as `Perlu review` and reminds that sources/documents need checking before becoming official references.

## Curiosity Hook Changes

- Moved the small Task 1 curiosity hook out of the first-view component.
- Added a fuller panel with three safe reasons:
  - public sources can help citizens understand village information,
  - documents should be read before concluding numbers,
  - incomplete information should lead citizens to ask the right party.
- Copy avoids accusatory wording and avoids verified claims.

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
- `git diff --check`: pass.

## Guardrails

- No dependency added.
- No schema, DB, Prisma, migration, seed, or read path changes.
- No seed execution.
- No API, auth, voice, scheduler, scraper, or data automation changes.
- No numeric APBDes extraction.
- No verified claims.
- No raw URL list shown as main content.
- No scraper/import UI or admin verification workflow.

## Blockers

- No blocker for Sprint 04B Task 2.
- Lint remains blocked by existing project debt unrelated to this UI-only source/document snapshot change.

## Follow-Up Prompt For Iwan

Iwan, Sprint 04B Task 2 source/document snapshot sudah selesai. Tolong review apakah kartu Website desa, Halaman kecamatan, Dokumen APBDes/Realisasi, dan Status review sudah cukup jelas untuk warga biasa, tidak terasa menuduh, dan tidak membuat data demo terbaca sebagai final/verified.
