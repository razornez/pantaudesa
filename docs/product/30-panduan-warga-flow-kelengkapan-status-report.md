# Panduan Warga Flow and Kelengkapan Status Report

Date: 2026-04-28
Status: DONE_PENDING_REVIEW
Executed-by: Ujang
Requested-by: Iwan

## Scope

- Connected the detail-page citizen guidance blocks into one clearer `Panduan Warga` flow.
- Added reusable `DataStatusBadge` usage to `Kelengkapan Desa`.
- Kept the change UI-only and limited to the desa detail route.

## Affected Pages / Routes

- `http://localhost:3000/desa/4`

## Files / Components Changed

- `src/app/desa/[id]/page.tsx`
- `src/components/desa/KelengkapanDesa.tsx`
- `docs/product/30-panduan-warga-flow-kelengkapan-status-report.md`

## What Changed

- Added a compact four-step guide at the start of `Panduan Warga`:
  - `Pahami hak warga`
  - `Tanya pihak yang tepat`
  - `Cek sebelum melapor`
  - `Sampaikan suara warga`
- Kept `Hak Wargamu`, `Tanyakan ke pihak yang tepat`, `Tanggung Jawab`, `Cek Langkah Sebelum Melapor`, `Suara Warga`, and `Ada yang Ingin Ditanyakan?` in one connected section.
- Moved `Kelengkapan Desa` out of the citizen-guidance flow so it reads as secondary context before the guidance section.
- Added `<DataStatusBadge status="demo" />` to the `Kelengkapan Desa` header.
- Removed unused `Wheat` and `Trees` imports from `KelengkapanDesa`.

## What Reviewers Should Check

- `/desa/4`: `Panduan Warga` now reads like one guided flow, not disconnected cards.
- `/desa/4`: checklist and Pak Waspada CTA still point to `#pre-report-checklist`.
- `/desa/4`: `Kelengkapan Desa` shows a reusable `Data Demo` badge and does not imply official/final data.
- Mobile: four-step guide wraps cleanly and does not crowd the existing cards.

## QA Commands

- `npx tsc --noEmit` - PASS
- `npm run test` - PASS after sandbox escalation for Vitest/esbuild spawn; 42/42 tests passed
- `npx eslint 'src/app/desa/[id]/page.tsx' src/components/desa/KelengkapanDesa.tsx` - PASS
- `npm run lint` - FAIL due existing unrelated lint debt outside this batch:
  - `src/app/desa-admin/dokumen/page.tsx`
  - `src/components/desa/SuaraWargaSection.tsx`
  - `src/components/ui/OtpInput.tsx`
  - `src/components/ui/PinInput.tsx`
  - `src/lib/use-countdown.ts`
  - plus existing unused-var warnings in admin/support components

## Route Checks

- `http://localhost:3000/desa/4` - 200
- SSR content check contains `Baca hak warga, tanya pihak yang tepat`, `Pahami hak warga`, `Cek sebelum melapor`, `Kelengkapan Desa`, `Data Demo`, `Cek Langkah Sebelum Melapor`, and `Ceritakan Kondisi Desaku`.

## Known Risks

- The detail page remains long; this change improves the guidance flow without converting the page into tabs.
- `Kelengkapan Desa` still contains demo numeric examples, now explicitly marked with the reusable demo badge.

## Confirmation

- No seed/read path/schema/DB/API/Prisma/scraper changes.
- No new dependency.
- No active `Terverifikasi` state.
- No numeric APBDes extraction.
- No Risk Radar.
- No Score Orb.
- No advanced dataviz.
- No animation/micro-interactions.
- No data semantics changes.
