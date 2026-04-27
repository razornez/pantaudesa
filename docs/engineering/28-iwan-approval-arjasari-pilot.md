# Iwan Approval — Arjasari First Pilot

Date: 2026-04-27
Reviewer: Iwan
Input reviewed: `docs/engineering/27-pilot-area-scoring-arjasari-banjaran.md`

## Decision

Approved.

Kecamatan Arjasari, Kabupaten Bandung, Provinsi Jawa Barat dipilih sebagai pilot pertama untuk manual source discovery PantauDesa.

## Reason

Rangga scoring menunjukkan:

- Arjasari: 35/40 — strong first pilot candidate.
- Banjaran: 30/40 — strong/acceptable, tetapi lebih cocok sebagai backup/second pilot.

Arjasari lebih cocok sebagai first pilot karena:

1. Ada official kecamatan source dengan daftar 11 desa.
2. Beberapa desa-level website atau website field ditemukan.
3. Ada indikasi dokumen APBDes/transparansi anggaran pada Wargaluyu.
4. Ada variasi source: website kecamatan, detail desa, website desa, profil, aparatur, kontak, peta, dan dokumen anggaran.
5. Data cukup beragam untuk menguji kebutuhan schema/source strategy tanpa langsung scraping.

## Approved initial sample

Manual discovery pertama dibatasi ke 5 desa:

1. Arjasari
2. Wargaluyu
3. Baros
4. Mekarjaya
5. Patrolsari

## Backup pilot

Kecamatan Banjaran disimpan sebagai backup / second pilot.

Banjaran belum dipilih sebagai first pilot karena source yang ditemukan lebih terkonsentrasi pada Desa Banjaran dan cross-desa coverage belum sekuat Arjasari.

## Framing rule

Tim tidak boleh menulis bahwa area ini bermasalah atau mencurigakan sebagai kesimpulan.

Framing yang dipakai:

> area prioritas untuk transparansi dan validasi sumber data publik.

## Boundary

Approval ini hanya mengizinkan manual discovery.

Tidak mengizinkan:

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
- publish data ke UI,
- klaim data verified.

## Manual discovery source of truth

Gunakan:

- `docs/engineering/23-manual-source-discovery-template.md`
- `docs/engineering/27-pilot-area-scoring-arjasari-banjaran.md`

## Required output from Rangga

Rangga should create:

`docs/engineering/29-manual-discovery-arjasari-initial-sample.md`

Isi minimal:

- completed manual discovery table for 5 desa sample,
- source URLs found,
- website status,
- data availability,
- format classification,
- risk/access notes,
- recommended next action per desa/source,
- summary findings,
- implication for Sprint 03 schema review.

## Data status rule

All findings must be treated as:

- `imported`, or
- `needs_review`.

Do not mark anything as `verified`.

## Instruction for Rangga

```text
Rangga, Iwan approved Kecamatan Arjasari as first manual source discovery pilot.

Read:
- docs/engineering/28-iwan-approval-arjasari-pilot.md
- docs/engineering/23-manual-source-discovery-template.md
- docs/engineering/27-pilot-area-scoring-arjasari-banjaran.md

Run manual discovery only for this 5-desa sample:
1. Arjasari
2. Wargaluyu
3. Baros
4. Mekarjaya
5. Patrolsari

Output:
docs/engineering/29-manual-discovery-arjasari-initial-sample.md

Use the manual source discovery template.
Do not scrape/crawl automatically.
Do not change schema/database/API/auth/read path/Prisma.
Do not mark data as verified.
Treat findings as imported/needs_review.
Use safe framing: area prioritas untuk transparansi dan validasi sumber data publik.
```

Initiated-by: Iwan (CEO)
Reviewed-by: Owner
Executed-by: Rangga (ChatGPT Freelancer)
Status: approved
Backlog: #13
