# PantauDesa BMAD-lite Sprint Status

Date: 2026-04-28
Status: active-sprint-status
Prepared-by: Rangga / BMAD-lite orchestration

## Current sprint

Sprint 03 — Data Foundation

## Sprint goal

Move PantauDesa into DB-first displayed data mode so performance and behavior can be tested against database-backed reads, while preserving clear trust labels and blocking false verification.

Updated Owner goal:

- all displayed data should come from DB;
- current hardcoded/dummy displayed data should be inserted into DB as mock/demo records;
- UI should not silently read hardcoded fallback data if DB is unavailable;
- dummy/mock fields must be clearly marked, e.g. `Rp1 M (mock)`;
- no `verified` status;
- no official numeric APBDes extraction;
- voices/comments/replies/votes/helpfuls should also be DB-backed.

## Current active task

- `docs/bmad/tasks/sprint-03-004-db-first-all-displayed-data-batch.md`

## Current task status

`READY_FOR_IWAN_GATE_AND_UJANG_ASEP_EXECUTION`

Why:

- Owner explicitly wants Sprint 03 to cover DB-first displayed data as one larger batch;
- task file has been created for Ujang/Asep;
- batch includes seed expansion, DB-only displayed reads, voice DB reads, mock field labels, and no hardcoded runtime fallback;
- implementation should be handled locally by Ujang/Asep because it needs DB env, seed execution, QA, route checks, and performance observation.

## Recently completed / reported

1. UI trust cleanup accepted/mostly closed.
2. Shared Supabase migration applied.
3. Demo seed Option A reported QA pass.
4. Hybrid DB + mock flagging implemented.
5. Latest code fixes added:
   - request-time DB read with `force-dynamic`,
   - Prisma env guards,
   - mock fallback crash safety,
   - actual-data province filter.

## Current batch objective

Sprint 03-004 should move beyond hybrid fallback:

- seed all currently displayed hardcoded/mock datasets into DB;
- move displayed runtime reads to DB services;
- remove silent hardcoded fallback for displayed data;
- use controlled empty/unavailable states if DB is unavailable;
- keep static copy/config constants allowed in code;
- flag all dummy/mock numeric/record values clearly;
- keep official/source-backed imported data unverified but not necessarily labelled mock;
- preserve no verified/no official numeric extraction/no scraper guardrails.

## Immediate handoff prompt

Use this short handoff:

```text
Ujang, pull latest main, read docs/bmad/tasks/sprint-03-004-db-first-all-displayed-data-batch.md, execute as one Sprint 03 DB-first batch, run QA/guardrails, commit with implementation note, push, then report commit SHA + QA/route summary. Do not widen scope beyond the task file.
```

If Asep takes over:

```text
Asep, pull latest main, read docs/bmad/tasks/sprint-03-004-db-first-all-displayed-data-batch.md, continue from latest commit, keep the same scope/guardrails, run QA, commit/push only necessary fixes, then report commit SHA + QA/route summary.
```

## Required QA for current task

Run locally/staging:

```bash
npx prisma validate
npx tsc --noEmit
npm run test
npm run build
```

Route checks:

- `/`
- `/desa`
- `/desa?cari=ancolmekar`
- `/desa/ancolmekar`
- `/desa/4`
- `/suara-warga`
- `/suara`

## Blocked / not next

Do not proceed yet to:

- `verified` activation,
- official numeric APBDes extraction,
- scraper/scheduler,
- Risk Radar / Score Orb,
- new dependency,
- destructive migration commands,
- full production data import beyond approved mock/demo DB-first batch.

## Status board

| Item | Status | Notes |
|---|---|---|
| UI trust cleanup | ACCEPTED / mostly closed | Product UI cycle completed with tracker acceptance. |
| Shared Supabase migration | APPLIED | Report 47. |
| Demo seed Option A | REPORTED_QA_PASS | Report 51. |
| Hybrid DB + mock flagging | IMPLEMENTED | Superseded by DB-first all displayed data goal. |
| DB-first all displayed data batch | READY_FOR_IWAN_GATE_AND_UJANG_ASEP_EXECUTION | Task file prepared. |
| Runtime DB connection check | ABSORBED INTO SPRINT-03-004 | Covered by larger DB-first batch. |
| Service layer hardening | CANDIDATE_AFTER_BATCH | Depends on Sprint 03-004 result. |
| Source review workflow | FUTURE SPRINT 04 CANDIDATE | Not opened. |
| Verified / official numeric extraction | BLOCKED | Needs future governance. |
