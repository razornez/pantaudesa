# Issue Update Drafts — Sprint 02.5

Date: 2026-04-27
Status: draft-for-iwan-use
Prepared-by: ChatGPT Freelancer / Rangga

## Context

Dokumen ini menyiapkan draft komentar/update untuk issue #9, #10, #12, #13, dan #11 berdasarkan review Iwan di:

- `docs/project-management/20-iwan-review-sprint-025-handoff.md`
- `docs/project-management/19-backlog-hygiene-plan.md`
- `docs/engineering/22-pilot-source-discovery-plan.md`
- `docs/engineering/21-official-source-schema-implications.md`

Tujuan:

- Owner/Iwan tidak perlu menulis ulang status issue.
- Issue backlog lebih sinkron dengan keputusan Sprint 02.5.
- Sprint 03 schema/database tetap terlihat blocked sampai review teknis.

## Final status summary

| Issue | New status | Action |
|---|---|---|
| #9 | done | close after posting update |
| #10 | done | close after posting update |
| #12 | partial | keep open |
| #13 | discovery-in-progress | keep open |
| #11 | open / in-progress | keep open |

## Draft for #9

Issue:

- #9 `Tambahkan highlight: kenapa desa perlu dipantau`

Recommended action:

- Post comment.
- Close issue as done.

Draft comment:

```text
Iwan review: #9 can be closed as done.

Reason:
- Homepage civic narrative already exists through `PondasiTransparansiSection`.
- `/tentang/kenapa-desa-dipantau` already exists.
- Copy tone supports the core PantauDesa principle: memantau bukan menuduh.
- No remaining product/copy blocker for this issue scope.

Status: done.
```

## Draft for #10

Issue:

- #10 `Tambahkan panduan kewenangan agar warga bertanya ke pihak yang tepat`

Recommended action:

- Post comment.
- Close issue as done.

Draft comment:

```text
Iwan review: #10 can be closed as done.

Reason:
- Detail desa already has `ResponsibilityGuideCard`.
- `/panduan/kewenangan` already exists.
- Authority categories and disclaimer are present.
- Copy is careful enough to avoid blaming desa for every issue.

Status: done.
```

## Draft for #12

Issue:

- #12 `Sprint 2: Sederhanakan wording agar mudah dipahami warga awam`

Recommended action:

- Post comment.
- Keep issue open.
- Mark as partial if labels/status workflow is available.

Draft comment:

```text
Iwan review: #12 remains partial.

Reason:
- Critical wording improvements have been made and key copy is centralized in `src/lib/copy.ts`.
- Civic narrative and authority guide copy are improved.
- However, full-site wording audit is not proven complete.
- Hardcoded text cleanup across homepage, desa detail, auth, badge/profile, footer, and other components may still be needed.

Status: partial.
Next action: keep this open as Sprint 02 follow-up for final copy audit and hardcoded text cleanup.
```

## Draft for #13

Issue:

- #13 `Sprint 2: Rancang data automation pipeline dari sumber resmi/desa official`

Recommended action:

- Post comment.
- Keep issue open.
- Mark as discovery-in-progress if labels/status workflow is available.

Draft comment:

```text
Iwan review: #13 is now discovery-in-progress.

Reason:
- Official desa/kecamatan/kabupaten source strategy exists in `docs/engineering/14-official-desa-data-source-and-scraping-strategy.md`.
- Schema implications are documented in `docs/engineering/21-official-source-schema-implications.md`.
- Manual pilot discovery plan is documented in `docs/engineering/22-pilot-source-discovery-plan.md`.

Important boundary:
- No scraper yet.
- No scheduler yet.
- No database/schema changes yet.
- Sprint 03 schema/database remains blocked until Sprint 02.5 outputs are reviewed by technical authority.

Status: discovery-in-progress.
Next action: owner/Iwan choose pilot area criteria or target area before manual discovery starts.
```

## Draft for #11

Issue:

- #11 `Terapkan team operating system Iwan-Asep-Ujang ke backlog dan commit workflow`

Recommended action:

- Post comment.
- Keep issue open.
- Use as umbrella for workflow/backlog hygiene.

Draft comment:

```text
Iwan review: #11 remains open / in-progress.

Reason:
- Role trace is now present in many docs.
- Sprint 02.5 docs improve owner visibility.
- However, issue labels/status/checklists are not yet fully clean.
- Backlog still needs consistent status tracking before Sprint 03 schema/database begins.

Status: open / in-progress.
Next action: use this issue as umbrella for backlog hygiene, issue status cleanup, and workflow visibility.
```

## Optional owner-facing comment

Use this in a summary comment or chat update if needed:

```text
Sprint 02.5 issue hygiene summary:
- #9: done, ready to close.
- #10: done, ready to close.
- #12: partial, keep open for final wording audit.
- #13: discovery-in-progress, keep open for official source/manual discovery planning.
- #11: open/in-progress, keep open for workflow and backlog hygiene.
- Sprint 03 schema/database remains blocked until technical review.
```

## Boundary reminder

These are issue update drafts only.

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
- Prisma

Initiated-by: Iwan
Reviewed-by: Pending Iwan/Owner
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-iwan-use
