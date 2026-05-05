# Sprint 04-008O - Back Office Fast Path Preview Candidate

## Status
READY - execute code change on branch preview, no production env edit.

## Decision
Stop adding more audit-only docs. We need a fast, safe candidate fix.

Because Vercel `DATABASE_URL` is scoped to `Production and Preview`, owner must not edit it manually. Instead, test the faster connection path using code on this branch only.

## Goal
Make this branch's Vercel Preview use `DIRECT_URL` / session-pooler path for Prisma runtime, while Production remains on `DATABASE_URL`.

Expected improvement based on 04-008K:
- context warm: ~1920ms -> ~766ms
- dokumen warm: ~1386ms -> ~407ms

## Hard Rules
Do not:
- edit Vercel env manually
- change Production `DATABASE_URL`
- merge to `main`
- create migration/index/schema change
- install package
- change business logic
- bypass auth/permission
- commit secrets

## Files To Change

### 1. `src/lib/db.ts`

Implement a small helper to choose Prisma runtime URL.

Required behavior:

```ts
function getPrismaDatasourceUrl(): string {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";
  const isVercelPreview = process.env.VERCEL_ENV === "preview";
  const isThisAuditBranch =
    process.env.VERCEL_GIT_COMMIT_REF === "fix/mobile-suara-profile-admin-access-polish";

  if (isVercelPreview && isThisAuditBranch && directUrl) {
    return directUrl;
  }

  return databaseUrl;
}
```

Then instantiate Prisma with explicit datasource override:

```ts
return new PrismaClient({
  datasources: {
    db: { url },
  },
});
```

Validation:
- Production deploy is safe because `VERCEL_ENV === "production"`, so it keeps `DATABASE_URL`.
- Only this branch Preview can use `DIRECT_URL` automatically.
- Local still uses `DATABASE_URL` unless manually changed.

Add a privacy-safe log when preview fast path is active:

```text
[perf][back-office] route=db step=previewDirectUrlRuntime enabled=true
```

Do not log URL values.

### 2. `docs/bmad/reports/back-office-performance-audit.md`

Append short section:

```md
## Fast Path Preview Candidate - Sprint 04-008O

Implemented branch-preview-only Prisma datasource selection:
- Vercel Preview on `fix/mobile-suara-profile-admin-access-polish` uses `DIRECT_URL` as Prisma runtime datasource.
- Production keeps `DATABASE_URL`.
- No Vercel env edit required.
- No production env change.

Next measurement:
- open the Vercel Preview deployment for this branch
- test `/profil/admin-desa/dokumen`
- compare cold/warm timing against 04-008K target
```

## Test Steps
Run locally:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

After push, owner opens the Vercel Preview deployment for this branch and tests:

```text
/profil/admin-desa/dokumen
```

Record:
- cold #1
- warm #2
- warm #3
- warm #4

## Acceptance Criteria
- `src/lib/db.ts` uses `DIRECT_URL` only for Vercel Preview on this branch.
- Production path remains `DATABASE_URL`.
- No secret is logged.
- QA commands pass or failures are documented.
- Report updated with candidate details.
