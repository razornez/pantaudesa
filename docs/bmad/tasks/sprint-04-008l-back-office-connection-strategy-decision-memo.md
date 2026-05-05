# Sprint 04-008L - Back Office Connection Strategy Decision Memo

## Status
READY FOR EXECUTION - decision memo only, no implementation.

## Execution Rule
Follow:

```text
docs/bmad/agent-execution-rules.md
```

This task is decision-locked. Ujang/Codex must execute the memo exactly as described. Do not ask the owner to choose options. The recommendation order is defined below.

## Context
Sprint 04-008F through 04-008K closed the back office performance audit as a **connection/runtime path overhead** issue.

Evidence already accepted:

1. Raw SQL EXPLAIN is sub-millisecond in the local dataset.
2. `serializeRows` is 0-1ms, so serialization is not the bottleneck.
3. `auth()` is not the main bottleneck.
4. `DATABASE_URL` normal path via transaction pooler `6543` remains slow on warm requests.
5. Runtime `DATABASE_URL = DIRECT_URL` session-pooler path `5432` is materially faster on warm requests.
6. Cold request remains slow on both runtime paths.
7. Local production mode reproduces the same core pattern as Next dev mode.
8. Current Supabase region is detected as `ap-south-1 / Mumbai`.
9. Staging/preview validation was not available in Sprint 04-008K.

Latest production-like local warm averages from Sprint 04-008K:

| Runtime path | Context dbQuery | Dokumen dbQuery | Meaning |
|---|---:|---:|---|
| `DATABASE_URL` normal | 1920ms | 1386ms | Transaction pooler path stays slow |
| `DIRECT_URL` as runtime `DATABASE_URL` | 766ms | 407ms | Session-pooler runtime path materially faster |

## Goal
Create a concise owner-facing decision memo that converts the audit evidence into a clear recommendation sequence.

This is not an implementation task. The output must help the owner decide what to do next, while keeping production safe.

## Hard Boundaries
Do not:

- merge to `main`
- create migration
- add DB index
- modify Prisma schema
- change production `DATABASE_URL`
- rotate secrets
- commit `.env`, `.env.local`, logs, screenshots with secrets, or DB URLs
- install packages
- enable Prisma Accelerate
- migrate Supabase region
- change business logic
- change auth/permission logic
- add persistent cache for sensitive back office data
- move sensitive fetching to client
- create a new deployment just for this task

## Required Source Documents
Read before writing:

```text
docs/bmad/agent-execution-rules.md
docs/bmad/reports/back-office-performance-audit.md
docs/bmad/tasks/sprint-04-008j-back-office-infra-region-runtime-validation.md
docs/bmad/tasks/sprint-04-008k-back-office-production-like-latency-validation.md
```

## Required Output File
Create:

```text
docs/bmad/reports/back-office-connection-strategy-decision-memo.md
```

Do not replace the main audit report. This memo must reference the audit report as the source of evidence.

## Required Memo Structure

Use this exact structure.

### 1. Decision Summary

State the decision recommendation in this order:

1. Do **not** change production `DATABASE_URL` immediately.
2. Do **not** add DB indexes/migrations for this performance issue now.
3. Treat the next technical candidate as **connection/pooler strategy review**.
4. Keep Singapore region migration as a later infra option, not first action.
5. Keep Prisma Accelerate as a later option, not first reaction.
6. Wait for staging/preview or production-like deployed validation before any production-impacting change.

### 2. Evidence Recap

Summarize accepted evidence from 04-008F to 04-008K.

Must include:

- raw SQL is fast
- app/Prisma `dbQuery` is slow
- transaction pooler `6543` stays slow on warm request
- session-pooler `5432` is materially faster on warm request
- cold request remains slow on both paths
- local production mode reproduced the same pattern
- Supabase currently detected in `ap-south-1 / Mumbai`

### 3. Decision Options

Create this table:

```md
| Option | Recommendation | Why | Risk | When to revisit |
|---|---|---|---|---|
```

Rows must include:

1. Stay on current setup for now.
2. Review connection/pooler strategy.
3. Move Supabase to Singapore.
4. Adopt Prisma Accelerate.
5. Add DB indexes/migrations.

Required recommendations:

- Stay on current setup for now: **YES, as temporary safe baseline**.
- Review connection/pooler strategy: **YES, first technical candidate after deployed validation**.
- Move Supabase to Singapore: **NOT NOW, revisit after deployed validation**.
- Adopt Prisma Accelerate: **NOT NOW, revisit after connection strategy evidence**.
- Add DB indexes/migrations: **NO for this issue, unless future production EXPLAIN proves DB plan cost**.

### 4. Recommended Sequence

Write a numbered sequence:

1. Keep current production settings unchanged.
2. Prepare staging/preview validation when available.
3. In staging/preview, measure `/profil/admin-desa/dokumen` cold and warm timings.
4. If deployed warm latency repeats the pooler gap, review connection/pooler strategy first.
5. If deployed latency still shows strong region/network drag after connection strategy is understood, evaluate Singapore migration.
6. If connection/runtime overhead remains hard to solve operationally, evaluate Prisma Accelerate.
7. Only revisit indexes after production/staging EXPLAIN proves actual DB scan/sort cost.

### 5. Explicit Non-Decisions

List clearly:

- No production `DATABASE_URL` change in this memo.
- No Supabase region migration in this memo.
- No Prisma Accelerate adoption in this memo.
- No DB migration/index in this memo.
- No client-side sensitive cache strategy in this memo.

### 6. Handoff For Next Task

Define the next task only as a future optional task, not created unless owner asks:

```text
Sprint 04-008M - Back Office Deployed Runtime Latency Validation
```

Purpose:

- measure deployed staging/preview route latency
- confirm whether local production-like results reproduce outside local machine
- decide go/no-go for connection strategy review

Do not create Sprint 04-008M in this task.

## Required Report Cross-Link
Append a short note to:

```text
docs/bmad/reports/back-office-performance-audit.md
```

Add under or near the 04-008K section:

```md
### Connection Strategy Decision Memo

Follow-up decision memo created:

`docs/bmad/reports/back-office-connection-strategy-decision-memo.md`

Summary: no immediate production `DATABASE_URL` change; connection/pooler strategy review is the first technical candidate after deployed validation; Singapore migration and Prisma Accelerate remain later owner decisions.
```

## Quality Checks
Run and record in final response:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If this is docs-only and QA is skipped due time/environment, state it explicitly. Prefer running QA if possible.

## Expected Deliverables

1. New decision memo:

```text
docs/bmad/reports/back-office-connection-strategy-decision-memo.md
```

2. Updated audit report cross-link:

```text
docs/bmad/reports/back-office-performance-audit.md
```

3. No code implementation.
4. No env/log/temp files committed.
5. Final agent response follows `docs/bmad/agent-execution-rules.md`.

## Acceptance Criteria

This task is complete when:

- decision memo exists
- memo gives a clear recommendation order without asking owner to choose again
- audit report links to the decision memo
- no production-impacting change is made
- no migration/index/schema/env/secret changes are committed
- QA status is recorded
