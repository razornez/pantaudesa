# Owner Visibility Report — Sprint 02.5

Date: 2026-04-27
Status: ready-for-owner-review
Prepared-by: ChatGPT Freelancer / Rangga

## One-line summary

Sprint 02.5 berhasil merapikan arah project sebelum Sprint 03: #9 dan #10 siap ditutup, #12 tetap partial, #13 menjadi discovery-in-progress, #11 tetap open, dan Sprint 03 schema/database tetap blocked sampai technical review.

## Current project status

| Area | Status | Meaning |
|---|---|---|
| Sprint 02 | partial-complete | Product/trust progress sudah banyak, tapi wording/backlog masih belum 100% rapi |
| Sprint 02.5 | docs accepted / follow-up docs prepared | Data source strategy dan backlog hygiene sudah dipetakan |
| Sprint 03 | blocked | Schema/database belum boleh dimulai |
| Data source strategy | discovery-in-progress | Arah official website desa/kecamatan/kabupaten sudah didokumentasikan |
| Coding high-risk | blocked | Schema, DB, API, auth, scraper, scheduler, read path tidak boleh disentuh dulu |

## Issue status for owner

### #9 — Kenapa desa dipantau

Status:

- Done / ready to close.

Owner meaning:

- Narasi utama PantauDesa sudah ada.
- Produk sudah menjelaskan bahwa memantau desa bukan berarti menuduh.

Next:

- Iwan boleh close issue ini.

### #10 — Panduan kewenangan

Status:

- Done / ready to close.

Owner meaning:

- Warga sudah diarahkan untuk bertanya ke pihak yang tepat.
- PantauDesa lebih aman secara tone dan tidak menyalahkan desa untuk semua masalah.

Next:

- Iwan boleh close issue ini.

### #12 — Wording warga awam

Status:

- Partial.

Owner meaning:

- Wording penting sudah membaik.
- Tapi audit seluruh website belum terbukti selesai.

Next:

- Jangan close dulu.
- Jadikan follow-up copy audit.

### #13 — Data automation / official source

Status:

- Discovery-in-progress.

Owner meaning:

- Ide owner untuk official website desa sudah masuk arah project.
- Belum scraping.
- Belum scheduler.
- Belum schema/database.

Next:

- Owner/Iwan pilih pilot area atau minimal pilih kriteria area.
- Manual discovery dilakukan setelah area dipilih.

### #11 — Team operating system

Status:

- Open / in-progress.

Owner meaning:

- Workflow makin rapi, tapi belum selesai.
- Issue tracking masih perlu dibersihkan supaya owner mudah monitor.

Next:

- Tetap open sebagai umbrella backlog hygiene.

## What changed strategically

Sebelumnya Sprint 03 terlihat seperti langsung pindah mock data ke database.

Sekarang arahnya lebih matang:

1. Jangan hanya meniru shape `mock-data.ts`.
2. Schema harus siap untuk official data source.
3. Harus ada data status: demo/imported/needs_review/verified/outdated/rejected.
4. Imported data tidak boleh otomatis dianggap verified.
5. `DataSource` kemungkinan besar perlu masuk Sprint 03 minimal.
6. Raw snapshot dan staging bisa ditunda, tapi harus dipikirkan sejak awal.

## Why Sprint 03 is blocked

Sprint 03 menyentuh area high-risk:

- Prisma schema,
- migration,
- database/Supabase,
- service layer,
- read path,
- data trust.

Kalau schema dibuat terlalu cepat hanya berdasarkan mock data, nanti bisa susah menampung:

- website desa,
- website kecamatan/kabupaten,
- PDF,
- Excel/CSV,
- dokumen scan,
- source yang stale/broken,
- data yang butuh review.

Karena itu Sprint 03 harus menunggu technical review atas output Sprint 02.5.

## What Rangga completed

Docs already prepared:

- `docs/project-management/14-sprint-02-closure-report.md`
- `docs/engineering/14-official-desa-data-source-and-scraping-strategy.md`
- `docs/engineering/21-official-source-schema-implications.md`
- `docs/engineering/22-pilot-source-discovery-plan.md`
- `docs/project-management/19-backlog-hygiene-plan.md`
- `docs/project-management/21-issue-update-drafts-sprint-025.md`
- `docs/project-management/22-owner-visibility-report-sprint-025.md`

No high-risk code changes were made.

## What Iwan already accepted

Based on `docs/project-management/20-iwan-review-sprint-025-handoff.md`:

- Sprint 02.5 documentation handoff accepted.
- #9 can be closed.
- #10 can be closed.
- #12 remains partial.
- #13 is discovery-in-progress.
- #11 remains open.
- Sprint 03 remains blocked.

## Owner decisions needed

### Decision 1 — Close #9 and #10

Recommended:

- Approve Iwan to close both.

### Decision 2 — Keep Sprint 03 blocked

Recommended:

- Yes, keep blocked until Asep/technical review.

### Decision 3 — Choose pilot area or choose criteria first

Recommended:

- Do not rush final area if not sure.
- Approve criteria first.
- Then choose 1 kecamatan or 1 kabupaten for manual discovery.

### Decision 4 — Decide whether Rangga may help manual discovery docs/research

Recommended:

- Yes for docs/research/manual table preparation.
- No for scraper/scheduler until technical approval.

## Recommended next actions

### For Iwan

- Post issue updates from `docs/project-management/21-issue-update-drafts-sprint-025.md`.
- Close #9 and #10 after owner confirmation.
- Keep #12, #13, #11 open with correct status.
- Review pilot area selection criteria.

### For Asep / CTO

- Review `docs/engineering/21-official-source-schema-implications.md`.
- Decide if `DataSource` and full `DataStatus` enter Sprint 03.
- Decide whether raw snapshot/staging are deferred or included.

### For Owner

- Confirm #9/#10 can close.
- Confirm Sprint 03 remains blocked until technical review.
- Choose or approve pilot area criteria.

### For Rangga

- Prepare docs/templates/reports.
- Help owner review Iwan/Asep/Ujang work.
- Do not touch high-risk code without explicit gate approval.

## Risk register

| Risk | Current control |
|---|---|
| Sprint 03 starts too early | Marked blocked in docs |
| Schema follows mock data only | Schema implications doc created |
| Imported data looks official | DataStatus lifecycle defined |
| Team overlaps work | Backlog hygiene plan created |
| Owner cannot see progress | This owner report created |
| Scraping starts too early | Manual discovery template and no-scraper boundary |

## Final recommendation

Owner should approve this state:

- Close #9 and #10.
- Keep #12 open.
- Keep #13 as discovery-in-progress.
- Keep #11 open.
- Keep Sprint 03 blocked.
- Move next to pilot area selection criteria and manual discovery preparation.

Initiated-by: Iwan direction
Reviewed-by: Pending Owner/Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: ready-for-owner-review
