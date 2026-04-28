# PantauDesa BMAD-lite Project Context

Date: 2026-04-28
Status: active-context
Prepared-by: Rangga / BMAD-lite orchestration

## Purpose

This folder is a BMAD-lite documentation layer for PantauDesa.

It does not replace existing `/docs` files.

BMAD-lite here is used as:

- project memory,
- sprint/status map,
- story orchestration,
- decision log,
- boundary checklist,
- chat handoff context.

## Product summary

PantauDesa helps citizens read village data, source status, public documents, and citizen voices without making demo/imported data look like verified official truth.

Current product posture:

- trust-first,
- citizen-readable,
- source-aware,
- demo-safe,
- no false verification claim,
- gradual DB read path migration.

## Core roles

| Role | Responsibility |
|---|---|
| Owner | Gives sensitive product approval and final visual/trust approval. |
| Iwan | Command owner / CEO. Opens gates, approves execution, controls scope. |
| Rangga | PM / BA / reviewer / tracker and docs owner. Reviews against gate and boundary. |
| Ujang | Executor / implementation support. Executes approved implementation tasks. |
| Asep | Technical/frontend reviewer when available. Should not parallel-edit same files without coordination. |

## Current tech stack

- Next.js 16
- React 19
- TypeScript
- Prisma
- Supabase PostgreSQL
- Tailwind-style utility classes
- Vitest
- mock-data fallback still present

## Current architecture state

Data layers now include:

1. `mock-data.ts` for demo UI coverage and fallback.
2. Supabase/PostgreSQL Sprint 03 tables for data foundation.
3. Prisma as server-side DB bridge.
4. Hybrid `/desa` read attempt:
   - database identity/source if available,
   - mock/demo budget values remain visible,
   - fallback to mock if DB unavailable.

## Important source references

### Product / UI tracking

- `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`
- `docs/product/25-navigation-citizen-journey-batch-report.md`
- `docs/product/26-rangga-navigation-citizen-journey-batch-review.md`
- `docs/product/27-rangga-navigation-citizen-journey-owner-visual-pass.md`
- `docs/product/28-data-desa-mobile-readability-closeout-report.md`

### Engineering / Sprint 03

- `docs/project-management/13-sprint-03-data-foundation-plan.md`
- `docs/engineering/31-manual-discovery-arjasari-full-11-desa.md`
- `docs/engineering/32-iwan-review-arjasari-full-discovery.md`
- `docs/engineering/33-final-sprint-03-schema-recommendation.md`
- `docs/engineering/34-iwan-approval-final-sprint-03-schema-recommendation.md`
- `docs/engineering/44-iwan-clean-db-validation-strategy.md`
- `docs/engineering/45-sprint-03-temp-dev-db-validation-report.md`
- `docs/engineering/47-sprint-03-shared-supabase-migration-apply-report.md`
- `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`
- `docs/engineering/50-sprint-03-demo-seed-execution-approval-plan.md`
- `docs/engineering/50a-iwan-approval-sprint-03-demo-seed-execution-gate.md`
- `docs/engineering/51-sprint-03-demo-seed-execution-report.md`
- `docs/engineering/52-sprint-03-db-read-hybrid-mock-flagging-report.md`

## Non-negotiable trust rules

- Do not show imported/needs_review/demo data as verified.
- Do not activate `Terverifikasi` before verification workflow exists.
- Do not do numeric APBDes extraction without explicit gate.
- Do not remove mock fallback until DB read path is stable and approved.
- Do not run scraper/scheduler without explicit future gate.
- Do not run destructive migration commands against shared Supabase.
- Do not commit secrets.

## Current active work

Current active story:

- `docs/bmad/stories/sprint-03-002-db-read-hybrid-mock-flagging.md`

Current status:

- Hybrid DB + mock flagging implemented.
- QA is pending/active.
- Owner reported Ancolmekar not visible, meaning runtime likely fell back to mock/hardcoded mode or DB env/seed was not read.

## How to use this BMAD-lite layer

When starting a new chat or task, read in this order:

1. `docs/bmad/project-context.md`
2. `docs/bmad/boundary-rules.md`
3. `docs/bmad/sprint-status.md`
4. `docs/bmad/decision-log.md`
5. active story under `docs/bmad/stories/`
6. relevant source report linked by the active story

Do not convert all old docs into BMAD. Reference them instead.
