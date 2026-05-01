# Sprint 04-008D — Back Office Completion for User, Admin Desa, and Internal Admin

Date: 2026-04-30
Status: backlog / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Related:
- `docs/bmad/tasks/sprint-04-008a-admin-desa-verification-review-otp-flow.md`
- `docs/bmad/tasks/sprint-04-008b-admin-desa-profile-tabs.md`
- `docs/bmad/tasks/sprint-04-008c-internal-admin-access-and-qa-seed-data.md`
- `docs/bmad/tasks/sprint-04-008-internal-admin-feature-backlog.md`

## Purpose

Capture Owner decision that Sprint 04-008 should complete the back-office experience related to:

- normal users,
- Admin Desa,
- internal admin,
- Admin Desa verification review,
- document upload/review/mapping/publish,
- suara warga,
- notifications.

This is a planning/backlog document only. Do not assign developer execution until Owner explicitly approves execution breakdown.

## Owner decision captured

Sprint 04-008 should aim to complete all back-office work related to user, Admin Desa, and internal admin.

The scope should include:

1. Internal admin access through normal login with database-backed internal admin flag/role.
2. Internal admin profile/page tab: `Admin Desa`.
3. Internal admin profile/page tab: `Dokumen Desa`.
4. Admin Desa profile tabs from 04-008B.
5. User-facing suara warga features working fully.
6. Admin Desa/internal admin suara warga visibility and notification behavior working fully.
7. Notification features working fully for user biasa, Admin Desa, and internal admin.
8. QA seed data from database for all major role/status flows.
9. No hardcoded dummy state in UI.

## Internal admin page/profile tabs

Internal admin logs in using the normal user login form. After login, if the authenticated user has internal admin flag/role from database, they should see internal admin tabs/sections in their profile/page.

### Internal tab: Admin Desa

Purpose:

Manage Admin Desa applications and verification lifecycle.

Scope:

- list Admin Desa claims/applications,
- filter by status: `PENDING`, `IN_REVIEW`, `REJECTED`, `VERIFIED`, `LIMITED` where relevant,
- review website-token claims,
- review desa-email OTP claims,
- review Hubungi Admin Pengajuan Admin Desa submissions,
- approve into `VERIFIED`,
- reject into `REJECTED`,
- provide clear rejection reason and instruction,
- mark fraud/suspicious and enforce 3-day cooldown,
- view audit trail for verification decision,
- see duplicate/conflicting claims for same desa,
- see renewal review queue,
- remove verified access when renewal fails or is missed,
- send/trigger notification email where required.

Important:

- Internal admin approval is for Admin Desa membership verification only.
- It must not be described as PantauDesa manipulating desa data.
- Internal admin actions must be audited.

### Internal tab: Dokumen Desa

Purpose:

Manage uploaded documents from Admin Desa and publish mapped data after internal review.

Scope:

- list uploaded documents by desa,
- filter by status:
  - `WAITING_VERIFIED_APPROVAL` if visible internally,
  - `PROCESSING`,
  - `PUBLISHED`,
  - `FAILED`,
- view document metadata,
- view uploader/admin status,
- run/trigger AI mapping where approved,
- inspect AI mapping result,
- edit/confirm mapping where needed,
- publish/update mapped desa data,
- mark document as `PUBLISHED` when successful,
- mark document as `FAILED` with clear reason when failed,
- send notification to uploader/admin,
- audit upload/review/mapping/publish/failure events.

Important:

- Document upload status is separate from Admin Desa claim status.
- AI mapping must not auto-publish without internal admin action.
- Failure reason must be clear and user-safe.

## Admin Desa profile tabs

Use 04-008B as source of truth.

Tabs:

1. `Profil`
2. `List Admin`
3. `Dokumen`
4. `Suara`
5. `Notifikasi`

Key rules:

- only one `VERIFIED` Admin Desa per desa,
- `VERIFIED` can invite admin,
- invitee becomes `LIMITED`,
- `VERIFIED` can revoke/delete `LIMITED`,
- `LIMITED` can upload documents but needs `VERIFIED` approval before processing,
- `VERIFIED` upload goes directly to `PROCESSING`,
- documents become `PUBLISHED` or `FAILED` after internal review/mapping,
- admin badge appears on profile photo for `VERIFIED` / `LIMITED`.

## User biasa features

Normal user features must continue to work and must not regress.

Scope:

- normal profile access,
- suara warga read/write flow where currently supported,
- comments/replies,
- likes/votes if existing feature supports it,
- notifications for replies/likes/votes/comments,
- no access to Admin Desa tabs unless eligible,
- no access to internal admin tabs.

## Suara warga requirement

Suara warga must work fully for relevant roles.

### For user biasa

- view published suara/comments,
- submit comment/voice where current product allows,
- reply where allowed,
- like/vote where allowed,
- receive notifications for replies/likes/votes where applicable,
- should not see private/internal moderation data.

### For Admin Desa

- see published suara/comments for their desa in `Suara` tab,
- see replies/likes/votes related to their desa or own comments where applicable,
- receive notifications for new suara/comment on their desa,
- receive notifications for replies to admin comments,
- receive notifications for likes/votes if supported,
- no moderation/destructive actions unless separately approved.

### For internal admin

- internal admin should be able to inspect suara/comment activity only if needed for back-office/support flows,
- internal admin access must be server-side guarded,
- no private data overexposure,
- internal admin actions must be audited if moderation/support action exists.

## Notification requirement

Notifications must work fully for:

1. user biasa,
2. Admin Desa,
3. internal admin.

### User biasa notification examples

- reply to user's comment,
- like/vote on user's comment if supported,
- status of user's Admin Desa claim if they applied,
- OTP/freeze/rejected/reapply updates if applicable.

### Admin Desa notification examples

- new published suara/comment on their desa,
- reply to admin comment,
- like/vote on admin comment,
- invite accepted,
- `LIMITED` document waiting for `VERIFIED` approval,
- document approved into processing,
- document published,
- document failed with reason,
- renewal reminder,
- verified access expired due to missed renewal,
- claim/review updates.

### Internal admin notification examples

- new Admin Desa application in `IN_REVIEW`,
- website token success waiting review,
- email OTP success waiting review,
- claim-support submission waiting review,
- suspicious/fraud review item,
- document waiting internal processing,
- document mapping failure,
- renewal review item,
- support/contact message.

## QA seed data requirement

Use 04-008C as source of truth.

QA seed data must include DB-backed examples for:

- user biasa,
- PENDING claim,
- IN_REVIEW claim,
- REJECTED claim,
- fraud cooldown claim,
- VERIFIED Admin Desa,
- LIMITED Admin Desa,
- internal admin,
- Admin Desa tabs,
- internal admin tabs,
- documents in all statuses,
- suara/comments,
- notifications for all role types.

All QA data must be loaded from database/API, not hardcoded in UI.

## Engineering and QA requirements

Any execution task split from 04-008D must include:

- TDD where practical,
- server-side authorization tests,
- role/access regression tests,
- UI browser QA for desktop and mobile,
- no ESLint failure,
- `npm run test` PASS,
- `npx tsc --noEmit` PASS,
- `npx prisma generate` PASS,
- `npm run build` PASS,
- audit trail checks,
- no private data leaks,
- no client-side trust decisions for protected actions.

## Access matrix summary

| Feature | User biasa | Admin LIMITED | Admin VERIFIED | Internal admin |
|---|---:|---:|---:|---:|
| Normal profile | Yes | Yes | Yes | Yes |
| Admin Desa profile tabs | No | Limited/only if approved | Yes | N/A |
| Internal Admin Desa tab | No | No | No | Yes |
| Internal Dokumen Desa tab | No | No | No | Yes |
| Upload document | No by default | Yes, needs VERIFIED approval | Yes, goes processing | Review/manage |
| Publish document data | No | No | No direct internal bypass | Yes after review/mapping |
| Invite admin | No | No | Yes | No unless support flow approved |
| Revoke LIMITED | No | No | Yes | Yes if support/internal flow exists |
| Suara warga | Yes | Yes | Yes | Support/view if approved |
| Notifications | Yes | Yes | Yes | Yes |

## Suggested execution breakdown

Because this is large, do not implement as one giant task. Split into ordered execution tasks:

1. **04-008A** — Verification review + OTP + rejected/cooldown/renewal foundation.
2. **04-008C** — Internal admin access + QA seed data.
3. **04-008D.1** — Internal profile tabs: Admin Desa review queue.
4. **04-008D.2** — Internal profile tabs: Dokumen Desa review/mapping/publish queue.
5. **04-008B** — Admin Desa profile tabs: Profil/List Admin/Dokumen/Suara/Notifikasi.
6. **04-008D.3** — Suara warga regression and role-specific behavior.
7. **04-008D.4** — Notification system completion for user/Admin Desa/internal admin.
8. **04-008D.5** — Final cross-role back-office regression QA.

## Out of scope until approved

- separate internal-admin login form,
- dedicated Admin Desa dashboard,
- public admin list for all visitors,
- public exposure of private uploaded documents,
- AI auto-publish,
- client-side-only authorization,
- hardcoded dummy data in UI,
- destructive actions without audit/confirmation,
- exposing detailed fraud detection internals to users.

## Open decisions before execution

- Exact route/location for internal admin tabs.
- Whether internal admin tabs live in profile page or a protected internal route.
- Exact schema for notifications.
- Exact schema for document review/mapping.
- Exact schema for Admin Desa verification review.
- Whether document upload storage is implemented before or inside this sprint.
- How much of suara warga already exists and what needs refactor/regression only.
- Whether internal admin can moderate suara, or only view/support.

## Acceptance criteria for future 04-008 completion

Sprint 04-008 should not be considered complete until:

- internal admin login/flag works through normal login,
- internal admin `Admin Desa` tab works,
- internal admin `Dokumen Desa` tab works,
- Admin Desa profile tabs work,
- Admin Desa document upload/review/mapping/publish flow works,
- suara warga works for user biasa/Admin Desa/internal admin needs,
- notifications work for user biasa/Admin Desa/internal admin,
- DB-backed QA dummy data exists,
- role/access matrix is enforced server-side,
- all quality gates pass,
- desktop/mobile browser QA is documented,
- sensitive flows have clear explanatory copy.
