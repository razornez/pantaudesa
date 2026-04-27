# Rangga Checklist — Sprint 03 Demo Seed Plan

Date: 2026-04-27
Status: ready-for-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga

## Context

This checklist prepares the next planning gate after shared Supabase migration was applied.

Inputs reviewed:

- `docs/engineering/47-sprint-03-shared-supabase-migration-apply-report.md`
- `docs/engineering/33-final-sprint-03-schema-recommendation.md`
- `docs/engineering/34-iwan-approval-final-sprint-03-schema-recommendation.md`
- `docs/engineering/31-manual-discovery-arjasari-full-11-desa.md`
- `docs/engineering/32-iwan-review-arjasari-full-discovery.md`

## Current gate status

Migration status:

- Shared Supabase migration gate is complete.
- Sprint 03 tables exist in shared Supabase.
- No migration deploy blocker remains.

Still blocked until Iwan explicitly approves next task:

- seed,
- read path switch,
- API changes,
- auth/voice changes,
- scheduler/scraper,
- UI publishing.

## Boundary

This document is planning/checklist only.

Rangga does not:

- command Ujang directly,
- edit seed code,
- change schema,
- change database,
- touch Prisma runtime,
- switch read path,
- touch API/auth/voice,
- implement scheduler/scraper,
- publish data to UI.

## Seed objective

Prepare a safe demo seed plan for Arjasari data foundation.

Primary goal:

- populate basic `Desa`, `DataSource`, and `DokumenPublik` structure safely after Iwan approval.

Secondary goal:

- prepare minimal `AnggaranDesaSummary` / `APBDesItem` demo rows only if they are clearly marked `demo` or `needs_review` and not represented as verified public facts.

## Seed data status rules

Mandatory:

- [ ] No seeded data may be marked `verified`.
- [ ] Demo illustrative values must use `dataStatus = demo`.
- [ ] Manual discovery source links must use `dataStatus = imported` or `needs_review`.
- [ ] Unconfirmed source status must use `needs_review`.
- [ ] Mekarjaya source status remains `needs_review`.
- [ ] Wargaluyu typo/stale kecamatan URL note remains `needs_review`.
- [ ] Public source visibility does not equal verification.

## Recommended seed scope

### Option A — safest seed scope

Recommended first seed scope:

1. Seed all 11 `Desa` records with `dataStatus = demo`.
2. Seed `DataSource` records for official/public source links with `dataStatus = imported` or `needs_review`.
3. Seed `DokumenPublik` records for known document references with `dataStatus = imported` or `needs_review`.
4. Do not seed numeric `AnggaranDesaSummary` values yet except demo placeholders if needed.
5. Do not seed `APBDesItem` numeric breakdown yet.

This option aligns best with document registry before numeric extraction.

### Option B — limited demo metrics

Only if Iwan approves:

1. Seed all 11 `Desa` records as demo.
2. Seed one `AnggaranDesaSummary` per desa with clearly fake/demo numbers and `dataStatus = demo`.
3. Seed `DataSource` and `DokumenPublik` as imported/needs_review.
4. Keep UI/read path blocked until data status display is reviewed.

Risk:

- Demo numbers may be misread as real if UI later switches too early.

Rangga recommendation:

> Choose Option A first. Document/source registry first, numeric extraction later.

## Seed candidates — Desa records

All 11 desa can be seeded as `Desa` records with `dataStatus = demo`:

1. Ancolmekar
2. Arjasari
3. Baros
4. Batukarut
5. Lebakwangi
6. Mangunjaya
7. Mekarjaya
8. Patrolsari
9. Pinggirsari
10. Rancakole
11. Wargaluyu

Suggested shared fields:

- `kecamatan = Arjasari`
- `kabupaten = Bandung`
- `provinsi = Jawa Barat`
- `slug` generated from lowercase desa name
- `websiteUrl` from discovery if active/confirmed, otherwise null or needs_review source only
- `dataStatus = demo`

## Seed candidates — DataSource records

Use `DataSource` for source registry, not final verified data.

### Kecamatan-level sources

Recommended source records:

- Kecamatan Arjasari profile / desa list
  - `sourceType = kecamatan_page`
  - `scopeType = kecamatan`
  - `scopeName = Arjasari`
  - `dataAvailability = mixed`
  - `dataStatus = imported`

- Kecamatan Arjasari struktur pemerintahan
  - `sourceType = kecamatan_page`
  - `scopeType = kecamatan`
  - `scopeName = Arjasari`
  - `dataAvailability = profile_only` or `mixed`
  - `dataStatus = imported`

### Desa-level source candidates

Use `sourceType = official_website` and `scopeType = desa` for active desa websites:

- Ancolmekar — `imported`
- Arjasari — `imported`
- Baros — `imported`
- Batukarut — `imported`
- Lebakwangi — `imported`
- Mangunjaya — `imported`
- Patrolsari — `imported`
- Pinggirsari — `imported`
- Rancakole — `imported`
- Wargaluyu — `imported`, plus kecamatan typo URL note as `needs_review`

Mekarjaya:

- Kecamatan detail source only for now.
- `accessStatus = requires_review` or `unknown`.
- `dataStatus = needs_review`.

## Seed candidates — DokumenPublik records

Prioritize document registry before numeric extraction.

Document candidates from full discovery:

### Ancolmekar

- Laporan Realisasi Pelaksanaan Anggaran Pendapatan 2019
  - `jenisDokumen = realisasi`
  - `tahun = 2019`
  - `dataStatus = needs_review` or `imported`

### Lebakwangi

- APBDes 2022
  - `jenisDokumen = apbdes`
  - `tahun = 2022`
  - `dataStatus = needs_review` or `imported`

- Laporan Realisasi APBDES 2023 Semester I
  - `jenisDokumen = realisasi`
  - `tahun = 2023`
  - `dataStatus = needs_review` or `imported`

- Laporan Realisasi APBDes 2020
  - `jenisDokumen = realisasi`
  - `tahun = 2020`
  - `dataStatus = needs_review` or `imported`

### Mangunjaya

- APBDes 2021 summary
  - `jenisDokumen = apbdes`
  - `tahun = 2021`
  - `dataStatus = needs_review` or `imported`

- Realisasi Pertanggungjawaban APBDes Tahun 2025
  - `jenisDokumen = realisasi`
  - `tahun = 2025`
  - `dataStatus = needs_review` or `imported`

### Patrolsari

- APBDes 2026
  - `jenisDokumen = apbdes`
  - `tahun = 2026`
  - `dataStatus = needs_review` or `imported`

- Laporan Realisasi APBDes 2025
  - `jenisDokumen = realisasi`
  - `tahun = 2025`
  - `dataStatus = needs_review` or `imported`

- Realisasi APBDes 2024
  - `jenisDokumen = realisasi`
  - `tahun = 2024`
  - `dataStatus = needs_review` or `imported`

### Pinggirsari

- Laporan Pertanggungjawaban Realisasi Anggaran Pendapatan dan Belanja Desa Tahun Anggaran 2025
  - `jenisDokumen = realisasi`
  - `tahun = 2025`
  - `dataStatus = needs_review` or `imported`

### Rancakole

- Infografik APBDes 2021
  - `jenisDokumen = apbdes`
  - `tahun = 2021`
  - `dataStatus = needs_review` or `imported`

- Realisasi APBDesa 2019
  - `jenisDokumen = realisasi`
  - `tahun = 2019`
  - `dataStatus = needs_review` or `imported`

- APBDes 2019 / 2018 archive items
  - `jenisDokumen = apbdes`
  - `tahun = 2019` / `2018`
  - `dataStatus = needs_review` or `imported`

### Wargaluyu

- APBDes 2025
  - `jenisDokumen = apbdes`
  - `tahun = 2025`
  - `dataStatus = needs_review` or `imported`

- APBDes 2021 / realisasi-style content
  - `jenisDokumen = apbdes` or `realisasi` after manual review
  - `tahun = 2021`
  - `dataStatus = needs_review`

## Not recommended for numeric extraction yet

Do not seed real numeric budget values from discovery yet.

Reasons:

- Discovery was manual and not verification.
- Formats vary: HTML, article, archive, infographic, PDF references.
- Some records are historical.
- Some desa have only profile/contact.
- UI must not treat imported values as verified.

If numeric demo is required later:

- use fake/demo values only,
- set `dataStatus = demo`,
- do not attach them to imported public source as verified facts.

## Required seed plan checklist before implementation

Before Iwan approves any seed task, confirm:

- [ ] Shared Supabase migration apply report is accepted.
- [ ] Seed scope option A or B is chosen.
- [ ] No seed record will use `verified`.
- [ ] No read path switch will happen in the same task.
- [ ] No UI publish will happen in the same task.
- [ ] No API/auth/voice/scheduler/scraper changes will happen.
- [ ] Seed can be rerun safely or uses upsert strategy.
- [ ] Seed does not delete existing user/auth/voice data.
- [ ] Seed does not require `migrate reset` on shared Supabase.
- [ ] Seed report will be created after execution.

## Recommended QA after seed task, if later approved

After seed implementation and execution, report:

- [ ] seed command run,
- [ ] pass/fail,
- [ ] count of `Desa` records seeded,
- [ ] count of `DataSource` records seeded,
- [ ] count of `DokumenPublik` records seeded,
- [ ] count of `AnggaranDesaSummary` records seeded, if any,
- [ ] count of `APBDesItem` records seeded, if any,
- [ ] confirmation no `verified` records were inserted,
- [ ] confirmation auth/user/voice data untouched,
- [ ] confirmation read path unchanged,
- [ ] blockers and recommendation.

Suggested future report file:

`docs/engineering/49-sprint-03-demo-seed-execution-report.md`

## Stop conditions for future seed task

Stop if:

- [ ] Iwan has not approved seed task explicitly.
- [ ] Seed would insert `verified` data.
- [ ] Seed would require `migrate reset` on shared Supabase.
- [ ] Seed would delete or modify auth/user/voice records.
- [ ] Seed requires read path switch to prove success.
- [ ] Seed requires API/auth/scheduler/scraper changes.
- [ ] Source URL is unclear and would be inserted as trusted.
- [ ] Numeric APBDes values are being copied from unreviewed discovery as fact.
- [ ] DB target is unclear.
- [ ] Secrets appear in report or committed files.

## Recommended Ujang task draft via Iwan only

Rangga does not command Ujang directly. If Iwan approves seed planning, Iwan may send a short task like this:

```text
Ujang, read docs/engineering/48-rangga-sprint-03-demo-seed-plan-checklist.md.
Prepare seed implementation plan only, no execution yet.
Use Option A: seed Desa + DataSource + DokumenPublik structure first.
No verified data. No numeric APBDes extraction. No read path/API/auth/voice/scheduler/scraper.
Return a short seed implementation plan and wait for Iwan approval before coding/running seed.
```

Recommended Codex model/mode:

- Use standard/light coding model for seed plan drafting.
- Avoid high-reasoning unless Prisma seed/upsert logic becomes complex.
- Keep context limited to docs 47, 48, schema, and discovery summary.

## Risks

1. Seed may be mistaken as verified data if status discipline is weak.
2. Numeric APBDes extraction is tempting but unsafe at this point.
3. Shared Supabase now has schema, so wrong seed can pollute shared data even without schema risk.
4. Mekarjaya source status is unresolved.
5. Wargaluyu has a source URL typo/stale case that must be preserved as `needs_review`.
6. Read path switch should not happen until data status behavior is reviewed.

## Recommendation

Rangga recommendation:

- Approve seed planning only, not execution yet.
- Use Option A first: `Desa` + `DataSource` + `DokumenPublik` structure.
- Keep `AnggaranDesaSummary` and `APBDesItem` numeric data out unless using clearly fake `demo` values.
- Keep seed/read path/API/auth/voice/scheduler/scraper blocked until Iwan explicitly approves the next step.

## Final status

Checklist ready.

Seed is still blocked until Iwan approves a seed task.

Initiated-by: Iwan request
Reviewed-by: Pending Iwan/Owner
Executed-by: ChatGPT Freelancer / Rangga
Status: ready-for-seed-planning-review
