# Guided Comparison, Trust Layer, and Detail Readability Report

Date: 2026-04-28
Status: DONE_PENDING_REVIEW
Executed-by: Ujang
Requested-by: Iwan

## Scope

This batch handles the direct Owner/Iwan notes for:

- Priority 7: guided comparison presets on `Bandingkan`.
- Priority 8: compact trust/methodology layer.
- Detail page readability: anchors, metric hierarchy, safer rights copy, and clearer scan grouping.
- Test recommendation notes for future validation.

## Affected Pages / Routes

- `http://localhost:3000/bandingkan`
- `http://localhost:3000/`
- `http://localhost:3000/desa/4`

## Files / Components Changed

- `src/app/bandingkan/page.tsx`
- `src/app/page.tsx`
- `src/components/home/DataProcessingTrustSection.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/components/desa/DetailSectionNav.tsx`
- `src/components/desa/SeharusnyaAdaSection.tsx`
- `src/lib/copy.ts`
- `docs/product/29-guided-comparison-trust-detail-readability-report.md`

## What Changed

### Priority 7 - Bandingkan lebih guided

- Added a preset comparison block under the two village pickers.
- Copy: `Tidak tahu mulai dari mana? Coba bandingkan:`
- Presets added:
  - `Serapan tertinggi vs terendah` - `Pura Harapan vs Sumber Rejeki`
  - `Kabupaten yang sama` - `Sumber Rejeki vs Mekar Sari`
  - `Status Perlu Ditinjau` - `Pura Harapan vs Pantai Indah`
- Preset buttons fill both selected villages directly, reducing blank-state friction.

### Priority 8 - Trust layer

- Added homepage section `Bagaimana data diproses?`
- The section explains:
  - sumber publik ditemukan,
  - dokumen diklasifikasi,
  - data ditandai statusnya,
  - review dilakukan,
  - warga membaca dengan konteks.
- Copy explicitly says demo/status context prevents data from being read as official final claims.

### Detail information overload

- Added `DetailSectionNav` after the first view.
- Anchor sections:
  - `Ringkasan`
  - `Anggaran`
  - `Dokumen & Transparansi`
  - `Panduan Warga`
- This gives mobile users a stable reading map without hiding content behind complex tabs.

### Detail metric hierarchy

- Added a compact hierarchy guide:
  - Primary: status data, total anggaran, serapan, dokumen tersedia.
  - Secondary: aset desa, skor keterbukaan, rincian sumber dana.
  - Tertiary: daftar aset, panduan kewenangan, jalur pelaporan.
- Existing source/document-before-budget hierarchy was preserved.

### Hak Wargamu safety copy

- Changed `Wajib menurut regulasi` to `Ada dasar regulasi`.
- Reworded group copy so it distinguishes:
  - hak warga,
  - dasar regulasi umum,
  - rencana APBDes demo,
  - need to check source documents before relying on claims.
- Converted one long header paragraph into two short bullets.

### Visual grouping

- Detail page now has clearer anchor groups while keeping existing component layout.
- `KelengkapanDesa` asset categories were already displayed as cards by type, so no extra rework was needed there.

## Already Present / Skipped

- Data Demo/status labels near important detail numbers were already present.
- External reporting CTA was already gated through the pre-report checklist.
- Asset category cards already existed in `KelengkapanDesa`.
- No new dashboard, chart, radar, score orb, animation, or data extraction was added.

## Test Recommendation Notes

- First-click test: `Kamu ingin cek penggunaan anggaran desamu. Klik pertama ke mana?`
  Success metric: >=80% click search or Data Desa.
- Status comprehension test: `Apakah data ini resmi, demo, atau perlu review?`
  Success metric: >=90% understand status data correctly.
- Mobile usability test: cari satu desa, filter provinsi, lalu buka detail.
  Success metric: task selesai <60 detik, error tap <2 kali.
- CTA A/B test:
  Variant A: `Cari Desamu Sekarang`
  Variant B: `Cek Anggaran Desaku`
  Success metric: click-through to Data Desa/search.
- Data interpretation test: `Menurut kamu, apakah angka di halaman ini resmi atau demo?`
  Success metric: minimal 90% answer demo/belum resmi.
- CTA safety test: `Setelah membaca halaman ini, apa langkah pertama yang akan kamu lakukan?`
  Success metric: majority choose cek dokumen/tanya desa first.
- Mobile scroll test: cari total anggaran, dokumen tersedia, dan cara melapor.
  Success metric: selesai <90 detik tanpa kebingungan.

## What Reviewers Should Check

- `/bandingkan`: preset buttons appear under the pickers and correctly select both villages.
- `/`: `Bagaimana data diproses?` appears as a trust layer, not a marketing claim.
- `/desa/4`: anchor links jump to the right sections and make long-scroll orientation easier.
- `/desa/4`: rights copy feels careful and does not overclaim.
- `/desa/4`: metric hierarchy guide helps separate primary, secondary, and tertiary numbers.
- Mobile: anchor buttons wrap cleanly and remain easy to tap.

## QA Commands

- `npx tsc --noEmit` - PASS
- `npm run test` - PASS after sandbox escalation for Vitest/esbuild spawn; 42/42 tests passed
- `npx eslint src/app/bandingkan/page.tsx src/app/page.tsx src/components/home/DataProcessingTrustSection.tsx 'src/app/desa/[id]/page.tsx' src/components/desa/DetailSectionNav.tsx src/components/desa/SeharusnyaAdaSection.tsx src/lib/copy.ts` - PASS
- `npm run lint` - FAIL due existing unrelated lint debt outside this batch:
  - `src/app/desa-admin/dokumen/page.tsx`
  - `src/components/desa/SuaraWargaSection.tsx`
  - `src/components/ui/OtpInput.tsx`
  - `src/components/ui/PinInput.tsx`
  - `src/lib/use-countdown.ts`
  - plus existing unused-var warnings in admin/support components

## Route Checks

- `http://localhost:3000/bandingkan` - 200; contains preset copy, `Pura Harapan vs Sumber Rejeki`, same-kabupaten preset, and `Status Perlu Ditinjau` preset.
- `http://localhost:3000/` - 200; contains `Bagaimana data diproses?`, `Sumber publik ditemukan`, and `Review dilakukan`.
- `http://localhost:3000/desa/4` - 200; contains `Ringkasan`, `Anggaran`, `Dokumen & Transparansi`, `Panduan Warga`, metric hierarchy copy, and safer rights copy.

## Known Risks

- Detail page still contains many sections. This batch adds guided anchors rather than fully converting the page into tabbed content.
- Preset comparisons use current demo data and should stay labeled as demo in the broader product context.
- Full repo lint may still fail due unrelated existing lint debt.

## Confirmation

- No seed/read path/schema/DB/API/Prisma/scraper changes.
- No new dependency.
- No active `Terverifikasi` state.
- No numeric APBDes extraction.
- No Risk Radar.
- No Score Orb.
- No advanced dataviz.
- No animation/micro-interactions.
- No Panduan/Bandingkan IA restructure beyond the requested `Bandingkan` preset guidance.
- No data semantics changes.
