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

## Operating model

PantauDesa uses a **batch-first executor workflow**.

Default rule:

- Iwan/Owner opens direction or gate.
- Rangga turns it into a ready-to-execute batch prompt/story.
- Ujang/Asep execute technical work locally when code/env/build/browser/DB QA is needed.
- Ujang/Asep include implementation notes in the commit message.
- Ujang/Asep run QA/guardrails locally, then commit and push.
- Owner checks result directly.
- If Owner says OK, Rangga reviews the commit/report and updates BMAD/docs/status.

Rangga may directly execute only when the task is docs-only or does not require local QA/env/browser/secret-dependent work.

## Role responsibilities

| Role | Responsibility |
|---|---|
| Iwan | Command owner. Opens gates, approves scope, prevents conflicting work. |
| Owner | Checks result directly and gives OK/rework feedback. |
| Rangga | PM/BA/reviewer/docs owner. Prepares batch prompts, acceptance criteria, guardrails, and updates BMAD/docs after execution. |
| Ujang | Technical executor. Implements approved batch, runs local QA, includes implementation note in commit message, pushes. |
| Asep | Technical/frontend reviewer or executor. Can take handover if Ujang token/context is exhausted, but must follow same story/guardrails. |

## Batch-first rule

Do not split technical work into tiny one-off prompts unless urgent.

Prefer one batch containing:

- one theme,
- one affected area cluster,
- clear acceptance criteria,
- clear guardrails,
- QA commands,
- route checks,
- expected commit/report format.

Reason:

- saves token,
- avoids conflicting instructions,
- keeps Iwan/Ujang/Asep aligned,
- makes Owner review easier.

## Core workflow

Every meaningful task should move through this sequence:

```text
1. Context
2. Gate / Story
3. Acceptance Criteria
4. Boundary Check
5. Execution Prompt
6. Implementation
7. QA + Guardrail Check
8. Commit + Push
9. Owner Check
10. Rangga Review + Docs Update
11. Decision / Next Gate
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
- commit message requirement,
- report/update requirement.

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

## Step 5 — Execution Prompt

Rangga prepares a prompt ready for Ujang/Asep.

Minimum format:

```text
Task: <batch name>
Executor: Ujang/Asep
Status: OPEN_FOR_IMPLEMENTATION

Goal:
<goal>

Read first:
- docs/bmad/project-context.md
- docs/bmad/workflow.md
- docs/bmad/boundary-rules.md
- docs/bmad/sprint-status.md
- <active story/report>

Scope:
- <allowed work>

Out of scope:
- <blocked work>

Acceptance Criteria:
1. ...

Guardrails:
- no secrets
- no schema/migration unless approved
- no seed unless approved
- no verified
- no numeric extraction
- no scraper/scheduler
- mock fallback remains, if relevant

QA:
- npx prisma validate
- npx tsc --noEmit
- npm run test
- npm run build
- route checks: ...

Commit message must include:
- what changed
- QA result
- guardrail confirmation
- known risk, if any

Report back:
- files changed
- QA result
- route result
- known risks
- commit SHA
```

## Step 6 — Implementation

Implementation should be as small as possible but batched enough to avoid waste.

Prefer:

- one story,
- one affected area cluster,
- clear fallback,
- no broad refactor unless approved.

Ujang/Asep should not open unrelated work while executing a batch.

## Step 7 — QA + Guardrail Check

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

Guardrail confirmation must be included in commit message or handoff note.

## Step 8 — Commit + Push

Implementation note should be embedded in the commit message, not as a separate implementation note file unless Rangga/Iwan explicitly asks for a report file.

Commit message should include:

```text
<type(scope): short summary>

What changed:
- ...

QA:
- npx tsc --noEmit: PASS
- npm run test: PASS
- npm run build: PASS

Guardrails:
- no secrets
- no schema/migration
- no seed
- no verified
- no numeric extraction
- no scraper/scheduler

Known risks:
- ...
```

## Step 9 — Owner Check

Owner checks the result directly in app/staging/local.

Owner response examples:

- `OK`
- `rework`
- `blocked`
- specific visual/product feedback

## Step 10 — Rangga Review + Docs Update

After Owner says OK, Rangga:

- checks latest commits/diff,
- summarizes what Ujang/Asep changed,
- updates BMAD story/status,
- updates decision log if important,
- updates engineering/product report only if needed,
- does not duplicate full implementation notes if commit message already contains them.

## Step 11 — Decision / Next Gate

Iwan/Owner decide:

- accept,
- request rework,
- block,
- open next gate.

Do not silently mark sensitive work as accepted.

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

Then continue as Rangga/Iwan/Ujang/Asep according to role.
Use batch-first workflow.
Rangga prepares execution prompts and docs/status.
Ujang/Asep handle technical implementation, local QA, guardrails, commit, and push.
Implementation notes go in commit messages unless a report file is explicitly requested.
Do not open new gate without explicit instruction.
```
