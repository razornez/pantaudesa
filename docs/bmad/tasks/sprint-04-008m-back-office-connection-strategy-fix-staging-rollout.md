# Sprint 04-008M - Back Office Connection Strategy Fix Staging Rollout

## Status
READY FOR EXECUTION - staging/preview fix rollout only, production guarded.

## Execution Rule
Follow:

```text
docs/bmad/agent-execution-rules.md
```

This task is decision-locked. Ujang/Codex should execute the steps below without asking for additional product/architecture decisions. Ask only for hard blockers defined in `agent-execution-rules.md`.

## Why This Task Exists
Sprint 04-008L is a decision memo task. It does **not** fix the slow load.

This Sprint 04-008M task is the first safe fix rollout task. It moves from audit/memo into controlled remediation, but only in staging/preview or local production-like validation. It must not change production until owner explicitly approves.

## Current Accepted Diagnosis
Back office `/profil/admin-desa/dokumen` load is slow because of **connection/runtime path overhead**, not raw DB execution.

Accepted evidence:

| Evidence | Result |
|---|---:|
| Raw SQL EXPLAIN context | ~0.210ms |
| Raw SQL EXPLAIN documents | ~0.240ms |
| Local production normal `DATABASE_URL` warm context | ~1920ms |
| Local production normal `DATABASE_URL` warm documents | ~1386ms |
| Local production session-pooler runtime warm context | ~766ms |
| Local production session-pooler runtime warm documents | ~407ms |

Decision already made:

1. No DB migration/index for this issue now.
2. First technical fix candidate is **connection/pooler strategy**.
3. Session-pooler runtime path is the first candidate to validate as a fix.
4. Production `DATABASE_URL` must not be changed in this task.

## Goal
Prepare and, where access exists, execute a staging/preview rollout of the connection strategy fix candidate:

> Use the session-pooler runtime path for `DATABASE_URL` in staging/preview, then measure whether `/profil/admin-desa/dokumen` warm latency improves without breaking auth, upload, admin context, or document list rendering.

This task should produce one of two outcomes:

1. **Executed in staging/preview:** before/after measurements recorded and recommendation updated.
2. **Blocked by missing staging/preview access:** rollout runbook created with exact owner steps, without changing production.

## Hard Boundaries
Do not:

- merge to `main`
- change production `DATABASE_URL`
- rotate secrets
- paste or commit DB URLs, passwords, tokens, `.env`, `.env.local`, logs, screenshots with secrets
- create migration
- add DB index
- modify Prisma schema
- install packages
- enable Prisma Accelerate
- migrate Supabase region
- change business logic
- change auth/permission logic
- bypass auth/permission for performance
- add persistent cache for sensitive back office data
- move sensitive fetching to client

Allowed:

- change staging/preview environment variable if the agent already has explicit staging/preview environment access
- create documentation/runbook for owner execution if environment access is missing
- update BMAD reports with sanitized timing evidence

## Required Source Documents
Read first:

```text
docs/bmad/agent-execution-rules.md
docs/bmad/reports/back-office-performance-audit.md
docs/bmad/reports/back-office-connection-strategy-decision-memo.md
docs/bmad/tasks/sprint-04-008k-back-office-production-like-latency-validation.md
```

If `back-office-connection-strategy-decision-memo.md` does not exist yet because Sprint 04-008L has not been executed, continue using `back-office-performance-audit.md` as source of truth and document that 04-008L memo is pending.

## Required Deliverables

Create:

```text
docs/bmad/runbooks/back-office-connection-strategy-staging-rollout.md
```

Update:

```text
docs/bmad/reports/back-office-performance-audit.md
```

If Sprint 04-008L memo exists, also append a short reference there:

```text
docs/bmad/reports/back-office-connection-strategy-decision-memo.md
```

Do not modify code unless required only to remove temporary local-only artifacts created during measurement.

## Task 1 - Create Staging Rollout Runbook
Create `docs/bmad/runbooks/back-office-connection-strategy-staging-rollout.md` with this structure:

```md
# Back Office Connection Strategy Staging Rollout Runbook

## Purpose
Safely validate whether using the session-pooler runtime path for `DATABASE_URL` improves back office latency before any production change.

## Scope
Staging/preview only. No production `DATABASE_URL` change.

## Candidate Fix
Set staging/preview runtime `DATABASE_URL` to the same connection path currently represented by `DIRECT_URL` / session-pooler path.

## Pre-checks
- Confirm staging/preview environment exists.
- Confirm auth works for a QA admin desa account.
- Confirm target route: `/profil/admin-desa/dokumen`.
- Confirm no secrets will be pasted into reports.

## Baseline Measurement
Measure current staging/preview `DATABASE_URL` path:
- cold #1
- warm #2
- warm #3
- warm #4

## Candidate Measurement
After staging/preview env change only:
- redeploy/restart staging/preview runtime
- measure cold #1
- warm #2
- warm #3
- warm #4

## Success Criteria
- warm context `dbQuery` improves materially, target: at least 40% faster
- warm dokumen `dbQuery` improves materially, target: at least 40% faster
- auth still works
- admin desa context still resolves
- document list still renders
- upload UI still loads without permission regression

## Rollback
Restore previous staging/preview `DATABASE_URL` value and redeploy/restart staging/preview runtime.

## Production Gate
Production change remains blocked until owner approves based on staging/preview evidence.
```

Do not include actual DB URLs.

## Task 2 - Execute Staging/Preview Rollout If Access Exists
If staging/preview access exists and changing env is already authorized for staging/preview:

1. Record current staging/preview baseline timing for `/profil/admin-desa/dokumen`:
   - cold #1
   - warm #2
   - warm #3
   - warm #4
2. Change **staging/preview only** runtime `DATABASE_URL` to the session-pooler path.
3. Redeploy/restart staging/preview runtime.
4. Re-test:
   - auth/login as QA admin desa
   - `/profil/admin-desa/dokumen` renders
   - document list appears
   - upload UI loads
5. Record candidate timing:
   - cold #1
   - warm #2
   - warm #3
   - warm #4
6. If broken, rollback staging/preview env immediately.
7. Update report with before/after table and recommendation.

If access does **not** exist:

- Do not ask the owner to choose.
- Do not attempt production.
- Mark execution as blocked by missing staging/preview access.
- Finish the runbook and report update with exact owner steps.

## Task 3 - Update Main Audit Report
Append to:

```text
docs/bmad/reports/back-office-performance-audit.md
```

Add:

```md
## Connection Strategy Fix Rollout - Sprint 04-008M

### Status
- <Executed in staging/preview | Blocked: no staging/preview access>

### Candidate Fix
Staging/preview runtime `DATABASE_URL` uses the session-pooler path that was materially faster in local production validation.

### Results
| Environment | Runtime path | Run | Context dbQuery | Dokumen dbQuery | Notes |
|---|---|---|---:|---:|---|
| staging/preview | baseline | cold #1 | ... | ... | if available |
| staging/preview | baseline | warm avg | ... | ... | if available |
| staging/preview | session-pooler candidate | cold #1 | ... | ... | if available |
| staging/preview | session-pooler candidate | warm avg | ... | ... | if available |

### Recommendation
- If executed and improved: recommend owner approval for a production change plan in a separate task.
- If executed and not improved: do not change production; investigate cold-start/runtime/region next.
- If blocked: owner must provide staging/preview access or run the included runbook.

### Guardrails
- No production `DATABASE_URL` change in this task.
- No migration/index/schema change.
- No secret committed.
```

## Task 4 - Optional Decision Memo Cross-link
If this file exists:

```text
docs/bmad/reports/back-office-connection-strategy-decision-memo.md
```

Append:

```md
## Staging Rollout Follow-up

Sprint 04-008M created a staging rollout runbook:

`docs/bmad/runbooks/back-office-connection-strategy-staging-rollout.md`

Production change remains blocked until staging/preview evidence is available and owner approves.
```

## Task 5 - QA
Run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If docs-only and QA is skipped due environment/time, state it explicitly. Prefer running QA.

## Interpretation Rules
Use these exact rules.

### Case A - Staging/preview candidate improves warm latency by >=40%
Recommendation:
- Candidate fix is promising.
- Create next owner-approved task for production rollout plan.
- Still do not change production in this task.

### Case B - Staging/preview candidate improves warm latency but <40%
Recommendation:
- Candidate partially helps.
- Do not production-rollout yet.
- Compare region/cold-start/Prisma runtime factors next.

### Case C - Staging/preview candidate does not improve latency
Recommendation:
- Do not production-rollout.
- Connection path is not enough in deployed runtime.
- Evaluate cold-start/runtime or region next.

### Case D - Staging/preview access unavailable
Recommendation:
- No production change.
- Owner should run the runbook or provide staging/preview access.

## Expected Final Agent Response
Use the format from:

```text
docs/bmad/agent-execution-rules.md
```

## Acceptance Criteria
This task is complete when:

- staging rollout runbook exists
- main audit report records executed or blocked status
- if staging/preview was available, before/after measurements are recorded
- if staging/preview was unavailable, owner steps are clear and no question is asked
- no production env change is made
- no migration/index/schema/env/secret changes are committed
- QA status is recorded
