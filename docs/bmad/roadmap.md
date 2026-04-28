# PantauDesa BMAD-lite Roadmap

Date: 2026-04-28
Status: active-roadmap
Prepared-by: Rangga / BMAD-lite orchestration

## Product goal

PantauDesa should help citizens understand village public data and documents safely, without pretending demo/imported data is official verified truth.

## Roadmap phases

## Phase 1 — UI Trust Foundation

Status: mostly done / accepted

Goal:

Create citizen-readable pages with safe trust framing.

Done / mostly done:

- homepage journey cleanup,
- Data Desa card readability,
- detail page trust hierarchy,
- Suara Warga route/copy/loading/empty state,
- reusable data status badges,
- demo-safe framing.

Important remaining posture:

- keep `Terverifikasi` inactive,
- keep advanced dataviz deferred,
- do not over-expand homepage without clear gate.

## Phase 2 — Sprint 03 Data Foundation

Status: active

Goal:

Build DB foundation for village identity, sources, and document registry.

Done:

- schema recommendation approved,
- shared Supabase migration applied,
- Option A seed implemented and reported QA pass.

Active:

- hybrid DB read + mock flagging.

Next immediate focus:

- verify runtime DB connection,
- confirm seeded Arjasari data appears in `/desa`,
- keep budget values flagged as demo.

## Phase 3 — Safe Read Service Layer

Status: planned

Goal:

Create stable server-only read functions before broad UI switch.

Candidate work:

- internal DB read smoke test,
- seed count verification route/script,
- data mapping tests,
- mock fallback strategy,
- error/log visibility when fallback occurs,
- route-level QA.

Boundary:

- no numeric extraction,
- no `verified`,
- no public trust claim.

## Phase 4 — Gradual UI Read Path Switch

Status: planned / not approved yet

Goal:

Gradually switch low-risk UI surfaces to DB-backed data while retaining demo/missing-data fallbacks.

Possible sequence:

1. `/desa` identity/source list.
2. `/desa/[id]` identity/source/documents.
3. homepage stats only after summary strategy exists.
4. detail budget numbers last, only after numeric governance exists.

Boundary:

- no budget numbers from DB until `AnggaranDesaSummary` has reviewed data or explicit demo framing.
- no `verified` status.

## Phase 5 — Source Review Workflow

Status: future

Goal:

Allow internal review of source and document registry before data trust status improves.

Candidate work:

- internal source review table,
- source status audit,
- document status review,
- review notes,
- data status transition policy.

Boundary:

- still no automatic verification.
- no public admin panel without auth/role review.

## Phase 6 — Numeric APBDes Extraction

Status: blocked / future

Goal:

Extract and publish budget numbers only after source/document review workflow exists.

Prerequisites:

- source governance,
- document registry QA,
- methodology for extraction,
- review workflow,
- explicit Iwan/Owner approval.

Not allowed before gate:

- scraping numbers as facts,
- marking imported numbers verified,
- Risk Radar/Score Orb based on unreviewed data.

## Phase 7 — Automation / Scraper / Scheduler

Status: future / blocked

Goal:

Automate source discovery or monitoring after manual process and governance are mature.

Prerequisites:

- source review workflow,
- rate-limit/legal/robots policy,
- raw snapshot/staging design,
- failure handling,
- admin review flow.

## Current next recommended story

Story:

- `docs/bmad/stories/sprint-03-003-db-runtime-connection-check.md` (candidate)

Purpose:

- diagnose why Ancolmekar is not visible,
- confirm runtime DB env,
- confirm `/desa` is in database mode,
- keep fallback visible if DB unavailable.
