# Ujang Detail Safety / Hierarchy Verification Report

Date: 2026-04-28
Status: DONE_PENDING_REVIEW
Affected route: http://localhost:3000/desa/4
Verifier: Ujang

## Summary

Asep handover was reviewed against the requested tracker IDs. Minimal rework was needed before verification could pass:

- `TanggungJawabSection` no longer exposes direct external reporting links before the pre-report checklist.
- Personal mobile contacts in the escalation guide are masked with office-channel placeholder copy.
- The Transparansi section now opens on the Dokumen tab before budget cards.
- Pre-report checklist item copy now matches the tracker wording exactly.
- One route-visible unsafe wording instance was softened from "Pelayanan Buruk" to "Pelayanan Perlu Ditindaklanjuti".

Implementation rework commit: `e920f19`

## Tracker IDs Verified

- DETAIL-HIER-01
- DETAIL-HIER-06
- DETAIL-RISK-01
- DETAIL-RISK-02
- REPORT-01
- REPORT-02
- REPORT-03
- REPORT-04
- REPORT-05
- REPORT-06
- REPORT-07
- SCORE-01
- METRIC-06
- RIGHTS-01
- RIGHTS-06
- CONTACT-01
- CONTACT-02

## Files And Components Reviewed

- `docs/product/15-detail-safety-hierarchy-gate-report.md`
- `docs/product/owner-feedback/03-detail-safety-reporting-and-metrics.md`
- `docs/product/owner-feedback/04-rights-contact-documents-and-score.md`
- `docs/product/owner-feedback/06-review-protocol-and-next-gate.md`
- `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`
- Commit `25ef22b`
- Commit `202ceb9`
- `src/app/desa/[id]/page.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/components/desa/SourceDocumentSnapshotSection.tsx`
- `src/components/desa/TransparansiCard.tsx`
- `src/components/desa/SkorTransparansiCard.tsx`
- `src/components/desa/PreReportChecklistCard.tsx`
- `src/components/desa/SeharusnyaAdaSection.tsx`
- `src/components/desa/PerangkatDesaSection.tsx`
- `src/components/desa/TanggungJawabSection.tsx`
- `src/lib/copy.ts`
- `src/lib/expectations.ts`
- `src/lib/responsibility.ts`

## QA Commands Run

- `npx tsc --noEmit` - PASS
- `npm run test` - PASS, 42/42 tests
- `npm run lint` - BLOCKED by existing unrelated lint errors in admin/auth/input files outside this gate
- `npx eslint src/components/desa/TanggungJawabSection.tsx src/components/desa/TransparansiCard.tsx src/lib/copy.ts src/lib/responsibility.ts` - PASS

Route check:

- `Invoke-WebRequest http://localhost:3000/desa/4` - HTTP 200
- SSR content check confirmed source/document context, Dokumen section, budget cards, checklist, caution copy, and office-channel placeholder render on the route.
- `agent-browser` CLI was unavailable in this environment, so checklist interaction was verified by code review of `PreReportChecklistCard`.

## Result Per Tracker ID

| Tracker ID | Result | Notes |
|---|---|---|
| DETAIL-HIER-01 | PASS | First view is identity/status/source-oriented, not a raw data dump. |
| DETAIL-HIER-06 | PASS | Above-fold context shows desa identity, data status, source, and document snapshot before heavy metrics. |
| DETAIL-RISK-01 | PASS | Data demo badge and microcopy appear near first view and budget values. |
| DETAIL-RISK-02 | PASS | Rupiah/percentage/score areas have demo/status or methodology context. |
| REPORT-01 | PASS | Direct LAPOR CTA is replaced/gated; pre-existing escalation links were reworked to checklist anchors. |
| REPORT-02 | PASS | CTA uses `Cek Langkah Sebelum Melapor`. |
| REPORT-03 | PASS | Checklist includes `Pastikan data berasal dari dokumen resmi.` |
| REPORT-04 | PASS | Checklist includes `Cek apakah masalah termasuk kewenangan desa.` |
| REPORT-05 | PASS | Checklist includes `Dokumentasikan bukti lapangan.` |
| REPORT-06 | PASS | Checklist includes `Gunakan jalur tanya dulu sebelum eskalasi.` |
| REPORT-07 | PASS | External reporting link in `PreReportChecklistCard` is disabled until all checklist items are checked. |
| SCORE-01 | PASS | Score card includes visible methodology items and demo-status note. |
| METRIC-06 | PASS | Score is below source/document context and paired with methodology disclosure. |
| RIGHTS-01 | PASS | Hak Wargamu copy frames estimates as guide/context, not accusation. |
| RIGHTS-06 | PASS | Caution copy appears: `Angka ini adalah estimasi panduan, bukan bukti pelanggaran.` |
| CONTACT-01 | PASS | Personal mobile numbers from demo data are not rendered in the reviewed UI path. |
| CONTACT-02 | PASS | UI uses `Nomor kantor desa — hubungi via kanal resmi` placeholder copy. |

## What Reviewers Should Check

- Open http://localhost:3000/desa/4 and confirm the first view feels like guided context, not a budget dump.
- Confirm source/document context and the Dokumen tab appear before budget cards.
- Confirm every large budget card has nearby `Data demo` text.
- In the reporting area, confirm LAPOR.go.id only becomes available after all checklist items are checked.
- Confirm the Tanggung Jawab section points users to the checklist instead of sending them directly to reporting portals.
- Confirm score methodology explains the four factors and says it is demo, not official/final.
- Confirm Hak Wargamu caution copy is visible and non-accusatory.
- Confirm no personal mobile number is visible on the route, including Tanggung Jawab and Perangkat sections.

## Confirmation

- No seed/read path/schema/DB/API/Prisma/scraper changes.
- No new dependency.
- No numeric APBDes extraction.
- No active Terverifikasi state.
- No personal phone exposure in the reviewed route UI.
- Status remains DONE_PENDING_REVIEW until Rangga/Iwan/Owner review.
