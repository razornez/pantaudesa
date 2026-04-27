# Sprint 04A Homepage Acceptance Review

Date: 2026-04-27
Status: accepted-first-pass
Reviewer: ChatGPT Freelancer / Rangga
Review type: Product/UX acceptance review and next gate recommendation

## Context

Iwan accepted Sprint 04A Task 3 and homepage first-pass UX.

Inputs reviewed:

- `docs/product/05-homepage-ui-task-1-implementation-report.md`
- `docs/product/06-homepage-ui-task-1-1-copy-cleanup-report.md`
- `docs/product/07-homepage-ui-task-2-static-sections-report.md`
- `docs/product/08-homepage-ui-task-3-civic-narrative-report.md`
- `docs/project-management/52-sprint-04-owner-dashboard-and-gate-tracker.md`

## Verdict

Sprint 04A homepage first pass is accepted from Product/UX perspective.

Recommendation:

> Accept Sprint 04A as first-pass homepage clarity/data status UX. Do not expand it further right now.

## Review summary

## 1. Is homepage clearer for ordinary citizens?

Yes, clearer than before.

Reasons:

- Priority/ranking hook now appears immediately after hero.
- Homepage now explains citizen journey with `CitizenJourneySection`.
- `DataStatusCardsSection` helps users understand demo/source/review status.
- `DocumentDeskSection` makes public documents more tangible.
- `PilotAreaStorySection` makes the product feel grounded, not purely dummy.
- Civic narrative is now clearer through `Bukan Menuduh, Tapi Membaca`.

## 2. Does it avoid accusatory tone?

Mostly yes.

Positive changes:

- `Perlu Diawasi` shifted to `Perlu Ditinjau` / `Prioritas Cek Transparansi`.
- Danger/alert tone was softened.
- Copy now emphasizes reading data, checking sources, and asking the right party.
- `Bukan Menuduh, Tapi Membaca` reinforces the intended civic tone.

Watch item:

- Ranking/priority UI must continue to avoid labels that imply guilt, risk, corruption, or final judgment.

## 3. Is data demo/status explanation clear?

Yes for first pass.

Positive changes:

- `Data demo` badge was added in the priority/ranking area.
- Status cards explain `Data Demo`, `Sumber Ditemukan`, `Perlu Review`, and `Terverifikasi`.
- The homepage now makes it clearer that percentage/ranking data is not final or verified.

Watch item:

- `Terverifikasi` should remain a future/disabled state until a verification workflow exists.

## 4. Is the page too crowded?

Acceptable for first pass, but should be watched.

The page now has more sections, but the sections are more purposeful:

- priority hook,
- citizen journey,
- data status,
- document explanation,
- pilot story,
- civic manifesto,
- supporting stats/charts.

Risk:

- If future work adds more sections without removing/reducing older dashboard blocks, the homepage may become crowded again.

Recommendation:

- Treat this as accepted first pass.
- Do not add more homepage sections in Sprint 04A.
- Any future homepage work should be polish/reduction, not expansion.

## 5. Should seed/read path remain blocked?

Yes.

Seed execution should remain blocked because:

- homepage UX is accepted, but DB-powered data status behavior is not yet validated end-to-end.
- read path is not switched.
- seed data could still be misunderstood if detail pages are not ready.

Read path should remain blocked because:

- desa detail UX is not yet accepted.
- document/APBDes detail UX is not yet accepted.
- imported/needs_review behavior needs to be clear beyond homepage.

## 6. Can Sprint 04A be accepted as first pass?

Yes.

Sprint 04A can be accepted as:

> homepage clarity/data status UX first pass complete.

Not accepted as:

- final homepage forever,
- DB-powered homepage,
- seed-ready product,
- read-path-ready product,
- verified data UI.

## QA and guardrail notes

Across Task 1, 1.1, 2, and 3:

- `npx tsc --noEmit`: pass.
- `npm run test`: pass after sandbox rerun issue.
- `npm run lint`: still fails due existing lint debt outside homepage first-pass scope.
- No new dependency was added.
- No schema/DB/Prisma/migration/seed/read path/API/auth/voice/scheduler/scraper changes were made.

## Risks

1. Homepage may become crowded again if additional sections are added too soon.
2. Ranking/priority hook can still be misread as judgment if future copy becomes harsher.
3. Data status explanation is homepage-level only; detail page still needs its own UX.
4. `Terverifikasi` exists as concept but verification workflow does not exist yet.
5. Seed/read path could make demo/imported data feel official if moved too early.

## Next gate recommendation

Recommended option:

> Option C: pause technical work for owner visual review.

Reason:

Homepage first pass changed the page flow significantly. Before moving to detail UX or seed/read path, Owner should visually review the live homepage and confirm:

- it feels clearer,
- it is not too crowded,
- the fresh sections feel good,
- the civic tone feels right,
- ranking/priority hook remains attractive but not accusatory.

After owner visual review:

- If accepted, move to Option A: Sprint 04B Desa detail UX.
- Do not move to Option B seed readiness yet.

## Option assessment

## Option A — Move to Sprint 04B Desa detail UX

Good next step after owner visual review.

Why:

- Detail page UX is the next place where data status/source/document rules must be clarified.
- It should happen before seed/read path.

## Option B — Do seed readiness check

Not recommended yet.

Why:

- Homepage is accepted, but detail page and document/APBDes UX are not accepted.
- Seed/read path can still create user trust risk.

## Option C — Pause technical work for owner visual review

Recommended immediate next gate.

Why:

- Lowest risk.
- Keeps Ujang execution minimized.
- Lets Owner/Iwan validate product feel before continuing.

## Decisions needed from Iwan/Owner

1. Owner visually reviews homepage first pass.
2. Decide whether Sprint 04A is accepted as complete.
3. Confirm no more homepage expansion for now.
4. Confirm seed execution remains blocked.
5. Confirm read path remains blocked.
6. Decide whether next work becomes Sprint 04B Desa detail UX after visual review.

## Final recommendation

Accept Sprint 04A homepage first pass.

Pause technical execution briefly for Owner visual review.

Then proceed to Sprint 04B Desa detail UX if Owner/Iwan approve.

Do not execute seed, switch read path, or start scraper/import yet.

Initiated-by: Iwan request
Reviewed-by: Pending Owner/Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: accepted-first-pass
