# Ujang Learning Brief — During Asep Leave

## Status

Asep akan tidak available dalam waktu cukup lama.

Ujang belum boleh langsung mengerjakan Sprint 03 Data Foundation tanpa CTO review. Namun Ujang harus mulai mempelajari semua hal yang dibutuhkan supaya saat Asep kembali, proses review dan implementasi bisa lebih cepat.

## Goal

Mempersiapkan Ujang untuk Sprint 03:

> Pindah dari static mock data menuju database-backed dummy data.

Target Sprint 03 nanti:

- data masih boleh dummy/demo,
- tapi mulai dibaca dari database,
- bukan lagi hanya dari `src/lib/mock-data.ts`.

## What Ujang must study

## 1. Current data flow

Ujang harus memahami dulu data sekarang datang dari mana.

Baca dan pahami:

- `src/lib/mock-data.ts`
- `src/lib/types.ts`
- `src/app/page.tsx`
- `src/app/desa/page.tsx` jika ada
- `src/app/desa/[id]/page.tsx`
- komponen yang memakai data desa

Pertanyaan yang harus bisa dijawab Ujang:

- Data desa sekarang berasal dari file apa?
- Field apa saja yang dipakai homepage?
- Field apa saja yang dipakai detail desa?
- Field mana yang benar-benar wajib untuk MVP?
- Field mana yang hanya tambahan visual?

## 2. Prisma basics

Ujang harus memahami:

- apa itu Prisma schema,
- apa itu model,
- apa itu relation,
- apa itu enum,
- apa itu migration,
- apa itu seed,
- cara generate Prisma client,
- risiko mengubah schema sembarangan.

Baca file kalau sudah ada:

- `prisma/schema.prisma`
- `package.json` scripts terkait Prisma
- `.env.example`

Jangan ubah schema dulu tanpa instruksi Asep/Iwan.

## 3. Supabase/PostgreSQL basics

Ujang harus memahami konsep:

- database PostgreSQL,
- table,
- primary key,
- foreign key,
- relation one-to-many,
- enum/status,
- connection string,
- Supabase sebagai managed Postgres,
- perbedaan `DATABASE_URL` dan `DIRECT_URL` jika dipakai.

Target pemahaman:

- kenapa data desa harus masuk table,
- kenapa APBDes item harus relation ke desa,
- kenapa data status penting,
- kenapa source data perlu dicatat.

## 4. Minimal data model for PantauDesa

Ujang harus pelajari draft Sprint 03:

- `docs/project-management/13-sprint-03-data-foundation-plan.md`

Model yang harus dipahami:

1. `Desa`
2. `AnggaranDesaSummary`
3. `APBDesItem`
4. `DokumenPublik`
5. `DataSource`

Ujang harus bisa menjelaskan:

- kenapa model ini dipisah,
- relation antar model,
- field minimal yang wajib ada,
- mana field yang bisa optional,
- mana yang perlu enum.

## 5. Data status lifecycle

Ujang harus paham status data:

- `demo`
- `imported`
- `needs_review`
- `verified`
- `outdated`
- `rejected`

Pertanyaan yang harus bisa dijawab:

- Kapan data disebut demo?
- Kapan data disebut imported?
- Kenapa imported belum tentu verified?
- Kenapa data tidak boleh langsung tampil sebagai resmi?
- Bagaimana UI menunjukkan status data?

## 6. Seed dummy data

Ujang harus belajar konsep seed:

- seed adalah data awal untuk database,
- seed bisa berisi dummy/demo data,
- seed membantu development dan demo,
- seed tidak sama dengan data verified.

Target Sprint 03 nanti:

- seed beberapa desa demo ke database,
- homepage/detail desa bisa baca dari database demo,
- data tetap diberi label demo.

## 7. Service layer

Ujang harus pahami kenapa UI tidak boleh langsung mengambil data sembarangan.

Konsep service layer:

- `getDesaList()`
- `getDesaByIdOrSlug()`
- `getHomeStats()`
- `getFeaturedDesa()`

Target:

- UI memanggil function service,
- service bisa ambil dari DB,
- fallback/mock bisa dipikirkan nanti dengan arahan Asep.

## 8. What not to do

Selama Asep cuti, Ujang tidak boleh:

- mengubah `prisma/schema.prisma`,
- membuat migration,
- membuat table Supabase,
- mengubah auth flow,
- membuat API route baru,
- membuat scraper,
- membuat scheduler,
- membuat admin import,
- menghapus `mock-data.ts`,
- mengganti read path utama tanpa review.

Belajar boleh. Implementasi belum.

## Study tasks for Ujang

## L-01 — Map current mock data usage

Status: todo

Output yang diminta:

Buat catatan di `docs/engineering/02-current-data-flow-map.md`.

Isi minimal:

- daftar file yang memakai `mockDesa`,
- field data yang dipakai homepage,
- field data yang dipakai detail desa,
- field yang wajib untuk MVP,
- field yang bisa ditunda.

## L-02 — Draft Prisma model understanding

Status: todo

Output yang diminta:

Buat catatan di `docs/engineering/03-prisma-model-notes.md`.

Isi minimal:

- model yang menurut Ujang dibutuhkan,
- relation antar model,
- field minimal,
- pertanyaan untuk Asep sebelum implementasi.

Jangan ubah `schema.prisma`.

## L-03 — Draft service layer plan

Status: todo

Output yang diminta:

Buat catatan di `docs/engineering/04-data-service-layer-plan.md`.

Isi minimal:

- function apa saja yang dibutuhkan,
- halaman mana yang memakai function tersebut,
- data apa yang harus dikembalikan,
- risiko jika langsung pindah dari mock ke DB.

## L-04 — Prepare questions for Asep

Status: todo

Output yang diminta:

Buat daftar pertanyaan di `docs/engineering/05-questions-for-asep-data-foundation.md`.

Contoh pertanyaan:

- Apakah `Desa` perlu pakai slug atau id saja?
- Apakah `AnggaranDesaSummary` dipisah dari `Desa`?
- Apakah `dataStatus` enum global atau string?
- Apakah seed masuk Prisma seed atau script sendiri?
- Apakah perlu fallback ke mock data?

## Definition of done for learning phase

Learning phase dianggap selesai jika:

- [ ] Ujang membuat data flow map.
- [ ] Ujang membuat Prisma model notes.
- [ ] Ujang membuat service layer plan.
- [ ] Ujang membuat questions for Asep.
- [ ] Tidak ada perubahan schema/API/auth/scheduler.

## Report format to Iwan

```text
Iwan, learning phase data foundation sudah selesai.
Commit: [hash]
Done:
- L-01 current data flow map
- L-02 prisma model notes
- L-03 service layer plan
- L-04 questions for Asep
Tidak ada perubahan schema/API/auth/scheduler.
Perlu dicek Iwan:
- apakah catatan sudah cukup jelas untuk Asep review nanti
```

## Prompt for Ujang

```text
Ujang, baca `docs/engineering/01-ujang-learning-brief-during-asep-leave.md`.
Asep akan cuti lama, jadi kamu belum boleh implement Sprint 03 Data Foundation, tapi kamu harus mempelajari dan menyiapkan catatan teknisnya.
Kerjakan L-01 sampai L-04 saja.
Jangan ubah schema, API, auth, scheduler, scraper, atau database.
Output semuanya dalam docs/engineering.
```

## Iwan note

Ini bukan sprint implementation. Ini preparation agar saat Asep kembali, keputusan Sprint 03 bisa cepat dan tidak mulai dari nol.

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Direction)
Executed-by: Iwan (CEO)
Status: ready
Backlog: #4 #13
