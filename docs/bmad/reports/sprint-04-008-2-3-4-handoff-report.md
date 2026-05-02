# Sprint 04-008.2 / 04-008.3 / 04-008.4 — Handoff Report

Date: 2026-05-02
Branch: `feat/sprint-04-008-2-3-4`
Status: PASS
Prepared-by: Asep (AI Dev)

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

## Quality gate results

| Check | Result |
|-------|--------|
| `npm run lint` | ✓ 0 errors (2 pre-existing warnings in AdminClaimWizard.tsx — not our files) |
| `npm run test` | ✓ 110/110 pass |
| `npx tsc --noEmit` | ✓ Clean |
| `npx prisma generate` | ✓ Applied (Windows file-lock on retry — DLL already current from migration deployment) |
| `npm run build` | ✓ Pass — all new routes appear in route manifest as dynamic (ƒ) |

Build output confirms:
```
ƒ /internal-admin
ƒ /internal-admin/claims
ƒ /profil/klaim-admin-desa/pengajuan
```

---

## Known risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Magic-link email path (`generate-email-token` + `verify-email`) and OTP path are now parallel — UI doesn't yet guide users to choose one | Low | OTP routes are backend-only for now; UI integration is 04-008.6 scope |
| Internal admin shared account (per BMAD owner decision) reduces per-person accountability | Medium | Accepted for MVP per 04-008e governance doc; logged in handoff |
| `sendContactAdminEmail` for support submission requires `CONTACT_EMAIL` env; if not set, returns error but doesn't block DB operation | Low | Audit event always written; email is best-effort notification |
| `prisma generate` fails on Windows if dev server holds DLL lock | Low | Close dev server before running `npm run build` or kill node processes |
| `ClaimReviewQueue` pagination uses `window.location.href` for URL building (SSR-safe in client component, but breaks if rendered server-side) | Low | Component is `"use client"` so window is always available |

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
