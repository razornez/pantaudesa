# Owner Feedback UI/UX Visual Acceptance Criteria Register

Date: 2026-04-28
Status: canonical-register-draft
Prepared-by: ChatGPT Freelancer / Rangga
Purpose: Canonical owner feedback acceptance register for PantauDesa UI/UX, visual direction, safety, and governance.

## Context

This register consolidates owner feedback and current UI/UX audit findings so the team does not drop, dilute, or accidentally treat important owner feedback as optional.

Inputs reviewed:

- `docs/product/13-asep-frontend-ui-ux-handover-and-visual-audit-plan.md`
- `docs/product/10-sprint-04b-desa-detail-ux-brief.md`
- `docs/product/09-sprint-04a-homepage-acceptance-review.md`
- `docs/project-management/52-sprint-04-owner-dashboard-and-gate-tracker.md`

Operating rule:

- Rangga does not command Asep/Ujang directly.
- Iwan remains command owner.
- Owner approves sensitive product/visual/trust gates.
- This document is acceptance criteria only, not an execution command.

## Priority definitions

- `P0`: critical accessibility/safety/trust issue; should be resolved before additional polish.
- `P1`: important product/UX issue; should be resolved before read path/seed/data expansion.
- `P2`: valuable UX improvement; can be sequenced after P0/P1.
- `P3`: visual delight/polish; should not block safety, hierarchy, or trust work.

## Acceptance criteria register

| # | Priority | Page / Area | Owner feedback summary | Acceptance criteria | Execute by | Status | Needs Owner approval? |
|---:|---|---|---|---|---|---|---|
| 1 | P0 | Accessibility / all pages | Accessibility feedback must be treated as critical, not polish. | WCAG-oriented basics pass: semantic headings, focus-visible indicators, aria-labels for icon buttons/links, 44px touch targets, readable contrast for normal text. P0 accessibility tasks from Asep audit remain accepted baseline. | Asep | Not blocked; P0 mostly done per Asep report, keep regression checks | No, unless visual tradeoff needed |
| 2 | P1 | Data Desa listing / DesaCard | Data Desa cards feel too dense and expose too much at once. | DesaCard first view shows only: desa name, location, status badge, one progress/serapan indicator, and at most 2 key numbers. Move population/category/per-capita/extra stats to detail or expanded state. | Asep or Ujang after Iwan command | Not blocked | Yes, if card layout changes significantly |
| 3 | P1 | CTA / Cari Desa journey | CTA consistency and Cari Desa journey must be clear. | Primary CTA wording and path are consistent across homepage/detail/list: `Cari Desa`, `Lihat Dokumen`, `Cara Membaca Data`. Users should always know the next safe action. No competing CTA should outrank Cari Desa on homepage first journey. | Rangga brief, Asep/Ujang execute | Not blocked | Yes |
| 4 | P2 | Suara Warga | Suara Warga needs explicit empty state. | If no voices or filtered results empty, show friendly empty state: `Belum ada suara warga yang bisa ditampilkan...` with safe CTA. Empty state must not imply silence means no issue. | Asep/Ujang | Not blocked | No |
| 5 | P0 | Data status / all pages | Data Demo/status badge requirements must be clear everywhere. | Reusable status behavior exists for `Data Demo`, `Sumber Ditemukan`, `Perlu Review`, `Terverifikasi`. `Terverifikasi` remains disabled/future until workflow exists. No demo/imported/needs_review data appears as verified. | Asep for component, Rangga for copy | Not blocked for component; verified remains blocked | Yes |
| 6 | P2 | Panduan IA | Panduan page needs better information architecture. | Panduan grouped into clear categories: `Memulai`, `Anggaran`, `Hak Warga`, `Suara Warga`, `Akun`. Add lightweight search or category filter if feasible. Avoid flat long FAQ. | Asep/Ujang | Not blocked | No |
| 7 | P2 | Bandingkan | Bandingkan needs guided presets so users are not dropped into blank comparison. | Add guided preset chips/cards: `Serapan tertinggi vs terendah`, `Kabupaten sama`, `Perlu Ditinjau`. User can start comparison without knowing exact desa names. | Asep/Ujang | Not blocked | Yes, for preset logic/copy |
| 8 | P1 | Trust layer / methodology | Trust layer and methodology must be shown before strong score/claim. | Any score, ranking, or priority list has explanation: what it uses, what it does not prove, and whether it is demo/source/needs_review. No final-sounding claim without methodology. | Rangga/Asep | Not blocked for UI copy; full methodology blocked | Yes |
| 9 | P0 | Desa Detail | Detail page has authority bias: numeric/budget stats appear too early. | Detail page order must put source/document/status context before budget numbers. Budget cards move lower than document/transparency section or are collapsed/softened. | Asep | Not blocked; high priority | Yes |
| 10 | P0 | Report CTA / LAPOR | Report CTA safety gate required before direct LAPOR/government report link. | Replace direct report CTA with `Cek Langkah Sebelum Melapor` checklist gate. LAPOR/external report link only appears after user acknowledges checklist. | Asep | Not blocked; high priority | Yes |
| 11 | P1 | Desa Detail | Detail page information overload must be reduced. | First view limited to identity, status, quick summary, source/document snapshot, curiosity hook. Raw URLs, metadata, archives, long APBDes items, and technical notes collapsed. | Asep/Ujang | Not blocked | Yes |
| 12 | P1 | Metric hierarchy | Metric hierarchy must avoid false authority. | Metrics follow this order: status/source first, document evidence second, numeric values third, interpretation last. Percentage/Rupiah numbers must be labeled demo/needs_review unless verified. | Rangga/Asep | Not blocked | Yes |
| 13 | P1 | Hak Wargamu / SeharusnyaAda | Hak Wargamu needs caution labels. | Every item in `SeharusnyaAdaSection` has label modifier: `Wajib menurut regulasi`, `Estimasi`, `Masuk rencana`, or `Perlu ditanyakan`. Include microcopy: estimate is guidance, not proof of violation. | Asep | Not blocked | Yes |
| 14 | P0 | Personal contact risk | Personal phone/contact data may create privacy risk. | Audit demo data and UI. Avoid personal mobile numbers. Prefer office/contact channel. If personal data must appear later, require explicit policy and Owner approval. | Asep/Rangga | Not blocked for audit; personal display blocked | Yes |
| 15 | P1 | Detail page / documents | Document section should be near top. | Document/source section appears before heavy APBDes numbers. User should see available documents and status before interpreting budget. | Asep | Not blocked | Yes |
| 16 | P0 | Transparency score | Transparency score methodology is required. | Any score like `94/100` must have tooltip/disclosure: factors used, demo/future status, and non-official nature. If methodology is not ready, score is hidden, softened, or marked demo. | Asep/Rangga | Not blocked for tooltip; real score methodology blocked | Yes |
| 17 | P2 | Visual grouping | Visual grouping must make pages easier to scan. | Related content grouped into clear clusters: `Identitas`, `Status Data`, `Sumber & Dokumen`, `Anggaran`, `Hak Warga`, `Aksi`. Use spacing/background/labels to separate groups. | Asep/Ujang | Not blocked | Yes for major redesign |
| 18 | P2 | Mobile detail | Mobile sticky mini-summary requested. | On mobile after first fold, show sticky strip: `Desa [Nama] · Data Demo/Status` with quick actions like `Cek Dokumen` and `Panduan`. Must not cover content or hurt accessibility. | Asep | Not blocked | Yes |
| 19 | P2 | Detail page | Sticky Ringkasan Desa requested. | Detail page has persistent or sticky summary pattern on long pages, especially mobile. It shows identity + status + safe primary actions. | Asep | Not blocked | Yes |
| 20 | P2 | Copy / all pages | Long copy reduction required. | Long paragraphs are reduced into short bullets/cards/accordions. First view never has heavy legal/product explanation. Expanders hold detailed explanations. | Rangga copy, Asep/Ujang execute | Not blocked | No, unless core message changes |
| 21 | P2 | Asset/category readability | Asset category readability must improve. | Icons/images/category labels must be readable, descriptive, and not decorative-only when conveying meaning. Small captions use at least accessible contrast and understandable names. | Asep | Not blocked | No |
| 22 | P1 | Visual design direction | Visual direction should be modern civic-tech, not government portal, not generic SaaS. | Visual system feels engaging but trustworthy: warm civic palette, varied section rhythm, strong but safe hierarchy, no heavy decorative clutter. | Owner + Rangga + Asep | Not blocked for direction; execution gated | Yes |
| 23 | P3 | Risk radar | Risk radar visual idea captured. | May be explored later only as non-accusatory `Yang perlu dicek` / `Radar Baca Data`, not as corruption/risk score. Must wait for methodology and trust layer. | Rangga concept, Asep later | Blocked until methodology | Yes |
| 24 | P2 | Badge system | Memorable badge system requested. | Data/status badges have consistent icon, color, label, and microcopy. `Terverifikasi` is disabled/future. Badge language uses citizen terms, not raw enums. | Asep | Not blocked | Yes |
| 25 | P3 | Micro-interactions | Micro-interactions requested, but should be tasteful. | Add only lightweight interactions after safety/hierarchy: hover lift, checklist tick, progress soft animation. No new heavy dependency without approval. Respect reduced motion. | Asep | Blocked until P0/P1 done | Yes |
| 26 | P2 | Color palette | Color palette should be memorable and consistent. | Adopt semantic palette: civic green, trust teal, warm cream/demo, deep ink, alert amber. Colors must pass contrast and not rely on color alone. | Asep | Not blocked | Yes |
| 27 | P3 | Data visualization ideas | Data visualization should be engaging but not misleading. | Charts/visuals must be labeled demo/needs_review, avoid false precision, and appear after source/document context. New visualizations require clear methodology. | Rangga/Asep | Partially blocked until methodology | Yes |
| 28 | P3 | Delight elements | Delight elements should make product feel fresh. | Use subtle civic-tech delight: document shelf, source compass, checklist, badge animations, pilot story. Must not distract from clarity or increase load heavily. | Rangga concept, Asep execute | Blocked until core UX stable | Yes |
| 29 | P0 | Required tests | Required tests must be explicit. | For UI-only tasks: run `npx tsc --noEmit`, `npm run test`, `npm run lint` where possible, and note existing lint debt separately. Add manual checks: mobile, keyboard tab, contrast, no accusatory copy, no seed/read path. | Asep/Ujang executor, Rangga review | Not blocked | No |
| 30 | P1 | Homepage status UX | Homepage accepted first pass but must not expand endlessly. | Homepage remains accepted first pass. Further homepage work should be polish/reduction only, not new section expansion, unless Owner requests. | Rangga/Iwan | Blocked from expansion | Yes |
| 31 | P1 | Detail page curiosity | Detail page must make users curious: “why should I read this?” | Add/keep a `Kenapa desa ini perlu dibaca?` section that gives safe reasons: source found, document available, status needs review, next action. No problem/accusation framing. | Asep/Ujang | Not blocked | Yes |
| 32 | P1 | Source/document first | Source and document availability must be understood before APBDes conclusions. | `SourceDocumentSnapshotSection` remains near top. APBDes area references documents first and numbers later/collapsed. | Asep | Not blocked | Yes |
| 33 | P0 | Seed/read path safety | Seed/read path must remain blocked until status UX is accepted beyond homepage. | No seed execution or read path switch until detail and document/APBDes UX have accepted data status behavior. | Iwan/Owner | Blocked | Yes |
| 34 | P0 | Scraper/import safety | Scraping/import execution remains blocked. | No scraping/import prototype until source governance, document registry behavior, and imported/needs_review UX are accepted. | Iwan/Owner/Asep | Blocked | Yes |

## Required tests checklist

For any UI/UX task touching pages/components, the execution report must include:

- [ ] `npx tsc --noEmit`
- [ ] `npm run test`
- [ ] `npm run lint` or explicit note that existing lint debt blocks clean pass
- [ ] mobile layout check
- [ ] keyboard tab/focus check
- [ ] aria-label check for icon-only/ambiguous controls
- [ ] contrast check for small text
- [ ] no accusatory copy check
- [ ] no seed/read path/schema/DB/API/Prisma changes
- [ ] no new dependency unless approved
- [ ] `Terverifikasi` not active without workflow

## Unclear / needs clarification

1. `Risk radar` is captured as important visual idea, but methodology and exact wording are not approved yet.
2. `Delight elements` are important for visual quality, but exact animation/interactions need design approval and should wait until P0/P1 are stable.
3. `Data visualization ideas` need specific visual spec before implementation so they do not imply verified numeric conclusions.
4. `Personal contact risk` needs a clear policy: office contact only vs allowed public official contact. Current recommendation is office contact only until Owner approves otherwise.
5. `Transparency score methodology` needs product definition before score becomes more prominent.

## Recommended review flow

1. Owner/Iwan review this register as the canonical acceptance list.
2. Mark any missing feedback immediately before execution continues.
3. Iwan chooses the next small gate from this register.
4. Asep/Ujang execute only the approved small gate.
5. Execution report references the register item numbers.
6. Rangga reviews acceptance against this register.
7. Owner approves sensitive visual/trust gates before seed/read path/scraper progress.

## Immediate recommendation

Do not jump to visual delight yet.

Recommended next review/execution order:

1. P1 detail safety/hierarchy: D-01 reorder detail page and D-02 report CTA checklist gate.
2. P1/P0 trust: transparency score methodology disclosure and `SeharusnyaAdaSection` caution labels.
3. P2 density/IA: DesaCard density, Panduan IA, Bandingkan presets, Suara Warga empty state.
4. P2/P3 visual system: DataStatusBadge, color palette, grouping, sticky summary.
5. P3 delight/micro-interactions after the above is stable.

## Final note

This register does not authorize implementation.

It defines acceptance criteria so future implementation can be reviewed consistently and owner feedback is not lost.

Initiated-by: Owner/Iwan request
Reviewed-by: Pending Owner/Iwan/Asep
Executed-by: ChatGPT Freelancer / Rangga
Status: canonical-register-draft
