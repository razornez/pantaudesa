# Data Desa Card Density Report

Date: 2026-04-28
Status: DONE_PENDING_REVIEW
Executed-by: Ujang

## Tracker IDs Addressed

- DATA-DESA-01
- DATA-DESA-02
- DATA-DESA-03
- DATA-DESA-04
- DATA-DESA-05
- DATA-DESA-06
- DATA-DESA-07

## Affected Pages / Routes

- http://localhost:3000/desa

No homepage code was changed.

## Files / Components Changed

- `src/components/desa/DesaCard.tsx`
- `docs/product/22-data-desa-card-density-report.md`

## Before Card Hierarchy

1. Row 1 mixed village name, location, and status badge.
2. Row 2 showed progress/serapan.
3. Row 3 showed two budget numbers.
4. Row 4 showed population, category, and arrow.

## After Card Hierarchy

1. Row 1: village name + status badge only.
2. Row 2: location as `kecamatan / kabupaten / provinsi`.
3. Row 3: progress/serapan with compact `Data Demo` badge near the metric.
4. Row 4: only two main numbers: `Diterima` and `Dipakai`.

## Hidden / Moved / Lowered

- Hidden from card first view:
  - population / `jumlah jiwa`
  - category / `kategori`
  - extra footer arrow
- Location was moved out of row 1 and expanded to include province.
- Demo status context was kept near progress using `DataStatusBadge`.

## What Reviewers Should Check

- Open http://localhost:3000/desa on desktop and mobile.
- Confirm each card scans as name + status first.
- Confirm location is readable but secondary.
- Confirm progress is the only visual metric row.
- Confirm only two numbers appear in the card: `Diterima` and `Dipakai`.
- Confirm population/category are no longer crowding the card first view.
- Confirm cards remain clickable and keyboard focus still works.
- Confirm the compact `Data Demo` badge does not make the card feel crowded.

## QA Commands

- `npx tsc --noEmit` - PASS
- `npm run test` - PASS after sandbox escalation for Vitest/esbuild spawn; 42/42 tests passed
- `npx eslint src/components/desa/DesaCard.tsx` - PASS
- `npm run lint` - FAIL due existing unrelated lint debt outside this gate:
  - `src/app/desa-admin/dokumen/page.tsx`
  - `src/components/desa/SuaraWargaSection.tsx`
  - `src/components/ui/OtpInput.tsx`
  - `src/components/ui/PinInput.tsx`
  - `src/lib/use-countdown.ts`

Route check:

- `http://localhost:3000/desa` SSR contains `Data Demo`, `Diterima`, and `Dipakai`.
- `http://localhost:3000/desa` SSR no longer contains `jiwa` in the card/list HTML.
- `http://localhost:3000/desa` SSR does not contain active `Data terverifikasi` copy.

## Known Risks

- Province can wrap to two lines for long locations. This is intentional to keep the full location visible without adding more metadata.
- The table view is unchanged; this gate only updates card density.
- Full repo lint may still fail due existing unrelated lint debt outside this gate.

## Confirmation

- No seed/read path/schema/DB/API/Prisma/scraper changes.
- No new dependency.
- No active `Terverifikasi` state.
- No numeric APBDes extraction.
- No Risk Radar.
- No Score Orb.
- No animation/micro-interactions.
- No CTA journey work.
