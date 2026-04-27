# Iwan Approval — Final Sprint 03 Schema Recommendation

Date: 2026-04-27
Reviewer: Iwan
Technical gate: Owner acting as temporary technical gate because Asep unavailable
Input reviewed: `docs/engineering/33-final-sprint-03-schema-recommendation.md`

## Decision

Approved.

Final Sprint 03 schema recommendation is accepted.

Sprint 03 implementation gate may be opened **with strict scope and QA guardrails**.

## Approved must-have Sprint 03 models

The following models are approved as must-have for Sprint 03:

1. `Desa`
2. `DataSource`
3. `AnggaranDesaSummary`
4. `APBDesItem`
5. `DokumenPublik`

## Approved deferred models

The following are deferred and must not be implemented in the first Sprint 03 schema unless owner/Iwan explicitly reopens scope:

- `RawSourceSnapshot`
- staging tables
- scheduler/scraper/job tables
- audit log
- admin verification workflow
- full transparency score model
- perangkat desa model, unless explicitly prioritized later

## Approved enums / status lifecycle

`DataStatus` is mandatory from Sprint 03.

Approved values:

- `demo`
- `imported`
- `needs_review`
- `verified`
- `outdated`
- `rejected`

Important rules:

- `demo` is seed/demo/illustrative data.
- `imported` is not verified.
- `needs_review` must not be shown as trusted official data.
- `verified` requires explicit future review workflow.
- Arjasari discovery findings remain `imported` or `needs_review`, not `verified`.

## Approved key recommendations

### 1. `DataSource` wajib masuk Sprint 03

Approved.

Reason:

Arjasari discovery proves source variability is real. Source can come from desa website, kecamatan page, article page, archive page, document URL, or typo/stale URL.

### 2. `dataStatus` wajib di public data models

Approved.

Reason:

PantauDesa must protect trust and avoid making demo/imported data look official.

### 3. `sourceId` optional on public data models

Approved.

Reason:

Optional source relation gives flexibility for demo seed, partial discovery, and gradual data governance.

### 4. Document registry before numeric APBDes extraction

Approved.

Reason:

Manual discovery found APBDes/realisasi as article pages, archives, infographics, and document references. Numeric extraction should not be rushed.

### 5. Raw snapshot/staging deferred

Approved.

Reason:

Sprint 03 is database-backed demo/data foundation, not import/scraper pipeline yet. Raw snapshot and staging remain important for future Sprint 03.5/04.

### 6. Keep `Voice.desaId` unchanged

Approved.

Reason:

Forcing relation too early may break existing voice flow. Voice relation can be reviewed later.

## Implementation gate status

Sprint 03 implementation gate: open with strict scope.

Allowed implementation scope:

- update `prisma/schema.prisma` for approved must-have models/enums,
- create migration if required and safe,
- create/update seed demo data,
- create read-only service layer plan/implementation,
- keep mock fallback until read path is safely moved,
- run required QA commands,
- document all failures and risks.

Not allowed in this gate:

- scraper,
- scheduler,
- raw snapshot implementation,
- staging tables,
- admin verification workflow,
- audit log,
- production deployment,
- automatic verified claim,
- changing `Voice.desaId` relation,
- removing mock fallback too early,
- broad read path switch before service layer is stable.

## Required first implementation task

Before modifying schema, executor must create:

`docs/engineering/35-sprint-03-implementation-start-plan.md`

This plan must include:

- exact models/enums to add,
- whether migration is needed,
- seed approach,
- QA commands,
- rollback/stop conditions,
- known risks from lint/build/prisma generate,
- confirmation that raw snapshot/staging/scheduler/scraper are out of scope.

After that, executor may proceed with schema implementation if the plan matches this approval.

## Required QA after implementation

At minimum run and report:

- `npx prisma validate`
- `npx prisma generate`
- `npx tsc --noEmit`
- `npm run test`
- `npm run lint`
- `npm run build` if environment permits

If command fails, report:

- exact command,
- short error summary,
- whether it is existing issue or new issue,
- whether implementation must stop.

## Stop conditions

Stop immediately if:

- Prisma validate fails because of new schema.
- Migration is destructive or unclear.
- Auth/NextAuth models are affected unexpectedly.
- `Voice` relation needs migration.
- Build unexpectedly requires DB at build time.
- Data demo/imported would appear as verified.
- Typecheck/test failures are introduced by the new changes.
- Team is unsure whether a field/source should be public.

## Prompt for Rangga / executor

```text
Rangga, baca `docs/engineering/34-iwan-approval-final-sprint-03-schema-recommendation.md`.

Iwan/Owner approved the final Sprint 03 schema recommendation and opened implementation gate with strict scope.

First, create:
`docs/engineering/35-sprint-03-implementation-start-plan.md`

The plan must include:
- exact models/enums to add,
- migration/seed approach,
- QA commands,
- rollback/stop conditions,
- known risks,
- confirmation that scraper/scheduler/raw snapshot/staging/admin verification/audit log are out of scope.

After that, implement only approved must-have models:
1. Desa
2. DataSource
3. AnggaranDesaSummary
4. APBDesItem
5. DokumenPublik

Required:
- DataStatus lifecycle mandatory.
- DataSource included.
- sourceId optional on public data models.
- Voice.desaId unchanged.
- Manual discovery findings remain imported/needs_review, not verified.
- Keep mock fallback.

Do not implement:
- scraper
- scheduler
- RawSourceSnapshot
- staging tables
- audit log
- admin verification workflow
- full transparency score model
- perangkat desa model
- broad read path switch
- production deploy

Report to Iwan after implementation with QA results.
```

## Final note

This approval opens Sprint 03 implementation narrowly. It is not permission to build the full data automation system.

Initiated-by: Iwan (CEO)
Reviewed-by: Owner acting as Technical Gate
Executed-by: Rangga (ChatGPT Freelancer)
Status: approved
Backlog: #4 #13
