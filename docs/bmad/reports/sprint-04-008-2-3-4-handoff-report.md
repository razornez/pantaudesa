# Sprint 04-008.2 / 04-008.3 / 04-008.4 — Handoff Report

Date: 2026-05-02 (initial) / 2026-05-02 (rework)
Branch: `feat/sprint-04-008-2-3-4`
Status: PASS (rework applied — see Rework section)
Prepared-by: Asep (AI Dev)

---

## Rework summary (2026-05-02)

Owner reviewed initial commits and requested 6 blockers be fixed before merge.
All resolved on the same branch.

| # | Blocker | Resolution | Commit |
|---|---------|------------|--------|
| 1 | Vercel deployment failing | Untracked `test-results/.last-run.json`, fixed `.gitignore`, cleaned all lint warnings (was: 2 pre-existing warnings in AdminClaimWizard.tsx). Local build now compiles with only 1 informational Turbopack NFT warning (Prisma generated client traces — non-fatal, common to Next 16 + Prisma). | `(rework commit)` |
| 2 | `test-results/.last-run.json` committed | Removed via `git rm --cached`; added `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/` to `.gitignore`. | `(rework commit)` |
| 3 | Approve route missing active-membership-elsewhere guard | Added Guard 2 in `approve/route.ts`: rejects with 409 `USER_ACTIVE_IN_OTHER_DESA` and copy `User ini sudah terdaftar sebagai Admin Desa di {desaName}. Revoke/remove akses tersebut dulu sebelum bisa diverifikasi di desa lain.` | `(rework commit)` |
| 4 | Approve flow not transactional (race risk on double-submit) | Wrapped both guards (existing-VERIFIED check, active-elsewhere check) plus claim update + member upsert in `db.$transaction`. Audit events run after commit (best-effort, never block flow). Returns 404/422/409 responses cleanly via discriminated union from the transaction body. | `(rework commit)` |
| 5 | OTP resend policy off-by-one | Changed `>=` to `>` in both `send-email-otp` and `verify-email-otp`. Policy is now: **allow `OTP_RESEND_MAX` (3) sends, freeze on the 4th attempt**; **allow `OTP_WRONG_MAX` (5) wrong attempts, freeze on the 6th attempt**. Also fixed the freeze-expiry-reset bug: when `otpFrozenUntil <= now`, the counter is treated as 0 so the user gets a fresh allowance after the freeze elapses. Added 16 new tests in `admin-claim-otp.test.ts` to lock in the constants and the counter semantics. | `(rework commit)` |
| 6 | Support submission UX unclear for REJECTED claims | `ClaimSupportForm.tsx`: added explicit red banner `"Mengirim keberatan/bukti tambahan tidak otomatis mengubah status menjadi VERIFIED. Klaim akan tetap REJECTED sampai admin PantauDesa meninjau ulang ... Hasil peninjauan akan dikirimkan via email"`. Success state for REJECTED claims clarifies status remains REJECTED. API response now returns REJECTED-specific message. `ClaimReviewQueue.tsx`: REJECTED claims with `supportSubmittedAt` show an amber-bordered "Bukti tambahan masuk (perlu review ulang)" indicator with timestamp, distinct from the indigo indicator on PENDING/IN_REVIEW. | `(rework commit)` |

---

---

## Branch

```
feat/sprint-04-008-2-3-4
```

Pushed to GitHub. PR can be opened from:
`https://github.com/razornez/pantaudesa/pull/new/feat/sprint-04-008-2-3-4`

---

## Commits (in order)

| Commit | Batch | Summary |
|--------|-------|---------|
| `4f17650` | 04-008.2 | Verification backend — OTP flow, cooldown enforcement, member-creation fix |
| `b85854b` | 04-008.3 | Internal admin review queue — API + UI for claim approve/reject |
| `e48e7ca` | 04-008.4 | Dedicated claim support submission form and API |
| `8b86230` | lint | Fix lint errors (Link components, unused params, seed cleanup) |

---

## 04-008.2 — Verification backend

### Critical spec-violation fix
`verify-email/route.ts` and `check-website-token/route.ts` previously created
`DesaAdminMember` records with status `LIMITED` on verification success. This was wrong:
**LIMITED membership is ONLY from invite by a VERIFIED admin.**
Both routes now only update claim status to `IN_REVIEW`. No member record created.

### Files changed

| File | Change |
|------|--------|
| `src/app/api/admin-claim/verify-email/route.ts` | Removed member upsert; PENDING → IN_REVIEW only |
| `src/app/api/admin-claim/check-website-token/route.ts` | Removed member upsert; token found → IN_REVIEW only |
| `src/app/api/admin-claim/submit/route.ts` | Block if desa has VERIFIED (409 DESA_ALREADY_HAS_VERIFIED); block during fraudCooldownUntil / reapplyAllowedAt (429); only update PENDING/IN_REVIEW existing claims |
| `src/app/api/admin-claim/update-status/route.ts` | Restricted to REJECTED → PENDING (user reapply) only; enforces reapplyAllowedAt + fraudCooldownUntil; clears all OTP/reject state on reapply |
| `prisma/schema.prisma` | Added `otpHash String?` to `DesaAdminClaim` |
| `prisma/migrations/20260502010000_add_otp_hash_to_claim/` | `ALTER TABLE desa_admin_claims ADD COLUMN "otpHash" TEXT` |
| `src/lib/admin-claim/otp.ts` | NEW: generateOtp (6-digit CSPRNG), hashOtp, verifyOtp, freeze/expiry helpers |
| `src/lib/email/admin-claim-email.ts` | Added `sendDesaEmailOtp` — sends 6-digit OTP code to desa official email |
| `src/app/api/admin-claim/send-email-otp/route.ts` | NEW: generate + send OTP; resend limit (3) + 20-min freeze |
| `src/app/api/admin-claim/verify-email-otp/route.ts` | NEW: verify 6-digit code; wrong-attempt freeze (5 attempts → 20 min); PENDING → IN_REVIEW on success; OTP hash cleared (single-use) |
| `src/lib/admin-claim/audit-events.ts` | Added OTP_SENT, OTP_RESEND_BLOCKED, OTP_INVALID, OTP_VERIFY_FROZEN, OTP_CONFIRMED |
| `src/tests/lib/admin-claim-audit-events.test.ts` | Test coverage for new OTP audit events |

### OTP policy implemented
```
OTP_DIGITS = 6
OTP_EXPIRY_MS = 15 min
OTP_WRONG_MAX = 5 → freeze 20 min
OTP_RESEND_MAX = 3 → freeze 20 min
Fraud cooldown = 3 days (set by internal admin on reject)
Normal cooldown = 1 day (default on reject)
```

---

## 04-008.3 — Internal Admin Review Queue

### Files changed

| File | Change |
|------|--------|
| `src/lib/auth/internal-admin.ts` | Fixed: removed unused `req` param from `requireInternalAdminSession` |
| `src/lib/admin-claim/audit.ts` | Expanded `AuditPayload`: added actorRole, actorDisplayNameSnapshot, entityType, entityId, reasonCategory, reasonText, location |
| `src/app/api/internal-admin/claims/route.ts` | NEW: GET claims list with status/desaId filter, pagination (20/page) |
| `src/app/api/internal-admin/claims/[claimId]/approve/route.ts` | NEW: IN_REVIEW → APPROVED (claim) + VERIFIED (member upsert); enforces one-VERIFIED-per-desa |
| `src/app/api/internal-admin/claims/[claimId]/reject/route.ts` | NEW: PENDING/IN_REVIEW → REJECTED; requires reasonCategory + reasonText + fixInstructions; isFraud=true applies 3-day cooldown |
| `src/app/internal-admin/layout.tsx` | Server-side redirect guard: `getInternalAdminSession()` → `/masuk` if not INTERNAL_ADMIN |
| `src/app/internal-admin/page.tsx` | Redirects to /internal-admin/claims |
| `src/app/internal-admin/claims/page.tsx` | Server page: fetches + serializes claims, passes to ClaimReviewQueue |
| `src/components/internal-admin/ClaimReviewQueue.tsx` | Client component: status tabs, claim cards, approve button, reject modal (reason category + free text + fix instructions + fraud checkbox) |

### Access control
- All `/internal-admin/*` routes guarded server-side by `getInternalAdminSession()`
- All `/api/internal-admin/*` routes guarded by `requireInternalAdminSession()`
- Both check `User.role === INTERNAL_ADMIN` in DB — never trust client flags

### Internal admin approve flow
```
Internal admin approves IN_REVIEW claim:
  DesaAdminClaim.status = APPROVED
  DesaAdminMember upsert: role=VERIFIED_ADMIN, status=VERIFIED
  Enforces: one VERIFIED per desa (409 if violated)
  Audit: INTERNAL_CLAIM_APPROVED + MEMBER_VERIFIED
```

### Internal admin reject flow
```
Internal admin rejects PENDING/IN_REVIEW claim:
  DesaAdminClaim.status = REJECTED
  Sets: rejectCategory, rejectReason, rejectInstructions, reapplyAllowedAt
  isFraud=true: fraudCooldownUntil = now + 3 days
  isFraud=false: reapplyAllowedAt = now + 1 day
  Audit: INTERNAL_CLAIM_REJECTED or INTERNAL_COOLDOWN_APPLIED
```

---

## 04-008.4 — Dedicated Hubungi Admin Pengajuan Admin Desa

### Files changed

| File | Change |
|------|--------|
| `src/app/api/admin-claim/support-submission/route.ts` | NEW: POST tied to claim/desa/userId; PENDING→IN_REVIEW on submit; sends email to CONTACT_EMAIL; audit CLAIM_SUPPORT_SUBMITTED |
| `src/app/profil/klaim-admin-desa/pengajuan/page.tsx` | NEW: server page; reads active claim; shows ClaimSupportForm or redirect prompt |
| `src/components/admin-claim/ClaimSupportForm.tsx` | NEW: client form; 4 fields (reason, explanation, whyCannotVerify, evidenceDescription); responsibility acknowledgment checkbox; already-submitted notice |
| `src/lib/admin-claim/audit-events.ts` | Added CLAIM_SUPPORT_SUBMITTED |

### Form rules
- Linked from `/profil/klaim-admin-desa/pengajuan` only
- Requires authenticated session with active PENDING/IN_REVIEW/REJECTED claim
- Submission does NOT grant LIMITED or VERIFIED
- File upload not yet available (described in field, can follow up via email)
- SLA copy: "2–5 hari kerja karena bukti perlu diperiksa manual"
- Shows amber warning: "tidak langsung memberikan akses admin"
- Distinct from general `/hubungi-admin` (noted in page footer)

---

## How to test locally

### Setup
```bash
npm run seed:qa   # creates QA users, claims in all states, members, documents
```

### Internal admin login
```
Email: internal.admin.qa@pantaudesa.local
PIN:   246810
```

### Test 04-008.2 — OTP flow
1. Login as `pengaju.pending.qa@pantaudesa.local` (PIN 246810)
2. Ensure claim `qa-claim-pending` is in PENDING state
3. `POST /api/admin-claim/send-email-otp` with `{ claimId: "qa-claim-pending" }`
   - Dev mode returns `devOtp` in response if email not configured
4. `POST /api/admin-claim/verify-email-otp` with `{ claimId, code: "<otp>" }`
5. Claim should move to IN_REVIEW

### Test 04-008.3 — Internal admin review
1. Login as internal admin
2. Visit `/internal-admin/claims`
3. Filter by `IN_REVIEW`
4. Approve `qa-claim-in-review-website` → claim becomes APPROVED, member becomes VERIFIED
5. Reject `qa-claim-in-review-email` with reason → claim becomes REJECTED with cooldown
6. Verify normal user (`warga.biasa.qa`) cannot access `/internal-admin/claims` (redirects to /masuk)

### Test 04-008.4 — Support submission
1. Login as `pengaju.pending.qa@pantaudesa.local`
2. Visit `/profil/klaim-admin-desa/pengajuan`
3. Fill form and submit
4. Claim should move to IN_REVIEW
5. Internal admin should see `supportSubmittedAt` in review queue

### Test cooldown blocking
1. Login as `pengaju.cooldown.qa@pantaudesa.local` (has `fraudCooldownUntil` set to future)
2. Try `POST /api/admin-claim/submit` → should get 429 FRAUD_COOLDOWN_ACTIVE

---

## QA seed used

Run `npm run seed:qa` before testing. Key entities:
- `qa-desa-a` — 1 VERIFIED + 2 LIMITED
- `qa-desa-b` — 1 VERIFIED + 1 LIMITED
- `qa-desa-c` — claims only (PENDING, IN_REVIEW x2, REJECTED x2, APPROVED x2)
- `internal.admin.qa@pantaudesa.local` — INTERNAL_ADMIN role

---

## Quality gate results (post-rework, 2026-05-02)

| Check | Result |
|-------|--------|
| `npm run lint` | ✓ 0 errors, 0 warnings (cleaned `Link`/`LifeBuoy` unused imports in `AdminClaimWizard.tsx`) |
| `npm run test` | ✓ 126/126 pass (added 16 OTP policy tests in `admin-claim-otp.test.ts`) |
| `npx tsc --noEmit` | ✓ Clean |
| `npx prisma generate` | ✓ Runs as part of `npm run build` (`prisma generate && next build`); standalone retry hits Windows file-lock when dev server is up — kill node processes first |
| `npm run build` | ✓ Pass — 1 informational Turbopack NFT warning about Prisma client tracing (non-fatal, see Vercel section) |

Build output confirms all new routes:
```
ƒ /internal-admin
ƒ /internal-admin/claims
ƒ /profil/klaim-admin-desa/pengajuan
```

## Vercel status

**Locally green.** Without Vercel log access here, the only build-output warning is:

```
Turbopack build encountered 1 warnings:
./next.config.ts
Encountered unexpected file in NFT list

Import trace:
  App Route:
    ./next.config.ts
    ./src/generated/prisma/index.js
    ./src/lib/prisma.ts
    ./src/app/api/voices/route.ts
```

This is a known Next 16 + Turbopack + Prisma generated-client interaction — Prisma's
`src/generated/prisma/index.js` does dynamic requires for engine binaries, which
Turbopack's NFT (Node File Trace) flags as "the whole project was traced
unintentionally". It is **non-fatal** and the build still completes. Same warning
appears on `main` before this branch.

If Vercel is still failing after this push, the most likely root causes are
environment-side (not code-side):

1. **Missing build-time env vars** — `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`,
   `AUTH_URL`, `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_EMAIL`. Verify Project →
   Settings → Environment Variables for `Production` and `Preview`.
2. **Sentry build-time auth token** — `@sentry/nextjs` is in deps but no
   `SENTRY_AUTH_TOKEN` env / no `instrumentation.ts` file means source-map upload
   may warn but should not fail. If this is the failure, add `SENTRY_AUTH_TOKEN`
   or remove `@sentry/nextjs` from deps until config is finalized.
3. **Prisma binary target** — `schema.prisma` already includes `rhel-openssl-3.0.x`
   for Vercel; verified.
4. **Old `test-results/.last-run.json` checked in** — fixed in this rework.

The next push should trigger a fresh Vercel build. If it still fails, attach the
Vercel build logs and we'll diagnose precisely.

---

## Known risks (post-rework)

| Risk | Severity | Mitigation |
|------|----------|------------|
| Magic-link email path (`generate-email-token` + `verify-email`) and OTP path coexist — UI doesn't yet guide users to one | Low | OTP routes are backend-only for now; UI integration deferred to 04-008.6 |
| Internal admin shared account (per BMAD owner decision) reduces per-person accountability | Medium | Accepted for MVP per `04-008e` governance doc; every action still records `actorRole=INTERNAL_ADMIN` + IP/userAgent |
| `sendContactAdminEmail` for support submission requires `CONTACT_EMAIL` env; if not set, audit event still written, DB still updated, only email notification fails | Low | Honest error code returned; audit is source of truth for review queue |
| `prisma generate` fails on Windows if dev server holds DLL lock | Low | `npm run build` script kills no processes; if it fails locally, run `Get-Process node \| Stop-Process` then retry |
| Turbopack NFT warning about Prisma client traces the whole project | Low | Non-fatal informational warning, present on `main` before this branch; tracked upstream |
| Approve-route transaction holds Postgres row locks during the two SELECTs + UPDATE/UPSERT — under heavy concurrent admin actions on the same desa, contention is possible | Low | Acceptable for MVP (single shared internal-admin account, low expected concurrency); transaction is short and bounded |
| OTP counter reset semantics: when `otpFrozenUntil` elapses, the counter is treated as 0 on the next attempt. A patient attacker could re-enter the freeze window forever (3 sends, freeze 20 min, repeat) — but this still rate-limits to ~9 sends/hour | Low | Acceptable for MVP per BMAD policy; fraud cooldown is a separate, stricter mechanism set by internal admin |
| Vercel build status not directly observable from this environment | Low | Local quality gate fully green; if Vercel still red, env vars or Sentry config are the most likely cause (see Vercel section above) |

---

## Zero-bug readiness (per checklist)

- duplicate submit/idempotency checked: ✓ submit route uses PENDING/IN_REVIEW upsert; OTP clear on use
- multi-tab/stale cache: ✓ internal-admin page is force-dynamic; claim page is force-dynamic
- unauthorized direct API checked: ✓ all /api/internal-admin/* routes check INTERNAL_ADMIN role in DB
- token expiry/reuse checked: ✓ OTP hash cleared after verification (single-use); freeze enforced server-side
- email failure behavior checked: ✓ sendDesaEmailOtp returns error honestly; devOtp in dev mode only
- invite edge cases: n/a this sprint (invite is 04-008.7)
- public data verified not activated: ✓ approval creates VERIFIED member only, no data publish
- private data/token/secret leakage: ✓ OTP hash never logged; devOtp only in NODE_ENV=development
- desktop/mobile QA: UI is responsive (Tailwind), not browser-tested (no frontend changes touch public pages)
- known residual risks: documented above
