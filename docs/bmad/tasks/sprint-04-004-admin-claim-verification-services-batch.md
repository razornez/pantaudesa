# Task Sprint 04-004 — Admin Claim Verification Services + Audit + Invite + Fake Report

Status: READY_FOR_UJANG_IMPLEMENTATION_WITH_PROVIDER_CHECK
Executor: Ujang / Asep
Prepared-by: Rangga
Date: 2026-04-29

## Recommended model for Ujang

```text
Recommended model: GPT-5.1
Reasoning effort: high
```

Why:

- This task touches email verification, website token verification, role/status transition, audit trail, invite service, and fake-admin reporting.
- A mistake can create fake admin access, expose private data, or create legal/reputation risk.
- Build/test passing is not enough; security and state-transition review are required.

Fallback if only Codex mini is available:

```text
Model: GPT-5.1 Codex mini
Reasoning effort: medium/high
Escalate to GPT-5.1 high if auth, token, email, status transition, or security ambiguity appears.
```

## Goal

Implement the real service layer behind the guided `Klaim sebagai Admin Desa` flow.

This batch should turn the current UI flow into real DB-backed actions for:

1. real email magic-link request, if email provider/env is available;
2. real website verification token generation;
3. real website token check;
4. submit claim to DB from UI;
5. update status `PENDING`, `LIMITED`, `VERIFIED` from allowed user actions;
6. write real audit events for claim actions;
7. support invite admin service;
8. support fake admin report service.

## Critical note about email provider

Rangga checked repository search and did not find an existing obvious email provider/env such as SMTP/Resend setup.

Therefore Ujang must start with provider check.

Required provider/env check:

```text
SUPPORT_EMAIL
NEXT_PUBLIC_SUPPORT_EMAIL
EMAIL_FROM
NEXT_PUBLIC_APP_URL
EMAIL_PROVIDER or equivalent
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS if SMTP is used
RESEND_API_KEY or equivalent if HTTP email API is used
```

If no real email provider is configured:

- do not fake-send email;
- implement the DB/token/audit part safely;
- return a clear user-facing pending/provider-not-ready message;
- report `email sending: BLOCKED_PROVIDER_ENV_MISSING`;
- keep all other services working where safe.

If using an HTTP email provider API via `fetch`, do not add dependency.

If using SMTP and a new package is needed, stop and request explicit approval before adding a dependency.

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

## Workflow split

### Rangga owns

- task file;
- acceptance criteria;
- review;
- sprint status update;
- post-commit safety/flow review.

### Ujang/Asep owns

- service implementation;
- API routes/actions;
- UI wiring to real actions;
- token hashing;
- audit writes;
- local QA;
- security checks;
- commit/push.

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
10. No scraper or numeric APBDes extraction in this task.

---

# A. Claim submit to DB from UI

## Required behavior

From `/profil/klaim-admin-desa`, user can submit a claim for selected desa and selected method.

Supported methods:

```text
OFFICIAL_EMAIL
WEBSITE_TOKEN
SUPPORT_REVIEW
```

On submit:

- create or update `DesaAdminClaim` for `(userId, desaId)`;
- status starts as `PENDING` except invite/member states handled separately;
- method is saved;
- audit event is written.

Suggested API route:

```text
POST /api/admin-claim/claims
```

or equivalent project convention.

Request shape candidate:

```json
{
  "desaId": "...",
  "method": "OFFICIAL_EMAIL"
}
```

Response candidate:

```json
{
  "ok": true,
  "claimId": "...",
  "status": "PENDING",
  "nextAction": "EMAIL_SENT"
}
```

Required audit event:

```text
CLAIM_STARTED
```

If existing pending claim exists:

- do not duplicate spam rows;
- update method if allowed or return existing claim;
- audit `CLAIM_REUSED` or `CLAIM_METHOD_UPDATED`.

## Validation

- must require authenticated user;
- must validate desa exists;
- must validate method enum;
- must prevent duplicate noisy claims;
- must not allow claim for invalid desa.

---

# B. Real email magic-link request

## Required behavior

When user selects `OFFICIAL_EMAIL` and submits:

1. System determines official email candidate.
2. System creates magic token.
3. System stores token hash + expiry on `DesaAdminClaim` or separate token helper if implemented.
4. System sends email if provider/env exists.
5. System writes audit event.
6. UI shows clear status.

## Official email rules

Allowed official email sources:

- email already stored in trusted desa/source metadata;
- email attached to official source record if available;
- future: email discovered from official website.

Do not auto-verify personal email typed by user.

If no official email exists:

- return clear message;
- suggest website token or support fallback;
- audit event `EMAIL_VERIFICATION_UNAVAILABLE`.

## Token rules

- generate cryptographically random token;
- store hash only;
- expiry recommended: 30-60 minutes;
- include claim id/token in link;
- link should use `NEXT_PUBLIC_APP_URL` or safe base URL.

Candidate verification route:

```text
GET /api/admin-claim/verify-email?claimId=...&token=...
```

or page route:

```text
/profil/klaim-admin-desa/verifikasi-email?claimId=...&token=...
```

## Verification success behavior

When valid token clicked:

- verify hash;
- check expiry;
- mark claim `VERIFIED` if proof is official email;
- create or update `DesaAdminMember` role/status:
  - `role = VERIFIED_ADMIN`
  - `status = VERIFIED`
- set `verifiedAt`;
- write audit:
  - `EMAIL_VERIFIED`
  - `ROLE_GRANTED`

If token invalid/expired:

- do not verify;
- audit `EMAIL_FAILED` or `EMAIL_TOKEN_EXPIRED`;
- show safe error.

## Email sending provider

If provider available, send real email.

If provider unavailable:

- claim and token may be created only if safe;
- do not expose raw token in production UI;
- in development only, log token/link if needed for local QA;
- report provider blocker.

---

# C. Website token generation

## Required behavior

When user selects `WEBSITE_TOKEN`:

- create claim if needed;
- generate website verification token;
- store token hash and expiry;
- show the raw token to user once in UI;
- provide placement instructions.

Suggested token format:

```text
pantau-desa-verification=PD-<DESA_SLUG>-<RANDOM>
```

Suggested UI instruction:

```text
Tempel kode ini di halaman website resmi desa, halaman kontak/profil, footer, meta tag, atau file .well-known/pantaudesa-verification.txt.
```

Audit event:

```text
WEBSITE_TOKEN_CREATED
```

Token expiry recommended:

- 7 days for website token.

Do not store raw token.

---

# D. Website token checker

## Required behavior

User can click `Cek kode` after placing token on website.

System must:

1. load claim;
2. validate token exists and not expired;
3. determine official website URL for selected desa;
4. fetch website/page safely;
5. search for token text;
6. verify if found;
7. audit result.

Candidate API:

```text
POST /api/admin-claim/verify-website-token
```

Request candidate:

```json
{
  "claimId": "...",
  "url": "https://desaabc.desa.id/kontak"
}
```

## Safety rules for fetch

- only allow http/https;
- reject private/internal IPs and localhost;
- add timeout;
- limit response size;
- do not follow infinite redirects;
- only check allowed official domain if known;
- do not build general scraper.

If URL domain is not official/allowed:

- return rejected state;
- audit `WEBSITE_NOT_ACCEPTED_FOR_AUTO_VERIFY`.

If token found:

- mark claim `VERIFIED`;
- create/update `DesaAdminMember` verified role/status;
- set verifiedAt;
- audit:
  - `WEBSITE_TOKEN_VERIFIED`
  - `ROLE_GRANTED`.

If token not found:

- keep `PENDING`;
- audit `WEBSITE_TOKEN_FAILED`;
- show user-friendly retry message.

---

# E. Status transition policy

Allowed transitions:

```text
NONE -> PENDING
PENDING -> VERIFIED
PENDING -> REJECTED
PENDING -> LIMITED
LIMITED -> VERIFIED
VERIFIED -> SUSPENDED
SUSPENDED -> VERIFIED
```

User-triggered allowed transitions:

- claim submit: `NONE -> PENDING`
- valid email magic link: `PENDING -> VERIFIED`
- valid website token: `PENDING -> VERIFIED`
- support fallback submit/contact: `NONE/PENDING -> PENDING`

Admin/platform-triggered transitions are not required unless simple internal helper exists.

Do not allow:

- user self-promote without valid token;
- user set arbitrary status;
- user change another user's claim.

---

# F. Audit events

All real actions must write audit events to `AdminClaimAudit`.

Minimum events for this task:

```text
CLAIM_STARTED
EMAIL_VERIFICATION_SENT
EMAIL_VERIFICATION_UNAVAILABLE
EMAIL_VERIFIED
EMAIL_FAILED
EMAIL_TOKEN_EXPIRED
WEBSITE_TOKEN_CREATED
WEBSITE_TOKEN_CHECKED
WEBSITE_TOKEN_VERIFIED
WEBSITE_TOKEN_FAILED
WEBSITE_NOT_ACCEPTED_FOR_AUTO_VERIFY
CONTACT_SUPPORT_CLICKED
ROLE_GRANTED
INVITE_CREATED
INVITE_ACCEPTED
INVITE_EXPIRED
INVITE_REVOKED
FAKE_ADMIN_REPORT_SUBMITTED
ADMIN_CLAIM_FLAGGED_BY_PUBLIC
```

Implementation recommendation:

- create shared constants in one file;
- avoid typo-prone raw strings scattered everywhere.

Candidate file:

```text
src/lib/admin-claim/audit-events.ts
```

---

# G. Invite admin service

## Required behavior

Verified desa admin can invite another admin.

MVP rule from Owner:

```text
max 5 admins per desa
```

Invited admin starts as:

```text
LIMITED
```

First verified admin can promote later, but full promotion UI may be separate if too large.

## Minimum service behavior

Create API to create invite:

```text
POST /api/admin-claim/invites
```

Validation:

- current user must be `DesaAdminMember` with `role = VERIFIED_ADMIN` and `status = VERIFIED` for that desa;
- active admin count must be less than or equal to 5 limit before invite;
- email required;
- invite token hash stored;
- expiry set;
- audit `INVITE_CREATED`.

Accept invite endpoint:

```text
POST /api/admin-claim/invites/accept
```

Behavior:

- validate token;
- validate expiry;
- create/update `DesaAdminMember` for accepting user:
  - `role = LIMITED`
  - `status = LIMITED`
- mark invite `ACCEPTED`;
- audit `INVITE_ACCEPTED`.

If email provider exists:

- send invite email.

If provider missing:

- create invite record;
- report provider blocker;
- in development only, expose invite link for local QA.

## UI scope

This task may include minimal invite UI only if it remains small and safe:

- a compact admin-only invite form on admin claim/status page;
- no public exposure.

If UI becomes large, implement service first and report UI follow-up.

---

# H. Fake admin report service

## Required behavior

Allow users/public to report suspicious/fake admin claim.

Candidate endpoint:

```text
POST /api/admin-claim/fake-admin-reports
```

Request candidate:

```json
{
  "desaId": "...",
  "reportedUserId": "...",
  "reason": "Admin ini memakai nama/jabatan yang salah",
  "description": "...",
  "evidenceUrl": "...",
  "reporterEmail": "..."
}
```

Validation:

- reason required;
- desaId required;
- evidenceUrl optional but validated if present;
- reporterEmail optional but validate format if present;
- rate-limit/throttle if existing infra supports it; if not, note future risk;
- write `FakeAdminReport`;
- write `AdminClaimAudit` event:
  - `FAKE_ADMIN_REPORT_SUBMITTED`
  - `ADMIN_CLAIM_FLAGGED_BY_PUBLIC` if reported user exists.

UI scope:

- add small `Laporkan admin palsu` action where admin identity is shown if current UI has that spot;
- otherwise create minimal service endpoint and report UI follow-up.

Do not auto-suspend admin based only on report.

---

# I. UI wiring

Update `/profil/klaim-admin-desa` so it calls real endpoints:

- submit claim;
- request email magic link if method official email;
- generate website token;
- check website token;
- contact support click audit;
- show claim status from DB after action.

UI copy must be honest:

If email sent:

```text
Link verifikasi sudah dikirim ke email resmi desa.
```

If email provider missing:

```text
Pengajuan sudah tercatat. Pengiriman email belum aktif, gunakan website resmi atau Hubungi Kami sementara ini.
```

If website token created:

```text
Kode verifikasi sudah dibuat. Tempel kode ini di website resmi desa, lalu klik Cek kode.
```

If token found:

```text
Kode ditemukan. Akun kamu sekarang terhubung sebagai Admin Desa Terverifikasi.
```

If token not found:

```text
Kode belum ditemukan. Pastikan kode sudah ditempel di halaman website resmi desa.
```

---

# J. Out of scope

Do not implement:

- full document upload service;
- Supabase Storage bucket setup;
- AI source review;
- official numeric APBDes extraction;
- scraper/crawler beyond website token single-page check;
- verified status for data values;
- delete/moderate citizen voices;
- admin dashboard redesign;
- new dependency without approval.

---

# K. QA requirements

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
- email request: success if provider exists, provider-blocked if missing
- website token generate: success
- website token check: token found and token not found cases
- invite create: verified admin only
- invite accept: valid/expired token cases
- fake admin report: valid report, invalid report

Security checks:

- raw token not stored in DB;
- expired tokens rejected;
- invalid tokens rejected;
- user cannot verify another user's claim;
- user cannot invite admin unless verified admin for desa;
- max 5 admin rule enforced;
- no private contact exposure;
- all important actions write audit events.

Manual UI checks:

- profile card remains compact;
- claim wizard still visually clean after wiring actions;
- mobile 360/390/414 remains usable.

---

# L. Acceptance criteria

1. User can submit claim to DB from UI.
2. `DesaAdminClaim` status starts/updates correctly.
3. Email magic-link request is real if provider/env exists.
4. Email provider missing is handled honestly and safely.
5. Email token hash is stored, raw token is not stored.
6. Valid email token verifies claim and grants `VERIFIED_ADMIN` membership.
7. Website token can be generated and displayed once.
8. Website token hash is stored, raw token is not stored.
9. Website token checker can verify token on allowed official URL.
10. Website token checker rejects invalid/untrusted/private URLs.
11. Claim status transitions follow allowed policy.
12. Audit events are written for claim actions.
13. Verified admin can create invite if under max 5 admin limit.
14. Invite accept creates limited admin membership.
15. Fake admin report creates DB record and audit event.
16. UI remains clear and mobile-safe.
17. No data value verified activation.
18. No broad scraper/crawler.
19. No numeric extraction.
20. QA passes or provider blockers are reported clearly.

---

# M. Commit message requirement

```text
feat(admin): add claim verification services and audit flow

What changed:
- ...

Provider check:
- email provider detected: yes/no
- email sending: PASS/BLOCKED_PROVIDER_ENV_MISSING

Services:
- claim submit: PASS
- email magic link request: PASS/BLOCKED with reason
- email token verify: PASS/BLOCKED with reason
- website token generate: PASS
- website token check: PASS
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
- user cannot self-promote: PASS
- user cannot verify another claim: PASS
- verified admin required for invite: PASS
- max 5 admin enforced: PASS
- no private contact exposure: PASS

Guardrails:
- no verified data activation
- no official numeric APBDes extraction
- no scraper beyond single website token check
- no document upload service
- no AI API
- no new dependency unless approved

Known risks/blockers:
- ...
```

---

# N. Report back

```text
Task: Sprint 04-004 Admin Claim Verification Services + Audit + Invite + Fake Report
Status: PASS / PARTIAL_PASS / BLOCKED / REWORK
Model used:
Reasoning effort:
Provider check:
- email provider/env:
- support email env:
- app base URL env:
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
Security:
- token hash only:
- max 5 admin:
- no self-promotion:
- no private exposure:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

---

# Short handoff

```text
Ujang, pull latest main and read docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md fully. Use GPT-5.1 with high reasoning because this touches email, website token verification, roles, audit, invite, and fake-admin report. Start with provider/env check. If email provider is missing, do not fake-send email; implement claim/token/audit safely and report email sending as BLOCKED_PROVIDER_ENV_MISSING. Implement real claim submit, website token generation/check, allowed status transitions, audit events, invite create/accept with max 5 admin rule, and fake admin report service. Keep the existing UI clean, do not add schema/migration unless absolutely required, do not add dependency without approval, do not activate verified data values, do not build crawler/scraper beyond single website token check, do not implement upload or AI. Run QA/security checks and report provider status + commit SHA.
```

If Asep takes over:

```text
Asep, pull latest main and read docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md fully. Continue only this service/audit scope. Preserve the UI structure from the rework, do not widen scope, and do not fake email sending if provider/env is missing.
```
