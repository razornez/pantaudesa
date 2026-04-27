# Sprint 03 Closure and Sprint 04 Scope Proposal

Date: 2026-04-27
Status: draft-for-owner-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga
Role: Project Manager + Product Operations Reviewer

## Context

Sprint 03 has become too broad. The team has already completed the highest-risk data foundation work and created several downstream plans. Continuing to add homepage UI, detail page UX, seed execution, read path switch, numeric policy, or scraping/import work into Sprint 03 will increase risk and coordination cost.

Inputs reviewed:

- `docs/project-management/50-sprint-03-retro-and-operating-model-improvement.md`
- `docs/product/04-homepage-ui-implementation-brief.md`
- `docs/engineering/47-sprint-03-shared-supabase-migration-apply-report.md`
- `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`

## Closure recommendation

Close Sprint 03 now as:

> Data foundation completed, migration applied, seed implementation prepared-not-executed, operating model improved, and homepage direction approved for Sprint 04 planning.

Do not expand Sprint 03 further.

## Sprint 03 done

Sprint 03 should be considered done for these outputs:

1. Database foundation schema was designed and implemented.
2. Sprint 03 migration was created and applied to shared Supabase.
3. Shared Supabase migration gate completed safely.
4. Auth/user/voice safety was preserved.
5. Demo seed implementation was prepared but not executed.
6. Seed scope was constrained to `Desa`, `DataSource`, and `DokumenPublik`.
7. No numeric APBDes extraction was included in seed implementation.
8. Operating model improvements were documented.
9. Homepage visual/product direction was approved as a future UI-only scope.

## Sprint 03 hold / do not expand

Do not add these to Sprint 03:

- desa detail UI,
- APBDes detail UI,
- Dokumen detail UI,
- seed execution,
- read path switch,
- service layer integration,
- scraper/import prototype,
- numeric APBDes policy,
- transparency score,
- leaderboard methodology,
- alert dini methodology,
- admin verification workflow.

Reason:

These are separate product/UX/data-governance gates and should not be mixed with the database foundation sprint.

## Current blocked items

## Seed execution

Status:

- blocked.

Reason:

- seed implementation exists but has not been executed.
- Iwan must approve seed execution as a separate gate.
- data status UX/readiness must be clear before seed data affects product assumptions.

## Read path switch

Status:

- blocked.

Reason:

- read path switch can make demo/imported/needs_review data look official if UI status behavior is not ready.
- homepage/detail page status badges and disclaimers need product approval first.

## Scraper/import prototype

Status:

- blocked.

Reason:

- source governance and document/status UX must be stable first.
- imported data must not be presented as verified.

## Numeric APBDes policy

Status:

- blocked.

Reason:

- APBDes sources vary in format and maturity.
- document registry should come before numeric extraction.

## Sprint 04 proposed split

## Sprint 04A — Homepage clarity and data status UX

Goal:

Make homepage easier to understand while preserving the engaging hero/ranking hook.

Scope:

- keep current `HeroSection` visual direction,
- keep ranking/priority hook,
- reframe copy to avoid accusatory tone,
- reduce chart/donut prominence,
- add fresh static sections:
  - Citizen Journey Timeline,
  - Status Data Cards,
  - Document Desk,
  - Pilot Area Story,
  - Bukan Menuduh Manifesto.

Boundary:

- UI-only,
- no seed execution,
- no read path switch,
- no schema/API/auth/DB/scraper.

Output:

- homepage UI improvement implementation and QA report.

## Sprint 04B — Desa detail UX

Goal:

Design and implement a clearer desa detail page hierarchy.

Scope:

- identity header,
- data status banner,
- source summary,
- public document section,
- cautious APBDes section,
- authority guide.

Boundary:

- no read path switch until product/data status behavior is approved,
- can start as mock/static UI.

Output:

- desa detail UX brief or UI-only implementation depending on gate approval.

## Sprint 04C — Dokumen/APBDes detail UX

Goal:

Create document-first APBDes experience before numeric extraction.

Scope:

- document registry display,
- APBDes/realisasi document states,
- empty states,
- needs_review states,
- source link display,
- “what cannot be concluded yet” copy.

Boundary:

- no real numeric extraction,
- no transparency score,
- no alert dini methodology.

Output:

- APBDes/document UX spec or UI-only component pass.

## Sprint 04D — Seed/read path integration

Goal:

Execute demo seed and integrate read path only after UI/data status UX is ready.

Prerequisites:

- Sprint 04A status UX accepted,
- seed execution explicitly approved,
- seed execution report confirms no `verified` records,
- read path impact plan accepted.

Scope:

- run seed if approved,
- verify counts,
- keep `AnggaranDesaSummary` and `APBDesItem` empty unless separately approved,
- then plan read path switch.

Boundary:

- no broad read path switch without explicit gate,
- no scraper/import.

Output:

- seed execution report,
- read path readiness report.

## Sprint 04E — Scraping/import prototype after source governance

Goal:

Only after source governance and data status UX are stable, prepare limited import/scraping prototype.

Prerequisites:

- source governance accepted,
- imported/needs_review UX accepted,
- document registry behavior accepted,
- no verified claims from imported data.

Scope:

- prototype planning first,
- small source candidate only,
- no broad crawl.

Boundary:

- no national crawling,
- no scheduler until prototype is reviewed,
- no bypassing access controls,
- no personal/sensitive data extraction.

Output:

- import/scraping prototype plan, not immediate execution.

## Recommended Sprint 04 sequence

Recommended order:

1. Sprint 04A — Homepage clarity/data status UX.
2. Sprint 04B — Desa detail UX.
3. Sprint 04C — Dokumen/APBDes detail UX.
4. Sprint 04D — Seed/read path integration.
5. Sprint 04E — Scraping/import prototype.

Reason:

Product/UX clarity must come before data is executed and shown. Otherwise, demo/imported/needs_review data can look like official verified data.

## Ujang technical execution guidance

Ujang technical execution should be minimized until Sprint 04 scope is approved.

For now:

- no new Ujang command from Rangga,
- Iwan remains command owner,
- Ujang should only receive small, file-based, UI-only tasks after Sprint 04A is approved.

## Owner/Iwan decisions needed

1. Approve Sprint 03 closure.
2. Confirm seed execution remains blocked.
3. Confirm read path remains blocked.
4. Confirm detail page UX belongs to Sprint 04, not Sprint 03.
5. Confirm Sprint 04A starts with homepage clarity/data status UX.
6. Confirm Sprint 04D seed/read path integration happens only after product/status UX readiness.
7. Confirm Sprint 04E scraping/import is later and only after source governance.

## Summary max 12 bullets

1. Sprint 03 should close now; it has already delivered the data foundation and shared Supabase migration.
2. Seed implementation is prepared but not executed; keep it blocked.
3. Read path remains blocked.
4. Do not expand Sprint 03 into detail UI, APBDes UI, seed execution, read path, scraper, or numeric policy.
5. Homepage direction is approved but should move to Sprint 04A.
6. Desa detail UX belongs to Sprint 04B.
7. Dokumen/APBDes detail UX belongs to Sprint 04C.
8. Seed/read path integration belongs to Sprint 04D after status UX is ready.
9. Scraping/import prototype belongs to Sprint 04E after source governance.
10. Ujang execution should stay minimal and receive only small approved tasks from Iwan.
11. Product/data governance should lead before technical execution.
12. Recommended next decision: Owner/Iwan approve Sprint 03 closure and start Sprint 04A.

## Final recommendation

Close Sprint 03 as foundation complete.

Start Sprint 04 with product clarity first, not more database/read path execution.

Initiated-by: Owner/Iwan direction
Reviewed-by: Pending Owner/Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-review
