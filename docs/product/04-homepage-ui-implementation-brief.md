# Homepage UI Implementation Brief

Date: 2026-04-27
Status: ready-for-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga

## Goal

Refresh homepage visual/content flow without changing data layer.

Keep PantauDesa visually engaging, not government-like, while making the page easier for ordinary citizens to understand.

## Final homepage order

1. `HeroSection` — keep current visual direction.
2. Priority/ranking hook — keep, reframe safely.
3. Citizen Journey Timeline — new.
4. Status Data Cards — new.
5. Document Desk — new.
6. Pilot Area Story — new, Arjasari-focused.
7. Bukan Menuduh Manifesto — refresh `PondasiTransparansiSection`.
8. Final CTA — before/after citizen story.

## Section purpose and copy direction

## 1. HeroSection

Purpose:

- Make users curious and invite them to search desa.

Keep:

- current visual direction,
- receipt/ticker feel,
- strong cinematic design.

Improve lightly:

- avoid overclaiming verified/real-time data,
- add subtle pilot/demo/source-discovery note if needed.

## 2. Priority/ranking hook

Purpose:

- Keep the engaging ranking/priority feel owner likes.

Copy direction:

- Use `Prioritas Cek Transparansi` or `Desa yang Perlu Dilihat Lebih Dulu`.
- Avoid `desa bermasalah`, `mencurigakan`, or accusatory labels.

UI direction:

- ranked/card stack,
- reason chips,
- status badge.

## 3. Citizen Journey Timeline

Purpose:

- Explain PantauDesa in a fresh, non-boring way.

Copy direction:

```text
Penasaran soal desa → Cari desa → Lihat sumber → Baca status → Tanya pihak tepat
```

UI direction:

- horizontal timeline desktop,
- vertical timeline mobile,
- Lucide icons,
- subtle line/path.

## 4. Status Data Cards

Purpose:

- Teach users what data status means before they trust anything.

Cards:

- `Data Demo` — contoh tampilan, bukan data resmi final.
- `Sumber Ditemukan` — sumber publik ditemukan, belum diverifikasi.
- `Perlu Review` — sumber/isi data masih perlu dicek.
- `Terverifikasi` — future state only after review workflow exists.

## 5. Document Desk

Purpose:

- Make public documents tangible and useful.

Cards/folders:

- `APBDes`
- `Realisasi`
- `RKPDes`
- `RPJMDes`
- `Perdes`
- `Profil Desa`

Copy direction:

```text
Dokumen apa yang biasanya bisa dicari warga?
```

## 6. Pilot Area Story

Purpose:

- Make PantauDesa feel real, not dummy.

Copy direction:

```text
Pilot awal: Kecamatan Arjasari
11 desa ditinjau
10 website desa ditemukan
beberapa dokumen APBDes/realisasi terdeteksi
semua masih demo/imported/needs_review
```

## 7. Bukan Menuduh Manifesto

Purpose:

- Preserve civic narrative with better visual rhythm.

Copy direction:

```text
Memantau bukan berarti menuduh. PantauDesa membantu warga membaca informasi publik desa berdasarkan sumber dan status data yang jelas.
```

Cards:

- `Baca sumbernya`
- `Pahami statusnya`
- `Tanya pihak yang tepat`

## 8. Final CTA

Purpose:

- Close with emotional clarity.

Concept:

`Dari bingung jadi tahu harus cek apa`

Before:

- warga buka banyak website,
- bingung dokumen mana yang terbaru.

After:

- PantauDesa merapikan sumber, dokumen, dan status.

## Data/status rules

- Do not show imported/needs_review as verified.
- Do not use accusatory labels.
- Show demo/source-discovery status clearly.
- `Terverifikasi` is future/disabled unless verification workflow exists.
- APBDes numbers should not look final on homepage.
- Document/source explanation comes before numeric conclusion.

## What to keep

- Current `HeroSection` visual direction.
- Ranking/leaderboard engagement feel.
- Desa priority/check-first hook.
- Mock fallback.
- Existing `lucide-react` icon stack.
- Existing Tailwind/CSS animation approach.

## What to reduce/remove

- Reduce chart/donut prominence.
- Reduce generic stats dashboard feel.
- Avoid long civic paragraphs.
- Avoid national/final-sounding claims.
- Avoid heavy new dependency.
- Avoid score/alert/leaderboard language that implies accusation.

## UI-only boundary

This task must not touch:

- schema,
- database,
- seed execution,
- read path switch,
- API,
- auth,
- voice,
- scheduler,
- scraper,
- Prisma runtime.

No new dependency is required for first pass.

Use:

- Tailwind CSS,
- existing components/style,
- `lucide-react`,
- existing CSS transitions/animations.

## Suggested small Ujang tasks — draft for Iwan only

Rangga does not command Ujang directly. If Iwan approves, split into max 3 UI-only tasks.

### Task 1 — Homepage reorder and safe framing

Output:

- update homepage layout order,
- keep HeroSection,
- keep priority/ranking hook,
- rename/reframe alert/ranking copy,
- reduce chart/donut prominence.

Do not touch:

- schema/DB/API/auth/read path/seed.

### Task 2 — Add fresh static sections

Create static UI sections:

- `CitizenJourneySection`
- `DataStatusCardsSection`
- `DocumentDeskSection`
- `PilotAreaStorySection`

Use existing Tailwind + lucide only.

### Task 3 — Refresh civic narrative and QA pass

Refactor/improve:

- `PondasiTransparansiSection` into Bukan Menuduh Manifesto.
- Final CTA into before/after citizen story.

QA:

- mobile spacing,
- no accusatory copy,
- no new dependency,
- no read path/seed/schema changes,
- run lint/typecheck if code changes.

## Risks

- Homepage may still feel crowded if old stats/charts remain too prominent.
- Ranking hook can feel accusatory if copy is wrong.
- Too many new sections can make page longer without improving clarity.
- Status cards must not become boring disclaimers.
- Pilot story must not imply Arjasari data is verified.

## Key decisions already approved

- Keep HeroSection visual direction.
- Keep ranking/priority hook.
- Reframe copy to avoid accusatory tone.
- Reduce chart/donut prominence.
- Add fresh static sections.
- Keep UI-only before seed/read path switch.
- No new dependency for first pass unless Iwan explicitly approves later.

Initiated-by: Iwan approval
Reviewed-by: Pending Iwan/Ujang implementation decision
Executed-by: ChatGPT Freelancer / Rangga
Status: ready-for-iwan-review
