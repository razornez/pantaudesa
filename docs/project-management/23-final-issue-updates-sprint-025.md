# Final Issue Updates — Sprint 02.5

Date: 2026-04-27
Status: ready-for-iwan-to-apply
Prepared-by: ChatGPT Freelancer / Rangga

## Context

Iwan has accepted the Sprint 02.5 follow-up docs and confirmed the latest issue status:

- #9 can be closed as done.
- #10 can be closed as done.
- #12 remains partial.
- #13 remains discovery-in-progress.
- #11 remains open / in-progress.
- Sprint 03 schema/database remains blocked.

This document turns `docs/project-management/21-issue-update-drafts-sprint-025.md` into final issue updates that Iwan can apply directly.

## Issue #9 — Final update

Issue:

- #9 `Tambahkan highlight: kenapa desa perlu dipantau`

Final status:

- `done`

Final action:

- Post comment.
- Close issue as completed.

Final comment:

```text
Final Sprint 02.5 update: #9 is done.

Reason:
- Homepage civic narrative already exists through `PondasiTransparansiSection`.
- `/tentang/kenapa-desa-dipantau` already exists.
- Copy tone supports the core PantauDesa principle: memantau bukan menuduh.
- Iwan review accepted this scope as complete.

Status: done.
Action: closing this issue as completed.
```

## Issue #10 — Final update

Issue:

- #10 `Tambahkan panduan kewenangan agar warga bertanya ke pihak yang tepat`

Final status:

- `done`

Final action:

- Post comment.
- Close issue as completed.

Final comment:

```text
Final Sprint 02.5 update: #10 is done.

Reason:
- Detail desa already has `ResponsibilityGuideCard`.
- `/panduan/kewenangan` already exists.
- Authority categories and disclaimer are present.
- Copy is careful enough to avoid blaming desa for every issue.
- Iwan review accepted this scope as complete.

Status: done.
Action: closing this issue as completed.
```

## Issue #12 — Final update

Issue:

- #12 `Sprint 2: Sederhanakan wording agar mudah dipahami warga awam`

Final status:

- `partial`

Final action:

- Post comment.
- Keep issue open.

Final comment:

```text
Final Sprint 02.5 update: #12 remains partial.

Reason:
- Critical wording improvements have been made and key copy is centralized in `src/lib/copy.ts`.
- Civic narrative and authority guide copy are improved.
- However, full-site wording audit is not proven complete.
- Hardcoded text cleanup across homepage, desa detail, auth, badge/profile, footer, and other components may still be needed.

Status: partial.
Action: keep this issue open as Sprint 02 follow-up for final copy audit and hardcoded text cleanup.
```

## Issue #13 — Final update

Issue:

- #13 `Sprint 2: Rancang data automation pipeline dari sumber resmi/desa official`

Final status:

- `discovery-in-progress`

Final action:

- Post comment.
- Keep issue open.

Final comment:

```text
Final Sprint 02.5 update: #13 is discovery-in-progress.

Reason:
- Official desa/kecamatan/kabupaten source strategy exists in `docs/engineering/14-official-desa-data-source-and-scraping-strategy.md`.
- Schema implications are documented in `docs/engineering/21-official-source-schema-implications.md`.
- Manual pilot discovery plan is documented in `docs/engineering/22-pilot-source-discovery-plan.md`.
- Manual discovery template is documented in `docs/engineering/23-manual-source-discovery-template.md`.
- Pilot area selection criteria are documented in `docs/engineering/24-pilot-area-selection-criteria.md`.

Important boundary:
- No scraper yet.
- No scheduler yet.
- No database/schema changes yet.
- Sprint 03 schema/database remains blocked until technical review.

Status: discovery-in-progress.
Action: keep this issue open for official source/manual discovery planning.
```

## Issue #11 — Final update

Issue:

- #11 `Terapkan team operating system Iwan-Asep-Ujang ke backlog dan commit workflow`

Final status:

- `open / in-progress`

Final action:

- Post comment.
- Keep issue open.

Final comment:

```text
Final Sprint 02.5 update: #11 remains open / in-progress.

Reason:
- Role trace is now present in many docs.
- Sprint 02.5 docs improve owner visibility.
- Issue update drafts and final updates are now prepared.
- However, issue labels/status/checklists are not yet fully clean.
- Backlog still needs consistent status tracking before Sprint 03 schema/database begins.

Status: open / in-progress.
Action: keep this issue open as the umbrella for workflow hygiene, issue status cleanup, and owner visibility.
```

## Owner summary

```text
Sprint 02.5 issue update summary:
- #9: done, close.
- #10: done, close.
- #12: partial, keep open.
- #13: discovery-in-progress, keep open.
- #11: open/in-progress, keep open.
- Sprint 03 schema/database remains blocked until technical review.
```

## Boundary confirmation

This is documentation only.

No changes were made to:

- schema
- database
- migration
- Supabase table
- API
- auth
- scraper
- scheduler
- read path
- Prisma runtime implementation

Initiated-by: Iwan
Reviewed-by: Pending Iwan application
Executed-by: ChatGPT Freelancer / Rangga
Status: ready-for-iwan-to-apply
