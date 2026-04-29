# PantauDesa BMAD-lite Roadmap

Date: 2026-04-29
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

Status: done / accepted for next Sprint 04 gate

Goal:

Build DB foundation for village identity, sources, and document registry.

Done:

- schema recommendation approved,
- shared Supabase migration applied,
- Option A seed implemented and reported QA pass,
- schema/data foundation reviewed in Sprint 04-002,
- public read path moved away from direct mock usage for main desa routes.

Remaining posture:

- keep budget values clearly demo-framed unless governance changes,
- no `verified` activation without workflow,
- no destructive seed reset without approval.

## Phase 3 — Sprint 04 Quality, Data, and Trust Stabilization

Status: active / approved for BMAD planning

Primary task batch:

- `docs/bmad/tasks/sprint-04-006-consolidated-quality-data-trust-batch.md`

Goal:

Stabilize the technical quality gate and public read-path foundations before continuing high-risk admin claim services.

Execution sequence:

1. Lint & build gate stabilization.
2. GitHub Actions CI quality gate.
3. Critical Vitest test foundation.
4. Public read path scalability.
5. Trust layer, security, and privacy consistency.
6. Voice to Desa relation migration plan and gated implementation.
7. Developer documentation and OSS minimum readiness.
8. Admin claim verification services batch.

Key decisions:

- Do not treat all feedback as raw execution.
- Consolidate duplicate feedback into structured tasks.
- Keep NextAuth upgrade as a deferred risk note, not a Sprint 04 execution task.
- Defer Playwright until Owner approves new dependency.
- Defer branch protection until CI is green and stable.
- Keep `verified` inactive until governance exists.

## Phase 4 — Safe Read Service Layer and Scaling

Status: active inside Sprint 04 batch

Goal:

Move public read paths from full-list oriented behavior into server-driven query and DB-backed aggregate helpers.

Candidate work:

- server-driven `/desa` search/filter/sort/pagination,
- DB-backed page metadata,
- DB-backed filter options,
- `getHomeStats()` and safe homepage aggregates,
- caching/ISR strategy after read path is stable.

Boundary:

- no hardcoded fallback,
- no numeric extraction as official fact,
- no `verified`,
- no public trust claim beyond status badge copy.

## Phase 5 — Source Review and Trust Workflow

Status: future / gated

Goal:

Allow internal review of source and document registry before data trust status improves.

Candidate work:

- internal source review table,
- source status audit,
- document status review,
- review notes,
- data status transition policy,
- governance for future `verified` activation.

Boundary:

- still no automatic verification,
- no public admin panel without auth/role review,
- no official numeric status without explicit Owner gate.

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

- `docs/bmad/tasks/sprint-04-006-consolidated-quality-data-trust-batch.md`

Purpose:

- stabilize lint/build/typecheck/test,
- introduce CI quality gate,
- add critical tests,
- refactor public read path away from unbounded full-list behavior,
- keep trust/security guardrails clear,
- defer high-risk admin claim service until quality gates are ready.
