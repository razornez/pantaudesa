# Owner Pilot Area Candidates

Date: 2026-04-27
Status: ready-for-scoring

## Context

Owner mengajukan kandidat area pilot untuk manual source discovery PantauDesa.

Catatan penting dari Iwan:

Alasan owner menyebut ada hal yang perlu diperhatikan di area ini. Dalam dokumen project, tim tidak boleh memakai framing tuduhan seperti `mencurigakan` sebagai kesimpulan awal.

Gunakan framing aman:

> area prioritas untuk transparansi, validasi sumber, dan pengujian ketersediaan data publik.

PantauDesa harus tetap berbasis data, adil, dan tidak menuduh tanpa bukti/sumber resmi.

## Candidate areas

## Candidate A

Area:

- Kecamatan Arjasari
- Kabupaten Bandung
- Provinsi Jawa Barat

Owner reason:

- Owner menilai area ini perlu diprioritaskan untuk transparansi dan validasi sumber data publik.

## Candidate B

Area:

- Kecamatan Banjaran
- Kabupaten Bandung
- Provinsi Jawa Barat

Owner reason:

- Owner menilai area ini perlu diprioritaskan untuk transparansi dan validasi sumber data publik.

## Required scoring document

Rangga should score these candidates using:

- `docs/engineering/25-pilot-area-shortlist-scoring-worksheet.md`
- `docs/engineering/24-pilot-area-selection-criteria.md`

## Scoring focus

Rangga should evaluate:

- official source availability,
- desa website coverage,
- public document availability,
- format processability,
- recency,
- access safety,
- business relevance,
- data diversity.

## Boundary

This candidate selection does not authorize:

- scraper,
- scheduler,
- crawler,
- schema change,
- database change,
- migration,
- API change,
- auth change,
- read path change,
- Prisma runtime implementation.

Only manual research/scoring is allowed.

## Prompt for Rangga

```text
Rangga, baca `docs/engineering/26-owner-pilot-area-candidates.md` dan `docs/engineering/25-pilot-area-shortlist-scoring-worksheet.md`.

Owner mengajukan 2 kandidat area pilot:

1. Kecamatan Arjasari, Kabupaten Bandung, Provinsi Jawa Barat.
2. Kecamatan Banjaran, Kabupaten Bandung, Provinsi Jawa Barat.

Gunakan framing aman: area prioritas untuk transparansi dan validasi sumber data publik. Jangan tulis bahwa area ini bermasalah atau mencurigakan sebagai kesimpulan.

Tugas kamu:
- Score kedua kandidat memakai worksheet.
- Cek official source availability secara manual/public web research.
- Cek apakah ada website kecamatan/kabupaten/desa official.
- Cek apakah ada indikasi dokumen publik seperti APBDes, realisasi, RKPDes/RPJMDes, profil desa, atau dokumen lain.
- Jangan scraping/crawling otomatis.
- Jangan mengubah schema/database/API/auth/read path.

Output:
`docs/engineering/27-pilot-area-scoring-arjasari-banjaran.md`

Isi minimal:
- scoring Candidate A dan B,
- source links yang ditemukan,
- risiko tiap kandidat,
- rekomendasi area mana yang lebih cocok untuk pilot pertama,
- alasan rekomendasi,
- boundary bahwa hasil ini belum verified public data.
```

Initiated-by: Iwan (CEO)
Reviewed-by: Owner
Executed-by: Iwan (CEO)
Status: ready-for-scoring
Backlog: #13
