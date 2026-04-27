# Ujang Source Architecture Summary

Assessment task: A-01
Status: draft for Iwan review

## Scope

Dokumen ini merangkum pemahaman Ujang atas source code aktual sebelum Sprint 03 Data Foundation. Tidak ada perubahan kode runtime, schema, API, auth, scheduler, scraper, database, atau read path dari mock ke DB.

## Struktur source code

Repo ini memakai Next.js App Router.

Struktur utama:

- `src/app`: route pages, layouts, route handlers, error boundaries.
- `src/components`: komponen UI per domain, terutama `home`, `desa`, `layout`, `suara`, `ui`, dan `user`.
- `src/lib`: domain helpers, mock data, copy source of truth, auth/db helpers, profile helpers, verdicts, voice helpers, utilities.
- `prisma/schema.prisma`: schema database untuk auth, user, OTP, dan voice. Belum ada model data desa.
- `docs`: arah bisnis, product, sprint plan, engineering learning docs, dan review Iwan/Asep.
- `public/images`: aset visual UI.

## Route penting di `src/app`

Public/civic pages:

- `src/app/page.tsx`: homepage.
- `src/app/desa/page.tsx`: daftar desa dengan search/filter/sort/pagination client-side.
- `src/app/desa/[id]/page.tsx`: detail desa.
- `src/app/desa/[id]/suara/page.tsx`: suara warga per desa.
- `src/app/suara/page.tsx`: daftar suara warga.
- `src/app/bandingkan/page.tsx`: compare desa.
- `src/app/tentang/kenapa-desa-dipantau/page.tsx`: civic narrative.
- `src/app/panduan/kewenangan/page.tsx`: panduan kewenangan.
- `src/app/badge/page.tsx`: edukasi badge.
- `src/app/profil/[username]/page.tsx` dan `src/app/profil/saya/page.tsx`: profil publik/pribadi.

Auth/admin/API:

- `src/app/login/*`, `src/app/daftar/page.tsx`, `src/app/lupa-pin/page.tsx`: auth UX.
- `src/app/api/auth/*`: register, login, OTP, reset PIN, NextAuth.
- `src/app/api/users/*`: user profile/PIN/avatar endpoints.
- `src/app/api/voices/*`: voice endpoints, vote, helpful.
- `src/app/admin/page.tsx` dan `src/app/desa-admin/*`: admin/demo admin surfaces.

## Homepage dan dependensinya

File utama: `src/app/page.tsx`.

Data yang dipakai:

- `mockDesa`
- `mockSummaryStats`
- `mockTrendData`

Komponen utama:

- `HeroSection`
- `PondasiTransparansiSection`
- `StatsCards`
- `AlertDiniSection`
- `TrendChart`
- `SerapanDonut`
- `DesaLeaderboard`

Transformasi data di homepage:

- `topBaik`: desa status `baik`, sort dari serapan tertinggi, ambil 5.
- `topRendah`: desa status `rendah`, sort dari serapan terendah, ambil 5.
- `provinsiRanking`: reduce `mockDesa` per provinsi, rata-rata `persentaseSerapan`, nama desa terbaik.

Field sensitif:

- `id`, `nama`, `kabupaten`, `provinsi`
- `totalAnggaran`, `terealisasi`, `persentaseSerapan`
- `status`
- `riwayat`
- summary agregat nasional

Catatan arsitektur:

- Homepage saat ini tidak query DB untuk data desa.
- Agregasi nasional masih dihitung dari static mock. Saat pindah DB, bagian ini butuh service seperti `getHomeStats()` dan `getFeaturedDesa()`.

## Halaman daftar desa dan dependensinya

File utama: `src/app/desa/page.tsx`.

Data yang dipakai:

- `mockDesa`
- `provinsiList`

Komponen:

- `SearchFilterBar`
- `DesaCard`
- `DesaTable`

Perilaku:

- Client component.
- Search/filter/sort/pagination dilakukan di browser dengan `useMemo`.
- Sort field saat ini terbatas ke `nama`, `totalAnggaran`, `persentaseSerapan`, `terealisasi`.

Risiko saat pindah DB:

- Jika data desa banyak, client-side filtering dengan seluruh dataset tidak scalable.
- Perlu keputusan apakah Sprint 03 tetap preload data demo kecil atau mulai server-side query.
- Shape data list harus tetap cocok dengan `DesaCard` dan `DesaTable`.

## Halaman detail desa dan dependensinya

File utama: `src/app/desa/[id]/page.tsx`.

Data yang dipakai:

- `mockDesa` untuk `generateStaticParams()`, `generateMetadata()`, dan page render.
- `getVoicesForDesa()` dari `src/lib/citizen-voice.ts` untuk preview suara warga statis.
- `DATA_DISCLAIMER` dan `DATA_STATUS_COPY` untuk trust notice data demo.

Komponen detail:

- `DownloadButton`
- `DesaHeroCard`
- `KelengkapanDesa`
- `SeharusnyaAdaSection`
- `KinerjaAnggaranCard`
- `ResponsibilityGuideCard`
- `TransparansiCard`
- `TanggungJawabSection`

Data nested yang dipakai detail:

- `pendapatan`
- `apbdes`
- `outputFisik`
- `riwayat`
- `dokumen`
- `skorTransparansi`
- `perangkat`
- `profil`
- `profil.aset`, `profil.fasilitas`, `profil.lembaga`, `profil.bumdes`, `profil.badge`

Risiko terbesar:

- `generateStaticParams()` saat ini membaca mock synchronously. Jika DB dipakai saat build, build bisa gagal jika env/DB belum siap.
- Banyak komponen mengharapkan nested data untuk pengalaman visual. Jika model Sprint 03 minimal belum punya semua field, perlu fallback/empty state.
- Detail desa adalah halaman paling sensitif terhadap dataStatus karena user membaca angka spesifik desa.

## Current mock data flow

Source of truth: `src/lib/mock-data.ts`.

Export penting:

- `mockDesa`
- `mockTrendData`
- `mockSummaryStats`
- `provinsiList`
- `kategoriList`

Type shape: `src/lib/types.ts`.

File yang langsung import `mockDesa`:

- `src/app/page.tsx`
- `src/app/desa/page.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/app/desa/[id]/suara/page.tsx`
- `src/app/suara/page.tsx`
- `src/app/bandingkan/page.tsx`
- `src/app/profil/saya/page.tsx`
- `src/app/profil/[username]/page.tsx`
- `src/app/desa-admin/page.tsx`
- `src/app/desa-admin/profil/page.tsx`
- `src/components/suara/VoiceStats.tsx`

## Existing Prisma/Auth/Voice architecture

DB helper:

- `src/lib/db.ts` membuat singleton `PrismaClient` dari `src/generated/prisma`.

Auth:

- `src/lib/auth.ts` memakai NextAuth v5.
- Adapter: `PrismaAdapter(db)`.
- Providers: Resend dan Credentials PIN.
- Session strategy: JWT.
- Avatar sengaja tidak masuk JWT untuk menghindari cookie session terlalu besar.

Prisma schema saat ini:

- User/auth models: `User`, `Account`, `Session`, `VerificationToken`.
- OTP: `OtpCode`, `OtpPurpose`.
- Voice: `Voice`, `VoiceReply`, `VoiceVote`, `VoiceHelpful`.
- Enums: `Role`, `VoiceCategory`, `VoiceStatus`, `VoteType`.

Voice:

- `Voice.desaId` masih `String`, belum relation ke model `Desa`.
- `src/app/api/voices/route.ts` sudah memakai DB untuk voices.
- `src/lib/citizen-voice.ts` masih punya static helper/mock untuk beberapa UI.
- `src/lib/voices-api.ts` adalah client helper yang memanggil `/api/voices`.

Konsekuensi untuk Sprint 03:

- Model desa baru jangan langsung memaksa relation ke `Voice` tanpa migration strategy.
- Auth dan voice sudah menyentuh DB, jadi schema change harus hati-hati agar tidak mematahkan fitur existing.

## Copy source of truth dan trust layer

File: `src/lib/copy.ts`.

Copy penting untuk data trust:

- `DATA_DISCLAIMER.short`
- `DATA_DISCLAIMER.detailTitle`
- `DATA_DISCLAIMER.detailBody`
- `DATA_STATUS_COPY.demo/imported/verified`
- `FOOTER.note`

Trust layer saat ini:

- Homepage menampilkan `DATA_DISCLAIMER.short`.
- Detail desa menampilkan notice `Data demo` setelah hero.
- Footer memakai wording konsisten dari `DATA_DISCLAIMER.short`.

Konsekuensi:

- Sprint 03 harus menghubungkan `dataStatus` ke trust layer, bukan menghapus notice.
- Data demo/imported/verified harus tetap terbaca sebagai status berbeda.

## Komponen paling sensitif terhadap perubahan data

Sangat sensitif:

- `src/app/desa/[id]/page.tsx`: detail memakai banyak nested data dan static params.
- `src/app/page.tsx`: agregasi homepage dan ranking.
- `src/app/desa/page.tsx`: filtering/sorting/pagination data desa.
- `src/components/desa/DesaHeroCard.tsx`: identitas, progress, profil, badge.
- `src/components/desa/KinerjaAnggaranCard.tsx`: output fisik, APBDes, chart, riwayat.
- `src/components/desa/TransparansiCard.tsx`: skor, perangkat, dokumen.
- `src/components/desa/KelengkapanDesa.tsx`: profil visual besar.
- `src/components/home/StatsCards.tsx`, `AlertDiniSection.tsx`, `DesaLeaderboard.tsx`.

Bisa menerima data minimal lebih mudah:

- `DesaCard`
- `DesaTable`
- `SearchFilterBar`
- `StatsCards` jika summary sudah tersedia.
- `SerapanDonut` jika summary sudah tersedia.

## File yang tidak boleh sembarangan diubah

Tanpa CTO review, jangan ubah:

- `prisma/schema.prisma`
- `prisma.config.ts`
- `src/lib/db.ts`
- `src/lib/auth.ts`
- `src/app/api/auth/*`
- `src/app/api/users/*`
- `src/app/api/voices/*`
- `src/app/api/debug/health/route.ts`
- scheduler/scraper/admin import jika nanti ada.
- read path utama `src/app/page.tsx`, `src/app/desa/page.tsx`, dan `src/app/desa/[id]/page.tsx` dari mock ke DB.

## Risiko terbesar dari perubahan data layer

- Data demo bisa terlihat seperti data resmi jika `dataStatus` tidak dirancang jelas.
- DB-backed detail bisa gagal build karena `generateStaticParams()` membutuhkan DB/env.
- UI detail bisa pecah jika nested data minimal belum tersedia.
- Query langsung dari UI di banyak tempat akan membuat transisi susah dikontrol.
- `Voice.desaId` bisa orphan atau tidak cocok jika format ID/slug desa berubah.
- Schema uang/persentase salah bisa merusak agregasi, leaderboard, dan trust.
- Fallback mock/DB yang tidak jelas bisa mencampur data demo, imported, dan verified.

