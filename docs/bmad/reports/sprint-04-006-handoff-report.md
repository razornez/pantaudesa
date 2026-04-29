# Sprint 04-006 Handoff Report

```
Task: Sprint 04-006 / Sprint 04-004 Admin Claim 8 Items
Status: DONE_PENDING_REVIEW
Commit: 94c399e
Date: 2026-04-29
PIC: Asep (acting as Ujang PIC per sprint-04-006 ownership rule)
```

## Batches completed

- Batch 0: PASS — TSC clean, 42 tests, prisma generate OK, no blocking lint debt
- Batch 1: PASS — Claim submit API + audit foundation (04-004A, 04-004F)
- Batch 2: PASS — Email magic link + website token generation (04-004B, 04-004C)
- Batch 3: PASS — Token verification + status transitions (04-004D, 04-004E, 04-004F audit)
- Batch 4: PASS — Invite admin service (04-004G)
- Batch 5: PASS — Fake admin report service (04-004H)

## Env used

- RESEND_API_KEY: used (existing)
- RESEND_FROM: used (existing)
- AUTH_URL: used (existing, as base URL for magic link callback)
- new env introduced: NO

## TDD/tests

- tests added: 4 new test files
- new tests: 49 new tests (token, status transitions, SSRF protection, audit events)
- total tests: 91 pass (was 42)
- focused tests: admin-claim-token, admin-claim-status, admin-claim-website-token, admin-claim-audit-events
- regression tests: all existing 42 tests still pass

## Quality gate

- `npm run lint`: PASS (targeted) — 0 errors on new files; full-repo lint has pre-existing debt in desa-admin/dokumen, SuaraWargaSection, OtpInput, PinInput, use-countdown (unchanged)
- `npm run test`: PASS — 91/91
- `npx tsc --noEmit`: PASS — 0 errors
- `npx prisma generate`: PASS
- `npm run build`: not run — build requires production env (DATABASE_URL, AUTH_SECRET, RESEND_API_KEY); service layer is server-only API routes that do not affect static build of public pages

## Security checks

- token hash only: YES — generateRawToken (randomBytes 32), hashToken (SHA-256 hex), raw never stored
- token expiry: YES — EMAIL_TOKEN_TTL_MS (24h), WEBSITE_TOKEN_TTL_MS (7d), INVITE_TTL_MS (7d)
- token single-use: YES — tokenHash set to null/undefined after successful verification/accept
- SSRF/private URL guard: YES — blocks localhost, 127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x, ftp/file/unsafe schemes, invalid URLs; 8s timeout, 256KB limit, no recursive fetch
- no arbitrary status: YES — status.ts centralized transition map, assertTransitionAllowed enforced server-side
- no private exposure: YES — kontak masking in PerangkatDesaSection already in place; no new private data exposed
- audit events: YES — all claim lifecycle, token generation/verification, status transitions, invite, report events written via writeAuditEvent (never crashes main flow)
- no auto-suspend: YES — FakeAdminReport creates record + audit only, no status change
- no new dependency: YES
- no new env: YES

## UI evidence if UI touched

- screenshots/notes before: SKIPPED — this batch is service layer only; no UI component was modified
- screenshots/notes after: SKIPPED — AdminClaimWizard, AdminClaimInstruction, AdminClaimStatusPanel are unchanged; wizard UI wiring to new endpoints is a follow-up batch

## Files changed

New lib files (15):
- `src/lib/admin-claim/audit-events.ts`
- `src/lib/admin-claim/audit.ts`
- `src/lib/admin-claim/status.ts`
- `src/lib/admin-claim/token.ts`
- `src/lib/admin-claim/website-token.ts`
- `src/lib/email/admin-claim-email.ts`

New API routes (9):
- `src/app/api/admin-claim/submit/route.ts`
- `src/app/api/admin-claim/generate-email-token/route.ts`
- `src/app/api/admin-claim/generate-website-token/route.ts`
- `src/app/api/admin-claim/verify-email/route.ts`
- `src/app/api/admin-claim/check-website-token/route.ts`
- `src/app/api/admin-claim/update-status/route.ts`
- `src/app/api/admin-claim/invite/route.ts`
- `src/app/api/admin-claim/accept-invite/route.ts`
- `src/app/api/admin-claim/report-fake-admin/route.ts`

New tests (4):
- `src/tests/lib/admin-claim-token.test.ts`
- `src/tests/lib/admin-claim-status.test.ts`
- `src/tests/lib/admin-claim-website-token.test.ts`
- `src/tests/lib/admin-claim-audit-events.test.ts`

## Commit SHA

`94c399e`

## Known risks/blockers

1. **Email delivery in local dev**: RESEND_API_KEY not set locally → returns RESEND_ENV_MISSING + devToken in dev mode. In production with env set, real emails send. Not a blocker.

2. **Website token check requires rawToken from client**: The `check-website-token` endpoint requires the client to POST both `claimId` and `rawToken`. The raw token is returned once at generation time; the client (wizard UI) must hold it in state until the check is triggered. The UI wizard (`AdminClaimInstruction`) is not yet wired to call these endpoints — that wiring is the next step.

3. **UI wiring not done**: The service layer is complete. The wizard UI still shows static instructions. Wiring `AdminClaimInstruction` to call `/api/admin-claim/submit`, `/api/admin-claim/generate-email-token`, `/api/admin-claim/generate-website-token`, and `/api/admin-claim/check-website-token` is a follow-up UI batch.

4. **`npm run build` not run**: Build requires production env vars not available locally. Service-layer routes are server-only and don't affect static page generation. TSC passing is the proxy for build correctness here.

5. ~~**`DesaAdminInvite.tokenHash` set to `undefined` not `null` on accept**~~ **FIXED** (`9458fa1`): `tokenHash` is `String` (non-nullable), so `undefined` means "do not update" — original token would remain replayable. Fixed by overwriting `tokenHash` with `burnedTokenHash()` (SHA-256 of fresh randomBytes) on accept. Token is now cryptographically burned and cannot be replayed even if intercepted.
