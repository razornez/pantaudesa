# Task Sprint 03-004 — DB-first All Displayed Data Batch

Status: READY_FOR_IWAN_GATE_AND_UJANG_ASEP_EXECUTION
Executor: Ujang / Asep
Prepared-by: Rangga
Date: 2026-04-28

## Goal

Move PantauDesa Sprint 03 into a DB-first mode where all displayed data is read from the database, including data that is still dummy/mock.

The purpose is to test real app behavior and performance when the website reads from DB instead of hardcoded files.

Important trust framing:

- official/imported/source-backed data can be shown without `(mock)` if it is not fake/dummy;
- dummy/demo values must be stored in DB and visibly marked as mock/demo at field or record level;
- no data should be marked `verified` in this batch;
- no numeric APBDes extraction from official documents is allowed in this batch;
- mock numeric placeholders are allowed only if they are explicitly stored as `dataStatus = demo` and shown as mock/demo in UI.

## Owner direction

Owner wants:

- all displayed data to come from database;
- current hardcoded/dummy data to be inserted into database as mock/demo records;
- no hardcoded fallback if DB data is unavailable;
- visible flagging for dummy/mock values;
- example: `1 M (mock)` for a mock budget value;
- official/source-backed values do not need `(mock)`;
- reusable demo badge can be phased out later if field-level mock labels are clearer;
- voices, citizen comments/replies/votes/helpful interactions should also come from DB;
- work should be batched, not split into tiny tasks.

## Read first

- `docs/bmad/project-context.md`
- `docs/bmad/workflow.md`
- `docs/bmad/boundary-rules.md`
- `docs/bmad/sprint-status.md`
- `docs/bmad/sprint-planning.md`
- `docs/bmad/stories/sprint-03-002-db-read-hybrid-mock-flagging.md`
- `docs/engineering/51-sprint-03-demo-seed-execution-report.md`
- `docs/engineering/52-sprint-03-db-read-hybrid-mock-flagging-report.md`
- `prisma/schema.prisma`
- current `prisma/seed-demo.mjs`
- current hardcoded/mock sources used by UI, especially:
  - `src/lib/mock-data.ts`
  - `src/lib/citizen-voice.ts`
  - all pages/components importing mock data directly.

## Batch scope

This is a large technical batch. Keep it cohesive and do not open unrelated product features.

### A. Seed all currently displayed mock/dummy data into DB

Add/update a DB seed path so all existing displayed hardcoded data exists in DB.

Expected seeded data groups:

1. `Desa`
   - seeded Arjasari desa from Sprint 03 source discovery;
   - existing mock/demo villages needed to keep UI rich;
   - each dummy/mock desa uses `dataStatus = demo`;
   - source-backed imported records can use `imported` or `needs_review`, never `verified`.

2. `DataSource`
   - source-backed official/imported source rows;
   - dummy/mock source rows if needed for mock villages;
   - mock source rows use `sourceType = demo` and/or `dataStatus = demo`.

3. `DokumenPublik`
   - existing seeded source/document registry;
   - mock document rows if UI needs examples;
   - mock document rows use `dataStatus = demo`.

4. `AnggaranDesaSummary`
   - insert placeholder/mock summary numbers currently shown in UI;
   - each mock number must use `dataStatus = demo`;
   - no official numeric APBDes extraction in this task;
   - imported/source-backed numbers may only be used if already available and safe, otherwise keep demo.

5. `APBDesItem`
   - insert placeholder/mock APBDes item rows currently shown in UI or needed for detail page richness;
   - each mock row must use `dataStatus = demo`;
   - no official numeric extraction.

6. Citizen Voice tables
   - `Voice`
   - `VoiceReply`
   - `VoiceVote`
   - `VoiceHelpful`
   - optional demo users if needed to satisfy relations, without affecting real auth users;
   - all demo voice data must be clearly mock/demo in content/status/author framing where shown.

### B. Change read path so UI reads from DB only

Replace displayed-data hardcoded reads with server-side DB reads.

Target areas:

- `/desa`
- `/desa/[id]`
- `/desa/[id]/suara` if present
- `/suara-warga`
- `/suara`
- homepage pieces that display desa/voice/data counts or demo data, if they currently read mock data
- components that import `mock-data.ts` or `citizen-voice.ts` for displayed runtime data.

Important:

- Hardcoded constants for static copy/options are fine.
- Hardcoded displayed datasets should not be runtime source anymore.
- If DB is unavailable, the UI should show a controlled DB-unavailable/empty state, not silently fall back to hardcoded data.

### C. Flagging rules

Replace confusing global demo badges with clearer field/record indicators.

Rules:

- record from DB but dummy: show `Mock` / `(mock)` / `dataStatus = demo` clearly.
- budget number from DB but dummy: show value with `(mock)`, e.g. `Rp1 M (mock)`.
- source-backed/imported identity/source data: can show without `(mock)`, but must not say verified.
- `needs_review` should still be visible when relevant.
- `verified` must not appear or be active.

### D. Performance observation

Because Owner wants to know whether DB-read website feels fast or slow:

- note if pages feel slower after DB-first switch;
- avoid excessive N+1 queries;
- prefer batched Prisma queries with includes/selects;
- keep pages server-side where appropriate;
- do not add new dependency for performance monitoring.

## Out of scope

- No `verified` data status activation.
- No official numeric APBDes extraction from documents.
- No scraper/importer/scheduler.
- No Risk Radar.
- No Score Orb.
- No advanced dataviz.
- No new dependency.
- No destructive migration commands.
- No `migrate reset`, `migrate dev`, or `db push` against shared Supabase.
- No changing auth semantics beyond demo users only if required for seeded voice relations.
- No public claim that data is complete/official/verified.

## Important schema note

Current schema already has tables for:

- `Desa`
- `DataSource`
- `AnggaranDesaSummary`
- `APBDesItem`
- `DokumenPublik`
- `Voice`
- `VoiceReply`
- `VoiceVote`
- `VoiceHelpful`
- `User`

Use existing schema if possible.

If a schema change seems required, stop and ask Iwan/Owner before changing schema.

## Acceptance criteria

### Database / seed

1. All data currently displayed from hardcoded/mock datasets has a DB representation.
2. Seed is idempotent.
3. Seed does not delete real user/auth data.
4. Seed does not require destructive DB commands.
5. Mock/dummy rows use `dataStatus = demo` where applicable.
6. Imported/source-backed rows use `imported` or `needs_review`, not `verified`.
7. No seeded record uses `verified`.
8. Mock budget summary rows are in `AnggaranDesaSummary` with `dataStatus = demo`.
9. Mock APBDes item rows are in `APBDesItem` with `dataStatus = demo`.
10. Citizen voice examples are in DB voice tables, not hardcoded runtime files.

### UI read path

11. `/desa` reads displayed desa/card data from DB only.
12. `/desa/[id]` reads displayed detail data from DB only.
13. `/suara-warga` reads displayed citizen voice data from DB only.
14. `/suara` legacy route remains safe and DB-backed.
15. Any detail voice route reads from DB only.
16. No displayed runtime data is silently sourced from `mock-data.ts` or `citizen-voice.ts`.
17. If DB is empty/unavailable, UI shows controlled empty/unavailable state rather than hardcoded fallback.
18. Existing static copy, labels, and UI constants may remain in code.

### Flagging

19. Mock/dummy record or field values are visibly marked as mock/demo.
20. Mock budget values render with clear text such as `(mock)`.
21. Source-backed/imported identity/source values do not need `(mock)` but also do not say verified.
22. `needs_review` remains visible when data/source needs review.
23. Reusable global demo badge is not required if clearer field-level labels exist.

### Safety

24. No `verified` UI state is activated.
25. No numeric APBDes extraction from official docs.
26. No scraper/scheduler/importer.
27. No new dependency.
28. No secrets committed.
29. Auth/user/voice real user data is not damaged.
30. Mock fallback removal does not create app crash; controlled empty/unavailable states are shown.

### QA

31. `npx prisma validate` passes.
32. `npx tsc --noEmit` passes.
33. `npm run test` passes.
34. `npm run build` passes.
35. Route checks pass:
    - `/`
    - `/desa`
    - `/desa?cari=ancolmekar`
    - `/desa/ancolmekar`
    - `/desa/4`
    - `/suara-warga`
    - `/suara`
36. Basic performance observation is reported for DB-backed pages.

## Implementation guidance

Recommended approach:

1. Inventory direct imports of hardcoded datasets.
2. Extend seed script or create a dedicated seed script for Sprint 03 DB-first demo data.
3. Seed current mock dataset into DB with `dataStatus = demo`.
4. Seed citizen voice examples into DB with safe demo users or anonymous rows.
5. Create/extend DB read services.
6. Replace UI runtime data reads with DB services.
7. Remove silent hardcoded fallback.
8. Add controlled DB empty/unavailable states.
9. Update flagging formatting for mock values.
10. Run QA and route checks.

Recommended search commands:

```bash
rg "mockDesa|mock-data|citizen-voice|getVoicesForDesa|getAllVoices|DataStatusBadge" src
```

Seed execution must be explicit in commit message:

- what DB target was used,
- counts inserted/upserted,
- no secrets,
- no verified,
- no numeric extraction from official docs.

## Commit rule

Use one cohesive commit or a small sequence of logically grouped commits.

Commit message must include implementation note:

```text
feat(data): move displayed demo data to DB-first read path

What changed:
- seeded displayed mock/demo data into DB with dataStatus=demo
- moved /desa and detail pages to DB-only displayed data reads
- moved voice examples to DB voice tables
- removed silent hardcoded fallback for displayed datasets
- added mock field labels like '(mock)' for demo numeric values

DB seed/result:
- target host alias: <host only, no secret>
- Desa upserted: <count>
- AnggaranDesaSummary upserted: <count>
- APBDesItem upserted: <count>
- DokumenPublik upserted: <count>
- Voice upserted: <count>
- VoiceReply upserted: <count>
- VoiceVote/VoiceHelpful upserted: <count>

QA:
- npx prisma validate: PASS
- npx tsc --noEmit: PASS
- npm run test: PASS
- npm run build: PASS
- route /: PASS
- route /desa: PASS
- route /desa?cari=ancolmekar: PASS
- route /desa/ancolmekar: PASS
- route /desa/4: PASS
- route /suara-warga: PASS
- route /suara: PASS

Guardrails:
- no secrets committed
- no schema/migration change unless separately approved
- no verified status
- no official numeric APBDes extraction
- no scraper/scheduler
- no new dependency
- real auth/user data not damaged

Known risks:
- <text>
```

## Report back in chat

After push, report only:

```text
Task: Sprint 03-004 DB-first All Displayed Data Batch
Status: PASS / REWORK / BLOCKED
Runtime host alias: <host or missing>
DB counts:
- Desa:
- AnggaranDesaSummary:
- APBDesItem:
- DataSource:
- DokumenPublik:
- Voice:
- VoiceReply:
- VoiceVote:
- VoiceHelpful:
Routes:
- /:
- /desa:
- /desa?cari=ancolmekar:
- /desa/ancolmekar:
- /desa/4:
- /suara-warga:
- /suara:
QA:
- prisma validate:
- tsc:
- test:
- build:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

## Short handoff prompt

Use this short chat message for Ujang/Asep:

```text
Ujang, pull latest main, read docs/bmad/tasks/sprint-03-004-db-first-all-displayed-data-batch.md, execute as one Sprint 03 DB-first batch, run QA/guardrails, commit with implementation note, push, then report commit SHA + QA/route summary. Do not widen scope beyond the task file.
```

If Asep takes over:

```text
Asep, pull latest main, read docs/bmad/tasks/sprint-03-004-db-first-all-displayed-data-batch.md, continue from latest commit, keep the same scope/guardrails, run QA, commit/push only necessary fixes, then report commit SHA + QA/route summary.
```

## Status

`READY_FOR_IWAN_GATE_AND_UJANG_ASEP_EXECUTION`
