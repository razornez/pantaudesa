# Pilot Area Selection Criteria

Date: 2026-04-27
Status: draft-for-owner-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga

## Purpose

Dokumen ini membantu owner/Iwan memilih pilot area untuk manual source discovery tanpa langsung memilih area final.

Pilot area dipakai untuk mempelajari realita official website desa/kecamatan/kabupaten sebelum Sprint 03 schema/database dibuka kembali.

## Main recommendation

Jangan langsung pilih area berdasarkan rasa penasaran saja.

Pilih area yang paling membantu menjawab pertanyaan Sprint 03:

> Apakah data official desa/kecamatan/kabupaten cukup tersedia, cukup rapi, dan cukup aman untuk mendukung schema data foundation PantauDesa?

## Candidate scope options

### Option A — 1 kecamatan

Recommended when:

- tim ingin scope kecil,
- owner belum punya target bisnis spesifik,
- ingin cepat melihat 5–20 desa,
- risiko discovery ingin dibuat rendah.

Pros:

- cepat dicek manual,
- tidak melebar,
- cocok untuk Sprint 02.5,
- cukup untuk melihat pola awal website desa.

Cons:

- hasil bisa kurang representatif,
- bisa kebetulan terlalu bagus/terlalu buruk,
- dokumen APBDes mungkin sedikit.

### Option B — 1 kabupaten

Recommended when:

- kabupaten punya portal resmi yang rapi,
- owner punya kepentingan bisnis/relasi di area tersebut,
- data desa banyak tersedia di satu portal,
- tim siap scope lebih besar tapi tetap memilih 5–20 desa sample.

Pros:

- peluang menemukan source lebih besar,
- bisa melihat pola portal kabupaten,
- lebih realistis untuk source registry.

Cons:

- rawan melebar,
- manual discovery bisa makan waktu,
- perlu disiplin membatasi sample.

## Selection criteria

Gunakan skor 1–5 untuk tiap kriteria.

1 = buruk / tidak tersedia.
5 = sangat baik / jelas tersedia.

### 1. Official source availability

Apakah area punya sumber resmi yang jelas?

Score guide:

- 1: sulit menemukan sumber resmi.
- 3: ada beberapa sumber tapi tidak konsisten.
- 5: website kecamatan/kabupaten/desa jelas dan aktif.

### 2. Desa website coverage

Berapa banyak desa yang punya website official aktif?

Score guide:

- 1: hampir tidak ada.
- 3: sebagian desa punya website.
- 5: mayoritas desa dalam sample punya website aktif.

### 3. Public document availability

Apakah ada dokumen publik seperti APBDes/RKPDes/realisasi?

Score guide:

- 1: tidak ada dokumen.
- 3: ada dokumen tapi sporadis.
- 5: dokumen cukup banyak dan terbaru.

### 4. Format processability

Apakah format data memungkinkan diproses nanti?

Score guide:

- 1: hanya gambar/scan tidak jelas.
- 3: campuran HTML/PDF dengan kualitas sedang.
- 5: HTML/PDF/Excel relatif jelas dan stabil.

### 5. Recency

Apakah data terlihat baru?

Score guide:

- 1: data lama/tidak ada tanggal.
- 3: sebagian data 1–2 tahun terakhir.
- 5: data tahun berjalan/terbaru jelas.

### 6. Access safety

Apakah akses aman secara etika?

Score guide:

- 1: butuh login/captcha/akses internal.
- 3: publik tapi policy kurang jelas.
- 5: publik jelas, tidak butuh login, tidak sensitif.

### 7. Business relevance

Apakah area relevan untuk demo, sales, atau target owner?

Score guide:

- 1: tidak relevan secara bisnis.
- 3: netral.
- 5: relevan untuk demo, outreach, atau calon partner.

### 8. Data diversity

Apakah area cukup beragam untuk menguji schema?

Score guide:

- 1: data terlalu minim.
- 3: ada beberapa tipe data.
- 5: ada profil, dokumen, APBDes, perangkat, dan update berbeda.

## Suggested scoring table

```text
Candidate area:
Scope type: kecamatan/kabupaten
Expected sample: 5–20 desa

Criteria                         Score  Notes
Official source availability      _/5   ...
Desa website coverage             _/5   ...
Public document availability      _/5   ...
Format processability             _/5   ...
Recency                           _/5   ...
Access safety                     _/5   ...
Business relevance                _/5   ...
Data diversity                    _/5   ...
Total                             _/40
```

## Recommended threshold

### 30–40 points

Strong pilot candidate.

Action:

- Use as pilot area.
- Manual discovery likely valuable.

### 22–29 points

Acceptable pilot candidate.

Action:

- Can use if owner has business reason.
- Keep scope small.

### 15–21 points

Weak pilot candidate.

Action:

- Use only if area is strategically important.
- Expect many missing sources.

### Below 15 points

Not recommended for first pilot.

Action:

- Pick another area first.

## Recommended decision process

1. Owner suggests 2–3 candidate areas if any.
2. Iwan/Rangga scores them using this criteria.
3. Pick one area with best combination of data availability and business relevance.
4. Limit sample to 5–20 desa.
5. Run manual discovery using `docs/engineering/23-manual-source-discovery-template.md`.
6. Report findings before Sprint 03 schema review.

## Candidate preference if owner has no area

If owner has no preference:

1. Start with 1 kecamatan.
2. Prefer area with official kecamatan/kabupaten portal.
3. Prefer area where several desa websites are active.
4. Avoid areas where official source is unclear.
5. Avoid areas requiring login or automated crawling.

## What not to optimize for

Do not pick based only on:

- famous area,
- political sensitivity,
- controversy,
- areas likely to create viral content,
- data that looks suspicious but has weak source.

Reason:

PantauDesa must prioritize trust, source quality, and safe interpretation before virality.

## Final recommendation

For first pilot, choose the area that is boring but clean.

Good first pilot means:

- source is official,
- access is public,
- data is not too sensitive,
- documents exist,
- sample is small,
- output helps schema decisions.

## Boundary reminder

Selecting pilot area does not authorize:

- scraper,
- scheduler,
- crawler,
- database change,
- schema change,
- API change,
- read path change.

It only authorizes manual discovery planning and review.

Initiated-by: Iwan direction
Reviewed-by: Pending Owner/Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-owner-iwan-review
