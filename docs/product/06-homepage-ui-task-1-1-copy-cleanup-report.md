# Homepage UI Task 1.1 Copy Cleanup Report

Date: 2026-04-27
Owner instruction: Sprint 04A Task 1 accepted with minor copy cleanup
Commit: to be reported after commit

## Scope Completed

- Changed stats section title from `Kondisi Anggaran Desa Se-Indonesia` to `Apa yang Sedang Dipetakan?`.
- Changed ranking copy from `Desa Paling Rajin` to `Desa dengan Capaian Tinggi`.
- Added a small `Data demo` badge in the homepage priority/ranking section.
- Updated the priority helper note so percentage numbers are clearly not final or verified facts.
- Kept Task 1 ordering: Hero -> Prioritas Cek Transparansi -> Pondasi -> stats -> grafik pendukung.

## Changed Files

- `src/app/page.tsx`
- `src/lib/copy.ts`
- `docs/product/06-homepage-ui-task-1-1-copy-cleanup-report.md`

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

- No new section added.
- No CitizenJourneySection, DataStatusCardsSection, DocumentDeskSection implementation.
- No PondasiTransparansiSection refactor.
- No schema, DB, Prisma, migration, seed, or read path changes.
- No API, auth, voice, scheduler, scraper, or data automation changes.
- No dependency added.

## Follow-Up Prompt For Iwan

Iwan, Sprint 04A Task 1.1 minor copy cleanup sudah selesai. Tolong cek apakah title `Apa yang Sedang Dipetakan?`, label `Desa dengan Capaian Tinggi`, dan badge/helper `Data demo` di area prioritas sudah cukup jelas agar angka persentase tidak terbaca sebagai fakta final/verified.
