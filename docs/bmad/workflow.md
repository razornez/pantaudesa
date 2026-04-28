# PantauDesa BMAD-lite Workflow

Date: 2026-04-28
Status: active-workflow
Prepared-by: Rangga / BMAD-lite orchestration

## Purpose

This file explains how PantauDesa uses BMAD-lite in practice.

BMAD-lite here is Markdown-based workflow documentation, not a package install.

## Why this exists

PantauDesa has many moving parts:

- product trust rules,
- Owner/Iwan approvals,
- UI gates,
- database migration gates,
- seed gates,
- read-path gates,
- QA reports,
- chat handoffs.

BMAD-lite keeps all of that aligned across chats and contributors.

## Core workflow

Every meaningful task should move through this sequence:

```text
1. Context
2. Gate / Story
3. Acceptance Criteria
4. Boundary Check
5. Implementation
6. QA
7. Report
8. Review
9. Decision
10. Status Update
```

## Step 1 — Context

Read:

1. `docs/bmad/project-context.md`
2. `docs/bmad/boundary-rules.md`
3. `docs/bmad/sprint-status.md`
4. active story under `docs/bmad/stories/`

Goal:

- understand current state,
- avoid reopening closed topics,
- avoid breaking trust/data boundaries.

## Step 2 — Gate / Story

Before coding, there should be a story or gate.

Story should include:

- goal,
- scope,
- out-of-scope,
- acceptance criteria,
- affected files/routes,
- QA commands,
- report requirement.

For quick fixes, update the active story rather than creating a huge new process.

## Step 3 — Acceptance Criteria

Acceptance criteria must be testable.

Example:

```text
/desa shows Mode: Database + Angka Demo when DB seed is readable.
/desa?cari=ancolmekar finds Ancolmekar.
Budget values remain labelled Angka Demo.
```

Bad acceptance criteria:

```text
Make it better.
Improve data.
Use real data.
```

## Step 4 — Boundary Check

Before implementation, check:

- is this schema/migration?
- is this seed?
- is this read path?
- is this numeric APBDes?
- is this verified status?
- is this scraper/scheduler?
- does this touch auth/voice/API?

If yes, explicit Iwan gate is required.

## Step 5 — Implementation

Implementation should be as small as possible.

Prefer:

- one story,
- one affected area cluster,
- clear fallback,
- no broad refactor unless approved.

## Step 6 — QA

Minimum QA for current Sprint 03 DB/read tasks:

```bash
npx prisma validate
npx tsc --noEmit
npm run test
npm run build
```

Route checks:

- `/desa`
- `/desa?cari=ancolmekar`
- `/desa/ancolmekar`
- `/desa/4`

## Step 7 — Report

Every implementation batch should have a report in `/docs/engineering` or `/docs/product`.

Report should include:

- status,
- what changed,
- files changed,
- QA results,
- route checks,
- known risks,
- boundary confirmation,
- next recommended story.

## Step 8 — Review

Rangga reviews against:

- story acceptance criteria,
- boundary rules,
- report claims,
- source diff,
- QA result.

Verdict options:

- `ACCEPTED_FOR_OWNER_REVIEW`
- `DONE_PENDING_QA`
- `REWORK`
- `BLOCKED`

## Step 9 — Decision

Iwan/Owner decide:

- accept,
- request rework,
- block,
- open next gate.

Do not silently mark sensitive work as accepted.

## Step 10 — Status Update

After decision, update:

- `docs/bmad/sprint-status.md`
- relevant story file,
- `docs/bmad/decision-log.md` if decision is important,
- canonical tracker if it is a product tracker item and Iwan approved.

## Current example: Hybrid DB + Mock Flagging

### Context

Seeded Arjasari data should exist in DB, but Owner did not see Ancolmekar.

### Story

- `docs/bmad/stories/sprint-03-002-db-read-hybrid-mock-flagging.md`

### Fixes already applied

- force dynamic read on `/desa` and `/desa/[id]`,
- province filter derived from actual data,
- Prisma guarded against missing/bad `DATABASE_URL`,
- fallback to mock remains safe.

### QA expectation

If DB runtime is configured:

- Ancolmekar appears,
- banner says `Mode: Database + Angka Demo`,
- card says `Dari Database`,
- budget says `Angka Demo`.

If DB runtime is not configured:

- page does not crash,
- banner says `Mode: Mock/Hardcoded`,
- cards say `Mock/Hardcoded`.

## How to start a new chat

Paste this instruction:

```text
Read these first:
- docs/bmad/project-context.md
- docs/bmad/workflow.md
- docs/bmad/boundary-rules.md
- docs/bmad/sprint-status.md
- docs/bmad/decision-log.md
- active story in docs/bmad/stories/

Then continue as Rangga/Iwan/Ujang according to role.
Do not open new gate without explicit instruction.
```
