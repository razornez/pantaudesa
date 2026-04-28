# Rangga Review — Sprint 03-005 Loading, Caching, Trust Copy, and Route Performance

Date: 2026-04-29
Reviewer: Rangga
Owner status: Approved by Owner before review
Commit reviewed: `43f564acfb0d98502289ef5423c5b2e9912888e4`
Verdict: `ACCEPTED_FOR_SPRINT_03_CLOSEOUT`

## Scope reviewed

Task file:

- `docs/bmad/tasks/sprint-03-005-user-friendly-empty-loading-performance.md`

Commit message reviewed:

- `fix(perf): add db-first loading and source freshness`

Changed file set reviewed from compare:

- `src/app/api/voices/route.ts`
- `src/app/desa/[id]/loading.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/app/desa/[id]/suara/loading.tsx`
- `src/app/desa/loading.tsx`
- `src/app/page.tsx`
- `src/app/suara-warga/loading.tsx`
- `src/app/suara/loading.tsx`
- `src/components/desa/DesaCard.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/components/desa/DesaListClient.tsx`
- `src/components/desa/SourceDocumentSnapshotSection.tsx`
- `src/components/desa/SuaraWargaSection.tsx`
- `src/components/home/DesaLeaderboard.tsx`
- `src/components/ui/RouteSkeletons.tsx`
- `src/lib/data/desa-read.ts`
- `src/lib/data/voice-read.ts`
- `src/lib/prisma.ts`
- `src/lib/types.ts`

## Acceptance review

### Loading and route transition

Status: PASS

Evidence:

- Added route loading skeletons for:
  - `/desa`
  - `/desa/[id]`
  - `/desa/[id]/suara`
  - `/suara`
  - `/suara-warga`
- Added shared `RouteSkeletons` component.
- This addresses the Owner concern that clicking a desa detail felt frozen before navigation feedback appeared.

### Caching and DB read performance

Status: PASS

Evidence:

- `src/lib/data/desa-read.ts` now uses `unstable_cache` for public desa list/detail reads with `revalidate: 300`.
- Detail route now avoids full list fetch and uses a detail-specific read.
- Detail voice preview uses lightweight total + two preview rows instead of loading all voices.
- Commit message reports:
  - `/desa` warm route around 256ms after cache,
  - detail skeleton appears immediately,
  - warm detail responses around 1.1s on remote DB.

### Trust copy and source/freshness

Status: PASS

Evidence:

- Public technical DB/hardcoded/fallback wording was replaced with source/freshness summaries.
- `DesaCard` now shows source summary, document count, and freshness label.
- `DesaDetailFirstView` shows source-related first view copy and freshness label.
- `SourceDocumentSnapshotSection` now shows source names, document status, review status, and freshness context.

### Badge simplification

Status: PASS

Evidence:

- Repeated `Data Demo` badges were reduced where values already show `(mock)`.
- Detail budget cards no longer repeat demo badges on every stat card.
- Homepage and leaderboard use simpler `angka mock` copy.

### DB-first policy

Status: PASS

Evidence:

- No hardcoded displayed data fallback was reintroduced in reviewed diff.
- DB-first displayed data policy remains intact.

### Guardrails

Status: PASS based on commit message and diff review.

Guardrails confirmed:

- no schema/migration change,
- no seed rerun,
- no verified status activation,
- no official numeric APBDes extraction,
- no scraper/scheduler,
- no new dependency,
- no hardcoded displayed data fallback reintroduced.

### QA

Status: PASS based on Ujang commit message.

Reported QA:

- `npx prisma validate`: PASS
- `npx tsc --noEmit`: PASS
- `npm run test`: PASS
- `npm run build`: PASS
- route checks: PASS

## Known risks retained

From Ujang commit message:

- remote Supabase cold reads can still take several seconds,
- build still emits pre-existing Turbopack NFT trace warning around Prisma route import,
- Next dev logs still show unexpected ResolveMetadata root span warning.

These do not block Sprint 03 closeout, but should be watched in future performance work.

## Reviewer notes

No blocking rework found.

Minor watch-outs for future:

1. `unstable_cache` tags are broad (`desa-public`), which is acceptable for current public/demo read behavior but may need more granular invalidation when admin/source review workflow exists.
2. Source/freshness labels depend on available DB timestamps and source records; future Sprint 04 review workflow should improve data quality instead of adding more UI labels.
3. Voice global page may still fetch via client API; acceptable for current batch because loading states and API-backed behavior remain intact.

## Verdict

`ACCEPTED_FOR_SPRINT_03_CLOSEOUT`

Recommended next step:

- Update BMAD sprint status to reflect Sprint 03 technical closeout readiness.
- Prepare Sprint 03 closeout summary for Iwan/Owner decision:
  - close Sprint 03,
  - or open a focused rework batch only if Owner finds visual/runtime issue.
