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

Record these server timings if available:
- `route=admin-desa.context step=dbQuery`
- `route=admin-desa.dokumen step=dbQuery`
- `route=admin-desa.context step=serializeRows`
- `route=admin-desa.dokumen step=serializeRows`

## Candidate Measurement
After staging/preview env change only:
- redeploy/restart staging/preview runtime
- measure cold #1
- warm #2
- warm #3
- warm #4

Repeat the same route and the same QA account used in the baseline.

## Success Criteria
- warm context `dbQuery` improves materially, target: at least 40% faster
- warm dokumen `dbQuery` improves materially, target: at least 40% faster
- auth still works
- admin desa context still resolves
- document list still renders
- upload UI still loads without permission regression

## Rollback
Restore previous staging/preview `DATABASE_URL` value and redeploy/restart staging/preview runtime.

After rollback, re-check:
- QA admin login still works
- `/profil/admin-desa/dokumen` loads
- document list appears again

## Owner Execution Steps
1. Open the existing staging/preview project environment settings.
2. Record the current staging/preview `DATABASE_URL` value privately for rollback.
3. Measure baseline route timing on `/profil/admin-desa/dokumen`:
   - cold #1
   - warm #2
   - warm #3
   - warm #4
4. Change **staging/preview only** runtime `DATABASE_URL` to the session-pooler path currently represented by `DIRECT_URL`.
5. Redeploy or restart the staging/preview runtime.
6. Log in with a QA admin desa account and verify:
   - auth works
   - `/profil/admin-desa/dokumen` renders
   - document list appears
   - upload UI loads
7. Record candidate timing on the same route:
   - cold #1
   - warm #2
   - warm #3
   - warm #4
8. Compare warm averages against baseline.
9. If the candidate path breaks auth or rendering, rollback immediately.
10. Production remains blocked until staging/preview evidence is reviewed in a separate owner-approved task.

## Evidence To Record
Use this sanitized format in the audit report:

| Environment | Runtime path | Run | Context dbQuery | Dokumen dbQuery | Notes |
|---|---|---|---:|---:|---|
| staging/preview | baseline | cold #1 | ... | ... | |
| staging/preview | baseline | warm avg | ... | ... | |
| staging/preview | session-pooler candidate | cold #1 | ... | ... | |
| staging/preview | session-pooler candidate | warm avg | ... | ... | |

Do not paste:
- DB URLs
- passwords
- tokens
- raw env values
- screenshots with secrets

## Production Gate
Production change remains blocked until owner approves based on staging/preview evidence.
