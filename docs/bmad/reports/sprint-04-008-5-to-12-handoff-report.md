# Sprint 04-008 (batches 5–12) — Handoff Report

**Branch:** `feat/sprint-04-008-5-to-12`
**Date:** 2026-05-03 (rework applied 2026-05-03)
**Quality gate:** 140 tests pass · 0 TSC errors · 0 lint errors · production build clean

---

## Commits delivered

| Commit | Batch | Summary |
|--------|-------|---------|
| `2a84667` | 04-008.5 | Renewal enforcement backend + internal review UI |
| `6e30ffd` | 04-008.6 | Admin Desa profile shell + badge/popover |
| `cd00952` | 04-008.7 | List Admin tab + invite/revoke LIMITED |
| `8050270` | 04-008.8 | Supabase Storage + Admin Desa Dokumen tab upload |
| `e1388af` | 04-008.9 | Internal admin Dokumen Desa review + manual mapping draft + publish |
| `560f4de` | 04-008.10 | Suara Warga tab (read-only) |
| `2fb2bc0` | 04-008.11 | Notification system for Admin Desa |
| `ee73fe5` | 04-008.12 | Initial QA gate + handoff report |
| `548cbae` | rework | Wire notifications · multi-file upload · manual mapping · source indicator · env cleanup |

---

## Rework summary (blocker fixes)

### 1. Notification creation hooks wired

All notification events are **fire-and-forget** — errors are logged but never throw, so no notification failure can break a transaction or HTTP response.

| Event | Trigger route | Recipients |
|-------|--------------|-----------|
| `DOCUMENT_UPLOADED_WAITING` | upload (LIMITED uploader) | All VERIFIED admins of the desa |
| `DOCUMENT_APPROVED` | approve (WAITING→PROCESSING) | Uploader |
| `DOCUMENT_PUBLISHED` | publish (PROCESSING→PUBLISHED) | Uploader + all active desa admins |
| `DOCUMENT_FAILED` | mark-failed | Uploader (with reason) |
| `INVITE_ACCEPTED` | accept-invite | Inviter |
| `RENEWAL_REMINDER` | renewal/approve | Member (extension confirmed) |
| `RENEWAL_EXPIRED` | renewal/reject | Member (expired with reason) |

Helper: `src/lib/notifications/create-notification.ts` — exports `createNotification` (single) and `createNotifications` (bulk).

### 2. AI mapping status: MANUAL (not AI)

- Renamed `generateStubMappingDraft` → `generateManualMappingDraft`, `generator: "manual"`.
- UI button: "Run AI Draft" → "Buat Draft Manual".
- Publish modal header: "Publikasikan dokumen (mapping manual)".
- Warning banner updated: "AI provider belum dikonfigurasi — lakukan mapping manual."
- To integrate a real AI provider: replace `generateManualMappingDraft()` body in `src/lib/admin-claim/ai-mapping.ts`. The `AiMappingDraft` interface and all callers remain unchanged.

### 3. Multi-file upload (max 5) — real, not misleading

- Upload route: accepts `files[]` FormData field (1–5 files). Legacy single `file` field still supported.
- Each file validated individually (MIME, size) before any storage write.
- Titles auto-suffixed `(N/M)` when batch > 1.
- `ADMIN_DESA_DOCUMENT_MAX_FILES_PER_UPLOAD` env is now actively enforced server-side.
- UI: `<input type="file" multiple>` with per-file list, live count in button.

### 4. Public source indicator

- Prisma migration `20260503100354`: added `dataSourceLabel TEXT` + `dataPublishedAt TIMESTAMP` (nullable) to `desa` table.
- Publish route: always stamps `dataSourceLabel = "Dokumen Admin Desa"` + `dataPublishedAt = now()` on every publish — even when no field updates are applied.
- Public desa detail page: shows an emerald chip `● Dokumen Admin Desa · Terakhir diperbarui {date}` when `dataPublishedAt` is set. Hidden otherwise (no misleading indicator for unverified desas).

### 5. env.example cleanup

Removed S3-style keys that were never read by any code:
- `SUPABASE_SERVICE_ROLE_KEY_ACCESS_ID` → removed
- `SUPABASE_SERVICE_ROLE_KEY_SECRET_KEY` → removed
- `NEXT_PUBLIC_SUPABASE_ENDPOINT` → removed
- `NEXT_PUBLIC_SUPABASE_REGION` → removed
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → removed
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → removed

Correct key used by `supabase-storage.ts`: `SUPABASE_SERVICE_ROLE_KEY` (service_role key from Supabase dashboard → Settings → API).

---

## Supabase Storage — explicit status

| Item | Status |
|------|--------|
| Bucket name | `admin-desa-documents` (configurable via `SUPABASE_STORAGE_BUCKET_ADMIN_DESA_DOCUMENTS`) |
| Bucket access | **PRIVATE** — no public reads. All access via signed URLs only. |
| RLS policy | None required — service role key bypasses RLS. |
| Signed URL TTL | 900 seconds (15 min) — configurable via `SUPABASE_STORAGE_SIGNED_URL_TTL_SECONDS`. |
| Bucket creation | **Owner manual action required** — bucket must be created in Supabase dashboard before first upload. |

### Required env vars (both must be set for storage to work)

| Var | Where to get it | Exposure |
|-----|----------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL | Public (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API → service_role key | **Server-only. Never expose to browser.** |

### Optional env vars (all have safe defaults)

| Var | Default | Purpose |
|-----|---------|---------|
| `SUPABASE_STORAGE_BUCKET_ADMIN_DESA_DOCUMENTS` | `admin-desa-documents` | Bucket name |
| `SUPABASE_STORAGE_SIGNED_URL_TTL_SECONDS` | `900` | Signed URL TTL |
| `ADMIN_DESA_DOCUMENT_MAX_FILE_SIZE_MB` | `10` | Per-file size cap |
| `ADMIN_DESA_DOCUMENT_MAX_FILES_PER_UPLOAD` | `5` | Files per upload request |
| `ADMIN_DESA_DOCUMENT_ALLOWED_MIME_TYPES` | `application/pdf,image/jpeg,image/png,image/webp` | Allowed MIME types |

---

## Error handling — user-facing messages

| Scenario | Code | Message shown |
|----------|------|--------------|
| Storage not configured | `STORAGE_NOT_CONFIGURED` | "Storage tidak terkonfigurasi. Hubungi admin PantauDesa." |
| File too large | `FILE_TOO_LARGE` | "File melebihi batas {N} MB." |
| MIME not allowed | `MIME_NOT_ALLOWED` | "Tipe file tidak diizinkan. Diizinkan: …" |
| Too many files | `TOO_MANY_FILES` | "Maksimal {N} file per unggah." |
| Upload to storage failed | `UPLOAD_FAILED` | "Gagal mengunggah file: {reason}" |
| Signed URL failed | `STORAGE_OPERATION_FAILED` | "Gagal membuat tautan preview." |
| Mapping provider inactive | (UI banner) | "AI provider belum dikonfigurasi — lakukan mapping manual." |
| Publish failed | 422 | "Hanya dokumen PROCESSING yang dapat dipublikasikan." |
| Document failed | (notif body) | "… tidak dapat diproses. Alasan: {reason}" |
| Notification failure | (server log only) | Logged to console, never surfaced to user |

---

## Architecture decisions

**Lazy-init external clients** (`src/lib/resend.ts`, `src/lib/storage/supabase-storage.ts`): Proxy defers construction to first property access — prevents Vercel build-time failures when env vars absent.

**`db.$transaction` on all mutating admin ops**: revoke-member, renewal-approve, document-publish wrapped in transactions.

**Notification fire-and-forget**: `createNotification`/`createNotifications` catch all errors internally. Notification loss is acceptable; transaction failure is not.

**Manual mapping MVP**: `AI_MAPPABLE_DESA_FIELDS` allowlist (7 safe Desa fields). Stub replaced by `generateManualMappingDraft`. Interface stable — replace implementation when AI provider chosen.

**Renewal sweep**: idempotent, capped at 200 records, internal-admin gated.

**Notifications are per-user, not per-desa**: `GET /api/admin-claim/notifications` does not gate on active membership, so recently-expired admins can still read theirs.

---

## Known risks and follow-up

| Item | Risk | Recommended follow-up |
|------|------|----------------------|
| Renewal sweep is manual | VERIFIED admins expire silently without nightly sweep | Wire `POST /api/internal-admin/renewals/sweep-expired` to a cron job |
| AI mapping is manual | Internal admin must read document and type values | Integrate Claude API when owner picks provider; replace `generateManualMappingDraft()` body only |
| `dataPublishedAt` cache | Desa detail page uses `unstable_cache` (5 min TTL) | Source indicator may lag up to 5 min after publish; acceptable for MVP |
| Supabase bucket not auto-created | Upload returns 404/403 until bucket is manually created | Add bucket creation to onboarding runbook |
| Notification emails not wired | In-app only; no email for document events | Add email via Resend in a future sprint for document status changes |
| Signed URL TTL (900s) | Long review sessions may have URLs expire mid-session | Bump TTL or add a re-fetch button if UX feedback warrants it |

---

## Owner manual actions (local + Vercel)

1. **Create Supabase bucket** `admin-desa-documents` (private) in Supabase dashboard before first upload.
2. **Set env vars in Vercel** (project settings → Environment variables):
   - `NEXT_PUBLIC_SUPABASE_URL` (safe for all environments)
   - `SUPABASE_SERVICE_ROLE_KEY` (**Production + Preview only** — never expose in client)
3. **Remove old S3-style keys from Vercel** if previously set: `SUPABASE_SERVICE_ROLE_KEY_ACCESS_ID`, `SUPABASE_SERVICE_ROLE_KEY_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_ENDPOINT`, `NEXT_PUBLIC_SUPABASE_REGION`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. **Run `npx prisma migrate deploy`** on production DB after merge (migration `20260503100354` adds `dataSourceLabel` + `dataPublishedAt` columns to `desa`).

---

## QA checklist — per role

| Role | Flow | Expected |
|------|------|---------|
| LIMITED Admin | Upload 1 PDF | Status = WAITING_VERIFIED_APPROVAL; VERIFIED admin receives in-app notif |
| LIMITED Admin | Upload 3 files at once | 3 docs created, titled "X (1/3)" etc. |
| LIMITED Admin | Upload 6 files | Blocked: "Maksimal 5 file per unggah" |
| VERIFIED Admin | Upload 1 PDF | Status = PROCESSING directly |
| VERIFIED Admin | Approve LIMITED doc | Doc → PROCESSING; uploader receives in-app notif |
| VERIFIED Admin | Invite new admin | Invitee receives email; on accept inviter receives in-app notif |
| Internal Admin | Draft manual mapping | Empty draft with note "AI provider belum dikonfigurasi" |
| Internal Admin | Publish doc (with fields) | Desa fields updated; dataPublishedAt stamped; all active admins notified |
| Internal Admin | Mark FAILED | Doc → FAILED; uploader notified with reason |
| Internal Admin | Renewal approve | Member notified; renewalDueAt extended 6 months |
| Internal Admin | Renewal reject | Member EXPIRED; email + in-app notif sent |
| Public | Visit desa with published doc | Emerald chip visible: "Dokumen Admin Desa · Terakhir diperbarui {date}" |
| Public | Visit desa without published doc | No chip shown |
| Any Admin | Notifikasi tab | List shows unread first; "Tandai dibaca" + "Tandai semua dibaca" work |

---

## Quality gate results (post-rework)

```
Tests:    140 passed (10 files)
TSC:      0 errors
ESLint:   0 errors (1 pre-existing eslintignore deprecation warning)
Build:    all routes compiled, 0 errors
Migration: 20260503100354 applied to live DB
```
