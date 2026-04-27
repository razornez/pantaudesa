# Backlog Hygiene Plan — Sprint 02.5

Date: 2026-04-27
Status: draft-for-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga acting as Ujang backup
Sprint: 02.5 — Data Source Strategy and Backlog Hygiene
Tasks: H-01, H-02, H-05

## Context

Sprint 02 has meaningful product and trust progress, but backlog status is not clean enough for owner visibility. Some features are already implemented, while issues remain open or unclear.

This plan converts Iwan/Asep direction into actionable backlog hygiene.

References:

- `docs/project-management/18-iwan-review-rangga-docs-and-sprint-025.md`
- `docs/project-management/14-sprint-02-closure-report.md`
- `docs/engineering/14-official-desa-data-source-and-scraping-strategy.md`

## Scope

This document covers:

- H-01 final check #9 UI/copy.
- H-02 final check #10 UI/copy.
- H-05 backlog hygiene plan.
- Recommended issue statuses.
- Follow-up actions before Sprint 03.

No runtime code changes are made.

## Overall backlog status

Recommended project status:

- Sprint 02: `partial-complete`
- Sprint 02.5: `active / docs-and-hygiene`
- Sprint 03 schema/database: `blocked-until-sprint-02.5-review`

## H-01 — Final check #9 UI/copy

Issue:

- #9 `Tambahkan highlight: kenapa desa perlu dipantau`

Files checked:

- `src/components/home/PondasiTransparansiSection.tsx`
- `src/app/tentang/kenapa-desa-dipantau/page.tsx`
- `src/lib/copy.ts`

Observed status:

- Homepage has civic narrative section.
- Section explains why desa is monitored.
- Page `/tentang/kenapa-desa-dipantau` exists.
- Copy supports core tone: monitoring is not accusation.
- CTA to learn and see village data exists.

Risk notes:

- Needs visual/UI check in browser by Iwan/Owner if possible.
- No runtime validation was executed by Rangga in this step.

Recommendation:

- Mark #9 as `ready-for-iwan-review`.
- If Iwan/Owner approves UI/copy, close as `done`.

Suggested issue comment:

```text
Final check: #9 appears implemented. Homepage civic narrative section exists and `/tentang/kenapa-desa-dipantau` exists. Copy tone supports “memantau bukan menuduh”. Recommendation: ready for Iwan/Owner review, then close if approved.
```

## H-02 — Final check #10 UI/copy

Issue:

- #10 `Tambahkan panduan kewenangan agar warga bertanya ke pihak yang tepat`

Files checked:

- `src/components/desa/ResponsibilityGuideCard.tsx`
- `src/app/panduan/kewenangan/page.tsx`
- `src/lib/copy.ts`

Observed status:

- Detail desa has responsibility/authority guide card.
- Card links to `/panduan/kewenangan`.
- Authority guide page exists.
- Page explains desa/kecamatan/kabupaten/provinsi/pusat distinction.
- Disclaimer exists and tone is careful.

Risk notes:

- Needs browser/UI check by Iwan/Owner if possible.
- No runtime validation was executed by Rangga in this step.

Recommendation:

- Mark #10 as `ready-for-iwan-review`.
- If Iwan/Owner approves UI/copy, close as `done`.

Suggested issue comment:

```text
Final check: #10 appears implemented. Detail card exists through `ResponsibilityGuideCard`, and `/panduan/kewenangan` exists with authority categories and disclaimer. Recommendation: ready for Iwan/Owner review, then close if approved.
```

## Issue #12 — Wording simplification

Issue:

- #12 `Sprint 2: Sederhanakan wording agar mudah dipahami warga awam`

Observed status:

- Critical copy improvements exist in `src/lib/copy.ts`.
- Civic narrative and authority wording are improved.
- Auth/badge/civic copy exists in centralized copy.
- However, full-site wording audit is not proven complete.
- Hardcoded strings may still exist in components/pages.

Recommendation:

- Keep #12 open.
- Mark as `partial` or `needs-final-copy-audit`.
- Do not close until final site-wide audit is completed.

Suggested follow-up task:

`Sprint 02 Follow-up: final copy audit and hardcoded text cleanup`

Minimum audit areas:

- homepage,
- desa list,
- desa detail,
- APBDes sections,
- dokumen publik,
- skor transparansi,
- auth login/register,
- badge/profile,
- footer/disclaimer,
- hardcoded strings outside `src/lib/copy.ts`.

Suggested issue comment:

```text
Status remains partial. Core wording has improved, but full-site wording audit and hardcoded text cleanup are not proven complete. Keep open as Sprint 02 follow-up.
```

## Issue #13 — Data automation / official source strategy

Issue:

- #13 `Sprint 2: Rancang data automation pipeline dari sumber resmi/desa official`

Observed status:

- Official source strategy now exists: `docs/engineering/14-official-desa-data-source-and-scraping-strategy.md`.
- Schema implications now exist: `docs/engineering/21-official-source-schema-implications.md`.
- Pilot discovery plan now exists: `docs/engineering/22-pilot-source-discovery-plan.md`.
- Implementation is still blocked.

Recommendation:

- Mark #13 as `discovery-in-progress`.
- Do not close yet.
- Do not implement scraper/scheduler yet.
- Use this issue to track pilot discovery and Sprint 03 schema readiness.

Suggested issue comment:

```text
Status: discovery-in-progress. Official source strategy, schema implications, and pilot source discovery plan are now documented. Scraper/scheduler implementation remains blocked. Next step: Iwan/Asep review and choose pilot area.
```

## Issue #11 — Team operating system / workflow hygiene

Issue:

- #11 `Terapkan team operating system Iwan-Asep-Ujang ke backlog dan commit workflow`

Observed status:

- Docs are increasingly using role trace.
- Some issue comments have progress notes.
- But issue labels/statuses/checklists are not consistently maintained.
- Owner still needs clearer visibility.

Recommendation:

- Keep #11 open.
- Mark as `in-progress / needs-cleanup`.
- Use this issue as umbrella for workflow hygiene.

Minimum cleanup actions:

- active issues must have current status comment,
- docs should include role trace,
- avoid ambiguous `needs-asep-review` for everything,
- distinguish `ready-for-iwan-review`, `blocked-cto`, `partial`, `done`, `discovery-in-progress`,
- update issue checklists if GitHub access/workflow allows.

Suggested issue comment:

```text
Status: in-progress / needs-cleanup. Docs increasingly use role trace, but issue labels/status/checklists still need cleanup. Keep open as backlog hygiene umbrella before Sprint 03.
```

## Recommended labels/status vocabulary

If GitHub labels are available later, use:

### Status labels

- `status:todo`
- `status:in-progress`
- `status:partial`
- `status:ready-for-review`
- `status:blocked`
- `status:done`
- `status:discovery`

### Review labels

- `review:iwan`
- `review:asep`
- `review:owner`

### Area labels

- `area:docs`
- `area:product`
- `area:engineering`
- `area:data-source`
- `area:trust-layer`
- `area:backlog`
- `area:schema`

### Risk labels

- `risk:cto-gate`
- `risk:no-runtime-validation`
- `risk:build-lint-known-issues`

## Sprint 02.5 checklist

- [x] H-01 final check #9 UI/copy documented.
- [x] H-02 final check #10 UI/copy documented.
- [x] H-03 schema implications doc created.
- [x] H-04 pilot source discovery plan created.
- [x] H-05 backlog hygiene plan created.
- [ ] H-06 Sprint 03 blocked note added/reviewed.
- [ ] Iwan reviews Sprint 02.5 docs.
- [ ] Asep/CTO reviews schema implications before Sprint 03.
- [ ] Owner chooses or approves pilot discovery area.

## Recommended next action for Iwan

Iwan should review:

- `docs/engineering/21-official-source-schema-implications.md`
- `docs/engineering/22-pilot-source-discovery-plan.md`
- `docs/project-management/19-backlog-hygiene-plan.md`

Then decide:

1. Can #9 be closed?
2. Can #10 be closed?
3. Should #12 remain copy follow-up?
4. Is #13 ready for manual pilot discovery?
5. Is #11 enough to keep workflow cleanup visible?
6. Is Sprint 03 still blocked until Asep review?

## Recommended report to Iwan

```text
Iwan, Sprint 02.5 handoff sudah selesai oleh Rangga sebagai backup Ujang.

Done:
- H-01 final check #9 UI/copy documented.
- H-02 final check #10 UI/copy documented.
- H-03 `docs/engineering/21-official-source-schema-implications.md`.
- H-04 `docs/engineering/22-pilot-source-discovery-plan.md`.
- H-05 `docs/project-management/19-backlog-hygiene-plan.md`.
- H-06 Sprint 03 blocked note will be added/has been added.

Tidak ada perubahan schema/database/API/auth/scraper/scheduler/read path/migration/Supabase table.

Perlu direview:
- apakah #9 dan #10 bisa ditutup,
- apakah schema implications cukup untuk Asep review,
- apakah pilot discovery plan cocok,
- apakah backlog hygiene plan cukup untuk owner visibility.
```

## Completion note

H-01, H-02, and H-05 complete as documentation/review notes only.

No schema/database/API/auth/scraper/scheduler/read path/migration/Supabase table changes were made.

Initiated-by: Iwan / Asep direction
Reviewed-by: Pending Iwan/Asep
Executed-by: ChatGPT Freelancer / Rangga as Ujang backup
Status: draft-for-review
