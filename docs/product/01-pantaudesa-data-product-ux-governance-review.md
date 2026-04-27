# PantauDesa Data Product, UX, and Governance Review

Date: 2026-04-27
Status: draft-for-iwan-owner-review
Prepared-by: ChatGPT Freelancer / Rangga
Role: Product Owner + Business Analyst + UI/UX Reviewer + System Architecture Reviewer

## Context

This review is prepared before any seed execution or read path switch.

Inputs reviewed:

- `docs/engineering/47-sprint-03-shared-supabase-migration-apply-report.md`
- `docs/engineering/48-rangga-sprint-03-demo-seed-plan-checklist.md`
- `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`
- `docs/engineering/14-official-desa-data-source-and-scraping-strategy.md`
- `docs/engineering/33-final-sprint-03-schema-recommendation.md`

Current state:

- Shared Supabase migration is applied.
- Sprint 03 data foundation tables exist.
- Seed implementation exists but has not been executed.
- Read path is still blocked.
- Seed/read path/API/auth/voice/scheduler/scraper remain blocked until Iwan approves.

## Product principle

PantauDesa must be useful without overstating trust.

Key rule:

> Publicly visible source data is not automatically verified PantauDesa data.

Therefore, UI must separate:

- demo data,
- imported source references,
- needs-review records,
- verified records later.

## 1. What the Desa detail page should show

## MVP detail page structure

For MVP after seed/read path is eventually approved, Desa detail should prioritize source clarity over full budget claims.

Recommended sections:

1. Desa identity header
2. Data status banner
3. Source summary card
4. Public document registry
5. Anggaran/APBDes placeholder or cautious summary
6. Responsibility guide / kewenangan guide
7. Citizen voice section, if already existing and safe

## Desa identity header

Show:

- village name,
- kecamatan,
- kabupaten,
- provinsi,
- website URL if available,
- status label.

Do not present website URL as proof that all data is verified.

Recommended copy:

```text
Data desa ini masih dalam tahap demo/source discovery. Informasi sumber ditampilkan untuk membantu validasi, bukan sebagai klaim final.
```

## Data status banner

Must be visible near the top.

For `demo`:

```text
Data demo — digunakan untuk pengembangan tampilan dan alur produk. Belum mewakili data resmi final.
```

For `imported`:

```text
Data sumber ditemukan — belum diverifikasi oleh tim PantauDesa.
```

For `needs_review`:

```text
Perlu review — sumber atau isi data masih perlu dicek sebelum digunakan sebagai rujukan.
```

For `verified` later:

```text
Terverifikasi — data sudah melalui proses review yang ditetapkan PantauDesa.
```

Important:

- `verified` should not be used until explicit verification workflow exists.

## Source summary card

Show:

- source name,
- source level: desa/kecamatan/kabupaten,
- source type: website/article/archive/document,
- last checked date,
- access status,
- data availability,
- review status.

This helps users understand whether PantauDesa has found sources, not whether all content is final.

## 2. What Anggaran/APBDes section should show

## MVP Anggaran/APBDes behavior

Before numeric extraction is reviewed, APBDes section should be document-first.

Recommended MVP title:

```text
Dokumen Anggaran dan Transparansi
```

Recommended content:

- list of document references,
- year if detected,
- document type,
- source link,
- status badge,
- short caution note.

Do not show strong numeric conclusions yet unless data is `demo` and clearly labeled as demo.

## APBDes section states

### State A — demo only

Show demo chart/card only if clearly labeled:

```text
Contoh tampilan APBDes — angka demo untuk ilustrasi, bukan data resmi.
```

### State B — imported document references

Show document list, not budget numbers:

```text
Kami menemukan referensi dokumen APBDes/realisasi dari sumber publik. Dokumen ini belum diverifikasi sebagai data final PantauDesa.
```

### State C — needs_review

Show warning-style neutral badge:

```text
Perlu review sebelum ditampilkan sebagai angka anggaran.
```

### State D — verified later

Only later, after verification workflow exists, show:

- numeric APBDes summary,
- realization percentage,
- comparison/trend,
- status serapan.

## What should not appear yet

Do not show yet:

- ranking based on imported/needs_review APBDes,
- corruption-risk implication,
- strong warning labels based on unverified documents,
- final realization percentage copied from unreviewed source,
- official-looking score from imported data.

## 3. How data statuses should be displayed

## Recommended status badge language

| DataStatus | UI label | UX tone |
|---|---|---|
| `demo` | Data Demo | Illustrative / development data |
| `imported` | Sumber Ditemukan | Public source found, not reviewed |
| `needs_review` | Perlu Review | Needs checking before use |
| `verified` | Terverifikasi | Only after future explicit review |
| `outdated` | Perlu Pembaruan | Old/stale source |
| `rejected` | Tidak Digunakan | Not suitable to show |

## Badge placement

Display badges at:

- page header,
- source card,
- document row,
- budget section,
- any metric card that uses non-demo/non-verified data.

## Tone rules

Use neutral language:

- “sumber ditemukan”
- “perlu review”
- “data demo”
- “belum diverifikasi”

Avoid accusatory language:

- “mencurigakan”
- “bermasalah”
- “indikasi korupsi”
- “desa tidak transparan”

Unless there is verified methodology and legal/product review, those labels are not safe.

## 4. What data should be hidden until reviewed

Hide or suppress from public UI until reviewed:

- real numeric APBDes extraction from imported/needs_review sources,
- realization percentage from unreviewed source,
- status serapan if based on unreviewed source,
- leaderboard derived from imported/needs_review data,
- alert dini based on unverified budget data,
- score transparansi based on incomplete source registry,
- personal-level perangkat/contact details if privacy risk exists,
- broken/stale source URLs unless shown only as internal review note,
- any source that requires access clarification.

Can show cautiously:

- desa identity demo record,
- source registry summary,
- document title/year/type/source link,
- status badge,
- neutral disclaimer.

## 5. Schema assumptions that may change if UI/UX changes

## Assumption A — Document-first UX

If UI prioritizes document registry before numbers, `DokumenPublik` becomes more important than `APBDesItem` for MVP.

Impact:

- seed should emphasize `DokumenPublik`, not `APBDesItem`.
- read service should support documents list early.

## Assumption B — Status badges everywhere

If status badge appears per section/row, dataStatus may need to be surfaced in DTO/service layer for:

- Desa,
- DataSource,
- DokumenPublik,
- AnggaranDesaSummary,
- APBDesItem.

Impact:

- service layer must not strip `dataStatus`.

## Assumption C — Source summary card

If detail page shows source cards, UI needs `DataSource` records grouped by desa/sourceType/dataAvailability/accessStatus.

Impact:

- service needs `getDesaSources(desaIdOrSlug)` or include sources in `getDesaByIdOrSlug`.

## Assumption D — No verified workflow yet

If there is no verification workflow, UI must not rely on `verified` status.

Impact:

- seed should avoid `verified`.
- verified badge should be hidden or disabled until future workflow exists.

## Assumption E — Read path remains cautious

If read path moves too early, demo/imported data may appear official.

Impact:

- read path switch must be gated by UX status display and data governance copy.

## 6. MVP vs later

## MVP now / next safe stage

MVP should include:

- Desa identity records,
- DataSource/source registry,
- DokumenPublik/document registry,
- dataStatus badges,
- source summary card,
- APBDes document list,
- neutral disclaimers,
- no verified claims.

## Later

Later features:

- numeric APBDes extraction,
- APBDes trend/comparison,
- status serapan from real data,
- transparency score,
- admin verification workflow,
- raw snapshot/staging,
- scheduled source checks,
- scraper/importer,
- public leaderboard from verified data,
- alert dini based on reviewed methodology.

## 7. What should not be built yet

Do not build yet:

- scraper execution,
- scheduler,
- RawSourceSnapshot implementation,
- staging workflow,
- admin verification workflow,
- audit log,
- production data verification claims,
- score transparansi from imported data,
- leaderboard from imported/needs_review data,
- alert dini from unverified APBDes,
- broad read path switch,
- public UI that treats seed data as final.

## 8. Seed execution product review

`docs/engineering/49-sprint-03-demo-seed-implementation-report.md` says seed implementation exists but has not been executed.

Product review:

- Option A is aligned with product safety.
- It seeds `Desa`, `DataSource`, and `DokumenPublik` only.
- It avoids `AnggaranDesaSummary` and `APBDesItem` numeric data.
- It does not execute seed yet.
- It keeps read path blocked.

Product recommendation:

> Seed execution can be considered only after Iwan confirms UI/read path remains blocked and seeded statuses do not include `verified`.

## 9. Recommended next technical task for Ujang — draft only for Iwan

Rangga does not command Ujang directly.

If Iwan agrees with this review, Iwan may send a task like:

```text
Ujang, read docs/product/01-pantaudesa-data-product-ux-governance-review.md and docs/engineering/49-sprint-03-demo-seed-implementation-report.md.

Prepare a seed execution readiness check only. Do not run seed yet.

Confirm:
- seed inserts no verified data,
- seed only covers Desa, DataSource, DokumenPublik,
- AnggaranDesaSummary/APBDesItem remain empty,
- read path remains unchanged,
- API/auth/voice/scheduler/scraper untouched,
- seed can be run with upsert and reported safely.

Return short readiness report. Wait for Iwan approval before executing seed.
```

Recommended Codex mode/model:

- Use standard/light coding model.
- Keep context limited to docs 01 product review, 49 seed report, and seed file.
- Do not use high-reasoning unless seed logic or Prisma errors become complex.

## 10. Risks

1. Users may misunderstand demo/imported data as official if UI labels are weak.
2. Numeric APBDes extraction too early can create trust/legal/product risk.
3. Seed data in shared Supabase can pollute product assumptions even before read path switch.
4. `verified` status exists in schema but no verification workflow exists yet.
5. DataSource can become noisy if source records are not grouped and explained in UI.
6. Wargaluyu stale/typo source and Mekarjaya uncertain source must not be shown as clean verified sources.
7. Leaderboard/alert dini should not use imported/needs_review data.
8. Perangkat/person data may need privacy review before public use.

## 11. Decisions needed from Iwan

Iwan should decide:

1. Approve document-first APBDes MVP or request numeric demo cards.
2. Approve UI status badge language.
3. Confirm seed execution remains blocked until readiness check.
4. Confirm read path remains blocked after seed execution.
5. Confirm no `verified` seed data.
6. Confirm whether source summary card is MVP.
7. Confirm whether APBDes document registry appears before numeric extraction.
8. Confirm whether leaderboard/alert dini stays on mock/demo only until verified methodology.

## 12. Summary for owner/Iwan

- Shared Supabase migration is applied, but seed/read path remain separate gates.
- Product UX should be document-first and source-aware, not number-first.
- Desa detail should show identity, data status, source summary, document registry, and cautious APBDes section.
- `demo`, `imported`, `needs_review`, and `verified` must be visually distinct.
- `verified` should not appear until a future verification workflow exists.
- Hide real numeric APBDes, realization %, leaderboard, alert dini, and transparency score when based on imported/needs_review data.
- Current seed implementation scope is product-safe because it excludes numeric APBDes and is not executed yet.
- Seed execution should wait for Iwan approval after readiness check.
- Read path switch should wait until status badges and source disclaimers are ready.
- MVP: Desa + DataSource + DokumenPublik + status badges + disclaimers.
- Later: numeric extraction, verification workflow, raw snapshot/staging, scheduler/scraper, score/leaderboard/alert dini.
- Recommended next task is a seed execution readiness check, drafted for Iwan to send, not direct-commanded by Rangga.

Initiated-by: Iwan request
Reviewed-by: Pending Iwan/Owner
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-review
