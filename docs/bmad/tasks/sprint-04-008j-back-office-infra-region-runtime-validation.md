# Sprint 04-008J - Back Office Infra Region Runtime Validation

## Status
READY FOR EXECUTION - analysis and owner decision support only. No implementation in this task.

## Context
Sprint 04-008F through Sprint 04-008I already narrowed the back office slowness to the connection/runtime path around Prisma and the DB route, not raw SQL execution.

Current known evidence:

- Raw SQL execution is sub-millisecond in the local audit dataset.
- Warm runtime latency improved materially when runtime `DATABASE_URL` used the session pooler path instead of the transaction pooler path.
- Cold request remains slow on both paths, so pooler choice alone does not explain the full first-load penalty.
- Current shared Supabase host is detected as `aws-1-ap-south-1.pooler.supabase.com`, which maps to **ap-south-1 / Mumbai**.

Owner direction for this task:

1. Do not propose migration or DB index work here.
2. Do not change production `DATABASE_URL`.
3. Validate whether the same latency pattern is expected in staging/production-like runtime, not only local dev.
4. Document that Supabase is currently detected in **ap-south-1 / Mumbai**.
5. Compare owner decision options:
   - stay in current region
   - move to Singapore
   - use Prisma Accelerate
   - tune connection/pooler strategy
6. Output must be an **owner recommendation**, not an implementation batch.

## Goal
Produce a decision-oriented infra validation note for the owner that explains what is already known, what still must be validated in staging/production-like conditions, and which option has the best risk/benefit profile for Indonesian traffic.

## Hard Boundaries
Do not:

- create migration
- add DB index
- modify Prisma schema
- change production `DATABASE_URL`
- rotate secrets
- move project to a new Supabase region
- enable Prisma Accelerate
- change app business logic
- install new infra tooling just for this task
- claim production impact without staging/production-like validation evidence

## Required References
Read and use these as the source of truth before writing the recommendation:

- `docs/bmad/reports/back-office-performance-audit.md`
- `docs/bmad/tasks/sprint-04-008f-back-office-performance-audit.md`
- `docs/bmad/tasks/sprint-04-008h-back-office-prisma-runtime-latency-audit.md`
- `docs/bmad/tasks/sprint-04-008i-back-office-db-url-connection-path-test.md`
- `docs/engineering/47-sprint-03-shared-supabase-migration-apply-report.md`

If env host verification is repeated locally, do not paste secrets. Host alias only is allowed.

## Task 1 - Confirm current infra region statement
Record a short evidence block that the currently active shared Supabase path is:

```text
aws-1-ap-south-1.pooler.supabase.com
```

Conclusion that must be written explicitly:

- current shared Supabase runtime is detected in **AWS ap-south-1 (Mumbai, India)**
- this is not the temporary validation DB in `ap-northeast-1`
- this region is functional, but it is not the closest major AWS region for Indonesia-facing traffic

Do not include passwords, full URLs with secrets, or copied connection strings.

## Task 2 - Frame the staging/production-like validation question
This task does not implement infra changes. It defines what owner should validate next in a production-like environment.

Document that local dev evidence is directionally useful but not enough to prove production impact because local measurements may include:

- Next dev overhead
- local machine cold start
- local network variability
- dev server module reload behavior

Required validation pattern to describe:

1. test the same route in staging or production-like deployment
2. measure first-hit latency after cold start
3. measure warm repeat-hit latency
4. compare transaction pooler path vs current deployment behavior if safely possible
5. separate route/render timing from DB query timing where possible

Target route for comparison:

```text
/profil/admin-desa/dokumen
```

## Task 3 - Compare owner decision options
Write a decision table with at least these columns:

```md
| Option | Expected benefit | Main risk/cost | What it solves well | What it does not prove/solve | Owner recommendation |
```

Required options:

### Option A - Stay in current region (`ap-south-1 / Mumbai`)

Assess:

- zero migration risk
- no data relocation effort
- safest short-term operational choice
- likely keeps extra network distance for Indonesia users
- acceptable only if staging/production-like validation shows app/runtime overhead dominates and region is not the main contributor

### Option B - Move Supabase to Singapore (`ap-southeast-1`)

Assess:

- best geographic fit for Indonesia traffic
- likely reduces network roundtrip and TLS/auth travel time
- highest operational risk because region move means infra/data migration planning
- should not be first action unless staging/production-like validation still shows latency consistent with region distance after pooler/runtime factors are isolated

### Option C - Use Prisma Accelerate

Assess:

- may help connection management, pooling behavior, and globally distributed access patterns depending on deployment topology
- adds vendor/infra complexity and cost
- should not be adopted just to mask an unvalidated root cause
- reasonable only after staging/production-like validation confirms connection/runtime overhead remains material

### Option D - Tune connection/pooler strategy

Assess:

- lowest-risk technical lever after validation
- directly matches current evidence that session pooler warm path is materially faster than transaction pooler warm path
- does not fully solve cold-start penalty by itself
- likely strongest next candidate if production-like validation reproduces the same pattern

## Task 4 - Write the owner decision recommendation
The final output must end in a concise owner decision section.

Required recommendation shape:

### Recommended now

- keep current region for the moment
- do not change production `DATABASE_URL`
- run staging/production-like validation first
- prioritize connection/pooler strategy review before region migration or Prisma Accelerate

### Recommend next only if validation confirms

- if warm-path latency remains much better on session-style path, review runtime connection strategy first
- if cold and warm latency both still show strong geographic/network penalty after runtime factors are isolated, evaluate Singapore migration
- if connection/runtime overhead remains material and operationally hard to solve with current pooling strategy, then consider Prisma Accelerate

### Not recommended yet

- production DB URL swap without staging evidence
- region migration based only on local dev numbers
- index/migration work as a fix for this particular audit
- Prisma Accelerate as a first reaction before production-like validation

## Expected Deliverable
Create or append a decision-only section in:

```text
docs/bmad/reports/back-office-performance-audit.md
```

The deliverable should:

- explicitly state current Supabase region is `ap-south-1 / Mumbai`
- summarize why this matters for Indonesia traffic
- compare the 4 owner options
- end with a single recommended owner sequence
- avoid implementation steps beyond validation guidance

## Acceptance Criteria
This task is complete when:

- the report explicitly documents current Supabase region as **ap-south-1 / Mumbai**
- no migration/index/schema proposal is introduced as the main answer
- production `DATABASE_URL` is not changed
- staging/production-like validation is defined as the next evidence gate
- the 4 required options are compared in a risk/benefit table
- the final output is an owner decision recommendation, not an implementation plan
