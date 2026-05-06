# Sprint 05 Batch 1 Performance & Observability Report

**Date:** 2026-05-06  
**Branch:** `main`  
**Scope:** S05-001 Observability Strategy & OTel Spike, S05-002 Homepage/Public Read-path Monitoring, S05-003 Type Safety Cleanup for Mapping/Perf Runtime

---

## Executive Summary

Sprint 05 Batch 1 establishes a realistic observability path for PantauDesa without adopting paid or complex tooling prematurely.

The recommended Sprint 05 path is:

1. Use existing Sentry tracing as the immediate low-friction baseline after privacy hardening.
2. Keep guarded source-code public/back-office timing as a safe fallback and local diagnostic layer.
3. Prepare OpenTelemetry as the medium-term provider-neutral path, using Next.js `instrumentation.ts` and `@vercel/otel` only after owner approval for package adoption.

No package was installed. No production environment variable was changed. No database migration or index was created.

---

## S05-001 Observability Strategy & OTel Spike

### Current repo state

- Next.js version is `16.2.4`.
- Next.js local docs in `node_modules/next/dist/docs/01-app/02-guides/open-telemetry.md` recommend OpenTelemetry and describe `@vercel/otel` as the shortest setup path.
- The repo already has `src/instrumentation.ts` and `src/instrumentation.node.ts`.
- The repo already uses `@sentry/nextjs` with tracing configured.
- Before this batch, Sentry had `sendDefaultPii: true` on server and client configuration. This was not aligned with Sprint 05 guardrails.

### Provider comparison

| Option | Fit for PantauDesa | Cost posture | Notes |
|---|---|---|---|
| Existing Sentry Performance | Best immediate path because SDK is already installed | Free/developer plan includes error monitoring and tracing, with plan limits | Must keep `sendDefaultPii: false`; Prisma still needs manual spans or separate integration work |
| OpenTelemetry + `@vercel/otel` | Best medium-term architecture because it is provider-neutral | Package install required; backend may be free or paid depending provider | Good fit for Next.js/Vercel, but owner approval is needed before installing packages |
| Vercel Observability | Operationally convenient if deployed on Vercel | Basic visibility exists, richer retention/features can become paid | Useful for runtime logs/session tracing, less portable than OTel |
| Grafana Cloud / OTel collector | Strong provider-neutral observability backend | Free tier exists; collector/setup adds complexity | Good later if PantauDesa wants OTel-native traces/logs with more control |
| New Relic | Strong APM and generous free ingest | Free tier available; vendor adoption still needs owner approval | Useful candidate if owner wants quick hosted APM beyond Sentry |

### Recommendation

Use **Sentry + guarded perf helpers** for Sprint 05 implementation work, while documenting **OTel + `@vercel/otel`** as the next approved spike.

This keeps Batch 1 useful immediately without adding dependencies or vendor lock-in. If owner approves package installation later, the implementation should add `@vercel/otel` and `@opentelemetry/api`, then add custom spans around public route read paths and mapping/publish boundaries.

### Privacy decision

Sentry `sendDefaultPii` is now set to `false` in:

- `src/instrumentation.node.ts`
- `sentry.client.config.ts`

Existing `beforeSend` server filtering still removes `authorization` and `cookie` headers.

---

## S05-002 Homepage/Public Read-path Monitoring

### Added guarded public timing

The public read-path now emits `[perf][public]` timing lines through `src/lib/perf.ts`. These logs are still gated by the existing `perfEnabled()` rules:

- enabled in non-production,
- enabled in production only if `PERF_DEBUG_BACK_OFFICE=true`.

The label name remains inherited from Sprint 04 for compatibility, but the output namespace now distinguishes public timing from back-office timing.

### Covered routes and read paths

| Route/path | Timing added |
|---|---|
| `/` | `getDesaListResult()`, homepage aggregation, route data-ready |
| `/desa` | search params, `getDesaListResult()`, route data-ready |
| `/desa/[id]` | desa detail read, voice preview read, route data-ready |
| `/suara-warga` | all voices read, route data-ready |
| `src/lib/data/desa-read.ts` | cached list/detail read, DB list/detail fetch, mapping list/detail |
| `src/lib/data/voice-read.ts` | cached all voices read, voice DB fetch, voice mapping, voice preview count/read |

### Measurement interpretation

Because public list/detail reads use `unstable_cache`, a cache hit should show outer route/helper timings without the inner DB fetch timings. A cache miss should include inner `desa.findMany`, `desa.findFirst`, or voice query timings.

No identifiers are logged. Route labels are static. Row counts are aggregate counts only.

### Owner validation notes

Owner manual test observations after the Batch 1 rollout:

- `/desa` `routeDataReady` around `1235ms`
- `/desa/[id]` `routeDataReady` around `2169ms`
- `/suara-warga` `routeDataReady` around `1281ms`

Additional notes from the same check:

- `[perf][public]` logs are active and visible on the targeted public routes.
- The current public perf logs do not show PII, token, DB URL, document content, or storage key.
- Follow-up public image performance cleanup is still needed for:
  - Next Image `fill` usage without `sizes`
  - mascot image aspect ratio warning

---

## S05-003 Type Safety Cleanup for Mapping/Perf Runtime

### Mapping cleanup

`src/lib/admin-claim/ai-mapping.ts` now owns the mapping boundary types and helpers:

- `AiMappingFieldValue`
- `AiMappingFields`
- `AI_MAPPABLE_DESA_SELECT`
- `sanitizeMappingFields()`
- `toAiMappingDraftJson()`
- `getMappingFieldKeys()`
- `createDesaMappingUpdateData()`

The publish route now uses allowlisted field keys and typed Prisma update data instead of passing a sanitized object through a broad Prisma cast.

The draft-mapping route now stores the draft with `toAiMappingDraftJson()` instead of `JSON.parse(JSON.stringify(draft))`.

### Perf helper cleanup

`src/lib/perf.ts` now narrows Prisma client/event shapes with explicit guards before attaching query logging. This keeps `unknown` at the external runtime boundary but narrows it before use.

Minor follow-up after Batch 1:

- Prisma query event `duration` is interpreted as milliseconds directly.
- Public mapping timers were split so mapping-only labels do not include DB query time.

### Business flow

No change was made to the Sprint 04-008 flow:

```text
LIMITED upload -> VERIFIED approve/reject/return -> Internal Admin review/publish/fail
```

No auto-publish behavior was added.

---

## QA

| Command | Result |
|---|---|
| `npm run lint` | PASS; existing ESLint warning about `.eslintignore` deprecation remains |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS when rerun outside sandbox; first sandbox run was blocked by Windows `EPERM` on `C:\Users\IWANKU~1` during Prisma generate |
| `npx prisma generate` | PASS as part of `npm run build` |

Build note: Turbopack still emits the existing NFT trace warning through `next.config.ts -> src/generated/prisma/index.js -> src/lib/prisma.ts -> src/app/api/voices/[id]/replies/route.ts`. This appears unrelated to the Batch 1 changes.

---

## Guardrails

- No migration or index.
- No production `DATABASE_URL` change.
- No package install.
- No paid third-party adoption.
- No DB URL, token, document content, storage key, email, raw user id, or raw desa id logging.
- No AI/admin-desa auto-publish.
- Existing Sprint 04-008 business flow preserved.

---

## Sources Checked

- Next.js local docs: `node_modules/next/dist/docs/01-app/02-guides/open-telemetry.md`
- Next.js local docs: `node_modules/next/dist/docs/01-app/02-guides/instrumentation.md`
- Vercel docs: `https://vercel.com/docs/tracing/instrumentation`
- Sentry pricing/docs: `https://sentry.io/pricing/`, `https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/environments/`
- New Relic pricing: `https://newrelic.com/pricing`
- Grafana pricing: `https://grafana.com/pricing/`
- Vercel pricing: `https://vercel.com/pricing`
