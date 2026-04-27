# PantauDesa UX, Content Hierarchy, and Product Foundation Review

Date: 2026-04-27
Status: draft-for-owner-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga
Role: Senior Product Owner + Business Analyst + UI/UX Strategist + Information Architect

## Context

Owner feedback:

> Current PantauDesa website is visually good, but content feels too crowded and scattered. As a non-technical visitor, Owner feels confused and cannot quickly find the main thing they are looking for.

Core problem:

PantauDesa needs a clear benang merah:

- simple enough for ordinary citizens,
- still insightful and impactful,
- useful for understanding desa transparency,
- not accusatory,
- visually clean,
- scalable for future real/imported/scraped data.

This review is prepared before any more technical execution, seed execution, or read path switch.

## Product thesis

PantauDesa should not feel like a dashboard for experts.

It should feel like:

> A simple public guide that helps citizens understand what information about their desa is available, where it comes from, and what they can ask next — without accusing anyone.

The product should answer three citizen questions:

1. Desa saya ada informasinya tidak?
2. Dokumen atau sumber publik apa yang tersedia?
3. Kalau ada yang belum jelas, saya harus tanya ke siapa?

Everything else is secondary.

## 1. Main user journey for ordinary citizens

## Primary citizen journey

Recommended main journey:

```text
Homepage
→ search/select desa
→ desa detail
→ see status: demo/source found/needs review
→ see available public documents/sources
→ understand what can/cannot be concluded
→ know where to ask next
```

## Citizen intent levels

### Level 1 — Quick understanding

User wants to know:

- apakah desa ini ada di PantauDesa,
- sumbernya ada atau belum,
- dokumen publiknya ada atau belum.

Time: 5–30 seconds.

### Level 2 — Check transparency signals

User wants to know:

- dokumen APBDes/realisasi ada tidak,
- sumbernya dari mana,
- statusnya sudah dicek atau belum.

Time: 1–3 minutes.

### Level 3 — Take action

User wants to know:

- harus bertanya ke desa/kecamatan/kabupaten/pihak mana,
- dokumen apa yang bisa diminta,
- apa yang belum tersedia.

Time: after trust is built.

## Journey rule

Do not start with too many metrics.

Start with clarity:

- desa,
- source,
- document availability,
- status,
- next action.

## 2. What users should understand in the first 5 seconds

In the first 5 seconds, users should understand:

1. PantauDesa helps citizens check public desa information.
2. PantauDesa is for transparency, not accusation.
3. Users can search/select their desa.
4. Data has status: demo, source found, needs review, or verified later.
5. The product will show sources/documents first before making strong conclusions.

Recommended hero copy:

```text
Cek informasi publik desa dengan lebih mudah.
PantauDesa membantu warga melihat sumber data, dokumen, dan status transparansi desa — tanpa menuduh, tanpa menghakimi.
```

Recommended primary CTA:

```text
Cari Desa
```

Recommended secondary CTA:

```text
Lihat cara membaca data
```

Avoid first-screen copy like:

- “skor transparansi nasional”,
- “desa paling rawan”,
- “alert penyimpangan”,
- too many stats at once.

Those can be later, not first 5 seconds.

## 3. What is likely too crowded or confusing now

Based on owner feedback and current product direction, these likely create confusion:

### 1. Too many dashboard-style signals too early

Examples:

- nasional summary,
- leaderboard,
- alert dini,
- score,
- APBDes chart,
- document status,
- voice/citizen input,
- education narrative,
- authority guide.

Each is useful, but if shown with equal weight, users cannot find the main path.

### 2. Mixed data maturity

Mock/demo data, imported public source, needs-review source, and future verified data may appear similar if visual hierarchy is weak.

This is dangerous because users may think all data is official.

### 3. Too much civic explanation spread everywhere

“Memantau bukan menuduh” is important, but it should be a reusable short principle, not a long paragraph repeated in many places.

### 4. APBDes numbers too tempting

Numbers feel authoritative. If they are demo/imported/needs_review, they can mislead faster than document lists.

### 5. Source/document distinction may be unclear

Citizens may not know the difference between:

- desa website,
- kecamatan page,
- APBDes document,
- archive article,
- imported finding,
- verified data.

UI must explain this simply.

## 4. Recommended content hierarchy

## Homepage hierarchy

Homepage should be simple and directional.

### Section 1 — Hero / main promise

Goal:

Tell users what PantauDesa is and what to do next.

Priority content:

1. One-line value proposition.
2. Search/select desa CTA.
3. Short reassurance: transparency, not accusation.

Recommended structure:

```text
[Headline]
Cek informasi publik desa dengan lebih mudah.

[Subheadline]
Lihat sumber data, dokumen publik, dan status informasi desa — agar warga tahu apa yang tersedia dan apa yang masih perlu dicek.

[Primary CTA]
Cari Desa

[Secondary CTA]
Cara membaca data
```

### Section 2 — How it works in 3 steps

Goal:

Reduce confusion.

Recommended steps:

1. Cari desa.
2. Lihat sumber dan dokumen.
3. Pahami status dan langkah bertanya.

Keep it visual and short.

### Section 3 — Data status explanation

Goal:

Prepare users for demo/imported/needs_review/verified.

Show 4 badges:

- Data Demo
- Sumber Ditemukan
- Perlu Review
- Terverifikasi later/disabled

Do not over-explain.

### Section 4 — Featured desa / pilot area

Goal:

Show examples without claiming full coverage.

For now:

- “Contoh area pilot: Kecamatan Arjasari”
- “Data masih tahap demo/source discovery”

### Section 5 — Why monitor desa?

Goal:

Preserve civic narrative.

Keep this below the action path.

Short copy:

```text
Memantau bukan berarti menuduh. Warga berhak memahami informasi publik desa, dan desa juga berhak dibaca dengan adil berdasarkan sumber yang jelas.
```

### Homepage content to hide/delay

Delay:

- leaderboard,
- alert dini,
- strong transparency score,
- national comparison,
- complex APBDes charts,
- advanced filters.

These can exist later after verified methodology.

## Desa detail page hierarchy

Desa detail must answer:

1. Desa apa ini?
2. Status datanya apa?
3. Sumber apa yang ditemukan?
4. Dokumen apa yang tersedia?
5. Apa yang belum bisa disimpulkan?
6. Harus tanya ke siapa?

### Recommended layout

#### 1. Header

Show:

- Nama desa
- Kecamatan/Kabupaten/Provinsi
- Website if available
- Primary data status badge

Example:

```text
Desa Patrolsari
Kecamatan Arjasari, Kabupaten Bandung, Jawa Barat
Status: Sumber ditemukan — belum diverifikasi
```

#### 2. Status notice

Short notice, not long essay.

Example for imported/needs_review:

```text
Informasi di halaman ini berasal dari sumber publik yang ditemukan. Tim belum menandai data ini sebagai terverifikasi.
```

#### 3. Source summary

Show cards:

- Website desa
- Halaman kecamatan
- Artikel/dokumen
- Review status

For ordinary citizens, label them simply:

- “Website desa”
- “Halaman kecamatan”
- “Dokumen/APBDes”

#### 4. Dokumen publik

Put before numeric APBDes.

Show:

- document title,
- year,
- type,
- source,
- status badge.

#### 5. Anggaran/APBDes

If not verified:

- show document-based summary only,
- avoid full numeric dashboard.

If demo:

- clearly say “contoh tampilan”.

#### 6. Panduan bertanya

Show:

- “Kalau dokumen belum jelas, tanyakan ke...”
- link to kewenangan guide.

#### 7. Advanced details collapsed

Place behind accordion/tabs:

- raw source notes,
- access status,
- historical documents,
- technical metadata.

## Anggaran/APBDes section hierarchy

Recommended MVP structure:

```text
Dokumen Anggaran dan Realisasi
[status note]
[List dokumen]
[What this means]
[What cannot be concluded yet]
```

### Do show

- APBDes document exists/not found/needs review.
- Realisasi document exists/not found/needs review.
- Year detected.
- Link to source.
- Status badge.

### Do not show yet

- total budget as real fact from imported source,
- realization percentage from needs_review source,
- red/yellow risk labels,
- ranking,
- alert dini.

### Copy example

```text
Kami menemukan beberapa referensi dokumen anggaran dari sumber publik. Dokumen ini ditampilkan sebagai daftar sumber, belum sebagai angka final yang diverifikasi.
```

## Dokumen publik / source section hierarchy

This should become the most important MVP content after desa identity.

Recommended grouping:

1. Sumber utama
   - website desa,
   - halaman kecamatan.

2. Dokumen anggaran
   - APBDes,
   - realisasi.

3. Dokumen perencanaan
   - RKPDes,
   - RPJMDes.

4. Lainnya
   - perdes,
   - profil,
   - arsip.

Status per row:

- Sumber ditemukan
- Perlu review
- Tidak tersedia / belum ditemukan
- Terverifikasi later

## Status/disclaimer area hierarchy

Do not put a huge disclaimer everywhere.

Use layered disclaimers:

### Short badge

Always visible.

### Short sentence

Shown near section title.

### More detail

Expandable “Apa arti status ini?”

Example:

```text
Sumber ditemukan berarti PantauDesa menemukan tautan publik. Ini belum sama dengan data terverifikasi.
```

## 5. Simplest useful version of PantauDesa

The simplest useful PantauDesa is not a full analytics dashboard.

It is:

```text
Cari desa → lihat sumber publik → lihat dokumen yang tersedia → tahu statusnya → tahu harus bertanya ke siapa.
```

MVP must include:

- search/list desa,
- detail desa,
- data status labels,
- source registry,
- document registry,
- authority guide,
- simple explanations.

MVP does not need:

- leaderboard,
- alert dini,
- transparency score,
- numeric APBDes extraction,
- scraping,
- admin verification workflow,
- advanced analytics.

## 6. What should be hidden or delayed until user asks for detail

Hide by default / collapse:

- raw source URL metadata,
- accessStatus technical details,
- old historical documents,
- archive-only items,
- technical source notes,
- full APBDes line items,
- multiple duplicate sources,
- explanation of schema/data pipeline,
- audit notes.

Show only after click:

- “Lihat detail sumber”
- “Lihat dokumen lama”
- “Apa arti status ini?”
- “Kenapa data belum terverifikasi?”

## 7. Display rules for demo/imported/needs_review/verified

## Data Demo

Use for seeded illustrative data.

Badge:

```text
Data Demo
```

Copy:

```text
Data ini digunakan untuk contoh tampilan. Belum mewakili data resmi final.
```

Visual tone:

- neutral,
- subtle,
- not green/success.

## Imported / Sumber Ditemukan

Badge:

```text
Sumber Ditemukan
```

Copy:

```text
PantauDesa menemukan sumber publik, tetapi isi data belum diverifikasi.
```

Visual tone:

- informative,
- not success.

## Needs Review / Perlu Review

Badge:

```text
Perlu Review
```

Copy:

```text
Sumber atau isi data perlu dicek lagi sebelum digunakan sebagai rujukan.
```

Visual tone:

- caution,
- not alarming.

## Verified / Terverifikasi

Do not use in MVP unless future verification workflow exists.

Badge later:

```text
Terverifikasi
```

Copy later:

```text
Data sudah melalui proses review PantauDesa.
```

Rule:

- hide verified badge option for now or show disabled in explanation only.

## 8. Preserving “memantau bukan menuduh”

The narrative should be short, repeated consistently, and reflected in UI behavior.

Principles:

1. Show source before conclusion.
2. Show status before metric.
3. Show document list before score.
4. Show “perlu review” before “masalah”.
5. Show authority guide before complaint escalation.

Recommended recurring copy:

```text
Memantau bukan berarti menuduh. PantauDesa membantu warga membaca informasi publik berdasarkan sumber yang jelas dan status data yang jujur.
```

Avoid:

- “desa bermasalah”,
- “indikasi korupsi”,
- “rawan penyimpangan”,
- “buruk/transparan rendah” from imported/needs_review data.

## 9. UI/UX decisions to settle before seed execution/read path switch

Before seed execution:

- [ ] Which statuses are shown in UI?
- [ ] What exact badge labels are used?
- [ ] Is `verified` hidden until workflow exists?
- [ ] Does Desa detail prioritize source/document registry over APBDes numbers?
- [ ] Does homepage hide leaderboard/alert dini for now?

Before read path switch:

- [ ] Can every DB-powered section display dataStatus?
- [ ] Are demo/imported/needs_review disclaimers visible?
- [ ] Are empty states designed?
- [ ] Are APBDes numeric sections blocked unless data is demo or verified?
- [ ] Does UI avoid mixing mock and DB data without clear labels?

## 10. Schema/API/read path assumptions that may change later

## Source grouping may be needed

If UI groups sources by source type, API/service layer may need:

- sourceType grouping,
- dataAvailability filtering,
- accessStatus filtering.

## Document-first APBDes changes read priorities

If APBDes section is document-first, read path should fetch `DokumenPublik` before `APBDesItem`.

## Status badges require dataStatus everywhere

DTOs must include `dataStatus`, not strip it.

## Verified workflow later may require more fields

Later may need:

- reviewedAt,
- reviewedBy,
- reviewNote,
- verificationMethod.

Do not add now unless approved.

## Empty states need source absence tracking

If UI distinguishes “not found” from “not checked”, API may need stronger status semantics later.

For now, use:

- no record = not seeded/not checked,
- `needs_review` = found but uncertain,
- `imported` = source found.

## 11. MVP now vs later

## MVP now

- Homepage with clear value proposition.
- Desa search/list.
- Desa detail identity.
- Data status banner.
- Source summary.
- Dokumen publik list.
- APBDes document references, not final numbers.
- Authority guide.
- Simple “cara membaca data”.

## Later

- verified numeric APBDes extraction,
- trend analysis,
- leaderboard,
- alert dini,
- transparency score,
- admin verification workflow,
- raw snapshot/staging,
- scraper/scheduler,
- public methodology page,
- advanced filters.

## 12. What should not be built yet

Do not build yet:

- scraping execution,
- scheduler,
- raw snapshot/staging runtime,
- admin verification workflow,
- numeric APBDes extraction from imported data,
- public leaderboard from needs_review data,
- alert dini from unverified data,
- final transparency score,
- broad read path switch,
- production public claims of verified data.

## Recommended page structure

## Homepage recommended structure

1. Hero: simple promise + search CTA.
2. Three-step explanation.
3. Data status explanation.
4. Pilot/featured desa area, clearly labeled demo/source discovery.
5. Why monitoring matters.
6. Footer disclaimer.

## Desa detail recommended structure

1. Desa identity + status badge.
2. Short status notice.
3. Source summary cards.
4. Dokumen publik / document registry.
5. APBDes document references.
6. What cannot be concluded yet.
7. Authority guide.
8. Advanced details accordion.

## APBDes section recommended structure

1. Section title: “Dokumen Anggaran dan Realisasi”.
2. Status explanation.
3. Document rows.
4. Empty state if no document found.
5. Collapsed note on numeric data later.

## Empty/loading/needs_review states

## Empty state — no source yet

```text
Belum ada sumber publik yang tercatat untuk desa ini.
```

CTA:

```text
Lihat cara meminta informasi publik
```

## Empty state — source exists, no APBDes found

```text
Sumber desa ditemukan, tetapi dokumen APBDes belum tercatat di PantauDesa.
```

## Needs review state

```text
Sumber ditemukan, tetapi masih perlu dicek sebelum digunakan sebagai rujukan.
```

## Demo state

```text
Ini data demo untuk membantu melihat alur PantauDesa.
```

## Loading state

```text
Memuat sumber dan dokumen desa...
```

Avoid:

```text
Tidak transparan
Data buruk
Desa bermasalah
```

## Risks if technical work continues too early

1. Seed/read path can make demo/imported data look official.
2. Homepage may become more crowded if DB data is added before content hierarchy is fixed.
3. APBDes numbers may create false confidence.
4. Users may not understand source vs verified data.
5. Leaderboard/alert dini can look accusatory without verified methodology.
6. API/service layer may be built around the wrong UI priorities.
7. DataSource may become a technical artifact instead of a citizen-facing trust feature.
8. Future scraping may amplify confusing data if UX does not define trust states first.

## Decision checklist for Iwan/Owner

Top decisions:

- [ ] Approve the main journey: search desa → source/document → status → next action.
- [ ] Approve homepage hierarchy: hero/search first, metrics later.
- [ ] Approve Desa detail hierarchy: identity/status/source/document before APBDes numbers.
- [ ] Approve status labels: Data Demo, Sumber Ditemukan, Perlu Review, Terverifikasi later.
- [ ] Approve document-first APBDes MVP.
- [ ] Approve hiding leaderboard/alert dini/score until verified methodology.
- [ ] Approve no `verified` public display until verification workflow exists.
- [ ] Approve read path remains blocked until UX status/disclaimer behavior is designed.

## Draft next technical task for Ujang — draft for Iwan, not command

Only if Iwan decides a technical follow-up is needed after this product review:

```text
Ujang, read docs/product/02-pantaudesa-ux-content-hierarchy-and-product-foundation-review.md.
Task: prepare UI/read-path impact notes only, no code.
Output: docs/engineering/51-ui-read-path-impact-notes-from-product-review.md.
Do not edit code/schema/DB. Do not run seed. Do not switch read path.
Report max 10 bullets: affected pages/components, required dataStatus fields, blocked sections, and risks.
```

Recommendation:

Do not send this yet unless Iwan wants engineering impact notes. Product decisions should be made first.

## Executive summary — max 12 bullets

1. PantauDesa needs one simple journey: cari desa → lihat sumber/dokumen → pahami status → tahu harus tanya ke siapa.
2. First 5 seconds should explain public desa information, not metrics/leaderboards.
3. Homepage should prioritize search, 3-step explanation, and status meaning; hide complex stats for later.
4. Desa detail should show identity, status, source summary, document registry, cautious APBDes section, and authority guide.
5. APBDes MVP should be document-first, not numeric-first.
6. `demo`, `imported`, `needs_review`, and `verified` must have clear labels and copy.
7. `verified` should not appear as active status until verification workflow exists.
8. Hide real numeric APBDes, leaderboard, alert dini, score, and strong conclusions if data is imported/needs_review.
9. “Memantau bukan menuduh” must be expressed by showing source/status before conclusions.
10. Seed/read path should stay blocked until status/disclaimer UX is approved.
11. Schema/API assumptions may shift toward source grouping and document-first reads.
12. Next gate should be Product/UX Decision Gate, not more engineering execution.

## Top 5 product decisions needed

1. Confirm main journey: search → source/document → status → next action.
2. Confirm homepage hierarchy and what to hide for MVP.
3. Confirm Desa detail hierarchy.
4. Confirm document-first APBDes MVP.
5. Confirm `verified` remains inactive until verification workflow exists.

## Top 5 UX risks

1. Users mistake demo/imported data as official.
2. Too many dashboard signals hide the main journey.
3. APBDes numbers create false authority.
4. Leaderboard/alert dini feels accusatory.
5. Source status is too technical for ordinary citizens.

## Recommended next gate

Recommended next gate:

> Product/UX Decision Gate before seed execution or read path switch.

Gate output should be a short approval note from Iwan/Owner deciding:

- homepage hierarchy,
- desa detail hierarchy,
- status badge labels,
- APBDes document-first MVP,
- hidden/delayed sections,
- read path remains blocked until UI status behavior is ready.

Initiated-by: Owner/Iwan request
Reviewed-by: Pending Owner/Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-review
