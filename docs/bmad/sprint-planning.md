# PantauDesa BMAD-lite Sprint Planning

Date: 2026-04-28
Status: active-planning
Prepared-by: Rangga / BMAD-lite orchestration

## Planning principle

Every sprint/task should move through:

```text
Goal → Story → Task File → Acceptance Criteria → Implementation → QA → Review → Approval → Status Update
```

## Product goal

Make PantauDesa useful for citizens while preserving data trust:

- show available public source/document context,
- avoid false official claims,
- keep UI readable,
- move displayed runtime data to DB-first reads,
- never mark unreviewed data as verified,
- clearly mark dummy/mock fields as mock/demo when they are shown from DB.

## Current sprint planning

## Sprint 03 — Data Foundation

Status: active

Updated goal:

Build a DB-first displayed data foundation so the website can be tested against database-backed reads for performance and behavior.

This means:

- all displayed datasets should come from DB;
- existing hardcoded/mock displayed data should be seeded into DB as `demo`/mock records;
- mock budget/voice/detail values can remain, but must be clearly flagged, e.g. `(mock)`;
- hardcoded displayed data fallback should be removed and replaced with controlled DB empty/unavailable states;
- no `verified`, no official numeric APBDes extraction, no scraper/scheduler.

### Completed / reported

1. Schema recommendation approved.
2. Sprint 03 migration applied to shared Supabase.
3. Demo seed Option A implemented.
4. Demo seed execution reported QA pass.
5. Hybrid DB + mock flagging implemented and stabilized with request-time DB read + Prisma env guards.

### Active / next batch

Story / task:

- DB-first All Displayed Data Batch

Task file:

- `docs/bmad/tasks/sprint-03-004-db-first-all-displayed-data-batch.md`

Status:

- READY_FOR_IWAN_GATE_AND_UJANG_ASEP_EXECUTION

Acceptance focus:

- all displayed desa/list/detail data reads from DB;
- all displayed voices/comments/replies read from DB;
- hardcoded displayed datasets are seeded into DB as `demo`/mock where needed;
- mock numeric values show clear field labels such as `(mock)`;
- no hardcoded displayed data fallback;
- controlled DB empty/unavailable states exist;
- no `verified`;
- no official numeric APBDes extraction;
- no scraper/scheduler.

## Sprint 03 later candidates

These may remain after the DB-first batch, depending on implementation result.

### Service Layer Hardening

Goal:

- make DB read service easier to observe and test.

Candidate work:

- safe internal db health/check route,
- seed count check script,
- mapping unit tests,
- explicit fallback reason logging.

### Read Path Switch Review

Goal:

- decide whether DB-first displayed data behavior can be accepted for production/testing.

Prerequisites:

- DB-first batch QA passed,
- Owner confirms flagging is understandable,
- performance feels acceptable enough for next iteration.

### Detail Page DB Document Registry

Goal:

- show DB `DokumenPublik` references safely in detail page if not fully covered by Sprint 03-004.

Boundary:

- document registry only,
- no official numeric extraction,
- no official verification claim.

## Sprint 04 candidate planning

## Sprint 04 — Source Review Workflow

Status: candidate / not opened

Goal:

Create internal workflow to review sources/documents before improving trust status.

Candidate stories:

1. DataSource review list.
2. DokumenPublik review list.
3. status transition policy.
4. internal-only review notes.
5. document/source filter UX.

Blocked unless approved:

- admin verification workflow,
- public verified status,
- official numeric APBDes extraction.

## Sprint 05 candidate planning

## Sprint 05 — Numeric Data Governance

Status: future / blocked

Goal:

Extract official numeric APBDes only after source review process exists.

Prerequisites:

- source/document review accepted,
- methodology approved,
- status transition workflow,
- non-misleading UI.

## Do-not-open list

Do not open without explicit Iwan/Owner approval:

- scraper/scheduler,
- full production data import beyond approved seed/mock DB-first batch,
- official numeric APBDes extraction,
- Risk Radar,
- Score Orb,
- verified status,
- auth/voice schema relation changes,
- new dependency.
