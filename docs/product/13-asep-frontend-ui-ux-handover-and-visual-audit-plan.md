# Asep Frontend / UI-UX Handover and Visual Audit Plan

**Date:** 2026-04-28
**Author:** Asep (CTO / Senior Frontend + UI-UX)
**Status:** in-execution — P0 accessibility done, P1 safety/hierarchy next
**Scope:** UI-only audit. P0 tasks executed 2026-04-28.

---

## 1. What Asep Reviewed

Sources read:
- `docs/project-management/52-sprint-04-owner-dashboard-and-gate-tracker.md`
- `docs/product/09-sprint-04a-homepage-acceptance-review.md`
- `docs/product/10-sprint-04b-desa-detail-ux-brief.md`
- `docs/product/11-sprint-04b-task-1-detail-first-view-report.md`
- `docs/product/12-sprint-04b-task-2-source-document-snapshot-report.md`
- `docs/product/04-homepage-ui-implementation-brief.md`
- Owner feedback: 20 points on accessibility, hierarchy, copy, safety, and visual direction

Code inspected:
- `src/app/page.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/app/desa/page.tsx`
- `src/app/suara/page.tsx`
- `src/app/panduan/page.tsx`
- `src/app/bandingkan/page.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/components/desa/SourceDocumentSnapshotSection.tsx`
- `src/components/desa/DesaCard.tsx`
- `src/components/desa/DesaHeroCard.tsx`
- `src/components/desa/KinerjaAnggaranCard.tsx`
- `src/components/desa/SkorTransparansiCard.tsx`
- `src/components/desa/TransparansiCard.tsx`
- `src/components/desa/SeharusnyaAdaSection.tsx`
- `src/components/desa/TanggungJawabSection.tsx`
- `src/components/desa/VoiceCard.tsx`
- `src/components/home/HeroSection.tsx`
- `src/components/home/AlertDiniSection.tsx`
- `src/components/home/StatsCards.tsx`
- `src/components/layout/Navbar.tsx`

---

## 2. Current Frontend / UI Status

### What is working well

- Sprint 04A homepage first pass accepted. `CitizenJourneySection`, `DataStatusCardsSection`, `DocumentDeskSection`, `PilotAreaStorySection` are in place.
- Sprint 04B Task 1 and Task 2 accepted. `DesaDetailFirstView` and `SourceDocumentSnapshotSection` are live.
- `copy.ts` is used as source of truth for most static copy.
- Tailwind-only approach maintained. No new dependency added.
- TypeScript passes. 42 tests pass.
- Civic tone is generally safe. No accusatory labels found in new components.
- Data status framing (`Data Demo` badge) is present on detail page first view.
- Mobile layout is mostly responsive. `flex-col sm:flex-row` pattern used correctly in most places.

### What is not working or missing

- **Accessibility** is the most critical gap. No `aria-label`, `role`, or focus-visible indicators on interactive buttons across `DesaCard`, `AlertDiniSection`, `VoiceCard` action buttons, and Navbar mobile menu toggle.
- **Heading hierarchy is broken on homepage.** Multiple `h2` tags used without a `h1`. Screen readers and SEO cannot determine page structure.
- **DesaCard is still too dense.** Shows name, location, status, percentage, 2 money values, population, and category all at once. Owner specifically flagged this.
- **Touch targets are small.** Navbar login button uses `py-2` (~8px vertical padding) and `text-xs`. Some VoiceCard action buttons are similarly small. WCAG recommends 44×44px minimum.
- **Low-contrast text is widespread.** `text-slate-400` on white background at `text-[10px]` and `text-[11px]` fails WCAG AA (4.5:1 required for normal text). This appears in DesaCard, DesaDetailFirstView, SourceDocumentSnapshotSection.
- **Suara Warga page has no explicit empty state for zero results.** Filter state handles it generically.
- **Panduan page lacks search and accordion grouping.** Copy is flat, no `Memulai / Anggaran / Hak Warga / Suara Warga / Akun` category grouping.
- **Bandingkan page has no guided presets.** Picker is blank; user has no starting point.
- **Detail page ordering risk.** After Sprint 04B Task 1 and 2, the page order is: `DesaDetailFirstView` → `SourceDocumentSnapshotSection` → `KelengkapanDesa` → `SeharusnyaAdaSection` → Budget summary cards → `KinerjaAnggaranCard` → `ResponsibilityGuideCard` → `TransparansiCard` → `TanggungJawabSection` → Suara Warga + CTA. The budget numbers (4 stat cards with Rupiah amounts) appear above the transparency/document section. This creates authority bias risk Owner flagged.
- **`PENGADUAN.lapor` links to LAPOR.go.id directly** without checklist gate. Owner flagged this should be `"Cek Langkah Sebelum Melapor"` with pre-report checklist.
- **`94/100` transparency score has no methodology tooltip.** Number appears authoritative without context.
- **`SeharusnyaAdaSection` copy** references `"regulasi Dana Desa & alokasi APBDes"` — still technical. Owner flagged `"Wajib menurut regulasi / Estimasi / Masuk rencana / Perlu ditanyakan"` labeling needed.
- **No sticky mobile summary** on detail page. Owner flagged `"Desa X · Data Demo"` sticky strip as needed.

---

## 3. Main Risks by Page

### Homepage

| Risk | Severity | Status |
|---|---|---|
| Multiple `h2` without `h1` — heading structure broken | High | Not fixed |
| `AlertDiniSection` card buttons lack `aria-label` | Medium | Not fixed |
| Ranking/priority hook copy could drift accusatory over time | Medium | Watch item |
| Too many sections if more are added | Low | Controlled for now |

### Data Desa (listing page)

| Risk | Severity | Status |
|---|---|---|
| `DesaCard` too dense — 8 data points visible at once | High | Not fixed |
| `text-slate-300` arrow icon (`ArrowRight`) fails contrast on white | Medium | Not fixed |
| No `aria-label` on card link | Medium | Not fixed |
| Touch target on small card elements | Medium | Not fixed |

### Desa Detail

| Risk | Severity | Status |
|---|---|---|
| Budget numbers (4 stat cards with Rupiah) appear before document/transparency section | High | Not fixed |
| `PENGADUAN.lapor` direct CTA without checklist gate | High | Not fixed |
| `94/100` score shown with no methodology disclosure | High | Not fixed |
| `SeharusnyaAdaSection` uses overclaiming language without label modifiers | High | Not fixed |
| No sticky mobile summary | Medium | Not fixed |
| Personal contact risk in `PerangkatDesaSection` (phone numbers) | Medium | Needs audit |
| `KelengkapanDesa` uses `ROI visual`, `Omset/Tahun` — jargon not explained | Medium | Not fixed |
| `h1` missing — page title uses `text-lg font-bold` div, not semantic heading | High | Not fixed |

### Suara Warga

| Risk | Severity | Status |
|---|---|---|
| Empty state when filter returns zero results is generic | Medium | Not fixed |
| No explicit "zero data" empty state for no API data | Medium | Not fixed |
| `h1` exists in hero section inside `"use client"` component | Low | Acceptable |

### Panduan

| Risk | Severity | Status |
|---|---|---|
| No category grouping — flat accordion list | Medium | Not fixed |
| No search input | Low | Not fixed |
| `h1` exists correctly | ✅ | Good |

### Bandingkan

| Risk | Severity | Status |
|---|---|---|
| No guided presets — blank picker intimidates new users | High | Not fixed |
| `h1` exists correctly | ✅ | Good |
| Comparison table rows could benefit from `th scope` for screen readers | Low | Not fixed |

---

## 4. Accessibility Audit Checklist

### Target: WCAG AA

| Check | Requirement | Current status | Priority |
|---|---|---|---|
| Normal text contrast | ≥ 4.5:1 | `text-slate-400` on white fails at small sizes | P1 |
| Large text contrast | ≥ 3:1 | Headings generally pass | OK |
| UI/focus indicator contrast | ≥ 3:1 | No `focus-visible` ring on most buttons | P1 |
| Keyboard navigation | Tab order logical | Not audited end-to-end | P1 |
| `aria-label` on icon-only buttons | Required | Missing on VoiceCard actions, Navbar toggle | P1 |
| Heading structure | h1 → h2 → h3 logical | Homepage missing h1; detail page missing semantic h1 | P1 |
| Alt text on images | Descriptive or `alt=""` for decorative | Decorative images use `alt=""` — correct; mascot needs descriptive alt | P2 |
| Touch target size | 44×44px minimum | Navbar login, VoiceCard actions too small | P1 |
| No keyboard trap | Modal/dialog escapable | Not audited | P2 |
| Form labels | All inputs labeled | Form inputs in VoiceCard reply have placeholder only | P2 |
| Color not only indicator | Status not only color | Status badges have text labels — mostly OK | OK |
| Link text | Descriptive, not "click here" | `ArrowRight` icon links need `aria-label` | P2 |

### Specific critical fixes needed

1. Add `<h1>` to homepage (visible or sr-only) and desa detail page.
2. Add `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2` to all interactive elements.
3. Add `aria-label` to: Navbar mobile toggle, VoiceCard helpful/vote buttons, DesaCard link, AlertDiniSection cards.
4. Increase minimum touch target to 44px for mobile action buttons.
5. Elevate or replace `text-[10px] text-slate-400` — either increase size to `text-xs` or increase contrast to `text-slate-600`.

---

## 5. Visual Design System Recommendations

### Current state
Tailwind utility classes applied directly in components. No design token layer. Colors, spacing, and shadow values are repeated across files without abstraction.

### Recommended approach (MVP — no new tooling)

Define a small set of semantic class patterns in a shared file or Tailwind config. Do not introduce a CSS-in-JS library or design token system yet. Use Tailwind's `@layer components` in `globals.css` for the most repeated patterns.

### Color direction (matches Owner visual brief)

```
Civic green:   #16a34a (green-600)  — action, positive, verified
Trust teal:    #0d9488 (teal-600)   — source found, informational
Warm cream:    #fefce8 (yellow-50)  — demo, caution zone
Deep ink:      #0f172a (slate-900)  — headings, primary text
Alert amber:   #d97706 (amber-600)  — needs review, caution
```

### Typography scale (existing Tailwind — apply consistently)

```
Page title:    text-2xl / text-3xl font-black text-slate-900
Section title: text-lg font-bold text-slate-800
Card title:    text-base font-semibold text-slate-800
Body:          text-sm text-slate-700
Caption:       text-xs text-slate-600   ← minimum for accessibility
Micro:         text-[10px] text-slate-500 ← use sparingly, never for critical info
```

### Shadow / elevation system

```
Level 0 — flat:   border border-slate-100
Level 1 — card:   shadow-sm border border-slate-100
Level 2 — raised: shadow-md border border-slate-200
Level 3 — float:  shadow-xl (modals, sticky)
```

### Spacing rhythm

Sections: `space-y-5` (existing, keep)
Card internal: `p-4` (sm) or `p-5` (md) or `p-6` (lg)
Gap between cards: `gap-3` or `gap-4`

---

## 6. Data Status Badge System Proposal

Four states. Visual identity must be immediately recognizable without reading label text.

### Data Demo
```
Icon:       FlaskConical (beaker)
Color:      amber-100 bg / amber-700 text / amber-300 border
Label:      "Data Demo"
Microcopy:  "Contoh tampilan, bukan data resmi final"
Use:        all mock data pages
```

### Sumber Ditemukan
```
Icon:       Link2 or Globe
Color:      sky-100 bg / sky-700 text / sky-300 border
Label:      "Sumber Ditemukan"
Microcopy:  "Sumber publik ditemukan, belum diverifikasi"
Use:        imported data, scraped metadata
```

### Perlu Review
```
Icon:       AlertCircle
Color:      orange-100 bg / orange-700 text / orange-300 border
Label:      "Perlu Review"
Microcopy:  "Sumber atau isi data masih perlu dicek"
Use:        needs_review state
```

### Terverifikasi
```
Icon:       ShieldCheck
Color:      green-100 bg / green-700 text / green-300 border
Label:      "Terverifikasi"
Microcopy:  "Data sudah melalui proses review PantauDesa"
Use:        FUTURE ONLY — disabled/grayed until workflow exists
State now:  render as gray-100 / gray-400 / "Belum tersedia"
```

### Badge component spec

```tsx
// DataStatusBadge — reusable, props-driven
interface DataStatusBadgeProps {
  status: "demo" | "sumber_ditemukan" | "perlu_review" | "terverifikasi";
  size?: "sm" | "md";
  showMicrocopy?: boolean;
}
```

This component does not exist yet. Needs to be created.

---

## 7. Detail Page Safety / Hierarchy Recommendations

### Current order (post Sprint 04B Task 1+2)

```
Nav
DesaDetailFirstView         ← good
SourceDocumentSnapshotSection ← good
KelengkapanDesa             ← too early, too complex
SeharusnyaAdaSection        ← needs label modifiers
Budget stat cards (4×)      ← large Rupiah numbers too early
Sumber pendapatan           ← ok if labeled
KinerjaAnggaranCard         ← should be collapsible and lower
ResponsibilityGuideCard     ← good placement
TransparansiCard            ← tabs good, score needs methodology
TanggungJawabSection        ← direct LAPOR CTA risky
Suara Warga + Pak Waspada   ← CTA needs checklist gate
```

### Recommended order

```
Nav
DesaDetailFirstView         ← identity + status + quick read (keep)
SourceDocumentSnapshotSection ← source/document proof (keep)
Budget stat cards           ← move DOWN, after documents
TransparansiCard (dokumen tab first) ← document-first before numbers
KinerjaAnggaranCard         ← collapsible, after doc section
SeharusnyaAdaSection        ← with label modifiers added
ResponsibilityGuideCard     ← good
KelengkapanDesa             ← move to bottom or collapsible
TanggungJawabSection        ← with checklist gate before LAPOR CTA
Suara Warga                 ← good
Pak Waspada CTA             ← replace direct LAPOR with checklist
```

### Required safety additions before Task 3 (HOLD)

1. **Pre-report checklist** before any LAPOR CTA:
   ```
   Sebelum melapor:
   - [ ] Data berasal dari dokumen resmi yang bisa dibagikan
   - [ ] Masalah memang kewenangan desa (bukan kabupaten/provinsi)
   - [ ] Sudah ada bukti lapangan yang bisa disertakan
   - [ ] Sudah mencoba bertanya ke pihak desa terlebih dahulu
   ```
   CTA label: `"Saya sudah cek — lanjut melapor"` → then show LAPOR link.

2. **Transparency score methodology tooltip:**
   ```
   Skor ini dihitung dari:
   • Ketersediaan dokumen publik
   • Kelengkapan laporan
   • Konsistensi serapan anggaran
   • Respons kanal publik
   Status: Simulasi demo — bukan skor resmi final
   ```

3. **SeharusnyaAdaSection label modifiers:**
   Every item needs one of:
   - `"Wajib menurut regulasi"`
   - `"Estimasi berdasarkan jumlah penduduk"`
   - `"Masuk rencana APBDes"`
   - `"Perlu ditanyakan ke desa"`
   
   Plus microcopy: `"Angka ini adalah estimasi panduan, bukan bukti pelanggaran."`

4. **Perangkat Desa contact safety:**
   Audit `PerangkatDesaSection` for personal phone numbers. Replace with:
   - `"Kantor Desa [Nama]"` + office number only
   - Avoid personal mobile numbers in demo data

5. **Sticky mobile summary strip:**
   ```
   "Desa Sumber Rejeki · Data Demo"
   [Cek Dokumen] [Panduan]
   ```
   Appears when user scrolls past first fold on mobile.

---

## 8. Proposed Task Breakdown by Priority

### P0 — Accessibility critical (must fix before any visual polish)

**A-01** — Heading structure fix ✅ `done 2026-04-28`
- Confirmed: `h1` already present in `HeroSection` (homepage) and `DesaDetailFirstView` (detail page). No change needed.

**A-02** — Focus indicators ✅ `done 2026-04-28`
- `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2` added to: DesaCard link, AlertDiniSection card links, VoiceCard action buttons, Navbar nav links, login button, mobile toggle, logout, notification bell.
- Commit: `70b6184`

**A-03** — Aria labels ✅ `done 2026-04-28`
- `aria-label` added to: DesaCard link, AlertDiniSection cards, VoiceCard helpful/vote/toggle/official-reply buttons, Navbar mobile toggle (with `aria-expanded`), VoiceCard replies toggle (with `aria-expanded`), logout, notification bell.
- `aria-hidden` added to all decorative icons.
- Commit: `70b6184`

**A-04** — Touch targets ✅ `done 2026-04-28`
- `min-h-[44px]` added to: Navbar login button, mobile toggle, logout, notification bell, VoiceCard action buttons.
- Commit: `70b6184`

**A-05** — Text contrast ✅ `done 2026-04-28`
- `text-slate-400` → `text-slate-600` for DesaCard informational text (anggaran, realisasi, penduduk, kategori labels).
- Non-critical decorative captions remain at lower contrast.
- Commit: `70b6184`

---

### P1 — Safety and hierarchy (detail page)

**D-01** — Reorder detail page sections
- Move budget stat cards below TransparansiCard (dokumen tab)
- Files: `src/app/desa/[id]/page.tsx`

**D-02** — Pre-report checklist gate
- Replace direct `LAPOR.go.id` CTA with checklist gate component
- New component: `src/components/desa/PreReportChecklistCard.tsx`
- Files: `src/app/desa/[id]/page.tsx`, `src/lib/copy.ts`

**D-03** — Transparency score methodology
- Add tooltip/info popover to `SkorTransparansiCard`
- Copy: methodology bullets + demo status note
- Files: `src/components/desa/SkorTransparansiCard.tsx`, `src/lib/copy.ts`

**D-04** — SeharusnyaAdaSection label modifiers
- Add label type to each item: Wajib / Estimasi / Rencana / Perlu ditanyakan
- Add microcopy disclaimer
- Files: `src/components/desa/SeharusnyaAdaSection.tsx`, `src/lib/copy.ts`, `src/lib/expectations.ts`

**D-05** — Perangkat Desa contact audit
- Remove or mask personal phone numbers from demo data
- Files: `src/lib/mock-data.ts`, `src/components/desa/PerangkatDesaSection.tsx`

---

### P2 — UX improvements by page

**H-01** — DesaCard density reduction
```
Row 1: nama desa + status badge
Row 2: kecamatan · kabupaten · provinsi
Row 3: progress bar serapan
Row 4: 2 numbers only — diterima | dipakai
Move to detail: population, kategori, per-capita
```

**H-02** — Bandingkan guided presets
- Add 3 example preset buttons above picker:
  - "Bandingkan desa serapan tertinggi vs terendah"
  - "Bandingkan desa dalam kabupaten yang sama"
  - "Bandingkan desa dengan status Perlu Ditinjau"

**H-03** — Suara Warga empty state
- When filter returns 0: show specific empty state card
- When no API data: `"Belum ada suara warga yang bisa ditampilkan. Jadilah warga pertama yang membagikan kondisi desamu."` + CTA

**H-04** — Panduan page IA
- Group FAQ into 5 categories with visual separators
- Add small search input at top: `"Cari pertanyaan…"`

**H-05** — Sticky mobile detail summary
- Appears after scrolling past `DesaDetailFirstView`
- Content: desa name + data status + 2 CTA buttons

---

### P3 — Visual polish and data status system (after P0–P2 done)

**V-01** — `DataStatusBadge` component
- Reusable badge: demo / sumber_ditemukan / perlu_review / terverifikasi(disabled)
- Used across homepage cards, detail page, DesaCard

**V-02** — DesaCard visual refresh
- Apply density reduction from H-01
- Add hover lift effect
- Add progress ring option for serapan

**V-03** — Section visual rhythm on detail page
- Alternate section backgrounds (white / slate-50 / indigo-50) to break monotony
- Add section type labels (Insight / Edukasi / Aksi)

**V-04** — Micro-interactions (low priority, after stability)
- Animated counter on large numbers
- Checklist animation on SeharusnyaAdaSection
- Progress ring on serapan display

---

## 9. What Should Be Done by Asep

Asep can execute the following after Iwan approval:

- P0 accessibility tasks (A-01 through A-05)
- P1 safety and hierarchy tasks (D-01 through D-05)
- P2 UX improvements (H-01 through H-05)
- V-01 DataStatusBadge component creation
- V-02 DesaCard visual refresh

Asep will not command Ujang or Rangga. All execution is Asep's own.

---

## 10. What Should Remain Blocked

Blocked until Iwan explicitly lifts:

- Seed execution
- Read path switch
- Schema / DB / Prisma / migration changes
- API / auth / voice route changes
- Numeric APBDes extraction
- Verified claims in UI
- Scraper / import UI
- Raw snapshot / staging visualization
- Admin verification workflow
- Scheduler implementation

---

## 11. What Should Not Be Implemented Yet

Do not implement in immediate sprints:

- Animations and micro-interactions (V-04) — after stability proven
- Risk Radar visualization — needs design spec first
- Map/radar interface — needs library decision and Iwan approval
- Glassmorphism effects — wait for visual direction confirmation
- `Terverifikasi` active badge — wait for verification workflow
- Heavy new chart library — current Recharts is sufficient
- "Warga Cermat" badge system — needs product logic definition
- Forum / community features — blocked by product decision

---

## 12. Execution Progress

### P0 — DONE (2026-04-28, commit 70b6184)
A-01 through A-05 all complete. TypeScript clean, 42/42 tests pass.

### Next: P1 — Safety and hierarchy

**Recommended next task: D-01 + D-02 combined**
- D-01: Reorder desa detail page sections (budget cards move below TransparansiCard)
- D-02: Pre-report checklist gate (replace direct LAPOR CTA)

These are the two highest product-safety risks identified. No new components for D-01 — only JSX reorder in `src/app/desa/[id]/page.tsx`. D-02 requires one new component `PreReportChecklistCard`.

---

## Key Findings Summary

1. Accessibility is the most critical gap across all pages — heading structure, focus indicators, aria labels, touch targets, and text contrast.
2. DesaCard is too dense — Owner feedback is correct and confirmed by code inspection.
3. Detail page has authority bias risk — budget numbers appear before document/status context.
4. Direct LAPOR CTA without checklist gate is a product safety risk.
5. Transparency score shows `94/100` with no methodology disclosure.
6. SeharusnyaAdaSection uses estimations presented as facts — label modifiers required.
7. Suara Warga and Bandingkan pages need guided empty state and presets respectively.
8. Panduan needs IA improvement with category grouping.
9. Data status badge system does not exist as a reusable component yet.
10. Visual polish (micro-interactions, color system, glassmorphism) should wait until structural and safety issues are resolved.

---

## Decisions Needed from Iwan / Owner

1. ~~Approve execution of P0 accessibility tasks (A-01 through A-05).~~ ✅ Done.
2. **Approve detail page reorder (D-01)** — move budget cards below document section.
3. **Approve pre-report checklist gate (D-02)** — replaces direct LAPOR CTA.
4. Approve `DataStatusBadge` component creation (V-01).
5. Approve DesaCard density reduction (H-01).
6. ~~Confirm Asep is the executor for these tasks.~~ ✅ Confirmed.
7. ~~Confirm animation/visual effects (V-04) are deferred.~~ ✅ Confirmed.
8. ~~Confirm `Terverifikasi` badge remains disabled.~~ ✅ Confirmed.

---

*Reviewed-by: Asep (CTO / Senior Frontend + UI-UX)*
*Status: assessment-complete — awaiting Iwan approval to begin execution*
*Next action: Iwan reviews this doc and approves specific tasks*
