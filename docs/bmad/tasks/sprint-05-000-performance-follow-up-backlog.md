# Sprint 05 - Performance Follow-up Backlog

## Status
READY FOR OWNER REVIEW — backlog slicing only, no implementation in this file.

## Source Inputs
This backlog is based on:

- `docs/engineering/54-sprint-04-performance-closeout-report.md`
- `docs/bmad/reports/back-office-performance-audit.md`
- latest `main` closeout commit: `cf69f0c019183099296b6dca92694a5067803ad7` / `merge: close out sprint 04 performance hardening`

## Sprint 05 Theme
Sprint 05 should not reopen Sprint 04 as one large audit.

Sprint 05 should slice the remaining work into focused, reviewable tasks around:

1. homepage read-path follow-up,
2. public page server-first cleanup,
3. back-office warm-path reduction follow-ups,
4. Windows local runtime/build stability,
5. perf trace lifecycle and guarded diagnostics.

## Global Guardrails
Do not:

- merge unfinished work to `main`
- create DB migration/index without evidence and owner approval
- change production `DATABASE_URL`
- install Prisma Accelerate or observability packages without a separate owner decision
- bypass auth/permission for performance
- add persistent cache for sensitive back-office data
- move sensitive back-office fetching to client
- log PII, credentials, document content, DB URLs, or tokens

Allowed:

- public read-path server-first cleanup
- public cache review for public data only
- guarded diagnostics behind development or explicit env flags
- docs/runbook updates
- small, reversible code changes with QA

---

## P0 Backlog Candidates

### Sprint 05-001 — Homepage Read-path Follow-up

**Problem**  
Sprint 04 closeout notes that the homepage still shows slow application-code time under local dev and needs a focused read-path review.

**Goal**  
Split homepage timing so we know whether the cost is from `getDesaListResult()`, aggregation/composition, cache behavior, or render work.

**Scope**

- Inspect homepage route and related data readers.
- Add or reuse guarded perf timings for:
  - homepage route start/end
  - `getDesaListResult()`
  - any homepage aggregation/composition step
  - serialization/mapping if present
- Measure cold and warm local production mode.
- Recommend server-first/cache cleanup only if evidence supports it.

**Out of scope**

- homepage redesign
- DB migration/index
- production env change
- third-party observability package

**Acceptance Criteria**

- homepage timing breakdown documented
- bottleneck classified as query/read, aggregation, render, cache, or inconclusive
- no PII in logs
- `npm run lint`, `npx tsc --noEmit`, `npm run build` recorded

---

### Sprint 05-002 — Public Page Server-first Cleanup Continuation

**Problem**  
Sprint 04 improved `suara-warga` and `/profil/saya` by reducing client-first initial fetches. Other public surfaces may still wait for unnecessary client fetches or heavy dynamic reads.

**Goal**  
Identify public pages where first meaningful content should be server-provided and cached, then prepare small cleanup slices.

**Candidate surfaces**

- `/`
- `/desa`
- `/desa/[id]`
- `/suara`
- `/suara-warga`
- any public profile/detail pages that still fetch immediately after mount

**Scope**

- Inventory public pages that perform client fetch on mount for first render.
- Separate public-safe data from user/session-sensitive data.
- Convert only public-safe first-render data to server-first reads.
- Use existing cache patterns where appropriate.
- Keep interactive client behavior after first render.

**Out of scope**

- caching back-office or private user data
- moving auth-sensitive data into public cache
- major UI redesign
- route rewrites unrelated to first-render data

**Acceptance Criteria**

- public page inventory documented
- 1–3 small implementation tasks proposed, not one giant refactor
- sensitive/private data boundaries documented
- QA commands recorded for any implemented slice

---

### Sprint 05-003 — Back-office Warm-path Reduction Follow-up

**Problem**  
The back-office audit proved raw SQL is fast but connection/runtime path and repeated read-path work can still make back-office pages feel slow. Sprint 04 reduced some noise and improved selected warm paths, but remaining follow-ups should be narrow.

**Goal**  
Reduce warm-path cost without changing business logic, auth, permissions, or production DB settings.

**Priority targets**

1. Admin Desa `list-admin`
2. Admin Desa `dokumen`
3. Internal Admin `claims/documents/renewals`
4. Admin Desa shell/layout context reuse

**Scope**

- Confirm current warm timings after Sprint 04 closeout.
- Keep or refine request-level dedupe where safe.
- Remove remaining eager prefetch only where it creates measurable noise.
- Ensure pages do not duplicate `auth()` / context work unnecessarily.
- Validate branch-preview fast-path candidate if a Preview deployment is available.

**Out of scope**

- production `DATABASE_URL` change
- Prisma Accelerate
- region migration
- DB index/migration
- business-flow changes: approval/reject, admin role/status, upload, notification, claim verification, renewal

**Acceptance Criteria**

- before/after timing table for target pages
- no business logic diff
- mobile back-office layout remains intact
- QA commands recorded

---

## P1 Backlog Candidates

### Sprint 05-004 — Windows Local Runtime / Build Stability

**Problem**  
Sprint 04 closeout notes intermittent Windows local `EPERM` / `spawn EPERM` issues and Prisma lock/build operational problems. These issues slow the team and can be mistaken for source regressions.

**Goal**  
Separate Windows local operational failures from actual app/build failures and create a reliable local DX runbook.

**Scope**

- Collect exact failure signatures:
  - `EPERM`
  - `spawn EPERM`
  - Prisma query engine / DLL lock issues
  - Turbopack NFT warnings if still present
- Identify safe cleanup steps:
  - stop Node/Next processes
  - clear `.next` only when safe
  - regenerate Prisma client only when needed
  - restart terminal/IDE when lock persists
- Document recommended commands for Windows.
- Do not hide real build failures as Windows-only noise.

**Out of scope**

- package manager migration
- dependency upgrade batch
- Prisma version upgrade unless separately approved

**Acceptance Criteria**

- Windows build/runtime runbook exists
- known operational failures classified
- QA guidance explains pass/fail vs blocked

---

### Sprint 05-005 — Perf Trace Lifecycle / Guarded Diagnostics Decision

**Problem**  
Sprint 04 kept useful guarded instrumentation but also removed temporary debug endpoints. Sprint 05 needs to decide which traces remain as standard diagnostics and which should be retired.

**Goal**  
Make perf diagnostics boring, safe, and intentional.

**Scope**

- Inventory current perf logs in:
  - `src/lib/perf.ts`
  - admin-desa routes/data readers
  - internal-admin routes/data readers
  - public suara/desa detail reads
  - homepage if Sprint 05-001 adds tracing
- Classify each trace:
  - keep permanently guarded
  - keep temporarily until task closure
  - remove now
- Ensure all retained logs are gated by development mode or explicit env flag.
- Ensure no log emits PII, document content, DB URL, token, or raw query params.

**Out of scope**

- OpenTelemetry adoption
- external observability vendor
- exposing debug endpoints

**Acceptance Criteria**

- trace inventory documented
- removal/keep list agreed in BMAD
- no long-lived production-facing debug endpoint
- QA commands recorded if code changes occur

---

## P2 / Owner Decision Backlog Candidates

### Sprint 05-006 — Back-office Connection Strategy Decision Gate

**Problem**  
The back-office audit found transaction-pooler/runtime overhead and a faster session-pooler warm path. However, production env changes remain blocked until safe validation exists.

**Goal**  
Turn connection strategy into an owner decision only after deployed evidence exists.

**Scope**

- Validate branch-preview fast-path candidate if Preview deployment is available.
- Compare cold/warm target route timing against Sprint 04-008K local production baseline.
- Prepare go/no-go recommendation for:
  - production `DATABASE_URL` strategy change
  - Prisma Accelerate evaluation
  - Supabase Singapore migration evaluation

**Out of scope**

- changing production `DATABASE_URL` inside this task
- Prisma Accelerate install
- region migration
- DB index/migration

**Acceptance Criteria**

- deployed evidence exists or blocker is documented
- production rollout task is created only if owner approves
- no secrets exposed

---

## Recommended Sprint 05 Execution Order

1. **05-001 Homepage Read-path Follow-up** — fastest way to address the next public performance unknown.
2. **05-005 Perf Trace Lifecycle** — prevents diagnostic clutter while 05-001 adds/uses traces.
3. **05-002 Public Page Server-first Cleanup** — continue the Sprint 04 server-first gains.
4. **05-003 Back-office Warm-path Reduction Follow-up** — continue targeted back-office improvements without reopening infra.
5. **05-004 Windows Local Runtime / Build Stability** — improves team velocity and reduces false regressions.
6. **05-006 Connection Strategy Decision Gate** — only when Preview/Staging access or evidence is available.

## Not Recommended For Sprint 05 Start

- Starting with DB indexes for back-office performance. Current evidence does not support this as the primary fix.
- Starting with Prisma Accelerate. It may be useful later, but not before deployed validation.
- Starting with Supabase region migration. Too risky without staging/production-like evidence.
- Large public UI redesign. Sprint 05 should first stabilize read paths and diagnostics.

## Handoff Prompt For Ujang

```text
Ujang, pull main and read:

- docs/engineering/54-sprint-04-performance-closeout-report.md
- docs/bmad/reports/back-office-performance-audit.md
- docs/bmad/tasks/sprint-05-000-performance-follow-up-backlog.md

Start with Sprint 05-001 Homepage Read-path Follow-up.

Do not ask for a new decision unless a hard blocker appears. Keep scope narrow, no migration/index, no production DATABASE_URL change, no package install, and no sensitive-data logging.

Output: BMAD task/report update + QA + guardrails.
```
