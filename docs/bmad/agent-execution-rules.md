# BMAD Agent Execution Rules

## Purpose
This document defines how execution agents such as Ujang/Codex and Asep/Claude should work on PantauDesa BMAD tasks.

The goal is to reduce back-and-forth. Agents should execute the written BMAD task, not reopen product/architecture decisions that have already been made by the owner/reviewer.

## Roles

| Role | Responsibility |
|---|---|
| Owner / Reviewer | Makes product, architecture, infra, and risk decisions. Defines task scope, boundaries, and acceptance criteria. |
| Ujang / Codex | Executor. Implements or audits exactly according to the BMAD task. Does not change scope. |
| Asep / Claude | Executor/reviewer. Follows the same BMAD source of truth and guardrails. |

## Source of Truth

Agents must treat these as the source of truth, in order:

1. The active BMAD task file in `docs/bmad/tasks/`.
2. Relevant BMAD report in `docs/bmad/reports/`.
3. Existing project rules and guardrails documented in the task.
4. Existing code behavior.

If the BMAD task and code disagree, do not improvise a bigger fix. Document the mismatch in the report or final note.

## Default Execution Mode

Agents should default to execution, not discussion.

Do:
- Read the assigned BMAD task first.
- Follow the exact scope and hard boundaries.
- Make the smallest safe change required by the task.
- Record evidence in the required report file.
- Run required QA commands if listed.
- Commit only the files allowed by the task.
- Summarize what changed, what was verified, and what remains blocked.

Do not:
- Ask the owner to choose between options when the BMAD task already defines the recommendation order.
- Expand scope into migration, index, third-party package, production env change, or business logic change unless explicitly approved in the task.
- Merge to `main`.
- Commit `.env`, secrets, logs, screenshots with secrets, or temporary files.
- Re-litigate architecture decisions already written in the BMAD task.

## When Agent May Ask A Question

Ask only when one of these hard blockers occurs:

1. A required secret/credential/login is missing and the task cannot proceed without owner action.
2. The task asks for an action that would violate a hard boundary.
3. The repo state has conflicts or missing files that make the task impossible to complete safely.
4. A production-impacting decision is required and not already specified in BMAD.

If asking is required, ask one short question and include the safest default recommendation.

## If Detail Is Missing

If a minor detail is missing, agents should choose the safest default and continue.

Safe defaults:
- Documentation-only instead of implementation.
- Audit/report update instead of code change.
- No migration/index.
- No production env change.
- No third-party install.
- Preserve business logic.
- Redact sensitive values.

## Required Final Response Format For Agents

When done, the agent should return:

```text
Done.

Branch:
- <branch>

Commit:
- <sha> — <message>

Files changed:
- <file 1>
- <file 2>

Summary:
- <short factual bullets>

QA:
- npm run lint — <pass/fail/blocked>
- npx tsc --noEmit — <pass/fail/blocked>
- npm run build — <pass/fail/blocked>

Guardrails:
- no migration
- no index
- no production DATABASE_URL change
- no secrets committed
- no business logic change

Blocked / needs owner decision:
- <only if truly blocked>
```

## Current Back Office Performance Audit Decision

For Sprint 04-008F through 04-008J, the current decision is:

1. The root cause is treated as **connection/runtime path overhead**, not raw DB execution.
2. Transaction pooler `6543` is slow on warm request.
3. Session pooler `5432` is materially faster on warm request but does not remove cold-start penalty.
4. Supabase is currently detected in `ap-south-1 / Mumbai`.
5. Next evidence gate is staging/production-like validation.
6. Do not create DB migration/index for this performance issue unless future production-like EXPLAIN proves a DB plan problem.
7. Do not change production `DATABASE_URL` without explicit owner approval.
8. Do not adopt Prisma Accelerate as first reaction before staging/production-like validation.

## Instruction Template For Owner

Use this short handoff format:

```text
Ujang, pull branch <branch> lalu kerjakan task BMAD:

<task path>

Eksekusi sesuai task. Jangan minta keputusan tambahan kecuali ada blocker keras seperti secret/login, konflik repo, atau tindakan yang melanggar guardrail. Semua keputusan scope sudah ditentukan di BMAD. Output akhir cukup commit + summary + QA + guardrails.
```
