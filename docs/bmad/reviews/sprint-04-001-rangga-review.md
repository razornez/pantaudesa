# Rangga Review — Sprint 04-001 Public UI/UX Closeout Feedback Batch

Date: 2026-04-29
Reviewer: Rangga
Owner status: Approved by Owner before review

Commits reviewed:

- `8240468dbf969d84b21ad53f2afffcc8d081c145` — `fix(ui): close public sprint 04 feedback`
- `91b4775e418a8cbdccb3072847c0054e2efd321f` — `fix(home): show priority rank four and five`

Task reviewed:

- `docs/bmad/tasks/sprint-04-001-public-ui-ux-closeout-feedback-batch.md`

Verdict:

`ACCEPTED_WITH_NOTED_BLOCKERS`

## Summary

Ujang completed the public UI/UX closeout batch and reported QA pass for required commands/routes. The work covers homepage simplification, desa detail polish, mobile bandingkan layout, suara warga DB/copy improvements, DB-derived region filters, clickable/source-aware document rows, and cleaner public copy.

The follow-up commit `91b4775...` intentionally supersedes the original A4 limit of 3 desa in the homepage priority section by restoring ranks 4-5 based on latest Owner instruction. This is accepted because Owner approval happened after the original task file.

## Acceptance review

### Homepage

Status: PASS with Owner-approved exception.

Evidence:

- Homepage priority wording updated to simpler public copy.
- Static `20 desa` issue addressed by dynamic/safe count handling per commit message.
- Homepage sections were simplified: status/methodology/pilot/not-accusing content moved out of home.
- Follow-up commit restores priority ranks 4-5 compactly for visual balance.

Note:

- Original task asked to show 3 desa only. Latest Owner-approved follow-up supersedes this with top 5 display using compact rows.

### Desa detail

Status: PASS.

Evidence:

- Identity card/source/docs/panduan/suara sections were polished for mobile readability.
- `Baca halaman ini dari ringkasan dulu` and repeated generic illustration note were removed per commit diff.
- Suara Warga section was moved into its own late-page section.
- Document rows became source-aware and clickable only when URL exists.

### Bandingkan Desa

Status: PASS.

Evidence:

- Mobile picker/header/CTA layouts now stack vertically.
- Mobile comparison rows render as compact cards instead of forcing three-column overflow.

### Suara Warga

Status: PASS.

Evidence:

- `Lihat data desa` changed to dynamic village profile label, e.g. `Lihat profil <nama desa>`.
- Voice API now enriches voice rows with desa name/kabupaten/slug.
- DB-backed voice reply POST path added.

### Region/filter data

Status: PASS based on commit message.

Evidence:

- Ujang reported DB-derived region filters for provinsi/kabupaten/kecamatan.
- No schema/migration was introduced.

### Perangkat data

Status: BLOCKED / ACCEPTED AS BLOCKER.

Reason:

- Current schema has no `Perangkat` model/table.
- Ujang did not force a schema change, which is correct per guardrail.
- UI shows honest empty state instead of hardcoded dummy.

Recommended follow-up:

- Carry this into a future schema/data gate if Owner wants DB-backed perangkat data.

## QA review

Ujang reported:

- `npx prisma validate`: PASS
- `npx tsc --noEmit`: PASS
- `npm run test`: PASS
- `npm run build`: PASS
- route checks: PASS
- targeted lint changed files: PASS
- full lint: FAIL due to old lint debt outside this batch

Review note:

- The full lint failure is not considered a blocker for Sprint 04-001 because the commit identifies it as existing debt outside the changed batch.
- The targeted lint pass on changed files is acceptable for this review.

## Guardrail review

Status: PASS.

Reported and reviewed guardrails:

- no schema/migration change,
- no seed rerun,
- no verified activation,
- no official numeric APBDes extraction,
- no scraper/scheduler,
- no new dependency,
- DB-first displayed data remains,
- no hardcoded displayed fallback reintroduced.

## Known risks / carry-forward items

1. `Perangkat` remains blocked until a schema/data gate exists.
2. Full lint still has older debt outside this batch.
3. `Bandingkan` still uses existing comparison dataset; this batch only fixed requested mobile layout.
4. Build still emits pre-existing Turbopack NFT trace warning around Prisma route import.
5. Homepage priority count/display changed from original 3 to 5 due to latest Owner-approved follow-up; this should be treated as the current product decision.

## Verdict

`ACCEPTED_WITH_NOTED_BLOCKERS`

Recommended next step:

- Update BMAD sprint status to mark Sprint 04-001 as accepted with blockers carried forward.
- Do not open admin/AI implementation until Owner/Iwan explicitly opens the next Sprint 04 gate.
