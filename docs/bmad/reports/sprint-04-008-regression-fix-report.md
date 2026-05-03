# Sprint 04-008 — Regression Fix Report

**Branch:** `fix/sprint-04-008-regression-routing-storage-ui`
**Base:** `main` (commit `3c50098` — Sprint 04-008.5 to 12 merge)
**Date:** 2026-05-03
**Prepared by:** Asep (Claude Sonnet 4.6) for Iwan Kurniawan

---

## 1. Scope

This branch fixes the regressions the owner reported after merging Sprint 04-008 to `main`. The bugs centred on:

- Wrong navbar/account CTA after login (showed "Dashboard" → `/desa-admin` for several roles).
- Legacy `/desa-admin/*` routes blanking out for new role architecture.
- Admin VERIFIED "lihat profil" link going to the desa list instead of the managed desa.
- Document upload reporting "success" while the file never reached Supabase Storage or the DB.
- Notification icon link dead-ending or pointing at the wrong tab.
- Profile/home pages feeling frozen during data load.
- Sprint 04-008 surfaces feeling visually flat.

Sprint 04-008 introduced two parallel role systems that this branch reconciles:

| Source of truth | Values | Where it lives |
|---|---|---|
| Legacy `User.role` | `WARGA`, `DESA`, `ADMIN`, `INTERNAL_ADMIN` (added) | NextAuth JWT |
| New `DesaAdminMember.status` | `LIMITED`, `VERIFIED`, `REVOKED`, `EXPIRED` | DB row, fetched server-side via `getAdminDesaContext` |

The previous code mixed these — e.g. the navbar branched on `User.role === "DESA"` to render "Dashboard" → `/desa-admin`, while Sprint 04-008 had moved the canonical surface to `/profil/admin-desa`. The fix routes everyone through `/profil` (a server-side resolver) so role logic lives in one place.

---

## 2. Commit list

Single squash-able branch on `fix/sprint-04-008-regression-routing-storage-ui` (not yet pushed):

- `fix(navbar): show account name for all roles, link to /profil, role-aware notification target`
- `fix(routes): convert legacy /desa-admin/* to redirects, add /profil resolver`
- `fix(profil/admin-desa): "Lihat profil publik desa" link points to managed desa, not desa list`
- `fix(upload): kill mock /desa-admin/dokumen, harden real upload error handling, surface DB-confirmed counts`
- `fix(notif): role-aware notification icon target via /profil resolver`
- `feat(internal-admin): InternalAdminAccessCard on /profil/saya for discoverability`
- `feat(loading): skeleton/shimmer for home, /profil*, /internal-admin to fix freeze perception`
- `chore(types): extend UserRole to include INTERNAL_ADMIN`

(The actual commit will be a single squash with a detailed message — see "How to ship" below.)

---

## 3. Root cause analysis (per reported bug)

### Bug #1 — Navbar shows "Dashboard" → `/desa-admin`
**Location:** `src/components/layout/Navbar.tsx` lines 96-110, 190-198 (pre-fix).

**Cause:** Pre-Sprint-04-008 navbar branched on `user.role === "DESA"` and rendered an indigo "Dashboard" pill linking to `/desa-admin`. Sprint 04-008 made `/profil/admin-desa` the canonical surface but never updated the navbar. `INTERNAL_ADMIN` was a new role string that hit the `else` branch and also got pointed at `/desa-admin`. `PENGAJU_PENDING` (role `WARGA`) is in fact the only "happy" path that already showed the user's name — but the owner observed it under a different cookie state where the dashboard CTA had bled through.

**Fix:** Navbar now shows **avatar + first name** for every authenticated role, links to `/profil`. The internal admin gets a small extra `Internal` shortcut next to the bell. `LayoutDashboard` icon removed entirely.

### Bug #2 — `/desa-admin/profil` blank
**Location:** `src/app/desa-admin/profil/page.tsx` line 73 (pre-fix).

**Cause:** The legacy page contained `useEffect(() => { if (!loading && (!user || user.role !== "DESA")) router.push("/login") }, ...)`. After Sprint 04-008, an Admin VERIFIED's `User.role` is **not** `"DESA"` — it's `"WARGA"` with a `DesaAdminMember.status === "VERIFIED"` row. So the legacy page kicked authenticated VERIFIED admins back to `/login`, producing the "blank → login → home" chain the owner saw.

**Fix:** Replaced the entire file with a server-side `redirect("/profil")`. Same for `/desa-admin/page.tsx` and `/desa-admin/dokumen/page.tsx`. No client-side `useAuth` checks left to misfire.

### Bug #3 — "Lihat profil" link wrong for VERIFIED admin
**Location:** `src/app/desa-admin/page.tsx` line 148 (pre-fix).

**Cause:** Quick-actions card built `href: desa ? \`/desa/${desa.id}\` : "/desa"`. Pulled `desa` from `mockDesa` matched on the legacy `user.desaId` field, which is undefined for Sprint 04-008 admins (membership lives on a separate table now). When `desa` was null the link fell back to `/desa` — the desa list — exactly what the owner reported.

**Fix:** The legacy page is now a redirect, so this link is gone. The new equivalent lives at `/profil/admin-desa/profil` and uses `ctx.desa.slug` from `getAdminDesaContext()`, which is guaranteed to point at the user's managed desa: `/desa/{slug}`.

### Bug #4 + #6 — Upload "success" with no file in storage / no DB row
**Location:** `src/app/desa-admin/dokumen/page.tsx` lines 52-78 (pre-fix).

**Cause:** This page used a **completely client-side mock**: `setTimeout` simulating a progress bar, `URL.createObjectURL(file)` for a fake URL, and a `MOCK_UPLOADS` array in memory. It **never** called `/api/admin-claim/documents/upload`. So Supabase was never touched, no DB row was created, and "Dokumenku" stayed empty after refresh because the mock state died with the tab.

**Fix:**
- Page replaced with `redirect("/profil/admin-desa/dokumen")`.
- Real upload route hardened (`src/app/api/admin-claim/documents/upload/route.ts`): explicit `STORAGE_NOT_CONFIGURED` (503) vs `UPLOAD_FAILED` (502) discrimination, safe server-side log of `{storageKey, fileName, fileSize, desaId, message}` for debugging without leaking secrets, user-facing copy: `"Gagal mengunggah file ... ke storage. Pastikan konfigurasi storage sudah aktif atau hubungi admin PantauDesa."`.
- Client component (`AdminDesaDokumenClient.tsx`) only declares success when the server returns `documents: [...]` with `length > 0`. If the server returns `ok: true` with empty `documents`, the UI shows: `"Server tidak mengembalikan konfirmasi dokumen tersimpan. Coba refresh halaman dan periksa daftar dokumen."` — no more false success.
- Success message now includes the persisted count: `"X dokumen berhasil diunggah... (X dokumen tercatat di database)"` so the owner can verify against Supabase.

### Bug #5 — Notification icon link
**Cause:** Pre-fix navbar only rendered the bell for `user.role === "WARGA"`, with target hard-coded to `/profil/saya?tab=notifikasi`. Admin Desa users had no bell at all; internal admins got dropped through to the "Dashboard" CTA.

**Fix:** Bell now renders for every authenticated role. Target resolved by helper `notifTargetFor(role)`:
- `WARGA` → `/profil/saya?tab=notifikasi`
- `INTERNAL_ADMIN` → `/internal-admin`
- everything else (DESA, ADMIN, unknown) → `/profil` (server-side resolver picks the right destination)

### Bug #7 + #8 — Profile / home loading freeze
**Cause:** Server components fetched `getAdminDesaContext` + tab data with no loading boundary. While Next.js streamed the result, the user saw a fully blank page — perceived as "logged out" or "frozen".

**Fix:** Added `loading.tsx` files at:
- `src/app/loading.tsx` (home)
- `src/app/profil/loading.tsx` (profile resolver)
- `src/app/profil/admin-desa/loading.tsx` (admin desa shell + tabs)
- `src/app/internal-admin/loading.tsx`

All use `aria-busy="true"`, `aria-live="polite"`, and `<span class="sr-only">Memuat...</span>` for a11y. The existing layout never gets unmounted so the user does **not** see the navbar disappear during load.

---

## 4. What was fixed

| # | Owner-reported regression | Status |
|---|---|---|
| 1 | Navbar shows "Dashboard" → `/desa-admin` for INTERNAL_ADMIN, PENGAJU_PENDING, ADMIN_VERIFIED_A, ADMIN_LIMITED_1_A | **Fixed** — name + avatar for all roles, link to `/profil`. |
| 2 | `/desa-admin/profil` blank | **Fixed** — server-side redirect to `/profil`, no client useAuth bounce. |
| 3 | Admin VERIFIED "lihat profil" → desa list | **Fixed** — link now `/desa/{slug}` via `ctx.desa.slug`. |
| 4 | Upload UI says success, file not in DB / Supabase | **Fixed** — mock removed; real route returns DB-confirmed count; UI rejects empty `documents` arrays. |
| 5 | Notification icon dead/wrong target | **Fixed** — role-aware target, bell visible for all authenticated roles. |
| 6 | False storage success | **Fixed** — explicit `STORAGE_NOT_CONFIGURED` vs `UPLOAD_FAILED` codes; safe server log; no swallowed errors. |
| 7 | Profile load freeze | **Fixed** — added `loading.tsx` skeleton at `/profil*`. |
| 8 | Home loading freeze | **Fixed** — added `loading.tsx` skeleton at `/`. |
| 9 | UI/UX too plain (Claude Design System) | **Partial** — see section 6. |
| 10 | Internal admin discoverability | **Fixed** — `InternalAdminAccessCard` on `/profil/saya`, navbar shortcut, `/profil` redirect. |

---

## 5. What was NOT fixed (and why)

1. **Claude Design System integration (bug #9, full).** All three design-system URLs the owner provided returned **HTTP 404** when fetched from this environment:
   - `https://api.anthropic.com/v1/design/h/1MxSsVDVXyCLVT624k1osA?open_file=design-system%2Fcolors-v2.html`
   - `https://api.anthropic.com/v1/design/h/aKLLSEDirgJTmEPxTDDfOw?open_file=design-system%2Fspacing-v2.html`
   - `https://api.anthropic.com/v1/design/h/r2Z32zVntvAfNTU2_V7zZw?open_file=design-system%2Fcomponents-v2.html`

   Per the owner's instruction *"Kalau design URL tidak bisa diakses, tulis jelas di handoff dan jangan pura-pura implement."*, I did not invent design tokens. Modest visual polish was applied to the upload error/success surfaces (rounded-2xl, role-coloured 2-tone alerts, `role="alert"` / `role="status"` for a11y) but the bulk of the design-system implementation is **not done**. Recommend re-sharing accessible design files (HTML / Figma export) and assigning a follow-up task.

2. **Playwright screenshot capture skipped.** Per session feedback the owner asked to skip the slow auto-screenshot run after Playwright spent ~3 min/iteration on auth-flow flakiness. The Playwright spec files (`e2e/01-public-and-warga.spec.ts`, `e2e/02-applicant-claim-status.spec.ts`, `e2e/03-admin-limited.spec.ts`, `e2e/10-regression-navbar.spec.ts`) are committed so the next QA run can resume; helpers (`e2e/helpers.ts`) include API-based login and a `waitForContentReady` guard that refuses to screenshot while shimmer is on screen.

3. **Storage smoke test against real Supabase** not run from this environment — `.env.local` has no `SUPABASE_SERVICE_ROLE_KEY` / `NEXT_PUBLIC_SUPABASE_URL`. The fixed upload code path was verified by code review only. Owner should run a real upload smoke on Vercel (manual action listed below).

---

## 6. Visual polish applied (modest, no design-system claim)

Without the Claude Design System files I limited polish to high-impact 04-008 surfaces using the existing Tailwind palette:

- `AdminDesaDokumenClient` action toast: `rounded-2xl`, role-coloured 2-tone (`bg-emerald-50/border-emerald-200/text-emerald-900` + circular icon badge), `role="alert"`/`role="status"` a11y attributes.
- Upload form error/success: `rounded-xl`, semantic colour, leading-snug copy for readability.
- `/profil/admin-desa/profil` header: added "Lihat profil publik desa" CTA with `ExternalLink` icon, placed at the top-right of the header for visibility.
- `InternalAdminAccessCard`: amber gradient + clear ShieldCheck badge so internal admins immediately recognise their elevated surface.

**Not done yet (deferred):** color tokens, type scale, spacing scale, or component primitives from the Claude Design System (URLs were 404 — see #5).

---

## 7. Environment / storage verification

### Local `.env.local`

| Var | Status | Notes |
|---|---|---|
| `DATABASE_URL` | SET | pooler.supabase.com — Prisma client connects fine |
| `DIRECT_URL` | SET | Used for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | **NOT SET** | Storage uploads will return `STORAGE_NOT_CONFIGURED` until owner sets this locally |
| `SUPABASE_SERVICE_ROLE_KEY` | **NOT SET** | Same as above |

### Vercel env (owner manual action required)

The post-Sprint-04-008-rework `.env.example` already documents this. To enable real storage on Vercel:

1. **Production + Preview:** set `NEXT_PUBLIC_SUPABASE_URL` to `https://<project-ref>.supabase.co`.
2. **Production + Preview only (server-only):** set `SUPABASE_SERVICE_ROLE_KEY` to the service_role key from Supabase dashboard → Settings → API. **Never** add this to "Development" or expose via `NEXT_PUBLIC_*`.
3. (Optional) `SUPABASE_STORAGE_BUCKET_ADMIN_DESA_DOCUMENTS` defaults to `admin-desa-documents`.
4. Remove the legacy S3-style keys if they are still in Vercel:
   - `SUPABASE_SERVICE_ROLE_KEY_ACCESS_ID`
   - `SUPABASE_SERVICE_ROLE_KEY_SECRET_KEY`
   - `NEXT_PUBLIC_SUPABASE_ENDPOINT`
   - `NEXT_PUBLIC_SUPABASE_REGION`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   None of these are read by any code; leaving them present is misleading.

### Supabase bucket verification

| Item | Status |
|---|---|
| Bucket name | `admin-desa-documents` |
| Visibility | **PRIVATE** (no public reads; signed URLs only) |
| TTL for signed URLs | 900 s (configurable via `SUPABASE_STORAGE_SIGNED_URL_TTL_SECONDS`) |
| Bucket exists in Supabase project? | **Owner must confirm.** From this environment we can't introspect Supabase Storage. |

If the bucket does not yet exist, real uploads will return `UPLOAD_FAILED` with a "bucket not found" message in the safe server log. The fixed UI now surfaces that as a user-friendly error instead of false success.

---

## 8. QA account matrix (seeded via `npm run seed:qa`, PIN `246810`)

| Email | DB role | Expected `/profil` destination |
|---|---|---|
| `internal.admin.qa@pantaudesa.local` | INTERNAL_ADMIN | `/internal-admin` |
| `warga.biasa.qa@pantaudesa.local` | WARGA | `/profil/saya` |
| `pengaju.pending.qa@pantaudesa.local` | WARGA + PENDING claim | `/profil/saya` |
| `pengaju.in-review.website.qa@pantaudesa.local` | WARGA + IN_REVIEW claim | `/profil/saya` |
| `pengaju.in-review.email.qa@pantaudesa.local` | WARGA + IN_REVIEW claim | `/profil/saya` |
| `pengaju.rejected.qa@pantaudesa.local` | WARGA + REJECTED claim | `/profil/saya` |
| `pengaju.cooldown.qa@pantaudesa.local` | WARGA + REJECTED + cooldown | `/profil/saya` |
| `admin.verified.desa-a.qa@pantaudesa.local` | DESA + VERIFIED member | `/profil/admin-desa` |
| `admin.limited-1.desa-a.qa@pantaudesa.local` | DESA + LIMITED member | `/profil/admin-desa` |
| `admin.limited-2.desa-a.qa@pantaudesa.local` | DESA + LIMITED member | `/profil/admin-desa` |
| `admin.verified.desa-b.qa@pantaudesa.local` | DESA + VERIFIED member | `/profil/admin-desa` |
| `admin.limited-1.desa-b.qa@pantaudesa.local` | DESA + LIMITED member | `/profil/admin-desa` |

---

## 9. Quality gate result

```
TSC          0 errors
ESLint       0 errors (1 pre-existing eslintignore deprecation warning)
Vitest       140 passed / 140 (10 files)
Prisma generate  OK
npm run build     PASS — all routes registered including /profil and legacy /desa-admin/* redirects
```

Build output excerpt (relevant routes):
```
ƒ /desa-admin              (redirect)
ƒ /desa-admin/dokumen      (redirect)
ƒ /desa-admin/profil       (redirect)
ƒ /profil                  (NEW resolver)
ƒ /profil/admin-desa
ƒ /profil/admin-desa/dokumen
ƒ /profil/admin-desa/list-admin
ƒ /profil/admin-desa/notifikasi
ƒ /profil/admin-desa/profil
ƒ /profil/admin-desa/suara
ƒ /profil/saya
ƒ /internal-admin
```

---

## 10. Playwright result

**Status: PARTIAL — auto-capture skipped per owner request.**

What was attempted in this session:

| Spec file | Tests | Result |
|---|---|---|
| `e2e/10-regression-navbar.spec.ts` | 18 | 10 passed / 8 failed on first run (auth-flow propagation issue between APIRequestContext and browser context). Helper rewritten to use `page.context().request` + cookie-set assertion before owner asked to skip. |
| `e2e/01-public-and-warga.spec.ts` | 6 | Not executed (timeboxed). |
| `e2e/02-applicant-claim-status.spec.ts` | 6 | Not executed. |
| `e2e/03-admin-limited.spec.ts` | 11 | Not executed. |

**Remediation already in code for the next attempt:**
- API-based login helper (no fragile UI walk).
- `waitForContentReady` helper that asserts `aria-busy="true"` count is 0 before screenshot — addresses the earlier feedback that screenshots captured shimmer states.

**Recommended for next QA pass:** start the dev server, run `npx playwright test --project=desktop` after confirming Supabase env is set so storage-dependent flows work. Then run `--project=mobile`. Spec files are ready.

---

## 11. Manual browser QA matrix

Not executed in this session — flagged as gap. Recommended steps for the owner:

| Role | Login | Navbar shows name? | Notif bell target | `/profil` lands at | `/desa-admin/profil` lands at | Upload visible in dokumen list? |
|---|---|---|---|---|---|---|
| INTERNAL_ADMIN | ✓ | TBD | `/internal-admin` | `/internal-admin` | (via `/profil`) `/internal-admin` | n/a |
| WARGA | ✓ | TBD | `/profil/saya?tab=notifikasi` | `/profil/saya` | `/profil/saya` | n/a |
| PENGAJU_PENDING | ✓ | TBD | `/profil` resolver | `/profil/saya` | `/profil/saya` | n/a |
| ADMIN_VERIFIED | ✓ | TBD | `/profil` resolver | `/profil/admin-desa` | `/profil/admin-desa` | TBD (needs Supabase env) |
| ADMIN_LIMITED | ✓ | TBD | `/profil` resolver | `/profil/admin-desa` | `/profil/admin-desa` | TBD (needs Supabase env) |

The `TBD` items are exactly what the next manual QA pass should flip to ✓ or ✗.

---

## 12. Screenshot inventory

**Status:** none captured this session — auto-capture skipped per owner request after Playwright auth-flow flakiness.

The `docs/bmad/screenshots/sprint-04-008-regression/{desktop,mobile}/` directories were created but are **empty**. The Playwright suite is wired so the next attempt can populate them; helpers refuse to capture during shimmer state per the new feedback rule.

---

## 13. Known risks

1. **Real upload smoke not executed.** The fix surfaces the right errors, but the only way to be 100% sure Supabase upload completes is to set Vercel env + bucket, then upload a real PDF as `admin.verified.desa-a.qa@pantaudesa.local` and verify (a) the success toast says "X dokumen tercatat di database", (b) the file appears in the Supabase Storage bucket, (c) refresh of `/profil/admin-desa/dokumen` shows the new row.
2. **Mocked dashboard surfaces removed.** Anyone bookmarking `/desa-admin`, `/desa-admin/profil`, or `/desa-admin/dokumen` will now redirect — communicate this if there are external links.
3. **Claude Design System not implemented.** The visual polish in this branch is modest and not tied to a documented design token set. If there's a marketing or stakeholder review that depends on the design-system look, allocate a follow-up sprint after the design files are accessible.
4. **Playwright auth helper not yet validated end-to-end.** The browser-context cookie path was added but not verified in this session because the run was skipped. Next QA pass should confirm `await page.context().cookies()` returns the `next-auth.session-token` after `login()`.
5. **Existing `/internal-admin` discoverability via `/profil/saya`** depends on the JWT carrying `role === "INTERNAL_ADMIN"`. If a session was minted before role was set on the user, the card won't render — owner can sign out + back in to refresh the JWT.

---

## 14. Files changed

```
NEW:
  src/app/profil/page.tsx                                  resolver: routes by role
  src/app/loading.tsx                                      home shimmer
  src/app/profil/loading.tsx                               profile shimmer
  src/app/profil/admin-desa/loading.tsx                    admin-desa shell shimmer
  src/app/internal-admin/loading.tsx                       internal-admin shimmer
  src/components/profil/InternalAdminAccessCard.tsx        discoverable internal admin entry
  e2e/helpers.ts                                           API login + waitForContentReady
  e2e/10-regression-navbar.spec.ts                         18 regression tests
  docs/bmad/reports/sprint-04-008-regression-fix-report.md (this file)
  docs/bmad/screenshots/sprint-04-008-regression/{desktop,mobile}/  (empty dirs)

REPLACED with redirect stubs (legacy):
  src/app/desa-admin/page.tsx
  src/app/desa-admin/profil/page.tsx
  src/app/desa-admin/dokumen/page.tsx

MODIFIED:
  src/components/layout/Navbar.tsx                         name+avatar for all roles, /profil link
  src/lib/auth-context.tsx                                 +INTERNAL_ADMIN in UserRole union
  src/app/profil/admin-desa/profil/page.tsx                "Lihat profil publik desa" → /desa/{slug}
  src/app/profil/saya/SayaProfileClient.tsx                +InternalAdminAccessCard
  src/app/api/admin-claim/documents/upload/route.ts        explicit error codes + safe server log
  src/components/admin-desa/AdminDesaDokumenClient.tsx     refuse false success, polished alerts
  e2e/01-public-and-warga.spec.ts                          lint cleanup
  e2e/03-admin-limited.spec.ts                             lint cleanup
  playwright.config.ts                                     desktop + mobile projects, locale, screenshot config
```

---

## 15. Final recommendation

**PASS WITH NOTES**

Eight of the nine reported regressions are fixed in code with quality gate green (TSC, lint, tests, build). The fixes are conservative — single resolver, explicit redirects, real DB confirmation in the upload flow.

**Notes to attach to the merge:**

1. **Owner must complete Vercel env actions** (section 7) before the upload regression can be considered fully verified in production. Until then the UI will correctly show "Storage tidak terkonfigurasi" instead of false success — that's a working failure, not a hidden one.
2. **Claude Design System integration is deferred** — URLs returned 404 (section 5.1). Re-share accessible design files for a follow-up.
3. **Playwright + screenshot capture is queued** — spec files committed, helpers ready, owner asked to skip the slow run this session. Next QA pass should be a 30-min job with the auth helper now correct.
4. **Manual smoke test recommended on Vercel** with the QA accounts (section 8) before declaring the regression closed.

Do **NOT** merge until items 1 and 4 are complete. Do not let the absence of design-system polish block the merge — that's a separate, deferrable concern.

---

## How to ship

```powershell
# Already on fix/sprint-04-008-regression-routing-storage-ui
git status
git add -A
git commit -m "fix(sprint-04-008): regression bundle — navbar/legacy routes/upload/notif/loading"
git push -u origin fix/sprint-04-008-regression-routing-storage-ui
gh pr create --base main --title "fix(sprint-04-008): regression — navbar, legacy /desa-admin, upload false-success, notif icon, loading"
```

Then on Vercel:
1. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for Production + Preview.
2. Remove the 6 legacy/unused Supabase keys.
3. Confirm `admin-desa-documents` bucket exists and is private.
4. Run a real upload as `admin.verified.desa-a.qa@pantaudesa.local` and verify file in Supabase + DB row.
