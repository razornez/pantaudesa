# Questions for Asep: Data Foundation

Learning task: L-04
Status: draft for Asep review when available

## Keputusan model inti

1. Apakah `Desa` perlu memakai `slug` wajib untuk public URL, atau Sprint 03 tetap memakai `id` dulu?
2. Kalau memakai `slug`, apakah route tetap `/desa/[id]` untuk sementara atau diganti ke `/desa/[slug]` di sprint berbeda?
3. Apakah `kodeDesa` harus wajib sejak awal, atau optional sampai data resmi tersedia?
4. Apakah `tahunData` berada di model `Desa`, atau semua tahun hanya ada di `AnggaranDesaSummary`?
5. Apakah `kategori` tetap disimpan di `Desa`, atau ini hanya field visual/fokus yang boleh optional?

## Keputusan anggaran

6. Apakah `AnggaranDesaSummary` wajib dipisah dari `Desa` sejak Sprint 03?
7. Apakah satu desa bisa punya banyak `AnggaranDesaSummary` per tahun?
8. Apakah `persentaseRealisasi` disimpan di DB atau dihitung di service layer dari `totalRealisasi / totalAnggaran`?
9. Apakah `statusSerapan` disimpan sebagai enum, atau dihitung dari persentase di service layer?
10. Apakah data `pendapatan` perlu model sendiri pada Sprint 03, atau ditunda?

## Keputusan APBDes dan dokumen

11. Apakah `APBDesItem` langsung relation ke `Desa`, atau relation ke `AnggaranDesaSummary`?
12. Apakah `kodeBidang` mengikuti kode APBDes resmi, atau cukup string demo dulu?
13. Apakah `DokumenPublik.status` sebaiknya enum `tersedia/belum/unknown`, bukan boolean?
14. Apakah dokumen perlu `url` sejak awal, atau cukup checklist ketersediaan?
15. Apakah APBDes dan dokumen wajib ada di seed Sprint 03, atau cukup summary anggaran dulu?

## Keputusan data source dan status

16. Apakah `dataStatus` enum global dipakai di semua model?
17. Apakah nilai enum memakai lowercase (`demo`) atau uppercase (`DEMO`) mengikuti style Prisma yang Asep pilih?
18. Apakah `DataSource` boleh `desaId` optional untuk source global seperti demo seed?
19. Apakah summary/APBDes/dokumen perlu relation langsung ke `DataSource`, atau cukup field teks `sourceName` dulu?
20. Kapan data boleh naik dari `imported` ke `verified`, dan siapa actor/prosesnya?
21. Apakah `needs_review`, `outdated`, dan `rejected` harus masuk schema Sprint 03 walau belum dipakai UI?

## Keputusan service layer

22. Apakah service layer ditempatkan di `src/lib/data/` atau langsung `src/lib/desa-service.ts`?
23. Apakah function awal yang disetujui: `getDesaList`, `getDesaByIdOrSlug`, `getHomeStats`, `getFeaturedDesa`?
24. Apakah service boleh fallback ke `mock-data.ts` jika DB belum siap?
25. Jika fallback boleh, apakah fallback hanya development atau juga production sementara?
26. Apakah page list tetap client-side filtering, atau query/filter harus pindah server-side saat DB dipakai?
27. Apakah `generateStaticParams()` tetap dipakai saat data dari DB, atau detail desa dibuat dynamic?

## Keputusan seed dan migration

28. Apakah seed masuk Prisma seed resmi, script npm sendiri, atau file TypeScript manual?
29. Berapa desa minimal untuk seed Sprint 03 agar homepage/list/detail masih terlihat lengkap?
30. Apakah seed harus memasukkan APBDes, dokumen, dan source data untuk setiap desa?
31. Apakah seed boleh menyalin struktur dari `src/lib/mock-data.ts`, atau perlu data dummy baru yang lebih sederhana?
32. Apakah migration pertama untuk model desa boleh dibuat Ujang setelah review, atau harus Asep yang membuat?

## Keputusan integrasi dengan fitur existing

33. Apakah `Voice.desaId` tetap string tanpa relation ke `Desa` untuk Sprint 03?
34. Kalau nanti `Voice` relation ke `Desa`, bagaimana migrasi data suara warga yang sudah ada?
35. Apakah admin desa demo harus ikut membaca model `Desa`, atau tetap mock sampai sprint admin berikutnya?
36. Apakah profil desa, aset, fasilitas, lembaga, dan BUMDes masuk Sprint 03 atau ditunda?
37. Apakah skor transparansi menjadi model sendiri atau dihitung dari dokumen/status lain?

## Keputusan product/trust layer

38. Apakah badge `Data demo` di detail desa harus membaca `dataStatus` dari `Desa`, dari summary anggaran, atau dari data source?
39. Jika satu desa punya summary `verified` tapi APBDes masih `demo`, status mana yang tampil paling atas?
40. Apakah UI perlu menampilkan sumber data per section, atau cukup satu notice di halaman detail?
41. Apakah wording disclaimer berubah saat status `imported` atau `verified`?

## Pertanyaan risiko

42. Apa batas minimal perubahan yang masih aman untuk Sprint 03 saat Asep baru kembali?
43. File apa saja yang harus dianggap high-risk selain schema, API routes, auth, scheduler, scraper, dan admin import?
44. Apakah perlu test khusus untuk memastikan fallback DB/mock tidak membuat data resmi terlihat seperti verified?
45. Apakah ada aturan naming table dengan `@@map` yang harus diikuti sejak awal?

