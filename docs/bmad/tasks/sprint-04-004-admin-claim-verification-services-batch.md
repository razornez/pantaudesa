# Task Sprint 04-004 — Admin Claim Verification Services + Audit + Invite + Fake Report

Status: READY_FOR_UJANG_IMPLEMENTATION
Executor: Ujang / Asep
Prepared-by: Rangga
Date: 2026-04-29

## Recommended model for Ujang

```text
Recommended model: GPT-5.1
Reasoning effort: high
```

Why:

- This task touches email magic link, website token verification, role/status transitions, audit trail, invite service, and fake-admin reporting.
- A mistake can create fake admin access, expose private data, or create legal/reputation risk.
- Build/test passing is not enough; security, state-transition, and UI visual checks are required.

Fallback if only Codex mini is available:

```text
Model: GPT-5.1 Codex mini
Reasoning effort: medium/high
Escalate to GPT-5.1 high if auth, token, email, status transition, SSRF, or security ambiguity appears.
```

## Goal

Implement the real service layer behind the guided `Klaim sebagai Admin Desa` flow.

Owner approved implementing all 8 items in one batch, but the work must be ordered carefully so the result does not become chaotic.

The 8 items are:

1. kirim email magic link beneran;
2. generate token website beneran;
3. cek token di website desa;
4. submit claim ke DB dari UI;
5. update status `PENDING` / `LIMITED` / `VERIFIED` dari action user;
6. audit event real dari action klaim;
7. service invite admin;
8. fake admin report.

## Important provider decision

Owner confirmed PantauDesa already uses Resend.com for email login/check.

For this task, do **not** merge admin claim email into the existing NextAuth `signIn("resend")` flow.

Create a separate email service for admin-claim-related emails because PantauDesa will likely have multiple email services later.

Recommended structure:

```text
src/lib/email/resend-client.ts
src/lib/email/admin-claim-email.ts
src/lib/admin-claim/token.ts
src/lib/admin-claim/audit.ts
src/lib/admin-claim/audit-events.ts
src/lib/admin-claim/status.ts
src/lib/admin-claim/website-token.ts
```

Equivalent structure is allowed if it matches current project conventions.

## Required Resend/env check

Before implementation, check and reuse existing Resend setup/env:

```text
RESEND_API_KEY
RESEND_FROM_EMAIL
EMAIL_FROM
SUPPORT_EMAIL
NEXT_PUBLIC_SUPPORT_EMAIL
NEXT_PUBLIC_APP_URL
existing Resend provider/helper if any
existing NextAuth Resend config if useful as reference only
```

Rules:

- Use Resend as the intended provider.
- Do not add a new dependency; `resend` already exists in `package.json`.
- Do not reuse NextAuth magic-link flow directly for admin claim verification.
- If Resend env is missing in local runtime, report `RESEND_ENV_MISSING`, but do not fake-send email.
- In production-like flow, never expose raw email magic token in UI.
- In development-only logs, a test link may be logged only if safe and clearly not shown to users.

## Screenshot / UI evidence rule for this and future UI tasks

Owner asked that UI tasks must be audited visually with screenshots.

For this task:

- If UI is touched, Ujang must capture before/after screenshots or at least before/after screenshot notes.
- Screenshots should **not** be committed into the repo unless Owner/Iwan explicitly asks.
- Local screenshot artifacts should go into an ignored/local-only folder such as:

```text
.artifacts/screenshots/sprint-04-004/
```

or:

```text
tmp/screenshots/sprint-04-004/
```

- If files are currently piling up in local project root, move them to a local artifact folder and add/confirm gitignore coverage.
- Report screenshot paths/notes in the handoff.
- Build/test passing is not enough for UI changes.

Future direction:

- Supabase Storage can be used later for persistent visual evidence.
- Recommended bucket name later:

```text
qa-screenshots
```

- Keep bucket private.
- Store only signed URLs or metadata in DB.
- Do not implement Supabase screenshot upload in this task unless Owner explicitly opens that storage/artifact task.

## Existing foundation

Sprint 04-002 added schema foundations:

- `DesaAdminClaim`
- `DesaAdminMember`
- `DesaAdminInvite`
- `AdminClaimAudit`
- `FakeAdminReport`
- `DokumenAttachment`
- `AIReviewResult`

Sprint 04-003 added guided UI route:

- `/profil/saya`
- `/profil/klaim-admin-desa`
- `/api/admin-claim/profile`

This task should build on that foundation.

## Non-negotiable safety rules

1. Do not allow self-promotion to verified admin without successful official proof.
2. Do not treat `User.role = DESA` as desa-specific verified admin.
3. Do not store raw magic tokens in DB; store hash only.
4. Tokens must expire.
5. Tokens must be single-use where applicable.
6. Do not expose private email/phone publicly.
7. Do not activate verified status for data values.
8. Do not allow admin to delete citizen voices.
9. All claim/invite/report actions must write audit events.
10. Website token checking must not become a general scraper.
11. No official numeric APBDes extraction.
12. No new dependency unless explicitly approved.

---

# Ordered implementation plan

Ujang must implement in this order to avoid tangled code.

## Phase 1 — Shared admin-claim primitives

Create shared helpers first.

Required helpers:

1. audit event constants;
2. audit write helper;
3. token generate/hash/verify helper;
4. status transition helper;
5. member permission helper;
6. safe URL/domain helper for website token check;
7. Resend admin claim email helper.

Suggested files:

```text
src/lib/admin-claim/audit-events.ts
src/lib/admin-claim/audit.ts
src/lib/admin-claim/token.ts
src/lib/admin-claim/status.ts
src/lib/admin-claim/permissions.ts
src/lib/admin-claim/safe-url.ts
src/lib/email/resend-client.ts
src/lib/email/admin-claim-email.ts
```

Acceptance for Phase 1:

- No UI changes required yet.
- No raw event strings scattered everywhere.
- Token helper stores/compares hash only.
- Email helper is admin-claim-specific and does not rely on NextAuth `signIn("resend")`.

## Phase 2 — Submit claim to DB from UI

Implement claim submit from `/profil/klaim-admin-desa`.

Supported methods:

```text
OFFICIAL_EMAIL
WEBSITE_TOKEN
SUPPORT_REVIEW
```

On submit:

- require authenticated user;
- validate desa exists;
- create or update `DesaAdminClaim` for `(userId, desaId)`;
- status starts as `PENDING`;
- method is saved;
- write audit event `CLAIM_STARTED`;
- prevent noisy duplicate claims.

Suggested endpoint:

```text
POST /api/admin-claim/claims
```

If existing pending claim exists:

- return existing claim or safely update method;
- write `CLAIM_REUSED` or `CLAIM_METHOD_UPDATED`.

## Phase 3 — Real Resend admin-claim email magic link

For `OFFICIAL_EMAIL` method:

1. Determine official email candidate.
2. Generate cryptographically random token.
3. Store token hash and expiry on claim.
4. Send real email via admin-claim Resend service.
5. Write audit `EMAIL_VERIFICATION_SENT`.
6. UI shows success.

Allowed email sources:

- email stored in trusted desa/source metadata;
- email attached to official source record;
- future official website contact email.

Do not send to arbitrary user-entered Gmail/Yahoo/etc.

Token rules:

- expiry recommended: 30-60 minutes;
- raw token never stored;
- token single-use;
- link uses `NEXT_PUBLIC_APP_URL` or safe app base URL.

Candidate verification route:

```text
/profil/klaim-admin-desa/verifikasi-email?claimId=...&token=...
```

or API route equivalent.

On valid email token:

- verify hash;
- check expiry;
- reject if already used;
- set claim `VERIFIED`;
- create/update `DesaAdminMember`:
  - `role = VERIFIED_ADMIN`
  - `status = VERIFIED`
- set `verifiedAt`;
- write audit:
  - `EMAIL_VERIFIED`
  - `ROLE_GRANTED`.

On invalid/expired token:

- do not verify;
- write `EMAIL_FAILED` / `EMAIL_TOKEN_EXPIRED`;
- show safe error.

If Resend env is missing:

- do not fake-send;
- keep claim/token/audit safe if possible;
- write `EMAIL_PROVIDER_CONFIG_MISSING`;
- report `RESEND_ENV_MISSING`.

## Phase 4 — Website token generation

For `WEBSITE_TOKEN` method:

- create/update claim if needed;
- generate website verification token;
- store token hash and expiry;
- show raw token to user once;
- provide placement instruction;
- write audit `WEBSITE_TOKEN_CREATED`.

Suggested token format:

```text
pantau-desa-verification=PD-<DESA_SLUG>-<RANDOM>
```

Token expiry:

```text
7 days
```

Placement instruction:

```text
Tempel kode ini di halaman website resmi desa, halaman kontak/profil, footer, meta tag, atau file .well-known/pantaudesa-verification.txt.
```

## Phase 5 — Website token checker

Implement real website token check.

Candidate endpoint:

```text
POST /api/admin-claim/verify-website-token
```

System must:

1. require authenticated user;
2. load claim for current user;
3. validate token exists and not expired;
4. validate submitted URL is allowed official desa website/domain;
5. fetch one page safely;
6. search for token text;
7. verify if found;
8. audit result.

Safety rules:

- allow only `http`/`https`;
- reject localhost;
- reject private/internal IPs;
- reject file/data/javascript schemes;
- timeout request;
- limit response size;
- do not follow infinite redirects;
- check only allowed official domain if known;
- do not crawl site recursively.

If token found:

- set claim `VERIFIED`;
- create/update `DesaAdminMember` as `VERIFIED_ADMIN` / `VERIFIED`;
- set `verifiedAt`;
- write `WEBSITE_TOKEN_VERIFIED` and `ROLE_GRANTED`.

If token not found:

- keep `PENDING`;
- write `WEBSITE_TOKEN_FAILED`;
- show friendly retry copy.

If URL not allowed:

- keep `PENDING`;
- write `WEBSITE_NOT_ACCEPTED_FOR_AUTO_VERIFY`.

## Phase 6 — Status transition enforcement

Allowed user-triggered transitions:

```text
NONE -> PENDING
PENDING -> VERIFIED via valid official email token
PENDING -> VERIFIED via valid website token
INVITE_PENDING -> LIMITED via valid invite token
```

Allowed future/platform transitions, if helper supports but UI does not expose:

```text
PENDING -> REJECTED
PENDING -> LIMITED
LIMITED -> VERIFIED
VERIFIED -> SUSPENDED
SUSPENDED -> VERIFIED
```

Do not allow:

- client sets arbitrary status;
- user verifies claim owned by another user;
- user self-promotes without valid proof;
- `User.role = DESA` alone means verified admin.

## Phase 7 — Invite admin service

Verified desa admin can invite another admin.

Owner MVP rule:

```text
max 5 admins per desa
```

Invited admin starts as:

```text
LIMITED
```

Minimum endpoints:

```text
POST /api/admin-claim/invites
POST /api/admin-claim/invites/accept
```

Create invite validation:

- current user must be verified admin for that desa;
- active admin count must be below max 5;
- email required;
- token hash stored;
- expiry set;
- audit `INVITE_CREATED`;
- send invite email via separate admin-claim/invite Resend email helper if env exists.

Accept invite behavior:

- validate token;
- validate expiry;
- create/update `DesaAdminMember` for accepting user:
  - `role = LIMITED`
  - `status = LIMITED`
- mark invite `ACCEPTED`;
- audit `INVITE_ACCEPTED`.

If email send fails:

- do not silently pretend success;
- preserve invite only if safe and status is clear;
- report send failure.

UI scope:

- minimal invite UI only if it remains compact and safe;
- otherwise service first and report UI follow-up.

## Phase 8 — Fake admin report service

Implement fake-admin report endpoint.

Candidate endpoint:

```text
POST /api/admin-claim/fake-admin-reports
```

Required fields:

- `desaId`
- `reason`

Optional fields:

- `reportedUserId`
- `description`
- `evidenceUrl`
- `reporterEmail`

Validation:

- reason required;
- desaId must exist;
- evidenceUrl validated if present;
- reporterEmail validated if present;
- rate-limit/throttle if existing infra supports it; otherwise report future risk.

On success:

- create `FakeAdminReport`;
- write audit `FAKE_ADMIN_REPORT_SUBMITTED`;
- if reported user exists, write `ADMIN_CLAIM_FLAGGED_BY_PUBLIC`.

Do not auto-suspend admin based only on report.

UI scope:

- add small `Laporkan admin palsu` action only where admin identity is already shown;
- if not available yet, implement service endpoint and report UI follow-up.

---

# UI wiring requirements

Update `/profil/klaim-admin-desa` so it calls real endpoints:

- submit claim;
- request Resend magic link for official email method;
- generate website token;
- check website token;
- contact support click audit;
- show claim status from DB after actions.

UI must remain visually clean from the Sprint 04-003 rework.

Copy examples:

```text
Link verifikasi sudah dikirim ke email resmi desa.
```

```text
Pengajuan sudah tercatat, tetapi pengiriman email belum aktif di environment ini.
```

```text
Kode verifikasi sudah dibuat. Tempel kode ini di website resmi desa, lalu klik Cek kode.
```

```text
Kode ditemukan. Akun kamu sekarang terhubung sebagai Admin Desa Terverifikasi.
```

```text
Kode belum ditemukan. Pastikan kode sudah ditempel di halaman website resmi desa.
```

---

# Out of scope

Do not implement:

- document upload service;
- Supabase Storage bucket setup;
- screenshot upload to Supabase Storage;
- AI source review;
- official numeric APBDes extraction;
- scraper/crawler beyond single website token page check;
- verified status for public data values;
- delete/moderate citizen voices;
- admin dashboard redesign;
- new dependency without approval.

---

# QA requirements

Run:

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
npm run build
```

Route/API checks:

- `/profil/saya`
- `/profil/klaim-admin-desa`
- `/api/admin-claim/profile` public: 401
- `/api/admin-claim/profile` authed: 200
- claim submit API: authed success / public blocked
- email request: success via Resend or `RESEND_ENV_MISSING`
- email verify: valid / invalid / expired token cases
- website token generate: success
- website token check: token found / token not found / invalid URL / private URL
- invite create: verified admin only
- invite accept: valid / expired token cases
- fake admin report: valid / invalid report

Security checks:

- raw token not stored in DB;
- expired tokens rejected;
- invalid tokens rejected;
- single-use tokens enforced where applicable;
- user cannot verify another user's claim;
- user cannot invite admin unless verified admin for desa;
- max 5 admin rule enforced;
- no private contact exposure;
- all important actions write audit events;
- SSRF/private URL protection works for website token checker.

Manual UI checks if UI touched:

- profile card remains compact;
- claim wizard remains visually clean after wiring actions;
- mobile 360/390/414 remains usable;
- screenshots/notes reported.

---

# Acceptance criteria

1. Separate admin-claim Resend email service exists.
2. Claim submit from UI creates/updates `DesaAdminClaim`.
3. Claim submit writes audit event.
4. Official email magic link sends via Resend when env exists.
5. Resend env missing is handled honestly and safely.
6. Email token hash is stored, raw token is not stored.
7. Valid email token verifies claim and grants verified admin membership.
8. Website token can be generated and displayed once.
9. Website token hash is stored, raw token is not stored.
10. Website token checker verifies token on allowed official URL.
11. Website token checker rejects invalid/untrusted/private URLs.
12. Status transitions follow allowed policy.
13. Audit events are written for claim/email/website/invite/report actions.
14. Verified admin can create invite if under max 5 admin limit.
15. Invite accept creates limited admin membership.
16. Fake admin report creates DB record and audit event.
17. UI remains clear and mobile-safe.
18. Screenshot audit/notes are provided if UI was touched.
19. No data value verified activation.
20. No broad scraper/crawler.
21. No numeric extraction.
22. QA passes or env blockers are reported clearly.

---

# Commit message requirement

```text
feat(admin): add claim verification services and audit flow

What changed:
- ...

Provider:
- Resend service separated from NextAuth: PASS
- Resend env available: PASS/RESEND_ENV_MISSING

Services:
- claim submit: PASS
- email magic link request: PASS/BLOCKED with reason
- email token verify: PASS/BLOCKED with reason
- website token generate: PASS
- website token check: PASS
- status transitions: PASS
- invite create/accept: PASS
- fake admin report: PASS
- audit events: PASS

QA:
- prisma validate: PASS
- prisma generate: PASS
- tsc: PASS
- test: PASS
- build: PASS
- route/API checks: PASS

Security checks:
- token hash only: PASS
- token expiry: PASS
- token single-use: PASS
- user cannot self-promote: PASS
- user cannot verify another claim: PASS
- verified admin required for invite: PASS
- max 5 admin enforced: PASS
- SSRF/private URL protection: PASS
- no private contact exposure: PASS

UI evidence if UI touched:
- screenshots/notes before: PASS/SKIPPED with reason
- screenshots/notes after: PASS/SKIPPED with reason

Guardrails:
- no verified data activation
- no official numeric APBDes extraction
- no scraper beyond single website token check
- no document upload service
- no screenshot storage implementation
- no AI API
- no new dependency unless approved

Known risks/blockers:
- ...
```

---

# Report back

```text
Task: Sprint 04-004 Admin Claim Verification Services + Audit + Invite + Fake Report
Status: PASS / PARTIAL_PASS / BLOCKED / REWORK
Model used:
Reasoning effort:
Provider:
- Resend env:
- from email:
- app base URL:
Implemented:
- claim submit:
- email magic link request:
- email verification callback:
- website token generate:
- website token check:
- status transition:
- audit events:
- invite create:
- invite accept:
- fake admin report:
QA:
- prisma validate:
- prisma generate:
- tsc:
- test:
- build:
API checks:
- public blocked:
- authed success:
- invalid token:
- expired token:
- website token not found:
- website token found:
- private URL rejected:
Security:
- token hash only:
- token single-use:
- max 5 admin:
- no self-promotion:
- no private exposure:
UI evidence if touched:
- screenshot folder/notes:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

---

# Short handoff

```text
Ujang, pull latest main and read docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md fully. Use GPT-5.1 with high reasoning. Implement all 8 owner items in the ordered phases: shared primitives, claim submit, separate Resend admin-claim magic-link service, website token generation, website token checker with SSRF/private URL protection, strict status transitions, invite create/accept with max 5 admin rule, and fake admin report service. Do not reuse NextAuth signIn("resend") directly; create a separate admin-claim email service using Resend/env. Keep UI from 04-003 clean. If UI is touched, screenshot/audit desktop and mobile and keep screenshots in local ignored artifacts, not repo. Do not implement document upload, screenshot storage, AI, verified data values, numeric extraction, or scraper beyond single-page website token check. Run QA/security checks and report provider status + commit SHA.
```

If Asep takes over:

```text
Asep, pull latest main and read docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md fully. Continue only this service/audit scope. Preserve the UI structure from the rework, do not widen scope, do not merge admin claim email into NextAuth, and do not commit bulky screenshots.
```
