# Sprint 04-008K - Back Office Production-like Latency Validation

## Status
READY FOR EXECUTION - validation only, no implementation.

## Execution Rule
Follow:

```text
docs/bmad/agent-execution-rules.md
```

This task is intentionally decision-locked. Ujang/Codex executes the steps below and records evidence. Do not reopen the decision tree unless a hard blocker occurs.

## Context
Sprint 04-008F through 04-008J narrowed the back office performance problem to **connection/runtime path overhead**, not raw DB execution.

Known evidence so far:

- Raw SQL EXPLAIN is sub-millisecond in local dataset.
- `DATABASE_URL` via transaction pooler `6543` is slow on warm request.
- Runtime using the `DIRECT_URL`/session-pooler path `5432` is ~65-68% faster on warm request.
- Cold request remains slow on both paths.
- Supabase is currently detected in `ap-south-1 / Mumbai`.
- Local dev is not enough for production decision because Next dev server, local machine, and local network can exaggerate timings.

## Goal
Validate whether the same latency pattern appears in a more production-like runtime before any owner decision about connection strategy, Prisma Accelerate, or region migration.

## Final Decision Already Set
Do not choose a new architecture in this task.

The owner/reviewer decision for this task is:

1. Validate production-like behavior first.
2. If warm latency is still high, connection/pooler strategy is the first technical lever to review.
3. If cold and warm latency still strongly suggest geographic/network drag after runtime factors are isolated, Singapore migration can be evaluated later.
4. Prisma Accelerate is not first-line until production-like validation confirms connection/runtime overhead remains material.

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

## Required Source Documents
Read before execution:

```text
docs/bmad/agent-execution-rules.md
docs/bmad/reports/back-office-performance-audit.md
docs/bmad/tasks/sprint-04-008j-back-office-infra-region-runtime-validation.md
```

## Target Route

```text
/profil/admin-desa/dokumen
```

Required perf lines to capture:

```text
[perf][back-office] route=admin-desa.context step=dbQuery rows=... durationMs=...
[perf][back-office] route=admin-desa.dokumen step=dbQuery rows=... durationMs=...
[perf][back-office] route=admin-desa.context step=serializeRows durationMs=...
[perf][back-office] route=admin-desa.dokumen step=serializeRows durationMs=...
```

Do not record user id, desa id, email, token, document title, DB URL, host credentials, or storage key.

## Validation Priority

Execute in this order.

### Priority 1 - Local production mode validation

This removes Next dev server overhead while staying safe and local.

1. Checkout and update branch:

```bash
git checkout fix/mobile-suara-profile-admin-access-polish
git pull origin fix/mobile-suara-profile-admin-access-polish
```

2. Run build:

```bash
npm run build
```

3. Run app in production mode with perf logging:

```bash
PERF_DEBUG_BACK_OFFICE=true npm run start
```

If the project does not have a valid `npm run start`, use the existing Next production start command from `package.json` and document it.

4. Owner/browser operator opens:

```text
http://localhost:3000/profil/admin-desa/dokumen
```

5. Record 4 measurements:

- cold load #1 after `npm run start`
- warm refresh #2
- warm refresh #3
- warm refresh #4

6. Use current normal runtime `DATABASE_URL` first. Do not change env yet.

### Priority 2 - Local production mode with session-pooler runtime path

Only after Priority 1 is done.

1. Backup local env file:

```bash
cp .env.local .env.local.backup
```

2. Temporarily set runtime `DATABASE_URL` to the same value as `DIRECT_URL`.

Rules:
- do not print the value
- do not commit the value
- do not paste it into the report

3. Restart production server:

```bash
PERF_DEBUG_BACK_OFFICE=true npm run start
```

4. Repeat 4 measurements:

- cold load #1
- warm refresh #2
- warm refresh #3
- warm refresh #4

5. Restore env immediately after measurement:

```bash
cp .env.local.backup .env.local
rm .env.local.backup
```

If using Windows PowerShell, use equivalent safe commands and document only the action, not secrets.

### Priority 3 - Staging / preview deployment validation

Run this only if a staging or preview URL is already available without requiring new infra changes.

If available:

1. Use existing deployed preview/staging URL.
2. Enable existing safe perf logging only if already configured.
3. Measure target route cold/warm if authenticated access is available.
4. Record only timing and route labels.

If unavailable:

- Do not create new deployment just for this task.
- Document: `staging/preview validation not available in this run`.
- This is not a failure if Priority 1 and 2 were completed.

## Required Report Update
Update:

```text
docs/bmad/reports/back-office-performance-audit.md
```

Append a section:

```md
## Production-like Latency Validation - Sprint 04-008K

### Method
- Local production mode using `npm run build` + `npm run start`
- Target route: `/profil/admin-desa/dokumen`
- Measurements: cold #1, warm #2, warm #3, warm #4
- No secrets logged

### Results

| Runtime path | Run | Context dbQuery | Dokumen dbQuery | Notes |
|---|---|---:|---:|---|
| DATABASE_URL normal | Cold #1 | ...ms | ...ms | local production mode |
| DATABASE_URL normal | Warm #2 | ...ms | ...ms | local production mode |
| DATABASE_URL normal | Warm #3 | ...ms | ...ms | local production mode |
| DATABASE_URL normal | Warm #4 | ...ms | ...ms | local production mode |
| DIRECT_URL as runtime DATABASE_URL | Cold #1 | ...ms | ...ms | local production mode |
| DIRECT_URL as runtime DATABASE_URL | Warm #2 | ...ms | ...ms | local production mode |
| DIRECT_URL as runtime DATABASE_URL | Warm #3 | ...ms | ...ms | local production mode |
| DIRECT_URL as runtime DATABASE_URL | Warm #4 | ...ms | ...ms | local production mode |

### Interpretation
- State whether local production mode reproduces the same pattern as Next dev.
- State whether warm session-pooler path remains materially faster.
- State whether cold-start remains dominant.
- State whether staging/preview validation was available.

### Owner Recommendation
- If pattern matches 04-008I: connection/pooler strategy review is next technical candidate.
- If local production mode is much faster overall: Next dev overhead was a major contributor; validate deployed runtime before infra changes.
- If cold remains slow but warm is acceptable: prioritize cold-start/runtime mitigation before region migration.
- If both cold and warm remain slow in production-like runtime: evaluate connection strategy first, then Singapore migration or Prisma Accelerate.
```

## Interpretation Rules

Use these rules. Do not invent a new decision framework.

### Case A - Production-like mode is much faster than dev

Conclusion:
- Next dev server/local dev overhead was a major contributor.
- Do not make infra changes yet.
- Next action: validate deployed staging/preview if available.

### Case B - Session-pooler runtime path is still materially faster on warm request

Conclusion:
- Connection/pooler strategy remains the first technical candidate.
- Do not change production `DATABASE_URL`; recommend owner review only.

### Case C - Cold request remains slow but warm becomes acceptable

Conclusion:
- Cold-start/runtime startup is the main problem.
- Prioritize cold-start mitigation and deployed runtime validation.

### Case D - Both cold and warm remain slow in production-like mode

Conclusion:
- Connection/runtime path remains a strong production-like bottleneck.
- Recommend owner evaluate connection strategy first, then region/Prisma Accelerate.

## Quality Checks

Run and record:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If `npm run build` was already run as part of validation, record that result.

If a command fails due known local issue such as Windows EPERM / Prisma DLL / network font problem, record exact failure honestly.

## Expected Deliverables

1. Updated report only:

```text
docs/bmad/reports/back-office-performance-audit.md
```

2. No code changes unless required to remove temporary local-only logs introduced by this task.
3. No env/log/temp files committed.
4. Clear owner recommendation based on the defined interpretation rules.

## Acceptance Criteria

This task is complete when:

- local production mode baseline timings are recorded
- local production mode session-pooler runtime timings are recorded, unless blocked by env access
- cold vs warm behavior is documented
- staging/preview availability is documented
- report states which interpretation case applies
- no migration/index/schema/env/secret changes are committed
- QA status is recorded
