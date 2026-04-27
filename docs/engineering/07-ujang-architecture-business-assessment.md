# Ujang Architecture and Business Assessment Gate

## Status

Ready for Ujang.

Asep sedang cuti / tidak available. Karena itu, sebelum Sprint 03 Data Foundation dieksekusi, Ujang harus membuktikan bahwa dia memahami source code, arsitektur, data flow, dan goal bisnis PantauDesa secara cukup detail.

Ini bukan implementasi. Ini assessment dan preparation.

## Why this matters

Sprint 03 akan menyentuh schema, database, Prisma, Supabase, service layer, dan data model.

Kesalahan membuat skema bisa berdampak langsung ke bisnis:

- data sulit scale,
- import data nanti berantakan,
- trust layer tidak akurat,
- fitur kontribusi warga sulit disambungkan,
- admin/import/scheduler nanti jadi mahal diperbaiki,
- data dummy bisa tercampur dengan data verified,
- user bisa salah memahami data sebagai resmi,
- roadmap bisnis bisa melambat.

Karena itu Ujang tidak boleh langsung membuat table/schema hanya berdasarkan tebakan.

## Main instruction from Iwan

Ujang harus mempelajari dan membuktikan pemahaman terhadap:

1. Goal bisnis PantauDesa.
2. Product strategy dan civic trust.
3. Source code structure.
4. Current mock data flow.
5. Existing Prisma/Auth/Voice models.
6. UI components yang bergantung pada data desa.
7. Risiko transisi dari static mock ke database.
8. Data model minimal yang mendukung bisnis.
9. Area teknis yang biasanya di-handle Asep.
10. Perintah-perintah lokal yang perlu dijalankan untuk validasi.

## Important rule

Ujang boleh menjalankan command lokal untuk membaca, mengecek, dan memahami project.

Ujang boleh menjalankan command seperti:

- `npm install` jika dependency belum ada.
- `npm run lint`.
- `npm run typecheck` jika tersedia.
- `npm run build` jika environment memungkinkan.
- `npm test` atau `npm run test` jika tersedia.
- `npx prisma validate`.
- `npx prisma format --check` jika cocok.
- command pencarian source code seperti `grep`, `rg`, atau search VSCode.

Tapi Ujang tidak boleh melakukan perubahan berisiko tanpa approval:

- jangan ubah `prisma/schema.prisma`,
- jangan buat migration,
- jangan push perubahan database,
- jangan ubah auth flow,
- jangan buat API baru,
- jangan buat scheduler,
- jangan buat scraper,
- jangan ubah read path dari mock ke DB,
- jangan deploy.

## Business understanding checklist

Ujang harus bisa menjawab:

- Kenapa PantauDesa dibuat?
- Siapa user utama?
- Kenapa bahasa harus mudah dipahami warga awam?
- Kenapa data demo harus diberi label jelas?
- Kenapa data verified tidak boleh dicampur dengan demo/imported?
- Kenapa desa harus dipantau dengan tone adil, bukan menyerang?
- Kenapa auth harus menjadi pintu partisipasi, bukan paywall?
- Kenapa badge harus jadi reputasi kontribusi, bukan gimmick?
- Kenapa data model yang salah bisa mempengaruhi bisnis?

## Source code understanding checklist

Ujang harus bisa menjelaskan:

- Struktur folder `src/app`.
- Struktur komponen utama homepage.
- Struktur halaman daftar desa.
- Struktur halaman detail desa.
- Bagaimana `mockDesa` dipakai.
- Bagaimana `mockSummaryStats` dan `mockTrendData` dipakai.
- Komponen mana saja yang butuh field `Desa` lengkap.
- Komponen mana yang bisa menerima data minimal.
- Bagaimana auth saat ini bekerja secara garis besar.
- Model Prisma yang sudah ada.
- Fitur suara warga dan relasinya ke `desaId`.
- Copy source of truth di `src/lib/copy.ts`.
- Trust layer data demo di homepage dan detail desa.

## Architecture understanding checklist

Ujang harus bisa menjelaskan:

- Kenapa perlu service layer.
- Kenapa UI sebaiknya tidak langsung query database di banyak tempat.
- Kenapa `Desa` dan `AnggaranDesaSummary` sebaiknya dipisah.
- Kenapa APBDes item sebaiknya relation, bukan semua JSON besar di `Desa`.
- Kenapa `DataSource` penting.
- Kenapa `dataStatus` penting.
- Risiko `generateStaticParams` jika data pindah ke DB.
- Risiko fallback mock/DB jika tidak dirancang jelas.
- Risiko mengubah `Voice.desaId` terlalu cepat.
- Risiko menyimpan persentase vs menghitung di service layer.

## CTO coverage Ujang must study while Asep is away

Karena Asep sedang tidak available, Ujang harus mempelajari area yang biasanya di-handle Asep, tetapi hanya untuk pemahaman dan persiapan.

Area yang harus dipelajari:

### 1. Prisma and database safety

- schema design,
- enum design,
- relation design,
- migration risk,
- seed strategy,
- Prisma client generation,
- build failure risk.

### 2. Supabase/PostgreSQL basics

- table design,
- primary key,
- foreign key,
- indexes,
- numeric field for money,
- timestamp fields,
- connection string.

### 3. Data migration strategy

- how to move from mock to DB gradually,
- how to avoid breaking UI,
- how to use service layer as adapter,
- how to keep demo label visible.

### 4. Testing and validation

- build check,
- lint check,
- type check,
- Prisma validate,
- seed validation,
- basic smoke test for homepage/detail desa.

### 5. Risk management

- what can break business trust,
- what can break data trust,
- what can break public pages,
- what must wait for CTO review.

## Required assessment outputs

Ujang harus membuat file berikut:

## A-01 — Source Code Architecture Summary

File:

`docs/engineering/08-ujang-source-architecture-summary.md`

Isi minimal:

- ringkasan struktur source code,
- halaman utama dan dependensinya,
- halaman detail desa dan dependensinya,
- komponen yang paling sensitif terhadap perubahan data,
- file yang tidak boleh sembarangan diubah,
- risiko terbesar dari perubahan data layer.

## A-02 — Business Goal and Data Model Alignment

File:

`docs/engineering/09-business-goal-data-model-alignment.md`

Isi minimal:

- goal bisnis PantauDesa,
- kenapa data model harus mendukung trust,
- bagaimana model `Desa`, `AnggaranDesaSummary`, `APBDesItem`, `DokumenPublik`, `DataSource` mendukung bisnis,
- risiko bisnis jika schema salah,
- bagaimana data status membantu user trust.

## A-03 — Local Validation Capability Report

File:

`docs/engineering/10-local-validation-capability-report.md`

Isi minimal:

- command yang tersedia di `package.json`,
- command yang sudah dicoba Ujang,
- hasil command,
- command yang gagal karena env/dependency,
- apa yang perlu disiapkan sebelum Sprint 03,
- apakah `npx prisma validate` bisa jalan,
- apakah build/lint/test bisa jalan.

Catatan:
Jika command tidak bisa dijalankan karena environment, tulis alasannya. Jangan mengarang hasil.

## A-04 — Sprint 03 Readiness Self-Assessment

File:

`docs/engineering/11-sprint-03-readiness-self-assessment.md`

Isi minimal:

- apa yang Ujang sudah paham,
- apa yang masih ragu,
- keputusan apa yang harus menunggu Asep,
- bagian mana yang aman Ujang kerjakan nanti,
- bagian mana yang tidak boleh Ujang kerjakan tanpa CTO review,
- rekomendasi urutan implementasi Sprint 03 menurut Ujang.

## Assessment criteria from Iwan

Iwan akan menilai:

- apakah Ujang benar-benar memahami goal bisnis,
- apakah Ujang memahami source code saat ini,
- apakah Ujang memahami risiko schema,
- apakah catatan cukup membantu Asep nanti,
- apakah Ujang tidak overconfident,
- apakah Ujang tahu batas mana yang harus menunggu CTO review.

## Pass criteria

Assessment dianggap pass jika:

- [ ] Ujang membuat A-01 sampai A-04.
- [ ] Semua catatan berbasis source code aktual, bukan asumsi.
- [ ] Ada hasil command lokal atau alasan jelas jika command tidak bisa dijalankan.
- [ ] Risiko bisnis dari schema salah dijelaskan.
- [ ] Risiko teknis dari schema/read path dijelaskan.
- [ ] Ada daftar keputusan yang harus menunggu Asep.
- [ ] Tidak ada perubahan schema/API/auth/scheduler/scraper.

## Fail criteria

Assessment dianggap belum pass jika:

- Ujang hanya menulis ulang dokumen tanpa membaca source code.
- Tidak ada mapping file aktual.
- Tidak ada hasil atau rencana command lokal.
- Meremehkan risiko schema.
- Menganggap scheduler/scraper boleh langsung dibuat.
- Mengubah schema tanpa approval.
- Tidak membedakan data demo/imported/verified.

## Prompt for Ujang

```text
Ujang, baca `docs/engineering/07-ujang-architecture-business-assessment.md`.

Karena Asep cuti lama, kamu harus membuktikan dulu bahwa kamu paham source code, arsitektur, data flow, dan goal bisnis PantauDesa sebelum Sprint 03 Data Foundation.

Kerjakan assessment A-01 sampai A-04:

1. `docs/engineering/08-ujang-source-architecture-summary.md`
2. `docs/engineering/09-business-goal-data-model-alignment.md`
3. `docs/engineering/10-local-validation-capability-report.md`
4. `docs/engineering/11-sprint-03-readiness-self-assessment.md`

Kamu boleh menjalankan command lokal untuk memahami project:
- npm run lint
- npm run build jika env memungkinkan
- npm run test jika tersedia
- npx prisma validate
- search source code pakai rg/grep/VSCode

Tapi jangan ubah schema, jangan buat migration, jangan ubah API/auth/scheduler/scraper/database, dan jangan pindahkan read path dari mock ke DB.

Output harus berbasis source code aktual dan hasil command nyata. Kalau command gagal, tulis alasan gagalnya.

Setelah selesai, report ke Iwan.
```

## Report format to Iwan

```text
Iwan, architecture and business assessment sudah selesai.
Commit: [hash]
Done:
- A-01 Source Code Architecture Summary
- A-02 Business Goal and Data Model Alignment
- A-03 Local Validation Capability Report
- A-04 Sprint 03 Readiness Self-Assessment
Tidak ada perubahan schema/API/auth/scheduler/scraper/database.
Perlu dicek Iwan:
- apakah pemahaman source code sudah cukup
- apakah risk assessment sudah cukup
- apakah siap disimpan untuk Asep nanti
```

## Iwan note

Ini adalah gate sebelum Sprint 03. Kalau Ujang tidak pass assessment ini, Sprint 03 Data Foundation tidak boleh dimulai.

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Direction)
Executed-by: Iwan (CEO)
Status: ready
Backlog: #4 #13
