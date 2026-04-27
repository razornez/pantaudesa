# Homepage Visual Concept and Iwan Alignment

Date: 2026-04-27
Status: draft-for-owner-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga
Role: Product Owner + UI/UX Strategist + Product Direction Reviewer

## Context

Owner feedback:

- Current hero design is already liked.
- Peringkat desa section is liked because it feels engaging and not boring.
- Desa yang perlu dicek lebih dahulu is also liked and should remain as a strong hook.
- Other homepage sections feel more boring and need fresher visual concepts.
- PantauDesa should not feel like a government website.
- PantauDesa should feel modern, engaging, civic-tech, and trustworthy.

This document aligns product/UX direction before giving any technical task to Ujang.

## Current homepage observation

Current home structure from `src/app/page.tsx`:

1. `HeroSection`
2. `PondasiTransparansiSection`
3. `StatsCards`
4. `AlertDiniSection`
5. `TrendChart`
6. `SerapanDonut`
7. `DesaLeaderboard`
8. CTA + citizen illustration

Owner likes:

- `HeroSection`
- ranking / leaderboard feel
- desa priority / alert-like hook

Risk:

- the page can feel crowded because civic explanation, stats, alert, charts, ranking, and CTA compete for attention.
- some sections may feel plain compared to the hero.

## Design direction

PantauDesa should become:

> A modern civic-tech experience that helps citizens quickly understand which desa information is available, which source supports it, and what needs review — without making the website feel accusatory or bureaucratic.

Not:

- government portal,
- boring stats dashboard,
- generic SaaS landing page,
- accusatory watchdog page,
- heavy analytics product for experts.

## Visual stack recommendation

Use a light and practical stack:

- Tailwind CSS as visual foundation.
- Existing component style / shadcn-compatible patterns where helpful.
- `lucide-react` for icons, already used in the project.
- lightweight CSS animation first.
- Motion/Framer Motion only if needed for specific micro-interactions later.

Do not add heavy visual dependencies yet unless Iwan approves.

Recommended principle:

> Upgrade concept and composition first. Add animation library only when the design needs it.

## What to keep

## 1. Keep HeroSection

Decision:

- Keep current hero direction.
- Do not redesign from scratch.
- Improve copy/status framing only if needed.

Why:

- Owner likes it.
- It is visually strong and not boring.
- It gives PantauDesa a non-government feel.

Possible minor improvements later:

- add clearer pilot/data status microcopy,
- make CTA hierarchy slightly sharper,
- avoid overclaiming real-time/verified data,
- preserve the visual receipt card and ticker style.

## 2. Keep ranking / leaderboard concept

Decision:

- Keep ranking-like section as a homepage hook.
- Reframe it to avoid accusatory tone.

Recommended label options:

- `Prioritas Cek Transparansi`
- `Desa yang Perlu Dilihat Lebih Dulu`
- `Sorotan Desa untuk Ditinjau`

Avoid:

- `Desa Bermasalah`
- `Desa Mencurigakan`
- `Peringkat Desa Buruk`

Why:

- Owner likes this section.
- It creates engagement.
- It can become a strong product hook if framed safely.

## 3. Keep desa priority / alert-like hook

Decision:

- Keep the concept.
- Make it feel like a review priority, not an accusation.

Recommended framing:

```text
Desa yang perlu dicek lebih dahulu
```

or

```text
Prioritas tinjauan data
```

Reason chip examples:

- `dokumen belum lengkap`
- `sumber perlu review`
- `update lama`
- `status data belum jelas`

## What to improve

## 1. Move from dashboard-first to story-flow

Current page has many analytical blocks.

Recommended rhythm:

```text
Hero cinematic
→ Priority/ranking hook
→ Citizen journey timeline
→ Status data cards
→ Document desk
→ Pilot area story
→ Civic manifesto
```

This keeps the exciting parts while making the rest feel fresher.

## 2. Improve PondasiTransparansiSection

Current role:

- civic explanation / why desa is monitored.

Problem:

- can feel like a text-heavy education block.

New concept:

`Bukan Menuduh, Tapi Membaca`

Layout idea:

- 3 manifesto cards:
  1. `Baca sumbernya`
  2. `Pahami statusnya`
  3. `Tanya pihak yang tepat`

Copy:

```text
Memantau bukan berarti menuduh. PantauDesa membantu warga membaca informasi publik desa berdasarkan sumber dan status data yang jelas.
```

## 3. Improve StatsCards

Current role:

- ringkasan nasional.

Problem:

- if too prominent, it can feel like generic dashboard stats.
- if data is demo, users may misread it as real national coverage.

New concept:

`Apa yang sedang dipetakan?`

Instead of pure national stats, show progress-style cards:

- `Desa terdaftar`
- `Sumber ditemukan`
- `Dokumen tercatat`
- `Masih perlu review`

Important:

- label as pilot/demo/source discovery if not verified.

## 4. Improve AlertDiniSection

Current role:

- early warning / desa needing attention.

Problem:

- can sound accusatory if not framed carefully.

New concept:

`Prioritas Cek Transparansi`

Design:

- card stack or ranked review queue.
- each row has reason chips and status badge.

Copy rule:

- use “perlu dicek” not “bermasalah”.

## 5. Improve TrendChart and SerapanDonut

Current role:

- analytical budget visualization.

Problem:

- can feel too analytical / dashboard-heavy for homepage.
- can imply verified numeric data too early.

New concept:

For homepage MVP, either:

### Option A — collapse into preview

Show as `Contoh cara membaca anggaran`, clearly demo.

### Option B — move to detail page later

Keep homepage focused on sources/documents/status.

Rangga recommendation:

- reduce prominence on homepage.
- avoid making charts the main visual after hero.
- prioritize document/source story first.

## 6. Improve CTA + citizen illustration

Current CTA is good but can feel generic.

New concept:

`Dari bingung jadi tahu harus cek apa`

Before/after layout:

- Before: warga buka banyak website, bingung dokumen mana yang terbaru.
- After: PantauDesa merapikan sumber, dokumen, dan status.

This can become a more emotional close section than a normal CTA.

## Fresh section concepts to add or replace boring blocks

## Concept 1 — Citizen Journey Timeline

Purpose:

Explain how PantauDesa works without boring tutorial copy.

Flow:

```text
Penasaran soal desa
→ Cari desa
→ Lihat sumber
→ Baca status
→ Tanya pihak tepat
```

Design:

- horizontal path on desktop,
- vertical timeline on mobile,
- Lucide icons,
- subtle connecting line.

## Concept 2 — Status Data Cards

Purpose:

Teach demo/imported/needs_review/verified visually.

Cards:

- `Data Demo`
- `Sumber Ditemukan`
- `Perlu Review`
- `Terverifikasi`

Each card should answer:

- artinya apa,
- belum boleh disimpulkan apa.

## Concept 3 — Document Desk

Purpose:

Make public documents more tangible.

Cards/folders:

- `APBDes`
- `Realisasi`
- `RKPDes`
- `RPJMDes`
- `Perdes`
- `Profil Desa`

Design:

- folder / paper stack style,
- hover lift,
- short explanation.

## Concept 4 — Pilot Area Story

Purpose:

Make PantauDesa feel real, not dummy.

Content:

```text
Pilot awal: Kecamatan Arjasari
11 desa ditinjau
10 website desa ditemukan
beberapa dokumen APBDes/realisasi terdeteksi
semua masih demo/imported/needs_review
```

Design:

- map-pin visual,
- desa chips,
- timeline/checklist.

## Concept 5 — Transparency Radar / What We Check

Purpose:

Show what PantauDesa reads, without presenting a final score.

Categories:

- sumber desa,
- dokumen anggaran,
- realisasi,
- profil desa,
- kontak resmi,
- update terbaru.

Label:

```text
Yang dibaca PantauDesa
```

Avoid:

```text
Nilai transparansi desa
```

## Recommended homepage order

Preferred order:

1. HeroSection — keep existing visual direction.
2. Priority/ranking hook — keep, reframe safely.
3. Citizen Journey Timeline — new.
4. Status Data Cards — new.
5. Document Desk — new.
6. Pilot Area Story — new or replace generic stats.
7. Bukan Menuduh Manifesto — improved PondasiTransparansi.
8. Final CTA — before/after citizen story.

Alternative if Iwan wants less change:

1. Keep Hero.
2. Keep AlertDiniSection but rename/reframe.
3. Keep DesaLeaderboard.
4. Replace only Pondasi/Stats/CTA with fresher sections.
5. Reduce chart prominence.

## MVP visual improvement scope

Recommended MVP improvement, no DB/read path needed:

- homepage content hierarchy update,
- rename/reframe sections,
- add 3 new static visual sections:
  - Citizen Journey Timeline,
  - Status Data Cards,
  - Document Desk,
- add Pilot Area Story using existing discovery docs as static copy,
- keep current mock fallback,
- no seed execution,
- no read path switch,
- no API/schema/DB changes.

## What not to do yet

Do not:

- execute seed,
- switch read path,
- build real APBDes numeric dashboard from imported data,
- add heavy animation library without prototype review,
- add scraper/scheduler,
- build final transparency score,
- build accusatory leaderboard.

## Suggested lightweight implementation approach later

If Iwan approves the direction, implementation can be split into small UI-only tasks:

### UI Task 1 — Homepage content hierarchy pass

- reorder existing sections,
- rename labels,
- reduce chart prominence,
- keep hero/ranking/priority hook.

### UI Task 2 — New static visual sections

Create:

- `CitizenJourneySection`
- `DataStatusCardsSection`
- `DocumentDeskSection`
- `PilotAreaStorySection`

### UI Task 3 — Civic manifesto refresh

Refactor/improve:

- `PondasiTransparansiSection`

### UI Task 4 — QA and mobile pass

Check:

- mobile spacing,
- content density,
- status clarity,
- no accusatory copy,
- no performance regression.

## Draft alignment message for Iwan

This is a draft for owner to send to Iwan, not a command to Ujang:

```text
Iwan, owner likes the current HeroSection, peringkat desa, and desa yang perlu dicek lebih dahulu. So the direction is not to remove those hooks.

Please review docs/product/03-homepage-visual-concept-and-iwan-alignment.md.

Proposed direction:
- keep HeroSection visual direction,
- keep ranking/priority hook but reframe safely,
- improve boring sections with fresher concepts:
  1. Citizen Journey Timeline,
  2. Status Data Cards,
  3. Document Desk,
  4. Pilot Area Story,
  5. Bukan Menuduh Manifesto.

No technical instruction to Ujang yet. Need Iwan alignment first:
- approve homepage order,
- approve section names/copy tone,
- approve whether charts are reduced/moved lower,
- approve UI-only scope before any seed/read path switch.
```

## Decisions needed from Iwan/Owner

1. Keep existing HeroSection as-is with minor copy/status refinements?
2. Keep ranking/priority hook as homepage engagement feature?
3. Rename/reframe alert/ranking labels to safer civic language?
4. Reduce chart/donut prominence on homepage?
5. Add Citizen Journey Timeline?
6. Add Status Data Cards?
7. Add Document Desk?
8. Add Pilot Area Story for Arjasari?
9. Refresh PondasiTransparansi into manifesto-style section?
10. Confirm this is UI-only before seed/read path switch?

## Final recommendation

Do not flatten PantauDesa into a boring public-sector portal.

Keep the exciting parts:

- cinematic hero,
- ranking/priority hook,
- visual urgency.

Improve the weak parts:

- education,
- document explanation,
- data status,
- civic narrative,
- pilot story.

The goal:

> PantauDesa should feel like a modern civic-tech product: engaging enough to explore, clear enough for ordinary citizens, and careful enough not to accuse without verified data.

Initiated-by: Owner direction
Reviewed-by: Pending Iwan/Owner
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-alignment
