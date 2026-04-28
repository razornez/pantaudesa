# Navigation and Citizen Journey Cleanup Batch Report

Batch name: Navigation and Citizen Journey Cleanup

Date: 2026-04-28
Status: DONE_PENDING_REVIEW
Executed-by: Ujang

## Tracker IDs Addressed

- JOURNEY-01
- JOURNEY-02
- JOURNEY-03
- JOURNEY-04
- VOICE-01
- VOICE-02
- VOICE-03
- VOICE-04
- TEST-01
- TEST-02

## Affected Pages / Routes

- http://localhost:3000/
- http://localhost:3000/desa
- http://localhost:3000/suara-warga
- http://localhost:3000/suara
- http://localhost:3000/desa/4

## Files / Components Changed

- `src/components/home/HeroSection.tsx`
- `src/components/home/CitizenJourneySection.tsx`
- `src/components/layout/Navbar.tsx`
- `src/app/desa/page.tsx`
- `src/app/suara/page.tsx`
- `src/app/suara-warga/page.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/lib/copy.ts`
- `docs/product/25-navigation-citizen-journey-batch-report.md`

## What Changed Per Tracker ID

- JOURNEY-01: Homepage first action now centers on searching for a village.
- JOURNEY-02: Main CTA language was aligned around `Cari Desa`, `Lihat Dokumen`, `Cara Membaca Data`, and `Ceritakan Kondisi Desaku`.
- JOURNEY-03: Homepage hero now includes a prominent search input with placeholder `Ketik nama desa, kecamatan, atau kabupaten`.
- JOURNEY-04: Citizen journey section now states the intended path: cari desa, lihat status data, baca sumber/dokumen, lalu tanya atau sampaikan suara warga.
- VOICE-01: Suara Warga hero copy now frames posts as citizen stories/questions, not formal proof.
- VOICE-02: Suara Warga loading state explains that stories are being loaded and avoids looking stuck.
- VOICE-03: Empty/no-visible-voice state now says `Belum ada suara warga yang bisa ditampilkan. Jadilah warga pertama yang membagikan kondisi desamu.`
- VOICE-04: Voice CTA now uses `Ceritakan Kondisi Desaku`.
- TEST-01: Added test note below for first-click validation.
- TEST-02: Added test note below for data-status comprehension validation.

## What Reviewers Should Check

- On homepage, the first obvious action should be searching for a village.
- Secondary homepage CTA should feel secondary and point to journey explanation, not compete with search.
- Navbar should make `Cari Desa` clearer as the main citizen entry.
- Search from homepage should land on `/desa?cari=...` and prefill the Data Desa search.
- Detail CTA labels should read as consistent citizen journey steps.
- `/suara-warga` should load the Suara Warga page.
- Suara Warga empty/loading states should feel intentional, not broken.
- Demo/status context should not look official or verified.

## QA Commands

- `npx tsc --noEmit` - PASS
- `npm run test` - PASS after sandbox escalation for Vitest/esbuild spawn; 42/42 tests passed
- `npx eslint src/components/home/HeroSection.tsx src/components/home/CitizenJourneySection.tsx src/components/layout/Navbar.tsx src/app/desa/page.tsx src/app/suara/page.tsx src/app/suara-warga/page.tsx src/components/desa/DesaDetailFirstView.tsx 'src/app/desa/[id]/page.tsx' src/lib/copy.ts` - PASS
- `npm run lint` - FAIL due existing unrelated lint debt outside this gate:
  - `src/app/desa-admin/dokumen/page.tsx`
  - `src/components/desa/SuaraWargaSection.tsx`
  - `src/components/ui/OtpInput.tsx`
  - `src/components/ui/PinInput.tsx`
  - `src/lib/use-countdown.ts`
  - plus unused-var warnings in existing admin/bandingkan/support components

## Screenshots Or Notes

- Route checks returned 200 for:
  - http://localhost:3000/
  - http://localhost:3000/desa
  - http://localhost:3000/suara-warga
  - http://localhost:3000/suara
- Homepage SSR contains the new search placeholder, `Cari Desamu Sekarang`, and the journey explanation.
- Data Desa SSR contains the new search placeholder and existing `Data Demo` context.
- Suara Warga SSR contains `Suara Warga`, `Ceritakan Kondisi Desaku`, and safer non-formal-report copy.
- TEST-01 first-click prompt: `Kamu ingin cek penggunaan anggaran desamu. Klik pertama ke mana?`
- TEST-01 success expectation: most users choose homepage search or `Cari Desa` / Data Desa.
- TEST-02 comprehension prompt: `Apakah status data ini resmi, demo, atau perlu review?`
- TEST-02 success expectation: user understands `Data Demo` / `Perlu Review` and does not treat demo data as official.

## Known Risks

- `/suara-warga` is added as a route alias while legacy `/suara` remains available, so old links still work.
- Homepage search prefill reads the `cari` query on the client only; it does not change data fetching or read path.
- Existing homepage visual animation remains untouched; this batch did not add new animation/micro-interactions.
- Full repo lint is still blocked by pre-existing lint debt outside this gate.

## Items Intentionally Left Untouched

- No seed/read path discussion.
- No schema/DB/API/Prisma/scraper work.
- No numeric APBDes extraction.
- No active `Terverifikasi` state.
- No Risk Radar.
- No Score Orb.
- No advanced dataviz.
- No Panduan/Bandingkan IA batch.
- No visual delight or new animation work.

## Confirmation

- No seed/read path/schema/DB/API/Prisma/scraper changes.
- No new dependency.
- No active `Terverifikasi` state.
- No numeric APBDes extraction.
- Status remains DONE_PENDING_REVIEW until Iwan/Rangga/Owner review.
