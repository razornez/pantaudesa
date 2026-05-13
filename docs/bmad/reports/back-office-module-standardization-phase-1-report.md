# Back-Office Module Standardization - Phase 1 Report

Status: `IN_PROGRESS / UNCOMMITTED`
Date: `2026-05-13`
Branch: `main`

## Standards Read
- `docs/bmad/standards/nextjs-engineering-standard.md`
- `docs/bmad/tasks/back-office-module-standardization-phase-1.md`

## Scope Worked
Primary scope touched in this pass:

```text
src/app/api/internal-admin/intake/**
src/components/internal-admin/IntakeWorkbench.tsx
src/components/internal-admin/VillageDataCenter.tsx
src/components/internal-admin/InternalDocumentReviewQueue.tsx
src/components/internal-admin/intake/**
src/components/internal-admin/review-queue/**
src/components/internal-admin/village-data-center/**
src/lib/intake/**
```

Secondary small cleanup:

```text
src/components/internal-admin/AdminDesaFilterBar.tsx
src/components/internal-admin/ClaimReviewQueue.tsx
src/components/internal-admin/InternalRenewalQueue.tsx
src/components/admin-desa/**
src/app/internal-admin/**
src/app/profil/admin-desa/**
src/app/profil/saya/**
src/components/profil/**
```

Still partial after this pass:

```text
src/lib/versioning/** (except intake-coupled request/pipeline touchpoints)
src/app/api/internal-admin/claims/**
src/app/api/internal-admin/desa-version-history/route.ts
src/app/api/internal-admin/intake/history/route.ts
src/app/api/internal-admin/village-data/**
src/app/api/admin-claim/**
```

## 27-Item Checklist Coverage
This pass explicitly applied the standard in these ways:

1. `route.ts` made thinner by extracting shared intake request parsing, document-review service/policy/validation helpers, and shared constants.
2. oversized client module `VillageDataCenter.tsx` split into tab-focused modules.
3. DTO/type duplication reduced between `components/internal-admin/intake/types.ts` and `lib/intake/types.ts`.
4. fetch/orchestration for intake moved toward reusable hook/API modules.
5. queue/history/source-of-truth helper logic preserved without UX redesign.
6. no new `any` introduced.
7. external input boundaries kept explicit in parser/request helpers and new shared validation modules.
8. user-facing copy/constants stayed centralized while shared policy/constants moved into reusable helpers.
9. visual structure intentionally preserved.
10. client-side back-office `fetch()` calls were centralized into `api.ts` modules instead of being left inline in render components.
11. server auth/permission flow unchanged.
12. audit-sensitive business behavior unchanged.
13. no new public feature/dashboard/filter/CRUD added.
14. no sensitive logging introduced.
15. QA run and documented honestly, including new policy/validation tests.

Items still pending in later cleanup passes:

1. repository normalization for remaining admin-claim/internal-admin server routes
2. broader constants/copy normalization in remaining back-office surfaces
3. final build closure once Prisma Windows blocker is removed

## Audit Matrix
| File / Area | Before | After | Problem Found | Action In This Pass | Standard Coverage |
| --- | ---: | ---: | --- | --- | --- |
| `src/components/internal-admin/VillageDataCenter.tsx` | 1007 | 156 | multiple tabs + fetch logic + shared pills in one client file | parent reduced to tab shell; extracted `StandardsTab`, `DesaDataTab`, `VersionsTab`, `ActivityLogTab`, shared types/ui | line budget, thin client shell, extraction by concern |
| `src/app/api/internal-admin/intake/submit-review/route.ts` | 439 | 24 | duplicated parsing/constants/fallback logic and full submit-review orchestration living in route | moved orchestration into `src/lib/internal-admin/intake-submit-review-service.ts` and kept route as auth + service boundary | thin route, explicit validation boundary, service extraction |
| `src/app/api/internal-admin/intake/route.ts` | 196 | 122 | duplicated request parsing and AI fallback rules | re-used shared request parser and constants | thin route, dedupe, explicit external boundary |
| `src/components/internal-admin/intake/types.ts` | 361 | 83 | duplicated domain DTOs and pipeline shapes | reduced to UI-only types + domain re-exports | DTO consolidation, no duplicate type systems |
| `src/lib/intake/types.ts` | 124 | 224 | domain types incomplete; response contracts scattered in UI | promoted shared intake DTOs/history/version response contracts to canonical domain module | centralized types, explicit API DTOs |
| `src/components/internal-admin/intake/hooks/useIntakePipeline.ts` | 138 | 87 | fetch logic duplicated with parent | moved request assembly to `intake/api.ts`, kept hook orchestration focused | hook responsibility, DRY |
| `src/components/internal-admin/intake/hooks/useIntakeHistory.ts` | 123 | 50 | mixed concerns with version history + duplicated parsing | split intake history and version history hooks | focused hook boundaries |
| `src/components/internal-admin/IntakeWorkbench.tsx` | 551 | 236 | parent still owned too much request/orchestration state | switched to extracted intake hooks and moved input, sticky result header, result step, review-submit section, and history panels into dedicated components | reduced duplicated flow logic, preserved UI |
| `src/components/internal-admin/InternalDocumentReviewQueue.tsx` | 1088 | 228 | largest back-office client file; status/copy/type/helper logic still crowded in one place | converted queue into orchestration shell and moved `DocCard`, `MarkFailedModal`, and `PublishModal` into dedicated modules | line budget, thin client shell, extraction by concern |
| `src/components/internal-admin/review-queue/PublishModal.tsx` | 279 | 189 | modal mixed action state with long template/coverage/field editor markup | extracted `PublishCoverageNotices` and `PublishFieldEditorList` | line budget, clearer modal responsibility |
| `src/components/internal-admin/village-data-center/DesaDataTab.tsx` | 467 | 92 | tab mixed fetch state, expanded row rendering, component visibility logic, and pagination | extracted `DesaDataResults` and `ComponentVisibilityPanel` | line budget, thin tab shell, extraction by concern |
| `src/components/internal-admin/intake/constants.ts` | 448 | 89 | one file mixed field metadata, sample data, file limits, helper functions, and large copy object | split into `field-metadata.ts`, `samples.ts`, `copy.ts`, and kept `constants.ts` as barrel/helper layer | constants/copy separation, line budget, clearer responsibility |
| `src/components/internal-admin/intake/IntakeDiffTheatre.tsx` | 286 | 159 | diff UI mixed filter controls, row rendering, and section grouping in one file | extracted `IntakeDiffRow`, `IntakeDiffFilterTabs`, and `diff-theatre.ts` helpers | line budget, thin render shell, mapper/helper extraction |
| `src/components/internal-admin/intake/IntakeCoverageLens.tsx` | 273 | 237 | coverage UI mixed donut chart, legend rows, and coverage grouping logic | extracted `IntakeCoverageChart`, `IntakeCoverageLegendRow`, and `coverage-lens.ts` helper | line budget, thin render shell, view-model helper extraction |
| `src/components/internal-admin/review-queue/utils.ts` | 250 | 166 | queue helper file still mixed formatting utilities with coverage/template parsing | extracted coverage/template parsing into `coverage-signals.ts` | line budget, helper separation, clearer utility boundaries |
| `src/app/profil/saya/SayaProfileClient.tsx` | 656 | 169 | user back-office page mixed avatar upload, PIN update, notification item, voice row, trust cards, profile update fetch logic, header/tabs, and tab content | extracted `profil/saya/api.ts`, `AvatarEditor`, `ChangePinCard`, `NotifItem`, `VoiceRow`, `TrustCard`, `BadgeMeaningCard`, `SayaProfileHeaderCard`, `SayaProfileProfileTab`, `SayaProfileVoicesTab`, and `SayaProfileNotificationsTab` | client fetch in `api.ts`, line budget improvement, extraction by concern |
| `src/components/profil/admin-claim/AdminClaimTimeline.tsx` | 240 | 33 | timeline presenter mixed step derivation with compact and full rendering variants | extracted `adminClaimTimelineModel.ts`, `AdminClaimTimelineCompact.tsx`, and `AdminClaimTimelineFull.tsx` | line budget, mapper/model extraction, clearer presentation boundaries |
| `src/app/api/internal-admin/documents/[documentId]/publish/route.ts` | 243 | 43 | route mixed request parsing, actor meta, document lookup, transaction, audit, and notifications inline | extracted `document-review-service.ts`, `document-review-policy.ts`, and `document-review-validation.ts` and left route as thin handler | thin route, validation/service/policy extraction |
| `src/app/api/internal-admin/documents/[documentId]/draft-mapping/route.ts` | 200 | 77 | route duplicated document lookup, actor-meta handling, and draft persistence | moved POST/PATCH orchestration into `document-review-service.ts` and validation helpers | thin route, validation/service extraction |
| `src/app/api/internal-admin/documents/[documentId]/mark-failed/route.ts` | 102 | 45 | route handled JSON parsing, status policy, persistence, audit, and notifications inline | moved failure orchestration into `document-review-service.ts` and `document-review-validation.ts` | thin route, validation/service/policy extraction |
| `src/components/internal-admin/village-data-center/*.tsx` | mixed inline client fetch | inline fetch removed | tab components still contained direct `/api/...` calls | moved all client calls into `village-data-center/api.ts` | client fetch in `api.ts`, thin components |
| `src/components/internal-admin/review-queue/*.tsx` | mixed inline client fetch | inline fetch removed | document card/modal actions still called `/api/...` directly | moved all client calls into `review-queue/api.ts` | client fetch in `api.ts`, thin components |
| `src/components/internal-admin/ClaimReviewQueue.tsx` + `InternalRenewalQueue.tsx` | inline action fetch | inline fetch removed | direct approve/reject request blocks in components | extracted `claim-review/api.ts` and `renewal-queue/api.ts` | client fetch in `api.ts`, thin components |
| `src/components/admin-desa/*.tsx` | mixed inline client fetch | inline fetch removed | upload / approve / invite / revoke / mark-read / status actions were inline | centralized client calls into `src/components/admin-desa/api.ts` | client fetch in `api.ts`, DRY, thin components |
| `src/app/internal-admin/documents/page.tsx`, `claims/page.tsx`, `renewals/page.tsx` | page mixed parsing + data loading + serialization | page boundary thinned | page components still owned filter parsing and DB orchestration | extracted `documents-page.ts`, `claims-page.ts`, `renewals-page.ts` server helpers | thin page boundary, clearer service-like loaders |
| `src/app/profil/admin-desa/*/page.tsx` + `layout.tsx` | repeated auth + admin-desa context gate | repeated gate removed | auth/context redirect logic repeated in many pages | extracted `requireAdminDesaContext()` helper | DRY, security-first, thinner page/layout boundary |
| `src/app/api/admin-claim/invite/route.ts`, `revoke-member/[memberId]/route.ts`, `documents/[documentId]/approve/route.ts`, `documents/upload/route.ts` | mixed inline membership policy + body parsing | shared policy/validation introduced | status/role rules and request normalization repeated across Admin Desa server actions | extracted `src/lib/admin-desa/policy.ts` and `src/lib/admin-desa/validation.ts` and reused them in route handlers and clients | policy layer, validation layer, DRY |
| `src/components/admin-desa/AdminDesaDokumenClient.tsx` + `AdminDesaListAdminClient.tsx` | repeated local permission checks | shared policy reused | UI-owned permission rules could drift from server rules | switched to `admin-desa/policy.ts` for upload, approve, revoke, and invite-limit decisions | shared policy, thinner client logic |

## New Modules Added
Intake standardization:

```text
src/components/internal-admin/intake/api.ts
src/components/internal-admin/intake/error-state.ts
src/components/internal-admin/intake/hooks/useVersionHistory.ts
src/components/internal-admin/intake/IntakeHistoryList.tsx
src/components/internal-admin/intake/DesaVersionHistoryList.tsx
src/lib/intake/constants.ts
src/lib/intake/request-parser.ts
```

Village data center split:

```text
src/components/internal-admin/village-data-center/types.ts
src/components/internal-admin/village-data-center/shared.tsx
src/components/internal-admin/village-data-center/StandardsTab.tsx
src/components/internal-admin/village-data-center/DesaDataTab.tsx
src/components/internal-admin/village-data-center/VersionsTab.tsx
src/components/internal-admin/village-data-center/ActivityLogTab.tsx
```

Preparation started and partially wired into queue:

```text
src/components/internal-admin/review-queue/constants.ts
src/components/internal-admin/review-queue/types.ts
src/components/internal-admin/review-queue/utils.ts
src/components/internal-admin/review-queue/MarkFailedModal.tsx
src/components/internal-admin/review-queue/DocCard.tsx
src/components/internal-admin/review-queue/PublishModal.tsx
src/components/internal-admin/review-queue/PublishCoverageNotices.tsx
src/components/internal-admin/review-queue/PublishFieldEditorList.tsx
src/components/internal-admin/review-queue/coverage-signals.ts
src/components/profil/saya/api.ts
src/components/profil/saya/image-utils.ts
src/components/profil/saya/NotifItem.tsx
src/components/profil/saya/VoiceRow.tsx
src/components/profil/saya/AvatarEditor.tsx
src/components/profil/saya/TrustCard.tsx
src/components/profil/saya/BadgeMeaningCard.tsx
src/components/profil/saya/ChangePinCard.tsx
src/components/profil/saya/SayaProfileHeaderCard.tsx
src/components/profil/saya/SayaProfileProfileTab.tsx
src/components/profil/saya/SayaProfileVoicesTab.tsx
src/components/profil/saya/SayaProfileNotificationsTab.tsx
src/components/profil/admin-claim/api.ts
src/components/profil/admin-claim/adminClaimTimelineModel.ts
src/components/profil/admin-claim/AdminClaimTimelineCompact.tsx
src/components/profil/admin-claim/AdminClaimTimelineFull.tsx
src/lib/internal-admin/document-review.ts
src/lib/internal-admin/document-review-policy.ts
src/lib/internal-admin/document-review-validation.ts
src/lib/internal-admin/document-review-service.ts
src/lib/internal-admin/intake-submit-review-service.ts
src/lib/admin-desa/policy.ts
src/lib/admin-desa/validation.ts
src/components/internal-admin/intake/IntakeResultStep.tsx
src/components/internal-admin/intake/IntakeHistoryPanels.tsx
```

Back-office client fetch consolidation:

```text
src/components/internal-admin/village-data-center/api.ts
src/components/internal-admin/review-queue/api.ts
src/components/internal-admin/claim-review/api.ts
src/components/internal-admin/renewal-queue/api.ts
src/components/internal-admin/admin-desa-filter/api.ts
src/components/admin-desa/api.ts
src/lib/internal-admin/constants.ts
src/lib/internal-admin/documents-page.ts
src/lib/internal-admin/claims-page.ts
src/lib/internal-admin/renewals-page.ts
src/lib/internal-admin/page-params.ts
src/lib/admin-desa/require-context.ts
src/components/internal-admin/intake/IntakeResultHeader.tsx
src/components/internal-admin/intake/IntakeInputStep.tsx
src/components/internal-admin/intake/IntakeReviewSubmitSection.tsx
src/components/internal-admin/intake/field-metadata.ts
src/components/internal-admin/intake/samples.ts
src/components/internal-admin/intake/copy.ts
src/components/internal-admin/village-data-center/DesaDataResults.tsx
src/components/internal-admin/village-data-center/ComponentVisibilityPanel.tsx
```

## Behavior / UI Change Check
Expected UI impact: `none`

Guardrails preserved:
- no color/layout/card/table/modal redesign
- no business-flow rewrite
- no new dashboard/public filter/CRUD work
- no DB migration
- no auth/publish governance change

## Performance / Maintainability Notes
- `VillageDataCenter` no longer forces all tab logic into one 1000+ line client file, which reduces mental load and narrows rerender responsibility by tab.
- intake request assembly is now centralized, reducing duplicated payload logic and lowering regression risk between preview and submit-review flows.
- shared intake request parser removes two parallel multipart/json parsing implementations and keeps external boundary validation consistent.
- queue review is now a much thinner orchestration shell, while card and modal responsibilities live in dedicated modules.
- intake diff and coverage modules now render from smaller extracted helpers/components instead of keeping filtering, grouping, and chart markup coupled in one hotspot file.
- review queue coverage/template parsing is now isolated from generic queue formatting helpers, which keeps publish-review utilities narrower and easier to test.
- back-office client request paths are now consistent: UI components render and trigger events, while `/api/...` communication lives in `api.ts` helpers.
- sweeping inline fetches out of village-data, review-queue, claim-review, renewal, and admin-desa components lowers duplication and makes future caching/error handling more consistent.
- user back-office profile flow now follows the same pattern: avatar upload, PIN update, and profile update go through `api.ts`, while tab content is split into smaller render components.
- repeated auth/context gate logic for Admin Desa pages is now centralized, which reduces redirect drift and keeps permission entry behavior consistent.
- internal-admin page parsing and data-loading responsibilities are now moving out of `page.tsx` into dedicated server helpers, improving maintainability without changing UI flow.
- `IntakeWorkbench` and `DesaDataTab` are now orchestration shells rather than giant mixed UI/state files, which materially lowers regression risk for future edits.
- document review and intake submit-review routes are now thin request boundaries that delegate to dedicated service/policy/validation modules instead of embedding long transactional flow inline.
- Admin Desa permission rules are now shared between clients and server actions, which reduces drift between what the UI allows and what the route enforces.

## Unit Test Coverage Added
New tests added in this pass:

```text
src/tests/lib/intake-request-parser.test.ts
src/tests/lib/intake-error-state.test.ts
src/tests/lib/review-queue-utils.test.ts
src/tests/lib/internal-admin-page-helpers.test.ts
src/tests/lib/admin-claim-timeline-model.test.ts
src/tests/lib/admin-desa-policy.test.ts
src/tests/lib/document-review-policy.test.ts
```

Covered helper areas:
- intake request-parser helper logic
- intake error-state classification
- review-queue helper formatting / next-step / coverage parsing
- admin-desa shared policy and validation helpers
- internal-admin document-review shared policy and validation helpers

## QA
Run results in this working tree:

```text
npm run lint         PASS
npx tsc --noEmit    PASS
npm test -- src/tests/lib/intake-diff-engine.test.ts src/tests/lib/intake-request-parser.test.ts src/tests/lib/intake-error-state.test.ts src/tests/lib/review-queue-utils.test.ts src/tests/lib/internal-admin-page-helpers.test.ts src/tests/lib/admin-claim-timeline-model.test.ts src/tests/lib/admin-desa-policy.test.ts src/tests/lib/document-review-policy.test.ts PASS
npx prisma generate FAIL
npm run build       FAIL
```

Known blocker for `prisma generate` and `build`:

```text
EPERM: operation not permitted, lstat 'C:\\Users\\IWANKU~1'
```

Other notes:
- ESLint still prints the existing `.eslintignore` deprecation warning from repo config.
- `rg -n "\\bfetch\\(" src/components/internal-admin src/components/admin-desa src/app/profil/admin-desa -g "!**/api.ts"` now returns no matches, so back-office client fetches are centralized in `api.ts`.

## Remaining Carry-Over
Phase 1 remaining carry-over is now narrower:

1. repository-style normalization is still incomplete for `admin-claim` server routes and several internal-admin history/claims/village-data routes.
2. broader constants/copy normalization is still incomplete in some Admin Desa and internal-admin surfaces.
3. `npx prisma generate` and `npm run build` remain blocked by the Prisma Windows `EPERM` environment issue.

## Suggested Next Safe Slice
Recommended continuation order:

1. repository/service normalization for remaining `admin-claim` and internal-admin history/claims routes
2. final constants/copy normalization for remaining back-office surfaces
3. rerun `prisma generate` + `build` once the Windows Prisma blocker is cleared

## 27-Item Compliance Matrix
This matrix is now the source of truth for completion. Status values:

- `DONE` = already applied with evidence in current working tree
- `PARTIAL` = improved but not yet fully compliant across back-office
- `BLOCKED` = cannot be completed fully because of environment/tooling blocker

| Item | Standard Topic | Status | Back-Office Files / Features Touched | Current Evidence | Remaining Gap |
| --- | --- | --- | --- | --- | --- |
| 1 | Why This Standard Exists | DONE | `VillageDataCenter`, `InternalDocumentReviewQueue`, `IntakeWorkbench` | large modules reduced and responsibilities split | none for intent level |
| 2 | Core Principles | DONE | intake, review queue, village data, admin desa clients, internal-admin document routes | SOLID/DRY/KISS/type-safe direction now applied across the main back-office surfaces, with shared API, service, policy, and validation helpers in place | none beyond repo-wide build blocker |
| 3 | Trusted References | DONE | App Router back-office boundaries, client fetch extraction | implementation follows App Router + client API separation pattern | none at report level |
| 4 | Recommended Project Structure | PARTIAL | `components/internal-admin/*`, `components/admin-desa/*`, `lib/intake/*` | `api.ts`, hooks, helper modules extracted | not yet normalized into fuller `features/server/repositories/services` shape |
| 5 | File Responsibility Rules | DONE | intake routes, queue shell, village data tabs, internal-admin pages, admin-desa pages, user profile back-office page | routes/pages are now thin boundaries and the large client shells have been split into focused modules | none in the touched back-office surfaces |
| 6 | Line Limit | DONE | `VillageDataCenter`, `InternalDocumentReviewQueue`, `IntakeWorkbench`, `PublishModal`, intake diff/coverage modules, admin desa clients | all touched back-office pages/components are now below the warning band and no touched back-office file remains above 250 lines | none in the touched back-office surfaces |
| 7 | TypeScript Rules | DONE | `review-queue/api.ts`, `village-data-center/api.ts`, intake types | no new `any`; explicit DTOs and fixes applied; `tsc` passes | none for current pass |
| 8 | Constants Rules | PARTIAL | `lib/intake/constants.ts`, `review-queue/constants.ts` | repeated limits/status maps started to centralize | more status/route/threshold constants still scattered |
| 9 | Copywriting Rules | PARTIAL | admin desa docs flow, review queue constants, existing back-office copy | copy preserved and partly centralized | still need feature-level `copy.ts` cleanup in more areas |
| 10 | API / Fetch / Server Action Rules | DONE | village-data tabs, review queue, claim review, renewal, admin desa, intake, user profile, admin-claim profile hook | no inline client `fetch()` remains outside `api.ts` in back-office components | route/service layering still needs more work, but client-fetch rule is satisfied |
| 11 | Validation Rules | PARTIAL | intake request parsing, document review boundaries, admin desa invite/revoke/upload boundaries | shared intake parser plus `document-review-validation.ts` and `admin-desa/validation.ts` now centralize the main request boundaries | broader schema validation still missing in remaining claims/history/village-data server routes |
| 12 | Repository Pattern for Prisma | PARTIAL | back-office server paths overall | Prisma still not moved into UI; repo discipline preserved where already present | not all touched routes have been normalized around repositories |
| 13 | Service Layer Rules | PARTIAL | intake flow, documents flow, admin desa actions, internal-admin page loaders | intake submit-review and document review now delegate to explicit service modules; page-level loading also uses server helpers | remaining admin-claim/history/claims server routes still need service extraction |
| 14 | Policy Layer Rules | PARTIAL | review/publish/fail/invite/revoke/upload flows | document review and admin desa permission rules now use shared policy helpers on both client and server paths | remaining claims/history actions still keep some policy inline |
| 15 | Mapper / ViewModel Rules | PARTIAL | `village-data-center/api.ts`, intake DTO shaping | normalization helpers now feed render-ready data | not all complex UI data uses explicit mapper modules yet |
| 16 | Error Handling Standard | PARTIAL | `intake/error-state.ts`, API helpers in review/admin desa/village data | repeated client error parsing reduced | no single shared back-office error contract across all touched areas yet |
| 17 | Performance Standard | PARTIAL | village data tabs, queue shell, intake hooks | duplication and oversized orchestration reduced | no full perf verification / query evidence pass yet |
| 18 | Caching Rules | DONE | queue/history/notification-sensitive flows | no unsafe persistent caching introduced | none in current scope |
| 19 | Loading, Streaming, and RSC Rules | DONE | internal-admin pages/layout/loading files, admin-desa pages/layout | existing loading/RSC behavior was preserved while page/layout boundaries were thinned and kept server-first | none for the touched back-office surfaces |
| 20 | Observability Rules | PARTIAL | touched back-office refactors overall | no sensitive logs added; existing perf/report discipline preserved | no new observability pass yet for remaining hotspots |
| 21 | Security Rules | DONE | all touched back-office flows | no client-side permission shift, no secret exposure introduced | none for current scope |
| 22 | Audit Trail Rules | PARTIAL | review/publish/fail/admin actions | audit-sensitive business flow preserved | no dedicated audit-layer standardization pass yet |
| 23 | Naming Convention | DONE | new helper/api/test modules | kebab-case files, typed exports, `@/` shared imports used | none for current pass |
| 24 | Test Standard | PARTIAL | intake parser/error-state/review utils tests, admin-desa policy tests, document-review policy tests | lint, tsc, and targeted helper tests pass | `prisma generate`/`build` remain blocked by environment; browser/integration closure is still outside this pass |
| 25 | Feature Completion Checklist | PARTIAL | batch-wide | line budgets, thin boundaries, client API extraction, and shared service/policy/validation helpers are now in place | full repository normalization and blocked build step remain |
| 26 | Rules for Existing Legacy Files | DONE | queue, village data, intake, admin desa client sweep | refactor done incrementally; no UI redesign mixed in | none for current method |
| 27 | Done Means | PARTIAL | whole batch | report updated, structure and type safety improved | cannot claim full done until remaining partial items and build blocker are closed |
