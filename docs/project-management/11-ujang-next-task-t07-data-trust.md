# Ujang Next Task — T-07 Data Trust Layer

## Status

Asep sedang tidak available.

Task ini dibuat oleh Iwan dan aman dikerjakan Ujang karena scope-nya hanya UI/copy trust layer. Tidak menyentuh Prisma, API, auth flow, scheduler, scraper, atau arsitektur data.

## Current sprint

Sprint 02.

## Previous task status

T-06 critical wording update sudah `verified-by-product` oleh Iwan.

Medium/low wording items tetap ditunda sampai ada instruksi baru.

## T-07 — Data Trust Layer di Detail Desa

**Status:** `ready`

**Backlog:** #3

**Branch:** `ujang/sprint2`

## Goal

Membuat user paham bahwa sebagian data PantauDesa masih demo/ilustrasi dan belum bisa dianggap data resmi/terverifikasi.

Homepage sudah punya disclaimer. Sekarang detail desa juga perlu trust layer yang jelas karena user kemungkinan langsung membuka halaman desa dari link/share.

## Product reason

PantauDesa tidak boleh membuat warga mengira data dummy adalah data resmi.

Trust lebih penting daripada terlihat lengkap.

## Scope yang boleh dikerjakan

Ujang hanya boleh mengerjakan:

- copy/UI kecil,
- data disclaimer di detail desa,
- data status badge sederhana,
- source-of-truth copy di `src/lib/copy.ts`.

## Scope yang tidak boleh dikerjakan

Ujang tidak boleh:

- mengubah schema Prisma,
- membuat table baru,
- membuat API baru,
- membuat scraper,
- membuat scheduler,
- mengubah auth flow,
- mengubah status data asli di database,
- membuat sistem verification beneran.

## Files yang kemungkinan diubah

- `src/lib/copy.ts`
- `src/app/desa/[id]/page.tsx`
- Optional: component kecil baru seperti `src/components/desa/DataTrustNotice.tsx`

Kalau membuat component baru terasa terlalu besar, boleh langsung pasang card kecil di `desa/[id]/page.tsx`, tapi copy tetap dari `copy.ts`.

## Copy source of truth

Tambahkan atau perluas `DATA_DISCLAIMER` di `src/lib/copy.ts`:

```ts
export const DATA_DISCLAIMER = {
  short: "Data yang ditampilkan bersifat ilustrasi. Integrasi data resmi sedang disiapkan.",
  detailTitle: "Catatan tentang data desa ini",
  detailBody: "Sebagian data di halaman ini masih bersifat demo/ilustrasi untuk menguji pengalaman pengguna. Jangan gunakan data ini sebagai dasar tuduhan atau kesimpulan resmi sebelum ada sumber dan verifikasi yang jelas.",
  statusLabel: "Data demo",
} as const;
```

Jika `DATA_DISCLAIMER.short` sudah ada, jangan duplikat. Cukup tambahkan field baru.

## UI requirement

Di halaman detail desa, tampilkan card/notice kecil yang mudah terlihat.

Rekomendasi placement:

- Setelah header/ringkasan desa, sebelum card anggaran utama.
- Atau dekat area ringkasan anggaran jika placement pertama terlalu mengganggu.

Isi minimal:

- Badge kecil: `Data demo`
- Title: `Catatan tentang data desa ini`
- Body: dari `DATA_DISCLAIMER.detailBody`

Tone visual:

- Netral.
- Tidak terlalu merah/error.
- Bisa pakai slate/amber/blue soft.
- Jangan terlalu besar sampai mengganggu user baca data.

## Acceptance criteria

- [ ] Detail desa menampilkan disclaimer data demo/ilustrasi.
- [ ] Copy disclaimer berasal dari `src/lib/copy.ts`.
- [ ] Ada label/badge `Data demo` atau setara.
- [ ] Copy jelas bahwa data belum boleh dipakai sebagai kesimpulan resmi.
- [ ] Copy tidak membuat PantauDesa terlihat tidak kredibel, tapi jujur dan bertanggung jawab.
- [ ] Tidak ada perubahan teknis di schema/API/auth/scheduler.
- [ ] Commit memakai role trace.
- [ ] Ujang report ke Iwan setelah selesai.

## Suggested commit message

```txt
feat(trust): add data demo notice to desa detail

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Copy)
Executed-by: Ujang (Programmer)
Status: partial
Backlog: #3
```

## Report format to Iwan

```md
Iwan, T-07 sudah selesai.
Branch: ujang/sprint2
Commit: [hash]

Done:
- [x] Detail desa punya data demo notice
- [x] Copy dari copy.ts
- [x] Tidak menyentuh schema/API/auth/scheduler

Perlu dicek Iwan:
- [ ] Copy tone disclaimer
- [ ] Placement tidak mengganggu user baca detail desa
```

## Iwan verification scope

Iwan hanya cek:

- copy tone,
- apakah disclaimer cukup jelas,
- apakah tidak terlalu menakutkan,
- apakah user paham data masih demo,
- apakah tetap selaras dengan PantauDesa.

## Current instruction

Ujang boleh mulai T-07.

Jangan lanjut ke T-08 atau medium/low wording sebelum Iwan buka task baru.

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Copy)
Executed-by: Iwan (CEO)
Status: ready
Backlog: #3
