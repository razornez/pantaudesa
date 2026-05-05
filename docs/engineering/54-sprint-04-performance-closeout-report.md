# Sprint 04 Performance Closeout Report

**Date:** 2026-05-05  
**Branch:** `fix/mobile-suara-profile-admin-access-polish`  
**Scope:** back-office performance tracing, read-path hardening, navigation fetch reduction, local DX cleanup, and public page read-path improvements

---

## Executive Summary

This closeout consolidates the meaningful engineering work completed after the Sprint 04 back-office performance audit.

The work confirmed that the original admin-desa slowness was not caused by SQL execution itself, but by runtime/connection overhead and repeated read-path work. From there, the implementation focused on:

1. reducing avoidable navigation fetches,
2. tightening repeated server auth/context work,
3. simplifying heavy list-admin roster reads,
4. moving selected public/client-first pages to server-first reads,
5. preserving production safety boundaries.

This report is intentionally broader than the audit report in `docs/bmad/reports/back-office-performance-audit.md`. The BMAD audit remains the source of truth for connection/runtime findings. This closeout explains what was actually changed in code and what outcomes were observed.

---

## What We Changed

### 1. Admin Desa navigation and shell fetch reduction

Reduced unnecessary route prefetching in:

- `src/components/admin-desa/AdminDesaTabNav.tsx`
- `src/app/profil/admin-desa/layout.tsx`
- `src/components/layout/Navbar.tsx`

Outcome:

- admin-desa tab switches stopped eagerly warming unrelated routes,
- hero return link stopped prefetching,
- top-level navbar links stopped generating extra RSC traffic while testing admin pages.

This did not fully solve the slow pages, but it removed noise and made performance debugging more truthful.

### 2. Admin Desa context query reshaping

Optimized admin-desa context lookup in:

- `src/lib/data/admin-desa-context.ts`

Outcome observed during local testing:

- context timing that had previously spiked into multi-second territory was reduced materially on warm paths,
- repeated membership/user context resolution became much more stable.

This was one of the highest-signal wins from the whole investigation.

### 3. List Admin roster query simplification

Optimized roster loading in:

- `src/lib/data/desa-admins.ts`
- `src/app/profil/admin-desa/list-admin/page.tsx`

Important implementation note:

- a “single giant loader query” experiment was attempted and rejected,
- the final kept version returned to split-but-lighter reads,
- the best result came from lighter member/invite reads rather than one large fan-out query.

Outcome observed:

- `list-admin` became the fastest version reached during this investigation,
- `auth()` was proven not to be the bottleneck,
- `getAdminDesaContext()` and roster reads were confirmed as the primary expensive path,
- the unsuccessful merged-query experiment was rolled back before closeout.

### 4. Internal Admin shell cleanup

Improved internal-admin repeated page work in:

- `src/lib/auth/internal-admin.ts`
- `src/app/internal-admin/layout.tsx`
- `src/app/internal-admin/claims/page.tsx`
- `src/app/internal-admin/documents/page.tsx`
- `src/app/internal-admin/renewals/page.tsx`
- `src/components/internal-admin/ClaimReviewQueue.tsx`
- `src/components/internal-admin/InternalDocumentReviewQueue.tsx`
- `src/components/internal-admin/InternalRenewalQueue.tsx`

Outcome:

- layout became the primary auth gate,
- duplicate child-page session checks were removed,
- queue filter/pagination navigation now avoids eager prefetch behavior,
- a `Beranda` button was added to the internal-admin shell for easier exit/navigation.

### 5. `/profil/saya` read-path cleanup

Reduced mount-time client fetch work in:

- `src/app/profil/saya/page.tsx`
- `src/app/profil/saya/SayaProfileClient.tsx`

Outcome:

- initial profile data now arrives server-side,
- profile client no longer depends on an immediate `/api/users/me` fetch on mount just to show the first render.

### 6. Public `suara-warga` server-first refactor

Refactored:

- `src/app/suara/page.tsx`
- `src/app/suara-warga/page.tsx`
- `src/components/suara/SuaraWargaPageClient.tsx`
- `src/lib/data/voice-read.ts`

Outcome:

- `suara-warga` no longer waits for a client-side first fetch after mount,
- public voice data now comes from a server-first cached read path,
- desa metadata (`desaNama`, `desaKabupaten`, `desaSlug`) now flows into the public cards correctly,
- “Lihat profil desa” labels now include the actual desa name when available.

### 7. Desa detail read-path tracing and voice preview cache

Improved:

- `src/app/desa/[id]/page.tsx`
- `src/lib/data/voice-read.ts`

Outcome:

- desa detail now logs separate timing for:
  - `getDesaByIdOrSlugWithFallback()`
  - `getVoicePreviewForDesaFromDb()`
- voice preview reads now use public cache,
- key CTA links in the detail page no longer prefetch unnecessarily.

### 8. Local build reliability

Adjusted:

- `src/app/layout.tsx`

Outcome:

- local build is no longer blocked by Google Fonts fetch for `next/font/google`,
- Windows local build stability improved after Prisma lock issues were handled operationally.

---

## Debugging Tools: What Was Kept vs Removed

### Kept

We kept targeted perf instrumentation that is still useful for controlled audits:

- `src/lib/perf.ts`
- selective route/query timing in admin-desa, internal-admin, public suara, and desa detail

These logs remain gated by development mode or `PERF_DEBUG_BACK_OFFICE=true`.

### Removed

We removed the temporary safe runtime inspector endpoint:

- deleted `src/app/api/debug/db-runtime/route.ts`
- removed `getPrismaRuntimeDebugInfo()` helper from `src/lib/db.ts`

Reason:

- it served its purpose during preview validation,
- it should not remain as a long-lived production-facing debug endpoint.

---

## What We Proved

### Confirmed

1. The original admin-desa slowness was not caused by raw SQL execution alone.
2. Transaction-pooler path and runtime startup overhead were the major audit findings.
3. Repeated page-level context and roster reads also contributed materially to user-facing slowness.
4. Some public pages were slower than necessary because they waited for client fetch after mount.
5. Prefetch noise was real in some flows, but it was not the sole root cause.

### Rejected / Rolled Back

1. One-shot giant loader query for `list-admin`.
2. Keeping the temporary preview/runtime debug endpoint permanently.

---

## User-Facing Outcome

By the end of this work:

1. `list-admin` reached the fastest tested version seen during the investigation.
2. `profil/saya` no longer needs a first-render client fetch for basic profile data.
3. `suara-warga` now renders from server-provided initial data instead of waiting for client fetch.
4. `desa` detail now benefits from cached voice preview reads and better instrumentation.
5. Internal admin has cleaner navigation and a direct `Beranda` escape hatch.

Not every slow path is fully solved, but the codebase is in a significantly better and more debuggable state than before this run.

---

## QA Summary

Validated repeatedly during the work:

- `npm run lint` — pass
- `npx tsc --noEmit` — pass

Build notes:

- local `npm run build` reached successful compile/type phases,
- Windows local environment still intermittently hit `EPERM`/`spawn EPERM` operational issues unrelated to TypeScript correctness,
- this remains a workstation/runtime issue rather than a source-level regression from the implemented changes.

---

## Guardrails Respected

1. No migration.
2. No DB index.
3. No production `DATABASE_URL` change.
4. No schema change.
5. No package install.
6. No business-flow rewrite.
7. No secret or `.env` commit.
8. No log file commit.

---

## Recommended Handoff To Rangga

Rangga should prepare the **Sprint 05 backlog** using these outcomes as input.

Recommended Sprint 05 backlog preparation themes:

1. **Homepage read-path review**
   - homepage currently still shows slow application-code time under local dev
   - backlog item should split tracing between `getDesaListResult()` and homepage aggregation work

2. **Public page read-path continuation**
   - continue server-first/cached treatment for public surfaces that still depend on heavy dynamic reads

3. **Back-office warm-path reduction follow-up**
   - convert confirmed wins from this investigation into narrower, reviewable tasks rather than reopening the whole audit

4. **Windows local build/runtime stability**
   - capture `EPERM` / `spawn EPERM` operational issues separately from product performance work

5. **Debug instrumentation lifecycle**
   - define which perf traces remain temporary and which become standard guarded diagnostics

Suggested owner message to Rangga:

> Rangga, please prepare Sprint 05 backlog based on `docs/engineering/54-sprint-04-performance-closeout-report.md` and the BMAD performance audit report. Focus on follow-up backlog slicing, not re-auditing Sprint 04 from scratch.
