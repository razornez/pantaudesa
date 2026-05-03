# Sprint 04-008 (batches 5–12) — Handoff Report

**Branch:** `feat/sprint-04-008-5-to-12`
**Date:** 2026-05-03
**Quality gate:** 140 tests pass · 0 TSC errors · 0 lint errors · production build clean

---

## Commits delivered

| Commit | Batch | Summary |
|--------|-------|---------|
| `2a84667` | 04-008.5 | Renewal enforcement backend + internal review UI |
| `6e30ffd` | 04-008.6 | Admin Desa profile shell + badge/popover |
| `cd00952` | 04-008.7 | List Admin tab + invite/revoke LIMITED |
| `8050270` | 04-008.8 | Supabase Storage + Admin Desa Dokumen tab upload |
| `e1388af` | 04-008.9 | Internal admin Dokumen Desa review + AI mapping draft + publish |
| `560f4de` | 04-008.10 | Suara Warga tab (read-only) |
| `2fb2bc0` | 04-008.11 | Notification system for Admin Desa |

---

## What was built

### 04-008.5 — Renewal enforcement backend
- `src/lib/admin-claim/renewal.ts` — `addRenewalPeriod`, `getRenewalState`, `daysUntilRenewal`, `isRenewalOverdue`
- `src/lib/email/admin-claim-email.ts` — `sendRenewalReminderEmail`, `sendRenewalExpiredEmail`
- `GET /api/internal-admin/renewals` — list members by renewal state
- `POST /api/internal-admin/members/[memberId]/renewal/approve` — extend 6 months
- `POST /api/internal-admin/members/[memberId]/renewal/reject` — expire + email
- `POST /api/internal-admin/renewals/sweep-expired` — idempotent batch sweep (200-cap)
- Approve claim route updated to stamp `renewalDueAt`
- 14 unit tests for renewal logic

### 04-008.6 — Admin Desa profile shell
- `src/lib/admin-claim/profile-tabs.ts` — tab registry + capability matrix
- `src/lib/data/admin-desa-context.ts` — `getAdminDesaContext(userId)`
- `src/app/profil/admin-desa/layout.tsx` — server guard + header + tab nav
- `src/components/admin-desa/AdminDesaBadge.tsx` — status dot + accessible popover with renewal warning

### 04-008.7 — List Admin tab
- `src/lib/data/desa-admins.ts` — `getDesaAdminRoster(desaId)`
- `POST /api/admin-claim/revoke-member/[memberId]` — transactional, VERIFIED-only
- `src/components/admin-desa/AdminDesaListAdminClient.tsx` — invite modal, revoke modal, history, React 19 purity fix
- `src/app/profil/admin-desa/list-admin/page.tsx`

### 04-008.8 — Supabase Storage + Dokumen upload
- `src/lib/storage/supabase-storage.ts` — lazy-init admin client, upload, signed URL, path builder
- `src/lib/storage/upload-validation.ts` — MIME/size/count validation
- `POST /api/admin-claim/documents/upload` — multipart, status-aware (LIMITED→WAITING, VERIFIED→PROCESSING)
- `GET /api/admin-claim/documents` — list for current desa
- `GET /api/admin-claim/documents/[id]/preview` — signed URL (same-desa OR INTERNAL_ADMIN)
- `POST /api/admin-claim/documents/[id]/approve` — VERIFIED-only, WAITING→PROCESSING
- `src/components/admin-desa/AdminDesaDokumenClient.tsx` — upload dialog, list, preview

### 04-008.9 — Internal admin document review + AI mapping
- `src/lib/admin-claim/ai-mapping.ts` — `AI_MAPPABLE_DESA_FIELDS` allowlist, stub generator, sanitizer
- `GET /api/internal-admin/documents` — paginated queue with status/desa filter
- `POST /api/internal-admin/documents/[id]/draft-mapping` — generates stub AI draft
- `POST /api/internal-admin/documents/[id]/publish` — apply Desa fields + PROCESSING→PUBLISHED + audit snapshots
- `POST /api/internal-admin/documents/[id]/mark-failed` — required reason
- `src/components/internal-admin/InternalDocumentReviewQueue.tsx` — review UI with publish modal + mark-failed modal
- `src/app/internal-admin/documents/page.tsx`

### 04-008.10 — Suara Warga tab
- `src/app/profil/admin-desa/suara/page.tsx` — read-only voice feed filtered by `ctx.desa.id`, category labels, status pills, engagement counts, link to public page

### 04-008.11 — Notification system
- `GET /api/admin-claim/notifications` — list 50 most-recent in-app notifications
- `POST /api/admin-claim/notifications/mark-read` — mark all or specific IDs
- `src/components/admin-desa/AdminDesaNotifikasiClient.tsx` — optimistic mark-read (single + all), unread count
- `src/app/profil/admin-desa/notifikasi/page.tsx` — server-side fetch, serialized dates as props

---

## Architecture decisions

**Lazy-init pattern for external clients** (`src/lib/resend.ts`, `src/lib/storage/supabase-storage.ts`): Proxy deferring construction to first property access prevents Vercel build-time failures when env vars are absent.

**`db.$transaction` on all mutating admin ops**: revoke-member, renewal-approve, document-publish all wrapped in transactions for race safety.

**AI mapping MVP scope** (`AI_MAPPABLE_DESA_FIELDS`): Only safe Desa profile fields — no APBDes, no sensitive data. Stub generator returns empty draft; interface is stable for future real LLM integration without UI changes.

**Notifications are per-user, not per-desa**: `GET /api/admin-claim/notifications` does not gate on active admin membership, so a recently-expired admin can still read their notifications.

**Renewal sweep** is idempotent, capped at 200 records, and internal-admin gated — safe to run multiple times or via cron.

---

## Known limitations / follow-up work

- AI mapping stub always returns empty draft — replace `generateStubMappingDraft()` with real LLM call in a future sprint.
- No push/email notification creation hooks wired yet — the `AdminDesaNotification` rows must be inserted by existing flows (renewal reminder, document status change, etc.) as follow-on work.
- Renewal sweep is manual (internal admin button) — a cron job should call `POST /api/internal-admin/renewals/sweep-expired` nightly.
- Signed URL TTL is 900 s — consider bumping for large PDF review sessions.

---

## Quality gate results

```
Tests:    140 passed (10 files)
TSC:      0 errors
ESLint:   0 errors (1 deprecation warning — eslintignore, pre-existing)
Build:    all routes compiled, 0 errors
```
