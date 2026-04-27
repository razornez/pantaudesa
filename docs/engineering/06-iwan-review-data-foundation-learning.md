# Iwan Review — Data Foundation Learning Docs

Date: 2026-04-27
Reviewer: Iwan
Scope: Review clarity of Ujang learning notes for future Asep alignment.

## Context

Asep sedang cuti / tidak available. Review ini **bukan** untuk meminta Asep kembali atau langsung melibatkan Asep sekarang.

Tujuan review ini hanya memastikan dokumen Ujang sudah cukup jelas, lengkap, dan mudah dipakai saat Asep nanti kembali.

## Files reviewed

- `docs/engineering/02-current-data-flow-map.md`
- `docs/engineering/03-prisma-model-notes.md`
- `docs/engineering/04-data-service-layer-plan.md`
- `docs/engineering/05-questions-for-asep-data-foundation.md`

## Overall status

Status: accepted for future CTO alignment

Catatan Ujang sudah cukup jelas sebagai bahan handover ke Asep nanti.

Dokumen ini belum berarti Sprint 03 boleh langsung dieksekusi. Sprint 03 Data Foundation tetap butuh CTO review saat Asep available lagi atau saat ada pengganti review teknis yang jelas.

## Review summary

### L-01 — Current Data Flow Map

Status: good

Yang sudah bagus:

- Source of truth saat ini sudah jelas: `src/lib/mock-data.ts`.
- File yang memakai mock data sudah dipetakan cukup lengkap.
- Field homepage, daftar desa, dan detail desa sudah dipisahkan.
- Field wajib untuk MVP database-backed demo sudah ditulis.
- Risiko transisi dari mock ke DB sudah disebut, terutama `generateStaticParams`, agregasi homepage, nested optional data, dan relasi voice.

Catatan Iwan:

- Ini sudah sangat membantu Asep nanti karena menjelaskan data mana yang wajib dan mana yang bisa ditunda.
- Untuk tahap berikutnya, jangan implementasi dulu. Dokumen ini cukup sebagai mapping.

### L-02 — Prisma Model Notes

Status: good, needs CTO decision later

Yang sudah bagus:

- Ujang tidak mengubah `schema.prisma`, hanya menulis pemahaman.
- Model minimal sudah masuk akal: `Desa`, `AnggaranDesaSummary`, `APBDesItem`, `DokumenPublik`, `DataSource`.
- Enum yang dibutuhkan sudah dicatat: `DataStatus`, `StatusSerapan`, `DocumentStatus`, `SourceType`.
- Risiko mengubah schema sembarangan sudah jelas.
- Pertanyaan untuk Asep sudah relevan.

Catatan Iwan:

- Secara product direction, model minimal ini sudah sesuai arah kita: pindah dari static mock ke database-backed demo data.
- Tapi keputusan final soal relation, enum style, migration, dan seed tetap harus menunggu CTO review.

### L-03 — Data Service Layer Plan

Status: good

Yang sudah bagus:

- Ujang memahami bahwa UI tidak boleh terlalu tahu apakah data berasal dari mock atau DB.
- Function yang dibutuhkan sudah masuk akal: `getHomeStats`, `getHomeTrend`, `getFeaturedDesa`, `getDesaList`, `getDesaByIdOrSlug`, `getDesaStaticParams`, `getProvinsiList`.
- Risiko pindah langsung dari mock ke DB sudah ditulis dengan benar.
- Urutan implementasi setelah Asep approve sudah realistis.

Catatan Iwan:

- Ini penting untuk mencegah transisi data jadi berantakan.
- Service layer harus jadi jembatan, bukan langsung ubah semua page secara brutal.

### L-04 — Questions for Asep

Status: very good

Yang sudah bagus:

- Pertanyaan sudah lengkap dan dipisah per area: model inti, anggaran, APBDes, dokumen, data source, service layer, seed, integrasi existing, trust layer, risiko.
- Pertanyaan tentang `Voice.desaId`, fallback mock, `generateStaticParams`, dan status data sudah tepat.
- Ini akan membuat Asep lebih cepat align saat kembali.

Catatan Iwan:

- Jangan kirim atau minta Asep jawab sekarang. Simpan sebagai bahan saat Asep balik.
- Kalau nanti Asep available, file ini bisa jadi checklist CTO review Sprint 03.

## Iwan decision

Learning phase Ujang untuk Data Foundation: accepted.

Ujang sudah memenuhi tujuan learning phase:

- [x] Data flow map tersedia.
- [x] Prisma model notes tersedia.
- [x] Service layer plan tersedia.
- [x] Questions for Asep tersedia.
- [x] Tidak ada instruksi implementasi schema/API/auth/scheduler.

## What this means

Ujang boleh dianggap sudah siap secara pemahaman awal untuk Sprint 03 Data Foundation.

Tapi implementasi tetap belum boleh dimulai sampai ada keputusan teknis.

## What Ujang should do next

Ujang jangan lanjut implementasi database dulu.

Sambil menunggu instruksi baru, Ujang boleh:

- merapikan typo/docs kecil jika ada,
- membaca ulang data flow map,
- menyiapkan diri untuk menjelaskan dokumen ini ke Asep nanti,
- menunggu task baru dari Iwan.

Ujang tidak boleh:

- mengubah `prisma/schema.prisma`,
- membuat migration,
- membuat table Supabase,
- membuat API route baru,
- mengubah auth flow,
- membuat scheduler,
- membuat scraper,
- mengubah read path utama dari mock ke DB.

## What Iwan should do next

Iwan perlu menentukan apakah Sprint 02 masih lanjut dengan task aman lain, atau menahan dulu sampai Asep kembali untuk Sprint 03 Data Foundation.

Rekomendasi Iwan sementara:

- Tutup dulu learning phase data foundation sebagai accepted.
- Jangan panggil Asep dari cuti.
- Jika butuh task lanjut tanpa Asep, pilih task yang hanya copy/UI/docs.
- Jangan buka task teknis besar.

## Future prompt for Asep, not now

Prompt ini disimpan untuk nanti saat Asep kembali, bukan untuk dipakai sekarang:

```text
Asep, baca docs/engineering/02-current-data-flow-map.md sampai docs/engineering/06-iwan-review-data-foundation-learning.md.
Ujang sudah menyiapkan mapping dan pertanyaan untuk Sprint 03 Data Foundation.
Tolong review model, service layer, risiko, dan jawab pertanyaan penting sebelum Ujang implement schema atau database-backed dummy data.
```

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Direction)
Executed-by: Ujang (Programmer)
Status: reviewed
Backlog: #4 #13
