# Owner Feedback UI/UX Visual To-Do Tracker

Date: 2026-04-28
Status: canonical-todo-tracker
Prepared-by: ChatGPT Freelancer / Rangga
Purpose: One source of truth for Owner UI/UX/visual feedback with measurable progress.

## Operating rules

- A task is **not ACCEPTED** just because Asep/Ujang pushed code.
- A task becomes **DONE_PENDING_REVIEW** after implementation is pushed.
- A task becomes **ACCEPTED** only after Iwan/Rangga/Owner review confirms it matches Owner feedback.
- If it does not match Owner feedback, mark **REWORK**.
- If it touches seed/read path/schema/DB/API/scraper/numeric extraction, mark **BLOCKED** unless Iwan explicitly approves.
- Rangga does not command Asep or Ujang directly.
- Iwan remains command owner.
- Owner approves sensitive visual/trust/data gates.

## Review protocol

- Every implementation report must list the exact tracker IDs being addressed.
- Every implementation report must include affected pages/routes.
- Every implementation report must include what reviewers should check.
- Pushed code means `DONE_PENDING_REVIEW`, not `ACCEPTED`.
- Iwan/Rangga reviews implementation against tracker IDs.
- Owner-sensitive items need Owner approval before `ACCEPTED`.
- Mismatch against acceptance criteria becomes `REWORK`.
- If work expands into seed/read path/schema/DB/API/scraper/numeric extraction without explicit gate approval, mark related item `BLOCKED`.

## Status values

- `TODO`
- `IN_PROGRESS`
- `DONE_PENDING_REVIEW`
- `ACCEPTED`
- `REWORK`
- `BLOCKED`
- `DEFERRED`

## Progress summary

Total Owner Feedback Items: **66**

| Status | Count |
|---|---:|
| ACCEPTED | 7 / 66 |
| DONE_PENDING_REVIEW | 0 / 66 |
| IN_PROGRESS | 1 / 66 |
| REWORK | 0 / 66 |
| BLOCKED | 9 / 66 |
| DEFERRED | 6 / 66 |
| TODO | 43 / 66 |

Note: ACCEPTED includes A11Y-01 through A11Y-05 plus the previously accepted homepage first-pass guardrails HOME-01 and HOME-08.

## Next gate

Next gate is **Detail safety/hierarchy**.

Tracker IDs in next gate:

- `DETAIL-HIER-01`
- `DETAIL-HIER-06`
- `DETAIL-RISK-01`
- `DETAIL-RISK-02`
- `REPORT-01` to `REPORT-07`
- `SCORE-01`
- `METRIC-06`
- `RIGHTS-01`
- `RIGHTS-06`

Purpose:

Prevent PantauDesa from looking accusatory, overconfident, or unsafe before seed/read path/data expansion.

## 1. Accessibility

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| A11Y-01 | All pages | WCAG AA color contrast | Normal text contrast meets WCAG AA. Small captions avoid low-contrast `text-slate-400` on white unless decorative. | P0 | Low-vision users may not read important text. | Asep | Rangga/Iwan | ACCEPTED | `docs/product/13-asep-frontend-ui-ux-handover-and-visual-audit-plan.md`, commit `70b6184` | Accepted by Iwan/Owner update. |
| A11Y-02 | All interactive elements | Visible keyboard focus | Buttons, links, toggles, cards, and icon controls show clear `focus-visible` ring. | P0 | Keyboard users must know where focus is. | Asep | Rangga/Iwan | ACCEPTED | `docs/product/13...`, commit `70b6184` | Accepted by Iwan/Owner update. |
| A11Y-03 | Homepage + Detail | Heading structure | Homepage and desa detail have logical semantic h1/h2/h3 structure. | P0 | Screen readers and SEO need readable hierarchy. | Asep | Rangga/Iwan | ACCEPTED | `docs/product/13...` | Accepted by Iwan/Owner update. |
| A11Y-04 | Mobile / all controls | Touch targets | Important tap targets meet minimum 44×44px, especially nav, cards, votes, CTAs. | P0 | Mobile users may struggle with small targets. | Asep | Rangga/Iwan | ACCEPTED | `docs/product/13...`, commit `70b6184` | Accepted by Iwan/Owner update. |
| A11Y-05 | Buttons/cards/icons | Aria labels | Icon-only and ambiguous controls have descriptive `aria-label`; decorative icons are `aria-hidden`. | P0 | Assistive tech needs clear labels. | Asep | Rangga/Iwan | ACCEPTED | `docs/product/13...`, commit `70b6184` | Accepted by Iwan/Owner update. |
| A11Y-06 | Mobile / low vision | Mobile/low-vision readability | Mobile text remains readable; no critical info uses tiny text; layout spacing supports scanning. | P1 | Ordinary users may miss meaning on phone. | Asep | Rangga | IN_PROGRESS | `docs/product/13...` | Remains in progress; full mobile readability still needs review. |

## 2. Primary user journey

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| JOURNEY-01 | Homepage | Make Cari Desa the primary funnel | Homepage first journey clearly pushes user to search/find desa before interpreting complex data. | P1 | User should not get lost in dashboard content. | Asep/Ujang | Rangga/Iwan | TODO | `docs/product/09-sprint-04a-homepage-acceptance-review.md` | Homepage accepted first pass, but first-click validation still needed. |
| JOURNEY-02 | All pages | Consistent CTA across pages | Primary CTAs use consistent language: `Cari Desa`, `Lihat Dokumen`, `Cara Membaca Data`, `Ceritakan Kondisi Desaku`. | P1 | Mixed CTAs confuse the main journey. | Asep/Ujang | Rangga | TODO | `docs/product/14-owner-feedback-ui-ux-visual-acceptance-criteria.md` | Needs CTA inventory. |
| JOURNEY-03 | Homepage | Homepage search bar | Search/find desa is visually prominent and easy to use. | P1 | User should know what to do next in first seconds. | Asep/Ujang | Rangga/Iwan | TODO | `docs/product/04-homepage-ui-implementation-brief.md` | Confirm current hero/search behavior. |
| JOURNEY-04 | Cross-page journey | Cari desa → status → source/document → question/voice | User can follow: Cari desa → Lihat status data → Baca sumber/dokumen → Ajukan pertanyaan/suara warga. | P1 | Product needs one clear benang merah. | Rangga/Asep | Iwan/Owner | TODO | `docs/product/10-sprint-04b-desa-detail-ux-brief.md` | Needs journey QA after detail page updates. |

## 3. Homepage visual/data experience

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| HOME-01 | Homepage | Avoid too many sections competing | Homepage first pass is accepted and no new major sections are added unless Owner requests. | P1 | Homepage can become crowded again. | Rangga/Iwan | Owner | ACCEPTED | `docs/product/09-sprint-04a-homepage-acceptance-review.md` | Accepted as first pass; future work should be polish/reduction. |
| HOME-02 | Homepage | Improve visual rhythm | Sections alternate between hook, education, data status, document, pilot story, civic narrative, and CTA without monotony. | P2 | Other sections felt boring before. | Asep/Ujang | Rangga/Owner | TODO | `docs/product/07-homepage-ui-task-2-static-sections-report.md` | Needs visual owner review, not just doc review. |
| HOME-03 | Homepage | Make data feel visual | Data is represented through cards, status badges, document desk, journey timeline, and non-heavy visuals. | P2 | Data should feel engaging, not like table/report. | Asep/Ujang | Owner/Rangga | TODO | `docs/product/07...` | Visual acceptance still needed. |
| HOME-04 | Homepage | Animated counters | Counters may animate subtly without implying real verified data. | P3 | Data visual should feel alive. | Asep | Rangga/Iwan | DEFERRED | Owner feedback handoff | Defer until P0/P1 stable; respect reduced-motion. |
| HOME-05 | Homepage | Risk radar | Risk/radar concept must be non-accusatory, framed as `Yang Perlu Dicek` or `Radar Baca Data`, not corruption risk. | P3 | Visual idea is important but sensitive. | Rangga concept, Asep later | Owner/Iwan | BLOCKED | `docs/product/14-owner-feedback-ui-ux-visual-acceptance-criteria.md` | Blocked until methodology and wording approved. |
| HOME-06 | Homepage / status | Stronger Data Demo/status visual system | Data Demo/status badges are visually memorable and appear near important demo metrics. | P1 | Users must not read demo as official. | Asep | Rangga/Iwan | TODO | `docs/product/06-homepage-ui-task-1-1-copy-cleanup-report.md` | Badge exists in first pass; reusable system still not done. |
| HOME-07 | Homepage / visual identity | Warm civic-tech premium direction | Visual feel is modern, warm, data-rich, and human, not stiff government portal or generic SaaS. | P1 | Owner wants fresh, not boring government site. | Owner/Rangga/Asep | Owner | TODO | Owner feedback, `docs/product/03-homepage-visual-concept-and-iwan-alignment.md` | Needs visual review against live UI. |
| HOME-08 | Homepage | Do not expand homepage endlessly | Future homepage work should not add more major sections; only polish/reduce after first pass. | P1 | Avoid returning to crowded homepage. | Iwan/Rangga | Owner | ACCEPTED | `docs/product/09-sprint-04a-homepage-acceptance-review.md` | Keep as operating rule. |

## 4. Data Desa page

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| DATA-DESA-01 | Data Desa / DesaCard | Reduce card density | DesaCard shows fewer visible data points and feels easier to scan. | P1 | Listing cards are too dense. | Asep/Ujang | Rangga/Owner | TODO | `docs/product/13...` | High product UX priority. |
| DATA-DESA-02 | Data Desa / DesaCard | Card hierarchy row 1 | Row 1 shows `nama desa + status badge` only. | P1 | Users need fast identity/status. | Asep/Ujang | Rangga | TODO | Owner feedback | Part of card redesign. |
| DATA-DESA-03 | Data Desa / DesaCard | Card hierarchy row 2 | Row 2 shows location: kecamatan/kabupaten/provinsi. | P1 | Location should be clear but secondary. | Asep/Ujang | Rangga | TODO | Owner feedback | Part of card redesign. |
| DATA-DESA-04 | Data Desa / DesaCard | Card hierarchy row 3 | Row 3 shows progress/serapan in simple visual. | P1 | Keep one visual progress signal. | Asep/Ujang | Rangga | TODO | Owner feedback | Needs demo/status label nearby if data demo. |
| DATA-DESA-05 | Data Desa / DesaCard | Card hierarchy row 4 | Row 4 shows only 2 numbers: `diterima` and `dipakai`. | P1 | Too many numbers confuse users. | Asep/Ujang | Rangga | TODO | Owner feedback | Other metrics moved to detail. |
| DATA-DESA-06 | Data Desa / Detail | Move extra details to detail page | Population, category, per-capita, and extra metadata move to detail/expanded state. | P1 | Listing should not become data dump. | Asep/Ujang | Rangga | TODO | `docs/product/13...` | Confirm which details are still needed. |
| DATA-DESA-07 | Data Desa / clickable cards | Hover lift and better clickable feel | Cards clearly feel clickable with hover lift/focus state and accessible link label. | P2 | Interaction should feel modern and obvious. | Asep/Ujang | Rangga | TODO | Owner feedback | Must keep keyboard focus visible. |

## 5. Data status system

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| STATUS-01 | All important values | Badge near important number/chart/card | Every important metric/chart/card has nearby data status when demo/imported/needs_review. | P0 | Users may mistake demo as official. | Asep | Rangga/Iwan | TODO | Owner feedback | Required before read path. |
| STATUS-02 | Status labels | Four status states | System supports `Data Demo`, `Sumber Ditemukan`, `Perlu Review`, `Terverifikasi`. | P0 | Status must be consistent across pages. | Asep | Rangga/Iwan | TODO | `docs/product/13...` | Reusable component recommended. |
| STATUS-03 | Verified state | Terverifikasi disabled/future | `Terverifikasi` cannot appear active until verification workflow exists. | P0 | Avoid false trust. | Asep/Rangga | Iwan/Owner | BLOCKED | `docs/product/10-sprint-04b-desa-detail-ux-brief.md` | Blocked until verification workflow. |
| STATUS-04 | Visual system | Data Demo amber/cream + beaker | Data Demo badge uses amber/cream and beaker/flask icon with microcopy. | P1 | Demo data must be memorable. | Asep | Rangga/Owner | TODO | `docs/product/13...` | Visual spec accepted? needs Owner check. |
| STATUS-05 | Visual system | Sumber Ditemukan blue/teal + link | Sumber Ditemukan badge uses blue/teal + link/globe icon and clear microcopy. | P1 | Source found should not imply verified. | Asep | Rangga/Owner | TODO | `docs/product/13...` | Reusable status badge. |
| STATUS-06 | Visual system | Perlu Review orange + alert | Perlu Review badge uses orange/amber + alert icon, caution but not scary. | P1 | Review status should be clear but not accusatory. | Asep | Rangga/Owner | TODO | `docs/product/13...` | Avoid red/danger tone. |
| STATUS-07 | Visual system | Terverifikasi green + shield-check | Terverifikasi badge uses green + shield-check but disabled/future until workflow. | P1 | Verified must be visually distinct later. | Asep | Owner/Iwan | BLOCKED | `docs/product/13...` | Design can exist disabled; active use blocked. |

## 6. Suara Warga

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| VOICE-01 | Suara Warga | Fix empty state that looks broken | Empty results state is intentional and helpful, not a blank/broken page. | P2 | Empty state can confuse users. | Asep/Ujang | Rangga | TODO | `docs/product/13...` | Needed for no results and no data. |
| VOICE-02 | Suara Warga | Empty state copy | Copy: `Belum ada suara warga yang bisa ditampilkan. Jadilah warga pertama yang membagikan kondisi desamu.` | P2 | Encourage safe participation. | Asep/Ujang | Rangga | TODO | Owner feedback | Must match owner copy. |
| VOICE-03 | Suara Warga | Empty state CTA | CTA: `Ceritakan Kondisi Desaku`. | P2 | User needs clear next action. | Asep/Ujang | Rangga | TODO | Owner feedback | CTA should not sound like complaint escalation. |
| VOICE-04 | Suara Warga | Skeleton loading max 1–2 seconds | Loading skeleton should not feel stuck; after loading, show data or empty state. | P2 | Loading should not feel broken. | Asep/Ujang | Rangga | TODO | Owner feedback | Implementation depends on current data behavior. |

## 7. Panduan page

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| GUIDE-01 | Panduan | Improve IA | Panduan is grouped by clear user questions/categories, not flat list only. | P2 | Users need easier guidance. | Asep/Ujang | Rangga | TODO | `docs/product/13...` | No heavy process needed. |
| GUIDE-02 | Panduan | Category: Memulai | Includes clear `Memulai` category. | P2 | New users need entry path. | Asep/Ujang | Rangga | TODO | Owner feedback | Part of IA pass. |
| GUIDE-03 | Panduan | Category: Memahami Anggaran Desa | Includes `Memahami Anggaran Desa` category. | P2 | Budget education must be findable. | Asep/Ujang | Rangga | TODO | Owner feedback | Part of IA pass. |
| GUIDE-04 | Panduan | Category: Hak Warga | Includes `Hak Warga` category. | P2 | Civic rights content must be easy to find. | Asep/Ujang | Rangga | TODO | Owner feedback | Part of IA pass. |
| GUIDE-05 | Panduan | Category: Suara Warga | Includes `Suara Warga` category. | P2 | Voice feature needs guidance. | Asep/Ujang | Rangga | TODO | Owner feedback | Part of IA pass. |
| GUIDE-06 | Panduan | Category: Akun & Keamanan | Includes `Akun & Keamanan` category. | P2 | Account/auth questions must be findable. | Asep/Ujang | Rangga | TODO | Owner feedback | Part of IA pass. |
| GUIDE-07 | Panduan | Accordion or sticky sidebar | Use accordion or sticky/sidebar navigation depending layout. | P2 | Avoid long flat page. | Asep/Ujang | Rangga | TODO | Owner feedback | Choose simplest approach first. |
| GUIDE-08 | Panduan | Small search | Add small search input with placeholder `Cari pertanyaan…`. | P2 | Users may look for specific help. | Asep/Ujang | Rangga | TODO | Owner feedback | Lightweight client filtering OK. |

## 8. Bandingkan page

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| COMPARE-01 | Bandingkan | Guided preset comparisons | Page offers preset comparisons before blank picker. | P2 | Users do not know where to start. | Asep/Ujang | Rangga/Iwan | TODO | `docs/product/13...` | Use static presets first. |
| COMPARE-02 | Bandingkan | Preset: serapan tertinggi vs terendah | Preset exists and is clearly labeled. | P2 | Give simple meaningful entry point. | Asep/Ujang | Rangga | TODO | Owner feedback | Demo/mock OK. |
| COMPARE-03 | Bandingkan | Preset: same kabupaten | Preset exists for comparing desa in same kabupaten. | P2 | More relevant local comparison. | Asep/Ujang | Rangga | TODO | Owner feedback | Needs mock-safe copy. |
| COMPARE-04 | Bandingkan | Preset: status Perlu Ditinjau | Preset exists for desa with `Perlu Ditinjau` status. | P2 | Connects to priority hook. | Asep/Ujang | Rangga | TODO | Owner feedback | Avoid accusation. |
| COMPARE-05 | Bandingkan | Helper copy | Copy: `Tidak tahu mulai dari mana? Coba bandingkan…` | P2 | Reduce blank-state intimidation. | Asep/Ujang | Rangga | TODO | Owner feedback | Add near picker. |

## 9. Trust layer / methodology

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| TRUST-01 | Trust layer | Bagaimana data diproses? | Add clear explanation of data pipeline in citizen language. | P1 | Users need trust context. | Rangga copy, Asep execute | Owner/Iwan | TODO | Owner feedback | Could be page/section/tooltip. |
| TRUST-02 | Trust layer | Sumber publik ditemukan | Explain `Sumber publik ditemukan` means source exists, not verified truth. | P1 | Avoid false certainty. | Rangga/Asep | Rangga/Iwan | TODO | Owner feedback | Must connect to status badge. |
| TRUST-03 | Trust layer | Dokumen diklasifikasi | Explain documents are classified by type/year/status. | P1 | Document-first approach needs clarity. | Rangga/Asep | Rangga | TODO | Owner feedback | No numeric extraction implied. |
| TRUST-04 | Trust layer | Data ditandai statusnya | Explain every data point needs status. | P1 | Status is core trust layer. | Rangga/Asep | Rangga/Iwan | TODO | Owner feedback | Required before read path. |
| TRUST-05 | Trust layer | Review dilakukan | Explain review is required before verified claims. | P1 | Prevent imported becoming verified. | Rangga/Asep | Owner/Iwan | BLOCKED | Owner feedback | Full review workflow not built. Copy can be explanatory only. |
| TRUST-06 | Trust layer | User membaca dengan konteks | UI helps users read with context and not jump to conclusions. | P1 | Memantau bukan menuduh. | Rangga/Asep | Owner/Iwan | TODO | Owner feedback | Needs sitewide copy consistency. |

## 10. Detail page safety and hierarchy

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| DETAIL-HIER-01 | Desa Detail | Avoid information overload | First view is not data dump; advanced data collapsed. | P1 | Users get confused by too much info. | Asep/Ujang | Rangga/Owner | TODO | `docs/product/10...` | Core 04B principle. Next gate. |
| DETAIL-HIER-02 | Desa Detail | Split into Ringkasan, Anggaran, Dokumen & Transparansi, Panduan Warga | Detail page visibly groups these areas. | P1 | Clear mental model for citizens. | Asep/Ujang | Rangga/Owner | TODO | Owner feedback | Section labels should be visible. |
| DETAIL-HIER-03 | Mobile Detail | Sticky mobile mini-summary | Mobile sticky summary shows desa + data status + safe quick actions. | P2 | Long page needs orientation. | Asep | Rangga/Owner | TODO | `docs/product/13...` | Must not harm accessibility. |
| DETAIL-HIER-04 | Detail visual grouping | Visual grouping: Insight, Education, Action | Sections have type labels or visual rhythm indicating insight/education/action. | P2 | Avoid monotony. | Asep/Ujang | Rangga/Owner | TODO | Owner feedback | Use simple labels/backgrounds. |
| DETAIL-HIER-05 | Detail copy | Copy reduction to bullets | Long copy becomes bullets, cards, or expandable text. | P2 | Users should not be overwhelmed. | Rangga copy, Asep execute | Rangga | TODO | Owner feedback | Apply across detail page. |
| DETAIL-HIER-06 | Detail first view | First view must not be data dump | Above fold shows identity, status, quick summary, source/doc snapshot, not all metrics. | P1 | First impression should guide, not overwhelm. | Asep/Ujang | Rangga/Owner | TODO | `docs/product/10...` | Critical for 04B acceptance. Next gate. |

## 11. Detail page data interpretation risk

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| DETAIL-RISK-01 | Desa Detail | Prevent Data Demo being read as official | Data Demo badge and microcopy appear near first view and key values. | P0 | Screenshot/user interpretation risk. | Asep | Rangga/Iwan | TODO | `docs/product/10...` | Required before read path. Next gate. |
| DETAIL-RISK-02 | Desa Detail | Add status near every large number | Large Rupiah, percentages, scores, and charts show status badge or nearby disclaimer. | P0 | Numbers create false authority. | Asep | Rangga/Iwan | TODO | Owner feedback | Required before DB data. Next gate. |
| DETAIL-RISK-03 | Desa Detail | Avoid authority bias from Rp besar, 96%, 94/100, names/contact | Big values and names cannot appear without context/methodology/status. | P0 | Users may trust/screenshot out of context. | Asep/Rangga | Owner/Iwan | TODO | `docs/product/13...` | High risk. |
| DETAIL-RISK-04 | Desa Detail / sharing | Screenshot sharing risk reduced | First-screen and score/metrics areas include enough context that screenshots do not mislead. | P1 | Screenshots can circulate without context. | Asep/Rangga | Owner/Iwan | TODO | Owner feedback | Needs manual screenshot review. |

## 12. Detail page reporting safety

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| REPORT-01 | Detail CTA | Replace direct `Lapor ke LAPOR.go.id` | Direct LAPOR CTA replaced with pre-report safety gate. | P0 | Avoid unsafe escalation without context. | Asep | Rangga/Iwan | TODO | `docs/product/13...` | Next gate. |
| REPORT-02 | Detail CTA | Use `Cek Langkah Sebelum Melapor` | CTA label changes to checklist-first wording. | P0 | Encourage responsible action. | Asep | Rangga/Iwan | TODO | Owner feedback | Next gate. |
| REPORT-03 | Report checklist | Checklist item 1 | `Pastikan data berasal dari dokumen resmi.` | P0 | Reports should be evidence-based. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Next gate. |
| REPORT-04 | Report checklist | Checklist item 2 | `Cek apakah masalah termasuk kewenangan desa.` | P0 | Avoid wrong authority escalation. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Next gate. |
| REPORT-05 | Report checklist | Checklist item 3 | `Dokumentasikan bukti lapangan.` | P0 | Encourage responsible reporting. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Next gate. |
| REPORT-06 | Report checklist | Checklist item 4 | `Gunakan jalur tanya dulu sebelum eskalasi.` | P0 | Memantau bukan menuduh. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Next gate. |
| REPORT-07 | Report CTA | Report CTA only after context/checklist | External reporting option appears only after checklist/context interaction. | P0 | Prevent impulsive report CTA. | Asep | Rangga/Iwan | TODO | Owner feedback | Next gate. |

## 13. Detail metric hierarchy

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| METRIC-01 | Detail primary metrics | Primary: status data | Status data is primary and near top. | P0 | Status frames all interpretation. | Asep | Rangga/Iwan | TODO | Owner feedback | Required before read path. |
| METRIC-02 | Detail primary metrics | Primary: total anggaran | Total anggaran appears only with status and context. | P1 | Big number can mislead. | Asep | Rangga/Iwan | TODO | Owner feedback | Could be lower than docs. |
| METRIC-03 | Detail primary metrics | Primary: serapan | Serapan appears with status and explanation; not final if demo. | P1 | Percentage may imply judgment. | Asep | Rangga/Iwan | TODO | Owner feedback | Label demo/needs_review. |
| METRIC-04 | Detail primary metrics | Primary: dokumen tersedia | Document availability appears as primary because document-first. | P1 | Source/document should come before conclusions. | Asep | Rangga/Iwan | TODO | Owner feedback | Near top. |
| METRIC-05 | Detail secondary metrics | Secondary: aset desa | Aset desa not first-fold dominant; shown after core context or collapsed. | P2 | Avoid clutter. | Asep | Rangga | TODO | Owner feedback | Check `KelengkapanDesa`. |
| METRIC-06 | Detail secondary metrics | Secondary: skor keterbukaan | Score shown only after methodology/status context. | P0 | Score authority risk. | Asep/Rangga | Owner/Iwan | TODO | Owner feedback | High trust risk. Next gate with SCORE-01. |
| METRIC-07 | Detail secondary metrics | Secondary: rincian sumber dana | Source fund details are not primary first-fold content. | P2 | Avoid overwhelming users. | Asep | Rangga | TODO | Owner feedback | Collapse if dense. |
| METRIC-08 | Detail tertiary metrics | Tertiary: daftar aset detail | Detailed asset list is lower/collapsed. | P2 | Detail page too crowded. | Asep | Rangga | TODO | Owner feedback | Move down/collapse. |
| METRIC-09 | Detail tertiary metrics | Tertiary: panduan eskalasi | Escalation guide appears after context/checklist, not as first action. | P1 | Avoid unsafe action. | Asep/Rangga | Iwan | TODO | Owner feedback | Related REPORT items. |

## 14. Hak Wargamu

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| RIGHTS-01 | Hak Wargamu / SeharusnyaAda | Avoid overclaiming | Section does not present estimates/plans as proof of violation. | P0 | Avoid accusation and legal risk. | Asep/Rangga | Owner/Iwan | TODO | `docs/product/13...` | High trust risk. Next gate. |
| RIGHTS-02 | Hak Wargamu | Label: Wajib menurut regulasi | Items that are regulatory requirements use this label. | P1 | Clarify certainty level. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Needs data mapping. |
| RIGHTS-03 | Hak Wargamu | Label: Estimasi berdasarkan jumlah penduduk | Estimates use this label. | P1 | Avoid treating estimates as facts. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Required. |
| RIGHTS-04 | Hak Wargamu | Label: Masuk rencana APBDes | Planned items use this label. | P1 | Separate plan from obligation. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Required. |
| RIGHTS-05 | Hak Wargamu | Label: Perlu ditanyakan ke desa | Unclear items use this label. | P1 | Safe civic action. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Required. |
| RIGHTS-06 | Hak Wargamu | Microcopy caution | Copy: `Angka ini adalah estimasi panduan, bukan bukti pelanggaran.` | P0 | Avoid overclaiming. | Asep/Rangga | Iwan/Owner | TODO | Owner feedback | Must be visible. Next gate. |
| RIGHTS-07 | Hak Wargamu | Stronger visual checklist treatment | Section uses checklist treatment to guide reading, not scare users. | P2 | More engaging and clearer. | Asep | Rangga/Owner | TODO | Owner feedback | Visual after labels/copy. |

## 15. Contact/personal data risk

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| CONTACT-01 | Detail / contact data | Avoid personal phone numbers | No personal mobile numbers appear in demo/public UI unless explicitly approved. | P0 | Privacy/personal data risk. | Asep/Rangga | Owner/Iwan | TODO | `docs/product/13...` | Audit needed. |
| CONTACT-02 | Demo contacts | Use placeholders if demo | Demo contact uses `Kepala Desa — [Nama Pejabat]`, `Nomor kantor desa — [Nomor resmi kantor]`. | P0 | Avoid fake personal contact realism. | Asep/Rangga | Owner/Iwan | TODO | Owner feedback | Required if contacts shown. |
| CONTACT-03 | Official channels | Prioritize official channels | Contact hierarchy: kantor desa, website desa, email resmi, LAPOR.go.id, hotline resmi. | P1 | Users need safe official path. | Asep/Rangga | Iwan/Owner | TODO | Owner feedback | Must align with report gate. |

## 16. Document-first APBDes

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| DOC-01 | Desa Detail | Document section near top | Document/source section appears above heavy budget metrics. | P1 | Users need evidence/context first. | Asep | Rangga/Owner | TODO | `docs/product/10...` | Related to detail safety hierarchy. |
| DOC-02 | Document cards | APBDes 2024 card | APBDes 2024 card exists if data/mock supports it, with status and source. | P2 | Documents should be tangible. | Asep/Ujang | Rangga | TODO | Owner feedback | Mock/static first. |
| DOC-03 | Document cards | RKPDes card | RKPDes card exists if available/mock, with status and source. | P2 | Planning docs matter. | Asep/Ujang | Rangga | TODO | Owner feedback | Mock/static first. |
| DOC-04 | Document cards | Laporan Realisasi card | Laporan Realisasi card exists with status and source. | P2 | Realization document is important. | Asep/Ujang | Rangga | TODO | Owner feedback | Mock/static first. |
| DOC-05 | Document cards | Perdes card | Perdes card exists if available/mock, with status and source. | P2 | Regulation docs matter. | Asep/Ujang | Rangga | TODO | Owner feedback | Mock/static first. |
| DOC-06 | Document cards | Profil Desa card | Profil Desa card exists with status and source. | P2 | Basic profile source matters. | Asep/Ujang | Rangga | TODO | Owner feedback | Mock/static first. |
| DOC-07 | Document row fields | Each document has name/year/source/status/CTA | Every document card/row shows name, year, source, status, button `Lihat sumber`. | P1 | Documents need context. | Asep/Ujang | Rangga/Iwan | TODO | Owner feedback | No raw URL dump. |
| DOC-08 | APBDes interpretation | No numeric conclusion before document/status context | Numeric APBDes conclusions are hidden/collapsed or clearly demo until document/status context appears. | P0 | Avoid false authority. | Asep/Rangga | Iwan/Owner | BLOCKED | Owner feedback | Numeric extraction blocked. UI can show caution only. |

## 17. Transparency score methodology

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| SCORE-01 | Detail / score | `94/100` must show methodology | Any score has visible tooltip/info explaining methodology and demo status. | P0 | Score appears authoritative. | Asep/Rangga | Owner/Iwan | TODO | `docs/product/13...` | Next gate with METRIC-06. |
| SCORE-02 | Score tooltip | Methodology: Ketersediaan dokumen publik | Tooltip includes this factor. | P1 | Explain score basis. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Required text. |
| SCORE-03 | Score tooltip | Methodology: Kelengkapan laporan | Tooltip includes this factor. | P1 | Explain score basis. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Required text. |
| SCORE-04 | Score tooltip | Methodology: Konsistensi serapan | Tooltip includes this factor. | P1 | Explain score basis. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Required text. |
| SCORE-05 | Score tooltip | Methodology: Respons kanal publik | Tooltip includes this factor. | P1 | Explain score basis. | Asep/Rangga | Rangga/Iwan | TODO | Owner feedback | Required text. |
| SCORE-06 | Score tooltip | Status: simulasi demo | Tooltip/status says score is simulation demo, not official final. | P0 | Prevent false trust. | Asep/Rangga | Owner/Iwan | TODO | Owner feedback | Required. |

## 18. Visual design direction

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| VISUAL-01 | Design system | Civic-tech premium | UI feels civic-tech premium, not stiff government portal. | P1 | Owner wants modern but trusted. | Owner/Rangga/Asep | Owner | TODO | Owner feedback | Needs visual review. |
| VISUAL-02 | Design system | Warm, modern, data-rich | UI feels warm, modern, and data-rich without overwhelming. | P1 | Avoid boring government feel. | Asep | Owner/Rangga | TODO | Owner feedback | Balance richness vs clarity. |
| VISUAL-03 | Tone | Warga merasa dibantu, bukan digurui | Copy/design feels helpful, not patronizing. | P1 | Product should guide ordinary citizens. | Rangga/Asep | Owner/Iwan | TODO | Owner feedback | Copy review required. |
| VISUAL-04 | Product metaphor | Dashboard transparansi yang manusiawi | Dashboard elements are humanized with context, source, and action. | P2 | Data should feel useful, not cold. | Asep/Rangga | Owner | TODO | Owner feedback | Related to metric hierarchy. |
| VISUAL-05 | Storytelling | Editorial data storytelling | Important sections tell a guided story: context → source → status → action. | P2 | Make users curious to read. | Rangga/Asep | Owner | TODO | Owner feedback | Good for detail page. |
| VISUAL-06 | Map/radar interface | Map/radar interface idea | Map/radar interface explored only after methodology and visual spec. | P3 | Fresh visual idea. | Rangga concept, Asep later | Owner/Iwan | DEFERRED | Owner feedback | Needs design spec/library decision. |
| VISUAL-07 | Effects | Light glassmorphism | Light glassmorphism used sparingly, readable, performant, and accessible. | P3 | Fresh premium feel. | Asep | Owner/Rangga | DEFERRED | Owner feedback | Do not apply before core safety. |
| VISUAL-08 | Direction | Warm government transparency report, not stiff admin panel | Visual language balances civic report and product interface. | P1 | Avoid admin panel vibe. | Asep/Rangga | Owner | TODO | Owner feedback | Needs before/after review. |
| VISUAL-09 | Palette | Civic green | Palette includes civic green for action/positive/verified later. | P2 | Consistent color identity. | Asep | Owner/Rangga | TODO | Owner feedback | Contrast required. |
| VISUAL-10 | Palette | Trust teal | Palette includes trust teal for source/informational states. | P2 | Source found should feel trusted but not verified. | Asep | Owner/Rangga | TODO | Owner feedback | Contrast required. |
| VISUAL-11 | Palette | Warm cream | Palette includes warm cream for demo/caution areas. | P2 | Demo/caution should feel warm, not alarming. | Asep | Owner/Rangga | TODO | Owner feedback | Contrast required. |
| VISUAL-12 | Palette | Deep ink | Palette includes deep ink for headings/primary text. | P2 | Strong readability. | Asep | Owner/Rangga | TODO | Owner feedback | Accessibility tie-in. |
| VISUAL-13 | Palette | Alert amber | Palette includes alert amber for review/caution, avoiding scary red. | P2 | Perlu Review should not feel accusatory. | Asep | Owner/Rangga | TODO | Owner feedback | Use carefully. |

## 19. Data visualization ideas

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| DATAVIZ-01 | Data viz | Uang Desa Flow Map | Concept captured; only implemented after methodology and data status rules. | P3 | Make data more visual. | Rangga concept, Asep later | Owner/Iwan | DEFERRED | Owner feedback | Could imply flow accuracy if too early. |
| DATAVIZ-02 | Data viz | Keterbukaan Score Orb | Score orb only allowed with methodology/demo label. | P3 | Memorable transparency visual. | Asep later | Owner/Iwan | BLOCKED | Owner feedback | Blocked until SCORE items. |
| DATAVIZ-03 | Data viz | Progress ring for serapan | Progress ring may show serapan with status badge and demo context. | P2 | More engaging than plain bar. | Asep | Rangga/Owner | TODO | Owner feedback | Avoid false precision. |
| DATAVIZ-04 | Data viz | Animated counters | Animated counters allowed only for demo/status-labeled numbers and reduced-motion support. | P3 | Data should feel alive. | Asep | Rangga/Owner | DEFERRED | Owner feedback | Defer until hierarchy stable. |
| DATAVIZ-05 | Data viz | Document sparkle | Subtle visual cue for available documents; must not distract. | P3 | Delight element. | Asep | Owner/Rangga | DEFERRED | Owner feedback | Later polish. |
| DATAVIZ-06 | Data viz / badge | Warga Cermat badge | Badge concept needs product logic before implementation. | P3 | Make civic action memorable. | Rangga concept, Asep later | Owner/Iwan | BLOCKED | Owner feedback | Needs logic/criteria. |
| DATAVIZ-07 | Citizen action | Pertanyaan siap dibawa | Provide ready-to-ask questions based on documents/status, safely worded. | P2 | Help citizens act constructively. | Rangga/Asep | Owner/Iwan | TODO | Owner feedback | Good later detail/panduan feature. |

## 20. Test recommendations

| ID | Area/Page | Feedback item | Acceptance criteria | Priority | Owner concern | Executor | Reviewer | Status | Related commit/doc | Notes/Rework needed |
|---|---|---|---|---|---|---|---|---|---|---|
| TEST-01 | User testing | First-click test | Test whether users click/find `Cari Desa` first without confusion. | P2 | Validate main funnel. | Rangga/Iwan | Owner | TODO | Owner feedback | Can be informal with 3–5 users. |
| TEST-02 | User testing | Comprehension test status data | Users can explain Data Demo/Sumber Ditemukan/Perlu Review/Terverifikasi after seeing UI. | P1 | Trust/data status clarity. | Rangga/Iwan | Owner | TODO | Owner feedback | Needed before read path. |
| TEST-03 | User testing | Mobile usability test | Users can complete main journey on mobile. | P1 | Most citizens likely use phone. | Rangga/Iwan | Owner | TODO | Owner feedback | Include sticky summary. |
| TEST-04 | User testing | CTA A/B test | Compare CTA variants if unclear: Cari Desa / Lihat Dokumen / Ceritakan Kondisi Desaku. | P3 | Improve clarity. | Rangga/Iwan | Owner | DEFERRED | Owner feedback | Later, after core UX stable. |
| TEST-05 | User testing | Data interpretation test | Users do not misread demo/imported data as official/verified. | P0 | Core trust risk. | Rangga/Iwan | Owner | TODO | Owner feedback | Required before read path. |
| TEST-06 | User testing | CTA safety test | Users understand report CTA checklist before external reporting. | P0 | Avoid unsafe escalation. | Rangga/Iwan | Owner | TODO | Owner feedback | Required after REPORT items. |
| TEST-07 | User testing | Mobile scroll test | Long detail page remains understandable on mobile scroll. | P1 | Detail page may be long/overwhelming. | Rangga/Iwan | Owner | TODO | Owner feedback | Include sticky summary behavior. |

## Blocked items summary

Current blocked items include:

- `STATUS-03`, `STATUS-07`: active verified state blocked until verification workflow exists.
- `TRUST-05`: review/verified workflow copy can exist, but actual workflow blocked.
- `HOME-05`: risk radar blocked until methodology/wording approved.
- `DOC-08`: numeric APBDes conclusion blocked; document-first only.
- `DATAVIZ-02`: score orb blocked until methodology.
- `DATAVIZ-06`: Warga Cermat badge blocked until product logic.
- Seed/read path/schema/API/DB/scraper items remain blocked outside this tracker unless Iwan explicitly opens those gates.

## Unclear items / needs clarification

1. Whether D-01/D-02 from Asep are already in progress after the latest handoff; this tracker marks related items TODO until implementation report exists.
2. Exact wording and methodology for `Risk Radar`.
3. Exact product logic for `Warga Cermat` badge.
4. Whether `Keterbukaan Score Orb` should exist at all before transparency methodology is mature.
5. Whether personal official contact can ever be shown, or only office/official channels.
6. Whether `Terverifikasi` should appear as disabled educational state or be hidden entirely until workflow exists.

## Recommended review flow

1. Iwan/Owner review this tracker and confirm no feedback item is missing.
2. Iwan marks next small gate from the tracker.
3. Asep/Ujang execution reports must reference tracker IDs.
4. Each implementation report must list affected pages/routes and what reviewers should check.
5. Rangga reviews implementation against specific tracker IDs.
6. Status moves:
   - pushed implementation → `DONE_PENDING_REVIEW`
   - accepted review → `ACCEPTED`
   - mismatch → `REWORK`
   - needs closed gate → `BLOCKED`
7. Owner-sensitive items require Owner approval before being marked accepted.

## Immediate recommended next gate

Recommended next small gate:

- Detail safety/hierarchy items first:
  - `DETAIL-HIER-01`
  - `DETAIL-HIER-06`
  - `DETAIL-RISK-01`
  - `DETAIL-RISK-02`
  - `REPORT-01` through `REPORT-07`
  - `SCORE-01`
  - `METRIC-06`
  - `RIGHTS-01`
  - `RIGHTS-06`

Reason:

These prevent PantauDesa from looking accusatory, overconfident, or unsafe before seed/read path/data expansion.

## Final note

This tracker does not authorize implementation.

It exists so Owner feedback becomes measurable and reviewable.

Initiated-by: Owner/Iwan request
Reviewed-by: Pending Owner/Iwan/Asep
Executed-by: ChatGPT Freelancer / Rangga
Status: canonical-todo-tracker
