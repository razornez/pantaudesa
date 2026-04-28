# Rangga Owner Visual Pass — Navigation and Citizen Journey Cleanup

Date: 2026-04-28
Prepared-by: Rangga / PM-BA / Product-UX Review
Review type: Final visual-validation checklist before tracker acceptance
Status: OWNER_VISUAL_PASS_READY_FOR_TRACKER_ACCEPTANCE

## Iwan decision received

Status from Iwan: **LANJUT KE OWNER VISUAL PASS**

No blocking rework for Ujang at this stage.

Rules followed in this review:

- No instruction to Ujang.
- No new gate opened.
- No tracker update to final `ACCEPTED`.
- No code changes.
- No seed/read path/schema/DB/API/Prisma/scraper/numeric extraction work.

## Batch reviewed

Batch name: Navigation and Citizen Journey Cleanup

Implementation commit reviewed previously:

- `0d104899284ae632f6d82023fa30fdc367cea1c2` — Navigation and Citizen Journey Cleanup batch

Implementation report:

- `docs/product/25-navigation-citizen-journey-batch-report.md`

Rangga review:

- `docs/product/26-rangga-navigation-citizen-journey-batch-review.md`

## Validation basis

This validation is based on current source files, batch report, and previous Rangga review.

Checked files:

- `src/components/home/HeroSection.tsx`
- `src/app/desa/page.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/app/suara-warga/page.tsx`
- `src/app/suara/page.tsx`
- `src/lib/copy.ts`

Note: Rangga did not execute a live localhost browser screenshot pass from this environment. The checklist below validates the implementation/copy/route structure and is ready for Iwan/Owner final confirmation.

## Final visual validation checklist

| # | Checklist item | Result | Rangga note |
|---:|---|---|---|
| 1 | Homepage: first instinct user adalah search desa. | PASS | Hero now places a direct search form before the secondary CTA. The input is visually primary with white field, search icon, and submit button. |
| 2 | Homepage: `Cara Membaca Data` terasa secondary, tidak bersaing dengan search. | PASS | Secondary CTA is now a lower-emphasis anchor to `#alur-warga` using translucent/outlined treatment, while search uses the stronger white form/button treatment. |
| 3 | Data Desa: search from homepage masuk ke `/desa?cari=...` dan text search ter-prefill. | PASS | Homepage submit pushes to `/desa?cari=${encodeURIComponent(query)}`. Data Desa initializes search state from `window.location.search.get("cari")`. |
| 4 | Navbar: `Cari Desa` terasa natural sebagai main citizen entry. | PASS | Navbar label changed from `Data Desa` to `Cari Desa`, which better matches the citizen-first journey. |
| 5 | Detail `/desa/4`: CTA `Lihat Dokumen` dan `Cara Membaca Data` jelas sebagai next step. | PASS | Detail first view presents `Lihat Dokumen` as primary CTA to `#dokumen-desa` and `Cara Membaca Data` as secondary CTA to `#status-data`. |
| 6 | `/suara-warga`: page load dan terasa intentional, bukan broken/duplicate aneh. | PASS | `/suara-warga/page.tsx` intentionally re-exports the existing Suara Warga page. Navbar now points to `/suara-warga`. |
| 7 | `/suara`: legacy route tetap aman. | PASS | Existing `/suara/page.tsx` remains the source page and was not removed. Legacy route continues to resolve safely. |
| 8 | Suara Warga loading state terasa intentional, bukan stuck. | PASS | Loading state now has spinner, label `Memuat suara warga...`, and explanatory microcopy telling users what is happening and what comes next if empty. |
| 9 | Suara Warga empty state copy terasa hangat, aman, dan tidak seperti formal report. | PASS | Empty copy says `Belum ada suara warga yang bisa ditampilkan.` and `Jadilah warga pertama yang membagikan kondisi desamu.` CTA uses `Ceritakan Kondisi Desaku`. Tone is warm and non-formal-report. |
| 10 | Demo/status framing tidak membuat data terlihat official/verified. | PASS | Detail first view and status section show `Data Demo` and explicit copy that this is not official final data. `Terverifikasi` is not activated. |

## Minor copy note

`Cari Desamu Sekarang` is **not a blocker**.

Rangga recommendation:

- Keep it for this acceptance if Owner likes the campaign/action tone.
- If Owner wants stricter canonical consistency later, use a tiny copy-only rework to change it to exact `Cari Desa`.

Do not block this batch for that wording.

## Boundary confirmation

No evidence that this batch opened or changed:

- seed execution,
- read path switch,
- schema/DB/API/Prisma,
- scraper/import,
- numeric APBDes extraction,
- active `Terverifikasi`,
- Risk Radar,
- Score Orb,
- new dependency,
- advanced dataviz.

Existing loading spinner behavior remains part of the loading state; this review does not open a new animation/micro-interaction gate.

## Recommended report back to Iwan

Verdict:

`OWNER_VISUAL_PASS_READY_FOR_TRACKER_ACCEPTANCE`

Recommended next Iwan action:

Approve Rangga to update tracker for these IDs to `ACCEPTED`:

- `JOURNEY-01`
- `JOURNEY-02`
- `JOURNEY-03`
- `JOURNEY-04`
- `VOICE-01`
- `VOICE-02`
- `VOICE-03`
- `VOICE-04`
- `TEST-01`
- `TEST-02`

Until Iwan gives explicit tracker-update approval, do not change tracker status.

## Final verdict

`OWNER_VISUAL_PASS_READY_FOR_TRACKER_ACCEPTANCE`

Rangga recommendation: Iwan can now approve tracker acceptance for the listed IDs. No Ujang rework required at this stage.
