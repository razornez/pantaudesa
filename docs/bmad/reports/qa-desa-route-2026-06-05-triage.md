# QA Triage — PantauDesa `/desa` Route (5 Juni 2026)

Source: automated QA session report (17 findings). Each finding below was
**verified against the code/DB** before any fix — several were false positives
or test-data/environment issues, not code defects.

Legend: ✅ FIXED · 🟡 NEEDS DECISION · 🔵 ENHANCEMENT (deferred) · ⬜ FALSE POSITIVE / NOT A BUG

| Bug | Sev | Verdict | Finding → Verification |
|---|---|---|---|
| BUG-01 | Critical | ✅ FIXED | "Unauthorized redirect deletes session." `redirect()` never clears cookies — real defect was that logged-in non-admins were sent to a non-existent `/masuk` (404). Layout now sends unauthenticated→`/login?next=`, logged-in-non-admin→`/?error=akses-ditolak` (session preserved). |
| BUG-03 | Critical | ✅ FIXED | `/masuk` is not a route → rendered global `not-found.tsx`. `internal-admin/layout.tsx` + `klaim-admin-desa/pengajuan` redirected to `/masuk`; changed to `/login`. |
| BUG-16 | Low | ✅ FIXED | 404 headline "Desa ini tidak ada di peta" was wrong for non-desa 404s → made neutral ("Halaman tidak ditemukan"). |
| BUG-02 | Critical | 🟡 NEEDS DECISION | "Admin VERIFIED shows BELUM KLAIM." Verified DB: `admin.verified.desa-a.qa` has **0 members, 0 claims** — so "BELUM KLAIM" is *correct* for the data. Root cause: `seed-qa.mjs` (idempotent) was not applied to this DB. Re-seeding fixes it BUT adds fake test desa (qa-desa-a/b) to the all-real DB — conflicts with the earlier "remove fictional desa" goal. **Decision needed.** |
| BUG-06 | High | ⬜ FALSE POSITIVE | "No admin-desa panel." `/desa-admin` (+ `/desa-admin/dokumen`, `/desa-admin/profil`) **exists**. Tester only tried `/portal`, `/admin`, `/admin-desa`. Post-login redirect target could still be reviewed (minor). |
| BUG-05 | High | ⬜ FALSE POSITIVE | "Prompt injection 'Stop Claude' in session API." String **not present** anywhere in `src/` or `prisma/`. It is the QA tool's own AI-agent artifact, not our data. |
| BUG-04 | Critical | 🔵 ENHANCEMENT | PIN input UX / accidental lockout. `PinInput` + `attemptsLeft` state already exist; improving auto-focus + showing remaining attempts is a real UX upgrade. Pairs with BUG-12. |
| BUG-12 | Medium | 🔵 ENHANCEMENT | Show remaining PIN attempts. `attemptsLeft` is already tracked in `login/page.tsx` — needs to be surfaced in the UI copy. |
| BUG-08 | High | 🔵 ENHANCEMENT | No confirm dialog before "Tolak dari tahap awal" (claim rejection). Real UX safety gap; add a confirm step. |
| BUG-07 | High | 🔵 ENHANCEMENT | `village-data` table rows not clickable. Verify intended (detail/edit nav) then wire row links. |
| BUG-09 | High | 🔵 ENHANCEMENT | Failed document lacks actionable error. `failedReason` field + DocCard rendering exist; needs retry/upload-again affordance. Partial already. |
| BUG-10 | Medium | 🔵 ENHANCEMENT | `/internal-admin/renewals` empty state copy. |
| BUG-11 | Medium | 🔵 ENHANCEMENT | `/suara-warga` filter-by-desa not prominent. |
| BUG-14 | Medium | 🔵 ENHANCEMENT | No breadcrumb on `/desa/[id]`. |
| BUG-15 | Low | 🔵 ENHANCEMENT | Login mode tab active-state contrast. |
| BUG-13 | Medium | ⬜ UNCONFIRMED | "Number format not id-ID." Tester didn't confirm; spot-check needed (most surfaces already use `toLocaleString('id-ID')` / `formatRupiah`). |
| BUG-17 | Low | ⬜ UNCONFIRMED | "Title/favicon." Tester didn't confirm; `icon.tsx` + per-route metadata largely present. |

## Fixed this pass
- BUG-01, BUG-03 — `src/app/internal-admin/layout.tsx`, `src/app/profil/klaim-admin-desa/pengajuan/page.tsx`
- BUG-16 — `src/app/not-found.tsx`

## Decisions needed from owner
1. **BUG-02 / QA test data**: re-run `npm run seed:qa` to populate verified/limited admin fixtures? It adds fake `qa-desa-a/b` test desa to the production-real DB. (Alt: keep DB all-real; treat QA accounts as data-less.)
2. **Enhancement batch (BUG-04, 07, 08, 09, 10, 11, 12, 14, 15)**: which to implement now vs defer to a UX sprint.

## Notes
- The report's recurring "session expired before turn" almost certainly stems from the QA environment not having seed-qa applied (admin features look broken without member/claim rows) — not a session-management defect in code.
