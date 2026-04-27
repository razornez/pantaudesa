# Iwan Review — Arjasari Initial Manual Discovery

Date: 2026-04-27
Reviewer: Iwan
Input reviewed: `docs/engineering/29-manual-discovery-arjasari-initial-sample.md`

## Decision

Approved.

Manual discovery awal 5 desa Kecamatan Arjasari diterima.

Kecamatan Arjasari tetap cocok sebagai first pilot.

## Reviewed sample

5 desa sample:

1. Arjasari
2. Wargaluyu
3. Baros
4. Mekarjaya
5. Patrolsari

## Summary accepted by Iwan

- Active official desa websites terlihat untuk Arjasari, Wargaluyu, Baros, dan Patrolsari.
- Mekarjaya menjadi `needs_review` karena website field ada di source kecamatan, tetapi direct website belum berhasil dibuka pada pass ini.
- APBDes/realisasi evidence paling kuat ditemukan pada Wargaluyu dan Patrolsari.
- Arjasari dan Baros punya profil/aparatur/kontak/data wilayah, tetapi APBDes/realisasi belum ditemukan pada pass ini.
- Format dominan adalah HTML pages dan beberapa image/embedded map/personnel images.
- Belum ada Excel/CSV/PDF confirmed pada pass awal ini.

## Product/trust assessment

Discovery ini mendukung arah PantauDesa:

- source official/public cukup tersedia untuk pilot kecil,
- data availability berbeda-beda antar desa,
- source URL bisa typo/stale,
- beberapa desa punya data budget/realisasi lebih kuat daripada desa lain,
- data status `imported` / `needs_review` wajib dipakai,
- tidak ada data yang boleh dianggap `verified` pada tahap ini.

## Owner approval

Owner menyetujui:

1. Lanjut manual discovery semua 11 desa Kecamatan Arjasari.
2. Owner dapat mewakili technical gate secara terbatas karena Asep tidak available.

## Iwan clarification on owner acting as technical gate

Approval owner sebagai pengganti Asep diterima sebagai **limited technical gate override**, bukan izin untuk langsung mengubah schema/database sekarang.

Artinya:

- boleh lanjut manual discovery semua 11 desa,
- boleh memperbarui schema implications berdasarkan hasil full discovery,
- boleh menyiapkan final Sprint 03 schema recommendation,
- tetapi jangan ubah Prisma/database sampai full discovery selesai dan schema recommendation final direview oleh Iwan/Owner.

Reason:

Schema akan lebih aman jika dibuat setelah melihat pola semua 11 desa Arjasari, bukan hanya 5 sample awal.

## Approved next step

Continue manual discovery for all 11 desa in Kecamatan Arjasari:

1. Ancolmekar
2. Arjasari
3. Baros
4. Batukarut
5. Lebakwangi
6. Mangunjaya
7. Mekarjaya
8. Patrolsari
9. Pinggirsari
10. Rancakole
11. Wargaluyu

## Required output from Rangga

Create:

`docs/engineering/31-manual-discovery-arjasari-full-11-desa.md`

Isi minimal:

- completed manual discovery table for all 11 desa,
- source URLs found,
- website status,
- data availability,
- APBDes/realisasi/dokumen evidence if found,
- format classification,
- source risk/access notes,
- recommended next action per desa/source,
- summary by category,
- strongest candidates for document/budget review,
- source-status problems,
- schema implications update.

## Special focus for full discovery

Rangga should pay special attention to:

- Wargaluyu and Patrolsari as strongest budget/document candidates.
- Mekarjaya as source URL/status validation case.
- Whether other desa have APBDes/realisasi/dokumen pages.
- Whether kecamatan source has stale/typo website fields.
- Whether source format remains mostly HTML or introduces PDF/Excel/image.

## Boundary

Allowed:

- manual public web research,
- docs update,
- source link collection,
- source classification,
- risk notes,
- schema implication notes.

Not allowed yet:

- scraper,
- crawler,
- scheduler,
- schema change,
- database change,
- migration,
- Supabase table,
- API change,
- auth change,
- read path change,
- Prisma runtime implementation,
- UI publishing,
- marking data as verified.

## Data status rule

All findings remain:

- `imported`, or
- `needs_review`.

No findings are `verified` yet.

## Prompt for Rangga

```text
Rangga, baca `docs/engineering/30-iwan-review-arjasari-initial-discovery.md`.

Iwan/Owner approved continuation to full manual discovery for all 11 desa in Kecamatan Arjasari.

Kerjakan manual discovery untuk:
1. Ancolmekar
2. Arjasari
3. Baros
4. Batukarut
5. Lebakwangi
6. Mangunjaya
7. Mekarjaya
8. Patrolsari
9. Pinggirsari
10. Rancakole
11. Wargaluyu

Output:
`docs/engineering/31-manual-discovery-arjasari-full-11-desa.md`

Use `docs/engineering/23-manual-source-discovery-template.md`.

Jangan scraping/crawling otomatis.
Jangan ubah schema/database/API/auth/read path/Prisma.
Jangan publish data ke UI.
Jangan mark data as verified.
Treat findings as imported/needs_review.

Special focus:
- Wargaluyu and Patrolsari for document/budget review.
- Mekarjaya for source URL/status validation.
- Check whether other desa have APBDes/realisasi/dokumen pages.
- Note schema implications after seeing all 11 desa.
```

Initiated-by: Iwan (CEO)
Reviewed-by: Owner
Executed-by: Rangga (ChatGPT Freelancer)
Status: approved
Backlog: #13
