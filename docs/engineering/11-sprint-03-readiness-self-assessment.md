# Sprint 03 Readiness Self-Assessment

Assessment task: A-04
Status: draft for Iwan review

## Scope

Ini self-assessment Ujang sebelum Sprint 03 Data Foundation. Kesimpulan utama: Ujang sudah cukup memahami arah awal, tetapi belum boleh implement schema/database tanpa CTO review.

## Apa yang sudah Ujang pahami

### Product dan bisnis

- PantauDesa dibuat untuk membantu warga memahami dan mengawasi penggunaan anggaran desa dengan cara yang adil.
- Produk harus memakai bahasa warga awam, bukan bahasa birokrasi/keuangan yang sulit.
- PantauDesa tidak boleh terdengar menyerang desa. Tone harus membantu warga bertanya dengan data dan memahami kewenangan.
- Data demo harus diberi label jelas agar tidak dianggap resmi.
- Auth adalah layer partisipasi, bukan paywall.
- Badge adalah reputasi kontribusi, bukan hiasan.
- Model data yang salah bisa merusak trust, roadmap bisnis, dan peluang B2B/B2G transparency dashboard.

### Source code dan data flow

- Data desa publik saat ini berasal dari `src/lib/mock-data.ts`.
- Shape data desa ada di `src/lib/types.ts`.
- Homepage memakai `mockSummaryStats`, `mockTrendData`, dan `mockDesa`.
- Daftar desa melakukan filter/sort/pagination client-side dari `mockDesa`.
- Detail desa memakai `mockDesa` untuk static params, metadata, dan render.
- Detail desa adalah halaman paling bergantung pada nested data.
- Trust layer sudah ada di homepage, detail desa, dan footer melalui `src/lib/copy.ts`.
- Voice sudah punya model DB, tetapi `Voice.desaId` masih string dan belum relation ke model desa.

### Prisma dan DB safety

- Schema Prisma saat ini valid, tetapi belum punya model desa.
- Existing DB area sudah mencakup auth/user/OTP/voice.
- `src/lib/db.ts` memakai singleton Prisma client.
- Build menjalankan `prisma generate && next build`, jadi schema invalid atau generated client bermasalah akan memblokir build.
- Migration/schema change adalah area high risk.

### Service layer

- UI sebaiknya tidak langsung tahu apakah data dari mock atau DB.
- Service layer perlu menjadi adapter untuk `getHomeStats`, `getFeaturedDesa`, `getDesaList`, `getDesaByIdOrSlug`, dan static params.
- Shape compatibility penting agar UI tidak rusak saat data source diganti.
- Fallback mock/DB harus eksplisit agar data demo/imported/verified tidak tercampur.

## Apa yang masih ragu

- Apakah public route tetap berbasis `id` atau mulai memakai `slug`.
- Apakah `Voice.desaId` tetap string untuk Sprint 03 atau mulai relation ke `Desa`.
- Apakah `AnggaranDesaSummary` relation langsung ke `Desa` saja atau menjadi anchor untuk APBDes items.
- Apakah `persentaseRealisasi` disimpan di DB atau dihitung di service.
- Apakah `statusSerapan` disimpan atau dihitung.
- Apakah document status memakai enum `tersedia/belum/unknown`.
- Apakah `DataSource` harus relation ke setiap record atau cukup source global dulu.
- Apakah detail desa tetap static dengan `generateStaticParams()` atau dynamic saat DB digunakan.
- Apakah fallback mock diperbolehkan di production sementara.
- Apakah seed wajib mengisi data visual penuh atau cukup model minimal.

## Keputusan yang harus menunggu Asep/CTO

- Final Prisma model dan relation.
- Enum naming style dan mapping DB.
- Migration strategy.
- Seed strategy.
- DB fallback policy.
- Route strategy: `id` vs `slug`.
- `generateStaticParams` strategy saat data dari DB.
- Relasi `Voice` ke `Desa`.
- Apakah admin demo ikut pindah ke DB atau tetap mock.
- Batas minimal data nested yang harus tersedia sebelum detail desa dipindah.
- Build/CI gate untuk Sprint 03.

## Bagian yang aman Ujang kerjakan nanti setelah approval

Setelah Asep/CTO memberi direction, Ujang kemungkinan aman mengerjakan:

- Implement service layer read-only sesuai interface yang disetujui.
- Membuat mapper DB shape ke shape UI.
- Membuat seed demo sesuai schema approved.
- Menambahkan tests untuk mapper/service.
- Menghubungkan `dataStatus` ke trust layer.
- Memindahkan read path satu per satu sesuai urutan approved.
- Menulis dokumentasi penggunaan seed/service.

## Bagian yang tidak boleh Ujang kerjakan tanpa CTO review

- Mengubah `prisma/schema.prisma`.
- Membuat migration.
- Membuat table Supabase.
- Mengubah auth flow.
- Mengubah API auth/users/voices.
- Mengubah relation `Voice.desaId`.
- Membuat scheduler.
- Membuat scraper.
- Membuat admin import.
- Mengubah read path utama dari mock ke DB.
- Deploy.

## Risiko teknis yang harus dijaga

- `npm run lint` saat ini gagal karena errors existing. Jangan menganggap repo sudah green.
- `npm run build` saat ini gagal di `prisma generate` karena EPERM rename query engine. Ini harus dibereskan/diinvestigasi sebelum Sprint 03 menjadi build-gated.
- `generateStaticParams()` dari DB bisa gagal di build jika DB/env tidak siap.
- Nested data detail bisa hilang jika seed minimal terlalu kecil.
- UI bisa berubah behavior jika list filtering pindah dari client-side ke server-side.
- Fallback mock/DB bisa membingungkan jika tidak ada indikator status.

## Risiko bisnis yang harus dijaga

- Data demo tidak boleh tampil seperti data resmi.
- Imported data tidak boleh otomatis dianggap verified.
- Wording dan status harus tetap netral agar desa tidak merasa dituduh.
- Angka summary/leaderboard yang salah bisa memicu distrust dan reputasi buruk.
- Data source yang tidak jelas akan melemahkan PantauDesa sebagai produk layanan transparency dashboard.

## Rekomendasi urutan implementasi Sprint 03 menurut Ujang

Urutan ini hanya rekomendasi, bukan instruksi implementasi:

1. Asep review dokumen `02` sampai `11` dan jawab keputusan kunci.
2. Finalisasi model minimal di docs sebelum schema diubah.
3. Tambahkan schema dan enum hanya setelah approved.
4. Jalankan `npx prisma validate` dan `npx prisma generate`.
5. Buat seed demo kecil dengan status `demo`.
6. Buat service layer read-only dengan tests.
7. Mapper service mengembalikan shape yang cocok dengan UI existing.
8. Pindahkan homepage/list dulu karena data minimalnya lebih sederhana.
9. Pindahkan detail desa setelah APBDes/dokumen/status minimal siap.
10. Hubungkan trust layer ke `dataStatus`.
11. Smoke test homepage, daftar desa, detail desa, dan suara warga.
12. Tunda scheduler/scraper/admin import sampai data foundation stabil.

## Self-assessment conclusion

Ujang sudah memahami arah bisnis, source code utama, current mock data flow, existing Prisma/Auth/Voice model, dan risiko transisi data. Namun Ujang belum boleh memulai Sprint 03 implementation tanpa CTO review karena keputusan schema, relation, migration, seed, fallback, dan route strategy masih belum final.

Status kesiapan Ujang:

- Ready untuk menjelaskan architecture dan risiko ke Iwan/Asep.
- Ready untuk menulis proposal/plan lebih lanjut.
- Not ready untuk implement schema/database tanpa approval.

