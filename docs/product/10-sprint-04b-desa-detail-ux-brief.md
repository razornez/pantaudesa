# Sprint 04B Desa Detail UX Brief

Date: 2026-04-27
Status: draft-for-iwan-owner-review
Prepared-by: ChatGPT Freelancer / Rangga
Role: Senior Product Owner + Business Analyst + UI/UX Strategist + Information Architect

## Context

Sprint 04A homepage first pass is accepted. Owner/Iwan wants to continue and not get stuck on homepage polish.

Sprint 04B focuses on Desa Detail UX.

Inputs reviewed:

- `docs/product/09-sprint-04a-homepage-acceptance-review.md`
- `docs/project-management/52-sprint-04-owner-dashboard-and-gate-tracker.md`
- `docs/project-management/51-sprint-03-closure-and-sprint-04-scope-proposal.md`
- `docs/engineering/14-official-desa-data-source-and-scraping-strategy.md`

Owner notes:

- Detail page must reduce unimportant information.
- Users get confused when exposed to too much complex information.
- Avoid monotonous design.
- Make the page more creative and engaging.
- Make users curious: “why should I read this?”
- Detail page should guide ordinary citizens, not overwhelm them.
- Keep civic-safe tone: memantau bukan menuduh.
- Data demo/imported/needs_review/verified must remain clear.
- No seed/read path/schema/API/DB changes yet.

## Product thesis

The Desa Detail page should not be a data dump.

It should behave like a guided reading page:

> “Ini desa apa, status datanya apa, sumber apa yang ditemukan, dokumen apa yang bisa dibaca, apa yang belum boleh disimpulkan, dan warga sebaiknya melakukan apa berikutnya.”

## 1. Main purpose of Desa Detail page

The main purpose is to help ordinary citizens understand one desa in a safe, guided, source-aware way.

The page should answer:

1. Desa ini siapa dan lokasinya di mana?
2. Status data di halaman ini apa?
3. Ada sumber publik atau dokumen yang ditemukan?
4. Apakah APBDes/realisasi sudah bisa dibaca sebagai dokumen?
5. Apa yang belum bisa disimpulkan?
6. Kalau warga mau bertanya, harus mulai dari mana?

The page should not start as an expert analytics page.

## 2. What citizens should understand in the first 5 seconds

Within 5 seconds, user should understand:

- desa name and location,
- whether this page is demo/imported/needs_review/verified,
- whether sources/documents exist,
- this page is not accusing the desa,
- there is a clear next step to read more.

Recommended first-screen copy:

```text
Baca informasi publik Desa [Nama Desa] dengan status sumber yang jelas.
```

Supporting note:

```text
PantauDesa membantu warga melihat sumber dan dokumen yang tersedia. Data yang belum direview tidak boleh dibaca sebagai kesimpulan final.
```

## 3. Information priority: show first, hide, collapse, delay

## Show first

Show above or near first fold:

1. Desa identity.
2. Primary data status badge.
3. “Yang perlu kamu tahu dulu” summary.
4. Source/document snapshot.
5. Curiosity hook: why this page is worth reading.
6. Primary next action.

## Hide/collapse by default

Collapse:

- raw source notes,
- full historical documents,
- long APBDes line items,
- technical access status details,
- duplicated source URLs,
- detailed metadata,
- long civic explanation,
- old yearly archives,
- chart/table-heavy analytics.

## Delay until later sprint

Delay:

- real numeric APBDes extraction,
- final transparency score,
- ranking inside detail page,
- alert/risk interpretation,
- verified claims,
- raw snapshot/staging visualization,
- scraping/import trace.

## 4. Information too complex for first view

Do not show in first view:

- all APBDes bidang/line items,
- dense budget charts,
- all historical realization years,
- raw DataSource fields,
- crawler/import metadata,
- admin/reviewer language,
- confidence score,
- source snapshot hash,
- technical enum names like `imported`, `needs_review`, `accessStatus`.

Translate technical terms into citizen language:

- `DataSource` → `Sumber data`
- `imported` → `Sumber ditemukan`
- `needs_review` → `Perlu review`
- `verified` → `Terverifikasi`
- `accessStatus` → `Status akses sumber`
- `DokumenPublik` → `Dokumen publik`

## 5. Make the detail page less monotonous and more engaging

Use varied section patterns, not only stacked white cards.

Recommended visual rhythm:

1. Hero/identity card with map/source accents.
2. Three-point “Yang perlu kamu tahu dulu” summary.
3. Data status banner.
4. Snapshot cards for source/document/APBDes/next action.
5. Curiosity hook panel.
6. Document-first APBDes section.
7. Citizen next-action guide.
8. Collapsible advanced details.

Visual concepts:

- `Desa Identity Passport`: identity card style with location, website, status.
- `Quick Read Strip`: three simple facts before detail.
- `Source Compass`: where this information comes from.
- `Document Shelf`: APBDes/realisasi/RKPDes/RPJMDes as document tiles.
- `Read Before Concluding`: caution panel explaining what cannot be concluded.
- `Ask the Right Place`: next-action guide.

## 6. Make users curious to continue reading

Use curiosity without accusation.

Recommended hook:

```text
Kenapa halaman ini perlu dibaca?
```

Possible answers:

- `Ada sumber publik yang bisa dicek.`
- `Ada dokumen yang perlu dibaca sebelum menyimpulkan.`
- `Ada informasi yang masih perlu review.`
- `Warga bisa tahu harus bertanya ke pihak mana.`

Avoid:

- `Ada masalah di desa ini.`
- `Desa ini mencurigakan.`
- `Anggaran desa ini buruk.`

## 7. Recommended content modules

## A. Hero / identity card for desa

Purpose:

Make user instantly know which desa they are reading.

Show:

- `Desa [name]`
- kecamatan, kabupaten, provinsi,
- website if available,
- main status badge,
- short source note.

Design:

- large identity card,
- map-pin or document motif,
- one strong CTA: `Lihat dokumen yang tersedia`,
- one secondary action: `Cara membaca status data`.

Do not show:

- complex charts,
- all metrics,
- rankings,
- long disclaimer.

## B. “Yang perlu kamu tahu dulu” summary

Purpose:

Reduce cognitive load.

Format:

3 short cards or bullets:

1. `Status data`
2. `Sumber ditemukan`
3. `Dokumen tersedia / belum tercatat`

Example:

```text
1. Data halaman ini masih Data Demo / Sumber Ditemukan / Perlu Review.
2. Sumber yang ditemukan: website desa / halaman kecamatan / dokumen publik.
3. Dokumen APBDes/realisasi ditampilkan sebagai referensi, belum angka final.
```

## C. Data status banner

Purpose:

Prevent misunderstanding.

State copy:

### Data Demo

```text
Ini data demo untuk membantu melihat alur PantauDesa. Belum mewakili data resmi final.
```

### Sumber Ditemukan

```text
PantauDesa menemukan sumber publik untuk desa ini. Isi data belum diverifikasi sebagai kesimpulan final.
```

### Perlu Review

```text
Sumber atau isi data masih perlu dicek sebelum digunakan sebagai rujukan.
```

### Terverifikasi

```text
Data sudah melalui proses review PantauDesa.
```

Important:

- `Terverifikasi` should not be active until verification workflow exists.

## D. Source/document snapshot

Purpose:

Give quick proof of source availability without overwhelming.

Show four compact cards:

- `Website desa`
- `Halaman kecamatan`
- `Dokumen APBDes/Realisasi`
- `Status review`

Each card should show:

- found / not found / needs review,
- source type,
- one short explanation.

Do not show raw URL list first.

## E. “Kenapa desa ini perlu dibaca?” curiosity hook

Purpose:

Make user continue reading.

Format:

A highlighted panel with 2–3 reasons.

Example:

```text
Kenapa desa ini perlu dibaca?
- Ada sumber publik yang bisa membantu warga memahami informasi desa.
- Beberapa dokumen mungkin perlu dicek agar tidak salah membaca angka.
- Jika ada informasi yang belum lengkap, warga bisa bertanya ke pihak yang tepat.
```

## F. APBDes/document area — document-first, not numeric-first

Purpose:

Show document availability before budget conclusions.

Recommended title:

```text
Dokumen Anggaran dan Realisasi
```

Show:

- document title,
- year,
- document type,
- status badge,
- source link if available,
- short note.

Do not show first:

- total APBDes as fact,
- realization percentage as fact,
- warning colors,
- score,
- ranking.

Copy:

```text
Dokumen ditampilkan sebagai referensi sumber. Angka anggaran belum diringkas sebagai kesimpulan final jika statusnya masih demo atau perlu review.
```

## G. Citizen action guide

Purpose:

Turn curiosity into safe civic action.

Recommended title:

```text
Kalau masih belum jelas, tanya ke siapa?
```

Show:

- Desa: dokumen desa, profil, pelayanan lokal.
- Kecamatan: koordinasi wilayah/administratif.
- Kabupaten: regulasi, pembinaan, data lintas desa.

Tone:

- helpful,
- not confrontational.

Copy:

```text
Mulai dari pertanyaan berbasis dokumen. Memantau bukan menuduh; warga berhak bertanya dengan sumber yang jelas.
```

## H. Collapsible advanced details

Purpose:

Keep advanced users supported without overwhelming ordinary citizens.

Collapse sections:

- semua sumber,
- metadata status,
- dokumen lama,
- catatan review,
- riwayat data,
- technical source notes.

Label:

```text
Lihat detail sumber dan catatan review
```

## 8. Avoid accusatory tone

Rules:

- Say `perlu dibaca`, not `bermasalah`.
- Say `perlu review`, not `mencurigakan`.
- Say `dokumen belum tercatat`, not `desa tidak transparan`.
- Say `angka belum diringkas`, not `anggaran tidak jelas`.
- Say `tanya pihak yang tepat`, not `laporkan desa`.

Narrative principle:

```text
Tampilkan sumber dulu, status dulu, dokumen dulu — baru kesimpulan jika sudah layak.
```

## 9. Data status handling rules

## Data Demo

Show:

- label: `Data Demo`
- copy: `Contoh tampilan, bukan data resmi final.`

Allow:

- UI preview,
- mock metrics,
- interaction testing.

Do not allow:

- official claim,
- final conclusion,
- verified badge.

## Sumber Ditemukan / Imported

Show:

- label: `Sumber Ditemukan`
- copy: `Sumber publik ditemukan, belum diverifikasi.`

Allow:

- source/document listing,
- source snapshot,
- link reference.

Do not allow:

- strong conclusion,
- final APBDes numbers,
- ranking based on real imported data.

## Perlu Review

Show:

- label: `Perlu Review`
- copy: `Perlu dicek sebelum jadi rujukan.`

Allow:

- caution display,
- hidden/collapsed details,
- next action guidance.

Do not allow:

- scary red alert,
- accusation,
- “bad village” implication.

## Terverifikasi

Show later only when workflow exists.

For now:

- can appear in explanatory status cards,
- should not appear as active data state unless manually verified process exists.

## 10. MVP now vs later

## MVP now — Sprint 04B

UI-only detail page first pass can include:

- identity hero,
- quick read summary,
- data status banner,
- source/document snapshot,
- curiosity hook,
- document-first APBDes section,
- citizen action guide,
- advanced details collapsed.

Can use existing mock data.

No read path switch.

## Later

Later after gates:

- DB-powered detail page,
- seed execution,
- source registry live display,
- document registry from DB,
- numeric APBDes extraction,
- verified data workflow,
- admin review,
- scraping/import prototype,
- historical trend by document year.

## 11. What should not be built yet

Do not build yet:

- seed execution,
- read path switch,
- Prisma/API service layer changes,
- numeric APBDes extraction,
- score transparansi detail,
- alert dini detail interpretation,
- verified claim UI,
- scraper/import display,
- raw snapshot/staging UI,
- admin verification workflow,
- heavy dashboard charts in first view.

## 12. Proposed page hierarchy

Recommended order:

1. Hero / identity card for desa.
2. “Yang perlu kamu tahu dulu” summary.
3. Data status banner.
4. Source/document snapshot.
5. “Kenapa desa ini perlu dibaca?” curiosity hook.
6. APBDes/document area — document-first.
7. Citizen action guide.
8. Collapsible advanced details.

Alternative compact order for mobile:

1. Identity + status.
2. Quick summary.
3. Source/document snapshot.
4. Document list.
5. Action guide.
6. Advanced details accordion.

## What to hide/collapse

Hide/collapse:

- all raw source URLs,
- long source notes,
- old document archives,
- APBDes line items,
- technical metadata,
- all status enums,
- detailed ranking logic,
- charts that require explanation,
- trust/legal disclaimer longer than 2 lines.

Use short note plus expandable detail.

## UX risks

1. Detail page can become a data dump if every source/document is shown at once.
2. Users may treat demo/imported data as official if status is not near the top.
3. APBDes numbers can create false authority if shown before document status.
4. Too many charts can make the page feel like an expert dashboard.
5. Civic tone can turn accusatory if copy uses “bermasalah”, “mencurigakan”, or “buruk”.
6. Page may feel monotonous if all sections are white cards with similar layouts.
7. Advanced metadata can overwhelm ordinary citizens.
8. If detail UX is not clear, seed/read path remains risky.

## Recommended next gate

Recommended next gate:

> Sprint 04B Detail Page UI-only execution gate.

Before execution, Iwan/Owner should approve:

- proposed page hierarchy,
- document-first APBDes approach,
- status banner copy,
- what stays collapsed,
- no seed/read path/schema/API/DB changes,
- no new heavy dependency.

## Draft Ujang task list for Iwan only

Rangga does not command Ujang directly. If Iwan approves Sprint 04B execution gate, Iwan may split into small UI-only tasks.

### Task 1 — Detail page hierarchy and first view

Goal:

- create/improve desa detail first fold.

Scope:

- hero/identity card,
- “Yang perlu kamu tahu dulu” summary,
- data status banner.

Boundary:

- UI-only,
- mock data only,
- no seed/read path/schema/DB/API changes.

### Task 2 — Source/document snapshot and curiosity hook

Goal:

- make source and document availability easy to understand.

Scope:

- source/document snapshot cards,
- “Kenapa desa ini perlu dibaca?” panel,
- avoid raw URL dump.

Boundary:

- UI-only,
- no real data integration.

### Task 3 — Document-first APBDes and citizen action guide

Goal:

- make APBDes section safer and more useful.

Scope:

- document-first APBDes area,
- citizen action guide,
- collapsible advanced details,
- mobile QA and civic-safe copy review.

Boundary:

- no numeric extraction,
- no read path switch,
- no scraper/import,
- no verified claims.

## Executive summary — max 12 bullets

1. Desa Detail should be a guided reading page, not a data dump.
2. First 5 seconds must show desa identity, status, source/document availability, and safe civic framing.
3. Important info should appear first: identity, quick summary, data status, source/document snapshot.
4. Complex info should be collapsed: raw URLs, metadata, old archives, line items, technical notes.
5. APBDes should be document-first, not numeric-first.
6. Use creative patterns: identity passport, quick read strip, source compass, document shelf, citizen action guide.
7. Curiosity hook should ask “Kenapa desa ini perlu dibaca?” without implying problems.
8. Copy must avoid accusatory language like bermasalah/mencurigakan/buruk.
9. Demo/imported/needs_review/verified states must be visible and translated into citizen language.
10. MVP is UI-only with mock data; no seed/read path/API/schema/DB work.
11. Later work includes DB integration, numeric extraction, verification workflow, and import/scraping.
12. Next gate should be Sprint 04B Detail Page UI-only execution gate.

## Final recommendation

Proceed with Sprint 04B as UI-only detail page first pass after Iwan/Owner approve this brief.

Do not execute seed, switch read path, scrape/import, or extract numeric APBDes yet.

Initiated-by: Owner/Iwan request
Reviewed-by: Pending Owner/Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-review
