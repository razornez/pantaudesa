# Ujang Sprint 03 Proposal Pack — Docs Only

## Status

Ready for Ujang.

Asep masih tidak available. Ujang boleh lanjut kerja dalam bentuk proposal teknis dan QA planning, tapi belum boleh implement database/schema.

## Goal

Membuat Sprint 03 Data Foundation siap dieksekusi nanti dengan risiko lebih rendah.

Karena kita dikejar deadline, Ujang tidak boleh idle. Tapi karena schema berpengaruh ke bisnis, Ujang tidak boleh langsung implement.

Jadi task sekarang adalah membuat proposal pack detail.

## Rules

Ujang boleh:

- membaca source code,
- menjalankan command lokal,
- membuat proposal docs,
- membuat ERD draft di markdown,
- membuat QA plan,
- membuat risk register,
- menulis rekomendasi teknis.

Ujang tidak boleh:

- mengubah `prisma/schema.prisma`,
- membuat migration,
- mengubah Supabase/database,
- membuat API route,
- mengubah auth flow,
- mengubah read path dari mock ke DB,
- membuat scheduler,
- membuat scraper,
- deploy.

## Batch tasks

## P-01 — Proposed Schema

File output:

`docs/engineering/13-sprint-03-proposed-schema.md`

Isi minimal:

- Proposed model `Desa`.
- Proposed model `AnggaranDesaSummary`.
- Proposed model `APBDesItem`.
- Proposed model `DokumenPublik`.
- Proposed model `DataSource`.
- Proposed enum `DataStatus`.
- Proposed enum `StatusSerapan`.
- Proposed enum `DocumentStatus`.
- Proposed enum `SourceType`.
- Relation antar model.
- Field wajib vs optional.
- Field yang sengaja ditunda.
- Catatan keputusan yang masih harus menunggu CTO.

Format yang diminta:

- Boleh pakai pseudo-Prisma code block.
- Jangan ubah file `prisma/schema.prisma`.

## P-02 — Proposed Service Contract

File output:

`docs/engineering/14-sprint-03-proposed-service-contract.md`

Isi minimal:

- `getHomeStats()`
- `getHomeTrend()`
- `getFeaturedDesa()`
- `getDesaList(params)`
- `getDesaByIdOrSlug(idOrSlug)`
- `getDesaStaticParams()`
- `getProvinsiList()`

Untuk setiap function, tulis:

- input,
- output,
- data source,
- fallback behavior,
- page/component yang memakai,
- risk.

## P-03 — Seed and Migration Plan

File output:

`docs/engineering/15-sprint-03-seed-and-migration-plan.md`

Isi minimal:

- urutan aman membuat migration nanti,
- seed strategy untuk 3-5 desa demo,
- field minimal yang harus ada di seed,
- cara memastikan semua seed berstatus `demo`,
- command validasi yang perlu dijalankan,
- rollback consideration,
- hal yang tidak boleh dilakukan.

Catatan:

Ini hanya plan. Jangan membuat migration.

## P-04 — Risk Register

File output:

`docs/engineering/16-sprint-03-risk-register.md`

Isi minimal:

Buat table:

- Risk
- Impact
- Likelihood
- Mitigation
- Owner
- Status

Wajib mencakup:

- build gagal karena Prisma generate,
- lint existing fail,
- generateStaticParams DB risk,
- data demo terlihat seperti data resmi,
- Voice.desaId relation risk,
- fallback mock/DB confusion,
- nested data detail hilang,
- client-side filtering scale issue,
- money precision issue,
- wrong schema hurting business trust.

## P-05 — Sprint 03 QA Plan

File output:

`docs/engineering/17-sprint-03-qa-plan.md`

Isi minimal:

- command QA yang wajib dijalankan,
- manual smoke test route,
- data trust checks,
- regression checks untuk homepage/list/detail/suara/auth,
- what counts as pass,
- what counts as block,
- known existing issue from validation report.

## P-06 — Proposal Pack Summary for Iwan

File output:

`docs/engineering/18-sprint-03-proposal-pack-summary.md`

Isi minimal:

- ringkasan keputusan yang Ujang rekomendasikan,
- keputusan yang masih harus menunggu CTO,
- urutan implementasi yang disarankan,
- bagian paling berisiko,
- hal yang bisa dikerjakan cepat setelah approval,
- hal yang tidak boleh dikerjakan tanpa CTO.

## Required QA report

Setelah membuat docs, Ujang tetap harus menjalankan validation ringan:

```md
## QA Report — Ujang

### Commands run
- [ ] npm run test
- [ ] npx tsc --noEmit
- [ ] npx prisma validate
- [ ] npm run lint
- [ ] npm run build, jika environment memungkinkan

### Results
- Test:
- Typecheck:
- Prisma validate:
- Lint:
- Build:

### Known existing issues
- ...

### New issues introduced
- Harusnya tidak ada, karena hanya docs.
```

Jika command gagal karena existing issue, tulis apa adanya.

## Suggested commit message

```txt
docs(engineering): add Sprint 03 data foundation proposal pack

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Direction)
Executed-by: Ujang (Programmer/QA)
Status: ready-for-product-review
Backlog: #4 #13
```

## Report to Iwan

```text
Iwan, Sprint 03 proposal pack sudah selesai.
Commit: [hash]
Done:
- P-01 proposed schema
- P-02 service contract
- P-03 seed and migration plan
- P-04 risk register
- P-05 QA plan
- P-06 proposal summary
QA:
- test: ...
- typecheck: ...
- prisma validate: ...
- lint: ...
- build: ...
Tidak ada perubahan schema/API/auth/scheduler/scraper/database.
Perlu dicek Iwan:
- apakah proposal cukup jelas untuk jadi bahan CTO review nanti
```

## Iwan verification scope

Iwan akan cek:

- apakah proposal selaras dengan bisnis,
- apakah risiko bisnis/trust cukup dijaga,
- apakah docs cukup jelas untuk Asep nanti,
- apakah Ujang tidak membuka implementasi diam-diam.

Iwan tidak review detail correctness schema seperti CTO.

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Direction)
Executed-by: Iwan (CEO)
Status: ready
Backlog: #4 #13
