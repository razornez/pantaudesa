# PantauDesa BMAD-lite Sprint Planning

Date: 2026-04-28
Status: active-planning
Prepared-by: Rangga / BMAD-lite orchestration

## Planning principle

Every sprint/task should move through:

```text
Goal → Story → Acceptance Criteria → Implementation → QA → Review → Approval → Status Update
```

## Product goal

Make PantauDesa useful for citizens while preserving data trust:

- show available public source/document context,
- avoid false official claims,
- keep UI readable,
- move gradually from mock to DB,
- never mark unreviewed data as verified.

## Current sprint planning

## Sprint 03 — Data Foundation

Status: active

Goal:

Build DB-backed data foundation safely while preserving mock fallback and trust labels.

### Completed / reported

1. Schema recommendation approved.
2. Sprint 03 migration applied to shared Supabase.
3. Demo seed Option A implemented.
4. Demo seed execution reported QA pass.

### Active

Story:

- DB Read Hybrid + Mock Flagging

Status:

- DONE_PENDING_QA

Acceptance focus:

- `/desa` reads DB when runtime env is correct.
- `/desa` falls back to mock if DB read fails.
- DB records show `Dari Database`.
- mock records show `Mock/Hardcoded`.
- budget/serapan numbers show `Angka Demo`.
- no numeric extraction.
- no verified.

### Next recommended Sprint 03 story

Story:

- DB Runtime Connection Check

Goal:

- diagnose why Ancolmekar is not visible,
- confirm DB env and target host in runtime,
- confirm seeded rows are in the DB runtime reads,
- keep fallback behavior.

Acceptance criteria:

- clear evidence of runtime DB host/alias without secret,
- clear count of `desa` rows from runtime DB,
- `/desa` shows `Mode: Database + Angka Demo` when DB is connected,
- `/desa?cari=ancolmekar` finds Ancolmekar,
- `/desa/ancolmekar` resolves,
- `/desa/4` legacy route still works,
- no source/API/schema/seed change unless explicitly approved.

## Sprint 03 later candidates

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

- decide whether `/desa` hybrid behavior can be accepted as first production read step.

Prerequisites:

- runtime DB connection verified,
- QA passed,
- Owner confirms flagging is understandable.

### Detail Page DB Document Registry

Goal:

- show DB `DokumenPublik` references safely in detail page.

Boundary:

- document registry only,
- no numeric extraction,
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
- numeric APBDes extraction.

## Sprint 05 candidate planning

## Sprint 05 — Numeric Data Governance

Status: future / blocked

Goal:

Extract numeric APBDes only after source review process exists.

Prerequisites:

- source/document review accepted,
- methodology approved,
- status transition workflow,
- non-misleading UI.

## Do-not-open list

Do not open without explicit Iwan/Owner approval:

- scraper/scheduler,
- full production data import,
- numeric APBDes extraction,
- Risk Radar,
- Score Orb,
- verified status,
- broad read path switch,
- auth/voice schema relation changes,
- new dependency.
