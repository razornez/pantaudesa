# PantauDesa BMAD-lite Decision Log

Date: 2026-04-28
Status: active-decision-log
Prepared-by: Rangga / BMAD-lite orchestration

## Purpose

This file lists key decisions that future chats/agents must not forget.

## Decision format

Each decision includes:

- date,
- decision,
- reason,
- references,
- current implication.

---

## 2026-04-27 — Use document/source registry before numeric extraction

Decision:

- Sprint 03 prioritizes `DataSource` and `DokumenPublik` before numeric APBDes extraction.

Reason:

- Manual discovery showed APBDes/realisasi appears as articles, archives, PDFs, infographics, and inconsistent public pages.
- Capturing document/source existence is safer than rushing numbers.

References:

- `docs/engineering/31-manual-discovery-arjasari-full-11-desa.md`
- `docs/engineering/32-iwan-review-arjasari-full-discovery.md`
- `docs/engineering/33-final-sprint-03-schema-recommendation.md`
- `docs/engineering/34-iwan-approval-final-sprint-03-schema-recommendation.md`

Implication:

- no numeric APBDes extraction until a future explicit gate.

---

## 2026-04-27 — `verified` remains inactive

Decision:

- `verified` exists in enum lifecycle but must not be used for seeded/imported data.

Reason:

- No verification workflow exists yet.
- Imported public sources are not automatically official verified data.

References:

- `docs/engineering/34-iwan-approval-final-sprint-03-schema-recommendation.md`
- `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`

Implication:

- active `Terverifikasi` UI remains blocked.

---

## 2026-04-27 — Temporary Supabase DB is only for migration validation

Decision:

- `pantaudesa-dev-migration-validation` is a disposable clean migration validation DB.

Reason:

- Shared Supabase should not be used for reset/dev validation.
- Temporary DB can safely run `migrate reset` and `migrate dev`.

References:

- `docs/engineering/44-iwan-clean-db-validation-strategy.md`
- `docs/engineering/45-sprint-03-temp-dev-db-validation-report.md`

Implication:

- seed/read path should not default to temp validation DB.

---

## 2026-04-27 — Shared Supabase migration applied after clean validation

Decision:

- Apply Sprint 03 migration to shared Supabase after temp validation and Iwan approval.

Reason:

- Temp validation passed.
- Shared DB received controlled baseline resolve + deploy, not reset/dev/db push.

References:

- `docs/engineering/47-sprint-03-shared-supabase-migration-apply-report.md`

Implication:

- Sprint 03 tables exist in shared Supabase.
- seed/read path could be planned after explicit gates.

---

## 2026-04-28 — Demo seed Option A approved and reported QA pass

Decision:

- Execute seed Option A only:
  - 11 `Desa`,
  - 14 `DataSource`,
  - 16 `DokumenPublik`,
  - 0 `AnggaranDesaSummary`,
  - 0 `APBDesItem`.

Reason:

- Seed identity/source/document registry first.
- Avoid numeric extraction and verified claims.

References:

- `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`
- `docs/engineering/50-sprint-03-demo-seed-execution-approval-plan.md`
- `docs/engineering/50a-iwan-approval-sprint-03-demo-seed-execution-gate.md`
- `docs/engineering/51-sprint-03-demo-seed-execution-report.md`

Implication:

- DB may contain Arjasari seed identity/source/document records.
- UI still needs runtime DB connection and safe read behavior.

---

## 2026-04-28 — Hybrid DB read + mock fallback accepted as direction

Decision:

- Begin limited `/desa` read step:
  - use DB identity/source when available,
  - keep mock/demo budget values,
  - fallback to mock if DB read fails,
  - clearly flag source of each data part.

Reason:

- Owner wants website not to look empty.
- Owner also wants users to see which data is real/source-backed vs demo/hardcoded.

References:

- `docs/engineering/52-sprint-03-db-read-hybrid-mock-flagging-report.md`
- `docs/bmad/stories/sprint-03-002-db-read-hybrid-mock-flagging.md`

Implication:

- DB identity/source may be shown,
- budget numbers remain `Angka Demo`,
- if Ancolmekar is missing, runtime likely fell back to mock mode.

---

## 2026-04-28 — BMAD-lite docs layer adopted

Decision:

- Use BMAD-lite Markdown docs as orchestration layer.
- Do not install full BMAD for now.
- Do not convert all old `/docs` files.

Reason:

- Current workflow needs chat handoff and planning clarity, not another dependency.
- Existing docs remain evidence/archive.

References:

- `docs/bmad/project-context.md`
- `docs/bmad/sprint-status.md`
- `docs/bmad/timeline.md`
- `docs/bmad/roadmap.md`

Implication:

- future tasks should create/update BMAD story/status docs first.
