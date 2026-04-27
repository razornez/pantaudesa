# Homepage UI Task 1 Implementation Report

Date: 2026-04-27
Owner instruction: Sprint 04A UI-only Task 1
Commit: to be reported after commit

## Scope Completed

- Reordered homepage so the priority/ranking hook appears immediately after `HeroSection`.
- Kept the current `HeroSection` visual direction and mock-data fallback.
- Reframed alert/ranking language from accusatory wording to civic-safe wording:
  - `Prioritas Cek Transparansi`
  - `Perlu Ditinjau`
  - `perlu dicek`
  - `bukan penilaian final`
- Reduced chart/donut prominence by moving charts below the priority section and presenting them as supporting context.
- Kept implementation to existing Tailwind, existing components, and `lucide-react`.

## Changed Files

- `src/app/page.tsx`
- `src/components/home/AlertDiniSection.tsx`
- `src/components/home/DesaLeaderboard.tsx`
- `src/components/home/StatsCards.tsx`
- `src/components/home/TopDesaRanking.tsx`
- `src/lib/copy.ts`
- `docs/product/05-homepage-ui-task-1-implementation-report.md`

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
- `git diff --check`: pass; only CRLF conversion warnings reported by Git.

## Guardrails

- No schema, DB, Prisma, migration, or seed changes.
- No seed execution.
- No read path switch.
- No API, auth, voice, scheduler, scraper, or data automation changes.
- Numeric APBDes policy unchanged.

## Blockers

- No blocker for Sprint 04A Task 1.
- Lint remains blocked by existing project debt unrelated to these homepage UI-only changes.

## Follow-Up Prompt For Iwan

Iwan, Sprint 04A UI-only Task 1 sudah selesai. Tolong review homepage framing: apakah urutan Hero -> Prioritas Cek Transparansi -> Pondasi -> stats -> grafik pendukung sudah cocok, dan apakah copy “perlu dicek/perlu ditinjau” sudah cukup civic-safe. Seed/read path/schema/DB/API tidak disentuh.
