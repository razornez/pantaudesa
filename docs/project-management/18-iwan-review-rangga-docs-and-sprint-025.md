# Iwan Review — Rangga Docs and Sprint 02.5 Bridge

Date: 2026-04-27
Reviewer: Iwan
Scope: Review Rangga/Freelancer docs and owner direction before Sprint 03.

## Files reviewed

- `docs/project-management/14-sprint-02-closure-report.md`
- `docs/engineering/14-official-desa-data-source-and-scraping-strategy.md`

## Owner direction accepted

Iwan accepts the owner direction:

1. Sprint 02 should not be treated as fully done.
2. Sprint 02 status should be `partial-complete`.
3. Issue #9 and #10 need final UI/copy check. If suitable, they can be closed as done.
4. Issue #12 remains partial because full wording audit is not proven complete.
5. Issue #13 becomes `discovery-in-progress` because official desa/kecamatan/kabupaten source strategy must influence Sprint 03 schema.
6. Issue #11 remains open for workflow/status/label/trace hygiene.
7. Sprint 03 schema/database must not start before official data source strategy is reviewed.

## Critical correction from Iwan

Previous instruction that allowed Sprint 03 schema execution in Acting CTO mode is now paused.

Reason:

Rangga's official data source strategy changes the design requirements for Sprint 03 schema. Schema must not only follow current mock data. It must be ready for:

- source registry,
- raw snapshot,
- staged/extracted data,
- review status,
- data status lifecycle,
- published data,
- source URL and timestamps,
- pilot discovery from official desa/kecamatan/kabupaten websites.

Therefore:

> Sprint 03 schema/database implementation is paused until Sprint 02.5 is completed.

## Decision 1 — Sprint 02 closure

Status: partial-complete

Sprint 02 has meaningful progress, but it is not fully done.

Done/mostly done:

- Civic narrative.
- Authority guide.
- Data trust notice/disclaimer basics.
- Auth/badge narrative improvements.
- Critical wording updates.
- Data foundation learning docs.

Still partial/open:

- Full wording audit.
- Backlog/issue hygiene.
- Data source strategy integration.
- Lint/build risk remains.
- Data automation remains discovery.

## Decision 2 — Issue status

### #9 — Civic narrative: why desa is monitored

Recommended status: done after final quick UI/copy confirmation.

Reason:

- Homepage section exists.
- `/tentang/kenapa-desa-dipantau` exists.
- Tone supports `memantau bukan menuduh`.

### #10 — Responsibility guide / authority guide

Recommended status: done after final quick UI/copy confirmation.

Reason:

- Detail desa card exists.
- `/panduan/kewenangan` exists.
- Disclaimer and careful wording exist.

### #12 — Wording simplification

Recommended status: partial.

Reason:

- Critical wording was improved and verified by product.
- Full-site wording audit is not proven complete.
- Medium/low wording items remain deferred.

### #13 — Data automation / official source strategy

Recommended status: discovery-in-progress.

Reason:

- Official website desa/kecamatan/kabupaten strategy now exists.
- It must influence schema before Sprint 03.
- Scraper/scheduler implementation remains blocked.

### #11 — Team operating system / backlog hygiene

Recommended status: open / in-progress.

Reason:

- Role trace exists in many docs/commits.
- Issue status/labels/backlog hygiene still needs cleanup.

## Decision 3 — Need Sprint 02.5

Iwan recommends creating Sprint 02.5 before Sprint 03.

Name:

> Sprint 02.5 — Data Source Strategy and Backlog Hygiene

Goal:

Bridge owner direction, official source strategy, and backlog hygiene before touching schema/database.

Why needed:

- Schema based only on mock data is dangerous.
- Real official website sources can be HTML, PDF, Excel, image, stale links, broken links, or mixed structure.
- We need source registry/raw snapshot/staging/review concepts before schema implementation.
- Backlog status is messy and needs cleanup so owner can track work.

## Sprint 02.5 tasks

### H-01 — Review #9 final UI/copy

Owner: Ujang
Review: Iwan
Output:

- Final note whether #9 can be marked done.
- Check homepage civic section and `/tentang/kenapa-desa-dipantau`.

### H-02 — Review #10 final UI/copy

Owner: Ujang
Review: Iwan
Output:

- Final note whether #10 can be marked done.
- Check detail card and `/panduan/kewenangan`.

### H-03 — Convert official data source strategy into schema implications

Owner: Ujang
Review: Iwan
Output:

`docs/engineering/21-official-source-schema-implications.md`

Must answer:

- Which source registry fields are mandatory for Sprint 03?
- Does Sprint 03 need `RawSourceSnapshot` now or later?
- Does Sprint 03 need staging tables now or later?
- Which dataStatus values must exist from day one?
- How published models connect to source/staging.
- How to avoid making imported data look verified.

### H-04 — Pilot source discovery plan, no scraping yet

Owner: Ujang
Review: Iwan
Output:

`docs/engineering/22-pilot-source-discovery-plan.md`

Must include:

- criteria for choosing 1 kecamatan/kabupaten,
- 5-20 desa pilot scope,
- fields to collect manually,
- no scraping/scheduler implementation,
- expected decision after pilot.

### H-05 — Backlog hygiene plan

Owner: Ujang
Review: Iwan
Output:

`docs/project-management/19-backlog-hygiene-plan.md`

Must include:

- #9 target status,
- #10 target status,
- #12 partial and follow-up items,
- #13 discovery-in-progress,
- #11 open/in-progress,
- what labels/statuses should be applied.

### H-06 — Update Sprint 03 plan gate

Owner: Ujang
Review: Iwan
Output:

Update or add note that Sprint 03 schema is blocked until Sprint 02.5 outputs are reviewed.

## Instruction to Ujang

Ujang should not overlap with Rangga.

Rangga already prepared closure report and official source strategy. Ujang's job is not to rewrite them. Ujang should convert them into actionable engineering implications and backlog hygiene.

## Ujang must not do

During Sprint 02.5, Ujang must not:

- change `prisma/schema.prisma`,
- create migration,
- create Supabase table,
- create scraper,
- create scheduler,
- create admin import,
- change API/auth/read path,
- mark Sprint 02 fully done,
- start Sprint 03 schema.

## Prompt for Ujang

```text
Ujang, baca `docs/project-management/18-iwan-review-rangga-docs-and-sprint-025.md`.

Sprint 03 schema/database ditahan dulu.
Kita masuk Sprint 02.5: Data Source Strategy and Backlog Hygiene.

Jangan overlap dengan Rangga. Rangga sudah membuat closure report dan official source strategy. Tugas kamu adalah mengubah dokumen itu menjadi engineering implications dan backlog hygiene.

Kerjakan:
1. H-01 final check #9 UI/copy.
2. H-02 final check #10 UI/copy.
3. H-03 buat `docs/engineering/21-official-source-schema-implications.md`.
4. H-04 buat `docs/engineering/22-pilot-source-discovery-plan.md`.
5. H-05 buat `docs/project-management/19-backlog-hygiene-plan.md`.
6. H-06 tambahkan note bahwa Sprint 03 schema blocked sampai Sprint 02.5 direview.

Jangan ubah schema, database, API, auth, scraper, scheduler, atau read path.
Report ke Iwan setelah selesai.
```

## Final decision

Sprint 02: partial-complete.
Sprint 02.5: recommended and should start now.
Sprint 03 schema/database: paused until Sprint 02.5 reviewed.

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Direction)
Executed-by: Iwan (CEO)
Status: ready
Backlog: #9 #10 #11 #12 #13
