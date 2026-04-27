# Homepage UI Task 3 Civic Narrative Report

Date: 2026-04-27
Owner instruction: Sprint 04A UI-only Task 3
Commit: to be reported after commit

## Scope Completed

- Refreshed `PondasiTransparansiSection` into the `Bukan Menuduh, Tapi Membaca` concept.
- Used the approved narrative: `Memantau bukan berarti menuduh. PantauDesa membantu warga membaca informasi publik desa berdasarkan sumber dan status data yang jelas.`
- Added three simple civic cards:
  - `Baca sumbernya`
  - `Pahami statusnya`
  - `Tanya pihak yang tepat`
- Refreshed the final CTA into a before/after citizen story:
  - before: warga membuka banyak website dan bingung dokumen mana yang terbaru
  - after: PantauDesa merapikan sumber, dokumen, dan status
- Kept existing Tailwind and `lucide-react` only.

## Changed Files

- `src/app/page.tsx`
- `src/components/home/PondasiTransparansiSection.tsx`
- `docs/product/08-homepage-ui-task-3-civic-narrative-report.md`

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
- No desa detail or APBDes detail implementation.
- Numeric APBDes policy unchanged.
- No additional major homepage section added beyond refreshing the existing civic narrative and final CTA.

## Blockers

- No blocker for Sprint 04A Task 3.
- Lint remains blocked by existing project debt unrelated to this UI-only narrative/CTA change.

## Follow-Up Prompt For Iwan

Iwan, Sprint 04A Task 3 civic narrative dan final CTA sudah selesai. Tolong review apakah konsep `Bukan Menuduh, Tapi Membaca`, tiga kartu civic, dan CTA before/after sudah membuat homepage lebih jelas tanpa terasa terlalu ramai. Data layer tidak disentuh.
