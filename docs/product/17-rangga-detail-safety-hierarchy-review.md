# Rangga Detail Safety / Hierarchy Review

Date: 2026-04-28
Status: ACCEPTED_FOR_OWNER_REVIEW
Reviewer: ChatGPT Freelancer / Rangga
Review type: Product/UX gate review against owner-feedback tracker IDs

## Scope reviewed

Commits reviewed:

- `e920f19` — `fix(detail-safety): gate reporting links before checklist`
- `72b3a26` — `docs(detail-safety): add ujang verification report`

Report reviewed:

- `docs/product/16-ujang-detail-safety-hierarchy-verification-report.md`

Route under review:

- `http://localhost:3000/desa/4`

Important note:

- Rangga could not directly open localhost from this environment.
- Review is based on commit diff, current source files, and Ujang verification report.
- Final visual acceptance still requires Owner/Iwan to open the route locally.

## Verdict

`ACCEPTED_FOR_OWNER_REVIEW`

Reason:

The implementation appears to satisfy the requested detail safety/hierarchy tracker IDs from product/UX and safety perspective, with no evidence of seed/read path/schema/DB/API/Prisma/scraper changes in the reviewed commits.

Do not mark final `ACCEPTED` until Owner/Iwan visually approve the route.

## Tracker ID review

| Tracker ID | Review result | Notes |
|---|---|---|
| DETAIL-HIER-01 | PASS | First view is identity/status/source-oriented and not a raw data dump. |
| DETAIL-HIER-06 | PASS | Above-fold structure shows identity, data status, quick facts, and source/document context before heavy metrics. |
| DETAIL-RISK-01 | PASS | Data demo badge and microcopy appear near first view and key values. |
| DETAIL-RISK-02 | PASS | Large Rupiah/percentage/score areas have demo/status or methodology context. |
| REPORT-01 | PASS | Direct external reporting CTA is gated behind pre-report checklist. |
| REPORT-02 | PASS | CTA uses `Cek Langkah Sebelum Melapor` / checklist-first wording. |
| REPORT-03 | PASS | Checklist includes `Pastikan data berasal dari dokumen resmi.` |
| REPORT-04 | PASS | Checklist includes `Cek apakah masalah termasuk kewenangan desa.` |
| REPORT-05 | PASS | Checklist includes `Dokumentasikan bukti lapangan.` |
| REPORT-06 | PASS | Checklist includes `Gunakan jalur tanya dulu sebelum eskalasi.` |
| REPORT-07 | PASS_WITH_VISUAL_CHECK_REQUIRED | Code disables external reporting link until all checklist items are checked. Owner/Iwan should still verify interaction in browser. |
| SCORE-01 | PASS | Score card includes methodology disclosure and demo note. |
| METRIC-06 | PASS | Score is placed after source/document context and paired with methodology/status explanation. |
| RIGHTS-01 | PASS | Hak Wargamu frames estimates as guidance/context, not proof of violation. |
| RIGHTS-06 | PASS | Caution copy appears: `Angka ini adalah estimasi panduan, bukan bukti pelanggaran.` |
| CONTACT-01 | PASS | Personal mobile contacts are masked or replaced in reviewed UI path. |
| CONTACT-02 | PASS | Contact display uses `Nomor kantor desa — hubungi via kanal resmi` placeholder copy. |

## Required check result

## 1. First view is not data dump

PASS.

`DesaDetailFirstView` starts with desa identity, location, status badge, quick facts, source availability, and document availability. This matches the guided-reading direction.

## 2. Dokumen tab appears before budget numbers

PASS.

`TransparansiCard` now defaults to `dokumen`, and the tab order starts with `Dokumen` before `Transparansi` and `Perangkat`. The detail page also places `SourceDocumentSnapshotSection` and `TransparansiCard` before the budget summary.

## 3. Big numbers have Data demo/status context

PASS.

Budget summary area includes a Data Demo strip and each budget stat card includes `Data demo`. Score area includes methodology and demo note.

## 4. No direct LAPOR.go.id before checklist

PASS.

Direct LAPOR link in page CTA is replaced with `#pre-report-checklist`. Reporting URLs inside escalation cards are redirected to the checklist anchor.

## 5. Checklist copy matches Owner tracker

PASS.

Checklist copy matches required tracker wording:

- `Pastikan data berasal dari dokumen resmi.`
- `Cek apakah masalah termasuk kewenangan desa.`
- `Dokumentasikan bukti lapangan.`
- `Gunakan jalur tanya dulu sebelum eskalasi.`

## 6. LAPOR only unlocks after all checklist items checked

PASS_WITH_VISUAL_CHECK_REQUIRED.

Code review shows the reporting link area is disabled until `allChecked` is true, with `pointer-events-none`, `tabIndex={-1}`, and hidden interaction behavior until checklist completion.

Owner/Iwan should verify the actual interaction in local browser.

## 7. Score has methodology/demo note

PASS.

`SkorTransparansiCard` includes methodology items and a demo-status note explaining the score is simulation/demo, not official/final.

## 8. Hak Wargamu has caution copy

PASS.

`SeharusnyaAdaSection` includes the caution copy: `Angka ini adalah estimasi panduan, bukan bukti pelanggaran.`

## 9. Personal mobile numbers are masked

PASS.

`TanggungJawabSection` masks personal mobile-like contacts with `Nomor kantor desa — hubungi via kanal resmi`, and `PerangkatDesaSection` also displays office-channel placeholder copy instead of the raw contact.

## 10. No seed/read path/schema/DB/API/Prisma/scraper changes

PASS based on reviewed commits.

Commit `e920f19` touched only:

- `src/components/desa/TanggungJawabSection.tsx`
- `src/components/desa/TransparansiCard.tsx`
- `src/lib/copy.ts`
- `src/lib/responsibility.ts`

Commit `72b3a26` added only:

- `docs/product/16-ujang-detail-safety-hierarchy-verification-report.md`

No seed/read path/schema/DB/API/Prisma/scraper changes were visible in these commits.

## Remaining risks / caveats

1. Final acceptance requires Owner/Iwan visual check on `http://localhost:3000/desa/4`.
2. `REPORT-07` interaction should be manually checked in browser because Ujang also noted browser automation was unavailable.
3. Score still exists visually; methodology/demo note mitigates risk, but Owner should decide whether the score still feels too authoritative.
4. The page is safer now, but later seed/read path remains blocked until data status behavior is accepted across real data paths.

## Recommended Owner/Iwan visual checklist

Owner/Iwan should open `http://localhost:3000/desa/4` and verify:

1. First view feels like guided context, not a budget dump.
2. Source/document context and Dokumen tab appear before budget cards.
3. Every large number feels clearly marked as demo/status-contextual.
4. LAPOR.go.id is not directly accessible before checklist.
5. Checklist copy matches owner tracker wording.
6. LAPOR link only unlocks after all checklist items are checked.
7. Score methodology explains the four factors and says demo/not official.
8. Hak Wargamu caution copy is visible and non-accusatory.
9. No personal mobile number is visible.

## Final recommendation

Move this gate to Owner/Iwan visual review.

Do not open seed/read path/schema/DB/API/Prisma/scraper gates yet.

Do not mark final `ACCEPTED` until Owner/Iwan visual approval.

Initiated-by: Iwan/Ujang report
Reviewed-by: ChatGPT Freelancer / Rangga
Status: ACCEPTED_FOR_OWNER_REVIEW
