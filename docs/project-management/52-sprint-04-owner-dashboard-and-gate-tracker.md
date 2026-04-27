# Sprint 04 Owner Dashboard and Gate Tracker

Date: 2026-04-27
Status: active-dashboard
Prepared-by: ChatGPT Freelancer / Rangga

## Purpose

One simple place for Owner/Iwan to see:

- what is approved,
- what is blocked,
- what is next,
- whether Ujang is needed,
- which gate must be cleared first.

## Current decisions

- Sprint 03 is closed.
- Seed execution is blocked.
- Read path is blocked.
- Detail page UX moved to Sprint 04.
- Sprint 04A starts first.
- Ujang execution is minimized.
- Rangga supports PM/BA/UX/review only.
- Iwan remains command owner.
- Owner approves sensitive gates.

## Sprint 04 gate tracker

| Gate / Workstream | Status | Owner | Current doc / commit reference | Blocker | Next decision | Ujang needed? |
|---|---|---|---|---|---|---|
| Sprint 04A — Homepage clarity/data status UX | Approved to start planning / pending execution gate | Iwan + Owner | `docs/product/04-homepage-ui-implementation-brief.md` / `034aaaf68a88f429aa50229ee0835716436d8b71` | Need Iwan final command if execution starts | Approve UI-only implementation task split | Yes, only after Iwan sends small UI-only command |
| Sprint 04B — Desa detail UX | Not started / blocked by 04A focus | Iwan + Owner | `docs/project-management/51-sprint-03-closure-and-sprint-04-scope-proposal.md` / `2d11db9c6c4ec14629bf05231aaa6e6b442b89bb` | Wait until homepage/status UX direction stabilizes | Decide whether to create desa detail UX brief after 04A | No for now |
| Sprint 04C — Dokumen/APBDes detail UX | Not started / blocked | Iwan + Owner | `docs/project-management/51-sprint-03-closure-and-sprint-04-scope-proposal.md` / `2d11db9c6c4ec14629bf05231aaa6e6b442b89bb` | Needs document-first UX decision from 04A/04B | Decide APBDes document-first UX spec, no numeric extraction | No for now |
| Sprint 04D — Seed/read path integration | Blocked | Iwan + Owner | `docs/engineering/49-sprint-03-demo-seed-implementation-report.md` | Seed not executed; read path blocked; status UX not accepted yet | Decide seed execution only after data status UX/readiness | No for now |
| Sprint 04E — Scraping/import prototype | Blocked | Owner + Iwan + Asep/technical review | `docs/engineering/14-official-desa-data-source-and-scraping-strategy.md` | Source governance and imported/needs_review UX not stable yet | Decide prototype plan only after 04A–04D gates | No for now |
| Numeric APBDes policy | Blocked | Owner + Iwan + Asep/technical review | `docs/project-management/51-sprint-03-closure-and-sprint-04-scope-proposal.md` | Document registry must come first; real numeric extraction not approved | Decide policy after document/APBDes UX spec | No for now |
| AI operating model / token budget | Active / accepted baseline | Iwan + Owner | `docs/project-management/50-sprint-03-retro-and-operating-model-improvement.md` | Needs consistent discipline in every prompt | Keep Iwan as command owner; use short file-based prompts | No, unless process docs need update |

## What is approved now

Approved:

- Sprint 03 closure.
- Sprint 04 starts with 04A.
- Homepage direction from `docs/product/04-homepage-ui-implementation-brief.md`.
- UI-only first pass for homepage if Iwan decides to execute.
- No new dependency for homepage first pass.
- Iwan remains command owner.
- Rangga remains PM/BA/UX/review support.

## What is blocked now

Blocked:

- seed execution,
- read path switch,
- desa detail implementation,
- Dokumen/APBDes detail implementation,
- numeric APBDes extraction,
- scraper/import prototype,
- verified data claims,
- broad technical execution by Ujang without Iwan command.

## Immediate next recommended non-technical action

Recommended next action:

> Iwan/Owner approve Sprint 04A execution gate or request final edits to the homepage UI brief.

No Ujang task should be sent until Iwan explicitly approves Sprint 04A execution.

## Sprint 04A execution gate checklist

Before Iwan sends any UI task to Ujang, confirm:

- [ ] Homepage brief accepted.
- [ ] UI-only boundary accepted.
- [ ] No seed/read path/schema/DB/API/auth/voice/scheduler/scraper.
- [ ] No new dependency.
- [ ] Hero stays.
- [ ] Ranking/priority hook stays.
- [ ] Copy avoids accusatory wording.
- [ ] Chart/donut prominence reduced.
- [ ] Fresh static sections approved.
- [ ] QA expectations clear: mobile, copy, no dependency, lint/typecheck if code changes.

## Decisions needed from Iwan/Owner

1. Approve Sprint 04A execution gate.
2. Confirm whether Ujang should receive UI-only task split from `docs/product/04-homepage-ui-implementation-brief.md`.
3. Confirm seed execution remains blocked until after homepage/data status UX is accepted.
4. Confirm read path remains blocked.
5. Confirm 04B/04C/04D/04E order remains valid.
6. Confirm no new dependency for homepage first pass.

## Recommended status language

Use these short labels in future updates:

- `approved-to-plan`
- `approved-to-execute`
- `blocked`
- `executed-pending-review`
- `accepted`
- `deferred`

## Operating rule reminder

Rangga does not command Ujang directly.

Workflow:

```text
Owner/Iwan decides gate
→ Iwan sends final command to Ujang
→ Ujang executes
→ Ujang reports to Iwan
→ Rangga reviews if requested
```

## Summary

Sprint 04 should start narrow.

Start with:

- Homepage clarity,
- data status UX,
- source/document narrative,
- no seed/read path.

Do not start with:

- database execution,
- detail UI,
- APBDes numeric extraction,
- scraper/import.

Initiated-by: Iwan/Owner approval
Reviewed-by: Pending Owner/Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: active-dashboard
