# Sprint 05 DB Runtime Hardening Report

Status: implemented, pending full authenticated browser QA  
Date: 2026-05-25

## Summary

Batch ini menutup akar masalah berulang pada koneksi Supabase/Prisma: runtime lokal tidak boleh otomatis memakai `DIRECT_URL`, seed/template sync tidak boleh hang tanpa tahap yang jelas, dan QA wajib mendeteksi masalah DB sebelum user membuka halaman back office.

## Core Changes

- Runtime DB policy dikunci:
  - `DATABASE_URL` menjadi jalur default untuk local app/runtime.
  - `DIRECT_URL` hanya dipakai runtime bila `PANTAUDESA_LOCAL_DB_USE_DIRECT_URL=true`.
  - Prisma singleton menyimpan identitas datasource supaya hot reload tidak memakai client lama saat URL berubah.
- Guardrail baru:
  - `npm run db:doctor` memeriksa env aman, TCP, Prisma `SELECT 1`, dan migration status tanpa mencetak secret.
  - `npm run qa:runtime` menjalankan `db:doctor`, smoke public detail, dan optional internal API smoke via `QA_INTERNAL_ADMIN_COOKIE`.
  - `npm run qa:static` dan `npm run qa:prebuild` memusatkan QA agar tidak bergantung pada command ingatan manual.
- Template sync:
  - `template:sync` tidak lagi default memaksa `DIRECT_URL`.
  - Stage logging dan timeout ditambahkan untuk preflight, catalog, template placement, assignment, dan backfill.
  - `--dry-run` tersedia untuk validasi tanpa DB write.
- Dokumentasi:
  - `.env.example` menjelaskan policy `DATABASE_URL`, `DIRECT_URL`, dan override template sync.
  - `docs/engineering/database-runtime-runbook.md` menjadi runbook migration drift, DB health, build safety, dan template sync.

## Resilience Status

- Runtime public/detail and back office API remain Prisma-backed.
- Template management GET has a manifest read-only fallback for real DB outages.
- Mutations remain DB-required and should fail/disable honestly when runtime DB is unavailable.
- `db:doctor` is the first-line diagnostic before debugging UI data symptoms.

## Residual Risks

- Authenticated internal-admin smoke cannot run unless `QA_INTERNAL_ADMIN_COOKIE` is provided.
- `DIRECT_URL` may remain unusable on some local networks; this is acceptable as long as `DATABASE_URL` is healthy for runtime.
- Full production migration discipline still depends on humans/CI following the runbook and not resolving drift blindly.
- `npm run build` passes, but Turbopack still reports one NFT tracing warning through `next.config.ts -> src/generated/prisma/index.js -> review-candidate-submission`. This is a known residual warning, not a build blocker.
- On Windows, `npm run build` can still fail if a running Next dev server locks Prisma's `query_engine-windows.dll.node`; stop Next dev before build or follow the `prisma:generate` guard hint.
- `template:sync` now completes with stage logs. Current observed slowest stage is perangkat backfill, around 52 seconds on this dataset.

## Verification Targets

- `npm run db:doctor`
- `node prisma/seed-templates.mjs --dry-run`
- `npm run qa:static`
- `npm run qa:runtime`
- `npm run build`

## Latest Verification

- `npm run qa:static` passed: 41 test files, 242 tests.
- `npm run qa:runtime` passed: DB doctor OK, `/desa/batukarut` returned 200, internal API smoke skipped because `QA_INTERNAL_ADMIN_COOKIE` was not set.
- `npm run qa:prebuild` passed.
- `npm run template:sync` completed with stage timing.
- `npm run build` passed after stopping local Next dev server.
