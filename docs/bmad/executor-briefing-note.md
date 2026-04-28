# PantauDesa Executor Briefing Note

Date: 2026-04-28
Status: ACTIVE_POLICY
Prepared-by: Rangga / BMAD-lite orchestration
Audience: Iwan, Ujang, Asep

## Purpose

This note aligns Iwan, Ujang, and Asep on the batch-first task-file workflow.

The goal is to reduce token waste, avoid overlapping instructions, and keep technical execution accurate.

## Core policy

Long task instructions live in task files:

```text
docs/bmad/tasks/<task-id>.md
```

Chat handoff should stay short.

## Role alignment

### Iwan

Iwan is the command owner / gatekeeper.

Iwan focuses on:

- opening gates,
- approving scope,
- deciding priorities,
- preventing conflicting work,
- deciding accept, rework, block, or next gate.

### Rangga

Rangga owns orchestration and docs.

Rangga focuses on:

- preparing BMAD task files,
- defining acceptance criteria,
- defining guardrails,
- preparing short handoff prompts,
- reviewing commits after Owner OK,
- updating BMAD/docs/status/decision log.

Rangga may execute directly when work is docs-only or safe to do without local environment, browser QA, DB access, or build/test runs.

Rangga assigns to Ujang/Asep when work requires local technical execution, runtime validation, browser checks, DB access, or full QA.

### Ujang

Ujang is a technical executor.

Ujang should:

1. pull latest `main`,
2. read the assigned task file,
3. execute only the task scope,
4. run QA and guardrail checks locally,
5. commit and push,
6. include implementation notes in the commit message,
7. report commit SHA plus QA/route summary.

Ujang should not widen scope or create extra documentation unless the task file explicitly asks.

### Asep

Asep can act as technical executor, frontend reviewer, or handover executor.

Asep should:

1. pull latest `main`,
2. read the same task file,
3. continue from latest commit,
4. keep the same scope and guardrails,
5. run QA,
6. commit/push only necessary fixes,
7. report commit SHA plus QA/route summary.

Asep should not duplicate Rangga documentation work unless requested.

## Batch-first rule

Related technical work should be grouped into batches.

Prefer one batch per area, for example:

- DB-first displayed data batch,
- Data Desa UI batch,
- Voice DB read batch,
- source/document review batch.

Each batch should have:

- goal,
- scope,
- out-of-scope,
- acceptance criteria,
- guardrails,
- QA commands,
- route checks,
- commit message requirement.

## Commit message rule

Implementation notes should go inside commit messages unless a separate report file is explicitly requested.

Recommended commit message body:

```text
What changed:
- ...

QA:
- npx prisma validate: PASS
- npx tsc --noEmit: PASS
- npm run test: PASS
- npm run build: PASS
- route checks: PASS/OBSERVED

Guardrails:
- no environment files committed
- no schema/migration change unless approved
- no seed rerun unless approved
- no verified status
- no official numeric APBDes extraction
- no scraper/scheduler
- no new dependency

Known risks:
- ...
```

## Short handoff templates

For Ujang:

```text
Ujang, pull latest main, read <task-file>, execute exactly as written, run QA/guardrails, commit with implementation note, push, then report commit SHA + QA/route summary. Do not widen scope beyond the task file.
```

For Asep handover:

```text
Asep, pull latest main, read <task-file>, continue from latest commit, keep the same scope/guardrails, run QA, commit/push only necessary fixes, then report commit SHA + QA/route summary.
```

## Current first technical batch

Current task file:

```text
docs/bmad/tasks/sprint-03-004-db-first-all-displayed-data-batch.md
```

Short handoff:

```text
Ujang, pull latest main, read docs/bmad/tasks/sprint-03-004-db-first-all-displayed-data-batch.md, execute as one Sprint 03 DB-first batch, run QA/guardrails, commit with implementation note, push, then report commit SHA + QA/route summary. Do not widen scope beyond the task file.
```

If Asep takes over:

```text
Asep, pull latest main, read docs/bmad/tasks/sprint-03-004-db-first-all-displayed-data-batch.md, continue from latest commit, keep the same scope/guardrails, run QA, commit/push only necessary fixes, then report commit SHA + QA/route summary.
```

## Sprint 03 policy

Sprint 03 is moving toward DB-first displayed data.

Owner goal:

- all displayed data comes from DB,
- current hardcoded/mock displayed data is seeded into DB as mock/demo rows,
- if DB is unavailable, show controlled empty/unavailable state instead of silent hardcoded fallback,
- mock/dummy values must be visibly marked, for example `(mock)`,
- no `verified`,
- no official numeric APBDes extraction,
- no scraper/scheduler,
- no new dependency.

## Final reminder

When uncertain:

- Ujang/Asep should stop and report blocker.
- Rangga should clarify with Iwan/Owner and update docs/status.
- Do not improvise beyond the task file.
