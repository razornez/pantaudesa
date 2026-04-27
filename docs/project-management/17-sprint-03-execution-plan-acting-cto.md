# Sprint 03 Execution Plan — Acting CTO Mode

## Status

Ready for Ujang as Acting CTO.

Asep tidak lagi menjadi dependency aktif. Ujang ditunjuk sebagai Acting CTO + Software Engineer + QA Executor.

## Sprint name

Sprint 03 — Database-backed Demo Data Foundation

## Goal

Mulai pindah dari static mock data menuju database-backed demo data.

Target Sprint 03 bukan data resmi, bukan scheduler, bukan scraper.

Target Sprint 03:

- schema minimal tersedia,
- seed demo kecil tersedia,
- service layer read-only tersedia,
- minimal satu read path mulai bisa pakai service,
- data tetap diberi status `demo`,
- mock fallback belum dihapus.

## Critical rule

Kejar deadline boleh, tapi jangan merusak trust dan schema.

Semua perubahan harus kecil, bertahap, dan bisa divalidasi.

## Execution phases

## S3-00 — Acting CTO decision note

Status: ready

Output:

`docs/engineering/19-sprint-03-acting-cto-decision-note.md`

Isi minimal:

- keputusan Ujang sebagai Acting CTO,
- model yang akan dibuat,
- enum yang akan dibuat,
- kenapa mulai minimal,
- risiko utama,
- rollback plan,
- command QA yang akan dijalankan,
- batas yang tidak akan disentuh.

Done when:

- [ ] Decision note dibuat sebelum code/schema berubah.

## S3-01 — Minimal Prisma schema

Status: ready after S3-00

Files:

- `prisma/schema.prisma`

Task:

Tambahkan model minimal:

- `Desa`
- `AnggaranDesaSummary`
- `APBDesItem`
- `DokumenPublik`
- `DataSource`

Tambahkan enum minimal:

- `DataStatus`
- `StatusSerapan`
- `DocumentStatus`
- `SourceType`

Rules:

- Jangan ubah auth/user/voice model existing kecuali benar-benar perlu.
- Jangan relation-kan `Voice.desaId` ke `Desa` di Sprint 03.
- Jangan membuat model scheduler/scraper/import batch dulu.
- Semua model harus mendukung `dataStatus`.

Validation wajib:

- `npx prisma validate`
- `npx prisma generate`
- `npx tsc --noEmit`

Done when:

- [ ] Prisma schema valid.
- [ ] Prisma client generate berhasil atau error dicatat jelas.
- [ ] TypeScript check jalan.

## S3-02 — Demo seed plan and script

Status: ready after S3-01

Files possible:

- `prisma/seed.ts` or agreed seed file
- `package.json` if seed script needed

Task:

- Buat seed demo 3-5 desa.
- Semua data status harus `demo`.
- Seed minimal harus cukup untuk homepage/list/detail dasar.
- Jangan klaim data official/verified.

Seed minimal includes:

- Desa identity.
- Anggaran summary.
- APBDes items minimal.
- Dokumen publik minimal.
- DataSource demo.

Validation:

- command seed jika DB env tersedia.
- jika DB env tidak tersedia, tulis blocked/needs-env.

Done when:

- [ ] Seed script ada.
- [ ] Data seed memakai status demo.
- [ ] Cara menjalankan seed terdokumentasi.

## S3-03 — Read-only service layer

Status: ready after S3-01/S3-02

Files possible:

- `src/lib/data/desa-service.ts`
- `src/lib/data/desa-mapper.ts`

Task:

Buat service read-only:

- `getDesaList()`
- `getDesaByIdOrSlug()`
- `getHomeStats()`

Rules:

- Service boleh punya fallback mock sementara kalau DB/env belum ready, tapi fallback harus eksplisit.
- Jangan langsung ubah semua page.
- Jangan hapus `mock-data.ts`.
- Data status harus terbawa ke output.

Validation:

- unit test/mapper test jika memungkinkan.
- `npx tsc --noEmit`.

Done when:

- [ ] Service layer ada.
- [ ] Return shape jelas.
- [ ] Fallback behavior terdokumentasi.

## S3-04 — Switch one low-risk read path

Status: ready after S3-03

Target recommended:

- Mulai dari `/desa` list atau homepage stats, bukan detail desa penuh.

Reason:

Detail desa paling kompleks karena nested data banyak.

Rules:

- Switch hanya satu read path.
- Mock fallback tetap ada.
- Jika DB/env tidak siap, app tetap bisa jalan.
- Data demo notice tetap tampil.

Done when:

- [ ] Satu halaman/section membaca dari service.
- [ ] No major UX regression.
- [ ] Smoke test dicatat.

## S3-05 — QA report

Status: ready after every phase

Output:

`docs/engineering/20-sprint-03-qa-report.md`

Wajib catat:

- command run,
- pass/fail,
- existing issue,
- new issue,
- screenshot/manual smoke note jika ada,
- decision apakah lanjut/stop.

Commands recommended:

- `npx prisma validate`
- `npx prisma generate`
- `npx tsc --noEmit`
- `npm run test`
- `npm run lint`
- `npm run build` jika environment memungkinkan
- smoke homepage/list/detail

## Stop conditions

Ujang wajib stop kalau:

- Prisma validate gagal karena schema baru.
- Prisma generate gagal karena perubahan schema baru dan bukan existing EPERM issue.
- TypeScript error muncul dari perubahan baru.
- Public route utama blank/error.
- Data demo terlihat seperti verified.
- Perlu mengubah auth/voice relation/API/scheduler/scraper.

## Suggested commit sequence

Commit 1:

```txt
docs(engineering): add Sprint 03 acting CTO decision note

Initiated-by: Iwan (CEO)
Reviewed-by: Ujang (Acting CTO)
Executed-by: Ujang (Programmer)
Status: ready
Backlog: #4 #13
```

Commit 2:

```txt
feat(data): add minimal desa data schema

Initiated-by: Iwan (CEO)
Reviewed-by: Ujang (Acting CTO)
Executed-by: Ujang (Programmer)
Status: partial
Backlog: #4
```

Commit 3:

```txt
feat(data): add demo seed for desa data

Initiated-by: Iwan (CEO)
Reviewed-by: Ujang (Acting CTO)
Executed-by: Ujang (Programmer)
Status: partial
Backlog: #4
```

Commit 4:

```txt
feat(data): add read-only desa service layer

Initiated-by: Iwan (CEO)
Reviewed-by: Ujang (Acting CTO)
Executed-by: Ujang (Programmer)
Status: partial
Backlog: #4
```

## Report to Iwan

```text
Iwan, Sprint 03 phase [S3-XX] selesai.
Commit: [hash]
Done:
- ...
QA:
- prisma validate: ...
- prisma generate: ...
- typecheck: ...
- test: ...
- lint/build: ...
Known risks:
- ...
Need Iwan review:
- product/data trust alignment
```

## Final note

Sprint 03 boleh dimulai sekarang, tapi harus bertahap.

Tujuan kita bukan langsung sempurna. Tujuan kita adalah mulai punya database-backed demo data tanpa menghancurkan trust dan arsitektur.

Initiated-by: Iwan (CEO)
Reviewed-by: Ujang (Acting CTO)
Executed-by: Iwan (CEO)
Status: ready
Backlog: #4 #13
