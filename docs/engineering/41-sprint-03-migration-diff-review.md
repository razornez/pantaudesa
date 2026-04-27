# Sprint 03 Migration Diff Review

Date: 2026-04-27
Executor: Ujang
Status: safe-for-review-not-applied

## Command Used

SQL diff:

```bash
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
```

Summary diff:

```bash
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma
```

No migration was applied.
No `migrate dev`, `migrate reset`, or `db push` was run.
No seed was created or executed.

## Diff Summary

The generated diff only adds Sprint 03 objects.

Added enums:

- `DataStatus`
- `SourceType`
- `ScopeType`
- `AccessStatus`
- `DataAvailability`
- `StatusSerapan`
- `DocumentStatus`
- `DocumentType`

Added tables:

- `desa`
- `data_sources`
- `anggaran_desa_summaries`
- `apbdes_items`
- `dokumen_publik`

Added indexes:

- `desa_kodeDesa_key`
- `desa_slug_key`
- `desa_kecamatan_kabupaten_provinsi_idx`
- `desa_dataStatus_idx`
- `data_sources_desaId_idx`
- `data_sources_scopeType_scopeName_idx`
- `data_sources_sourceType_idx`
- `data_sources_accessStatus_idx`
- `data_sources_dataStatus_idx`
- `anggaran_desa_summaries_tahun_idx`
- `anggaran_desa_summaries_sourceId_idx`
- `anggaran_desa_summaries_dataStatus_idx`
- `anggaran_desa_summaries_desaId_tahun_key`
- `apbdes_items_desaId_tahun_idx`
- `apbdes_items_sourceId_idx`
- `apbdes_items_dataStatus_idx`
- `dokumen_publik_desaId_tahun_idx`
- `dokumen_publik_jenisDokumen_idx`
- `dokumen_publik_status_idx`
- `dokumen_publik_sourceId_idx`
- `dokumen_publik_dataStatus_idx`

Added foreign keys:

- `data_sources.desaId -> desa.id` with `ON DELETE SET NULL`
- `anggaran_desa_summaries.desaId -> desa.id` with `ON DELETE CASCADE`
- `anggaran_desa_summaries.sourceId -> data_sources.id` with `ON DELETE SET NULL`
- `apbdes_items.desaId -> desa.id` with `ON DELETE CASCADE`
- `apbdes_items.sourceId -> data_sources.id` with `ON DELETE SET NULL`
- `dokumen_publik.desaId -> desa.id` with `ON DELETE CASCADE`
- `dokumen_publik.sourceId -> data_sources.id` with `ON DELETE SET NULL`

## Auth/User/Voice Safety Check

No changes detected for:

- `users`
- `accounts`
- `sessions`
- `verification_tokens`
- `otp_codes`
- `voices`
- `voice_replies`
- `voice_votes`
- `voice_helpfuls`

No generated SQL contained:

- `DROP TABLE`
- `DROP TYPE`
- `ALTER TABLE` on auth/user/voice tables
- `TRUNCATE`
- relation from `Voice` to `Desa`

The only `ALTER TABLE` statements add foreign keys for the new Sprint 03 tables.

## SQL Review Result

Diff recommendation: safe for Iwan review.

Apply recommendation: not yet approved.

Reason:

- The SQL content itself is additive and scoped to Sprint 03.
- The database is still not managed by Prisma Migrate, so applying through Prisma Migrate remains blocked until Iwan chooses a baseline/apply path.

## Blocker

`npx prisma migrate status` reports:

- no migrations found in `prisma/migrations`,
- current database is not managed by Prisma Migrate.

This means reviewed SQL can be considered safe in content, but the migration history/apply strategy is not resolved.

## Need Iwan Decision

Iwan must decide how to apply and record the reviewed diff:

- baseline existing Supabase schema in migration history, then apply Sprint 03 reviewed diff, or
- apply reviewed SQL through a controlled manual DB change and record the baseline afterward, or
- use a separate dev DB to formalize migration files before touching shared Supabase.

Until that decision:

- do not seed,
- do not switch read path,
- do not apply SQL,
- do not mark Sprint 03 as migration-ready.
