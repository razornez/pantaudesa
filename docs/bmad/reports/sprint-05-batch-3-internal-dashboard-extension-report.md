# Sprint 05 Batch 3 - Internal Dashboard Extension Report

## Status

Implemented on local `main` and verified with static QA plus browser-level manual regression.

## Scope Closed

- Added new internal route: `/internal-admin/dashboard`
- Added internal dashboard navigation entry in shared internal-admin shell
- Implemented decision-oriented summary, quality lens, ranking explorer, traffic honesty state, and next-step recommendations
- Reused existing back-office filter component instead of creating a duplicate filter surface
- Kept analytics truthful: no fake traffic data, no fake charts, no fabricated visitor counts

## Standards Read

- `docs/bmad/standards/nextjs-engineering-standard.md`
- `docs/bmad/standards/back-office-ui-design-guidelines.md`
- `docs/bmad/standards/ui-ux-standard.md`
- `docs/bmad/checklists/back-office-quiet-luxury-design-standard.md`
- Next.js local docs:
  - `node_modules/next/dist/docs/01-app/03-building-your-application/05-server-and-client-components.md`
  - `node_modules/next/dist/docs/01-app/03-building-your-application/06-fetching-data.md`
  - `node_modules/next/dist/docs/01-app/03-building-your-application/15-route-handlers.md`
  - `node_modules/next/dist/docs/01-app/03-building-your-application/02-guides/analytics.md`

## Files Added

- `src/app/api/internal-admin/dashboard/summary/route.ts`
- `src/app/api/internal-admin/dashboard/traffic/route.ts`
- `src/app/api/internal-admin/dashboard/village-rankings/route.ts`
- `src/app/internal-admin/dashboard/loading.tsx`
- `src/app/internal-admin/dashboard/page.tsx`
- `src/components/internal-admin/dashboard/DashboardHero.tsx`
- `src/components/internal-admin/dashboard/DataQualitySection.tsx`
- `src/components/internal-admin/dashboard/InternalDashboard.tsx`
- `src/components/internal-admin/dashboard/NextStepsPanel.tsx`
- `src/components/internal-admin/dashboard/OperationalSnapshot.tsx`
- `src/components/internal-admin/dashboard/PriorityLane.tsx`
- `src/components/internal-admin/dashboard/RankingExplorer.tsx`
- `src/components/internal-admin/dashboard/TrafficPanel.tsx`
- `src/components/internal-admin/dashboard/api.ts`
- `src/components/internal-admin/dashboard/shared.tsx`
- `src/lib/internal-admin/dashboard-constants.ts`
- `src/lib/internal-admin/dashboard-logic.ts`
- `src/lib/internal-admin/dashboard-repository.ts`
- `src/lib/internal-admin/dashboard-service.ts`
- `src/lib/internal-admin/dashboard-types.ts`
- `src/tests/lib/internal-dashboard-logic.test.ts`

## Files Updated

- `src/components/internal-admin/AdminDesaFilterBar.tsx`
- `src/lib/internal-admin/constants.ts`

## Product Decisions

### 1. Dashboard is a work surface, not a BI wall

The page is intentionally structured to answer:

- how much PantauDesa already covers nationally
- mana desa yang source-backed versus masih dummy/fallback
- backlog operasional mana yang paling mendesak
- desa mana yang harus langsung disentuh owner/internal admin
- kenapa traffic belum bisa dipakai sebagai dasar keputusan

### 2. No fake traffic

Traffic section currently renders a truthful empty state because no trusted analytics provider is configured in this batch. The dashboard explicitly tells the user:

- analytics provider is not active yet
- which metrics will become available later
- why traffic matters for promotion and prioritization

### 3. Real vs dummy is treated as a trust problem, not styling garnish

The dashboard separates:

- `source-backed`
- `fallback`
- `missing`

This prevents the owner from mistaking placeholder coverage as real public readiness.

## Data Sources and Definitions

### National Coverage Reference

- Total desa Indonesia: `75,753`
- Source: BPS Podes 2024
- Source URL: `https://www.bps.go.id/id/publication/2024/12/10/2f5217e2d6a695a0830290a7/village-potential-statistics-of-indonesia-2024.html`
- Stored in config constant with metadata:
  - `sourceName`
  - `sourceUrl`
  - `sourceDate`
  - `lastCheckedAt`

### Real / Dummy / Missing Rules

- `source-backed`: published public field with trusted source metadata
- `fallback`: field exists publicly but still relies on fallback/non-source-backed value
- `missing`: no usable public value is available

### Traffic Rules

- no fabricated totals
- no raw IP / email / token / sensitive identifiers
- current provider state is exposed as unavailable rather than zeroed analytics

## UI/UX Execution

### Layout Direction

- preserved the shared internal-admin shell to avoid fragmenting back-office navigation
- used a dedicated dashboard content surface inside that shell
- followed the intake-step-2 density principle: compact but breathable, information-rich without repetition

### Main Sections

1. `DashboardHero`
   - coverage verdict
   - BPS source badge
   - headline that frames the page as decision radar
   - direct CTA to document queue and village data
   - mini signals for source-backed, dummy, verified admin

2. `OperationalSnapshot`
   - owner questions answered in one glance:
   - active admins
   - desa without verified admin
   - pending docs
   - rejected + failed docs

3. `PriorityLane`
   - five action cards with reason + CTA
   - avoids dead KPI cards by always tying the signal to a work surface

4. `DataQualitySection`
   - custom orbit visualization instead of mainstream chart wall
   - heat-strip per component to show which modules still have low trusted coverage

5. `RankingExplorer`
   - reused `AdminDesaFilterBar`
   - preset ranking chips
   - actionable ranking rows with `Buka Data Desa` and `Detail Publik`

6. `TrafficPanel`
   - honest analytics-empty state
   - explains what is missing and why it matters

7. `NextStepsPanel`
   - converts the dashboard into clear strategic next actions

### No Redundant Information

The page intentionally avoids:

- repeating the same metric in multiple cards
- showing dummy traffic charts
- duplicating coverage explanations in every section
- mixing ranking information with unrelated audit noise

## Performance and Engineering Notes

- thin server page; heavy query logic lives in repository/service layer
- summary and ranking data are loaded in parallel with `Promise.all`
- API routes are internal-admin guarded and return narrow mapped payloads
- ranking client refresh uses:
  - `startTransition`
  - `useDeferredValue`
  - URL-sync filters without duplicate filter component creation
- no raw Prisma objects are passed into UI
- no fake analytics fetch loop

## React / Next Implementation Notes

- page and API routes are kept thin per engineering standard
- server-side data loading is separated from client rendering
- client interactivity is isolated in ranking/filter explorer
- existing filter bar was extended via `initialFilter` instead of duplicating component logic
- no new `any`

## Browser Fidelity QA

### Accepted Concept

- Concept path:
  - `C:\Users\iwan kurniawan\.codex\generated_images\019dfafd-ad4b-7f21-9803-0e7b6a5c404e\ig_00f1895a1fae2abb016a0ab7ec84188191abbbe9c6d6600600.png`

### Render Verification

- Browser plugin/IAB was not available in this session
- Fallback used: Playwright Chromium against local `next dev`
- Desktop screenshot:
  - `docs/bmad/screenshots/internal-dashboard-desktop.png`
- Mobile screenshot:
  - `docs/bmad/screenshots/internal-dashboard-mobile-390.png`

### Fidelity Ledger

Inspected comparison points:

1. Hero remains the primary decision surface:
   - concept: large coverage-led hero with source context and CTA
   - implementation: matched with headline, BPS badge, orbital coverage module, and direct work CTAs

2. Density and section rhythm:
   - concept: compact but varied dashboard cards
   - implementation: matched through summary strip, priority cards, quality lens, rankings, traffic honesty, and next steps

3. Ranking area behavior:
   - concept: filterable, actionable attention list
   - implementation: matched with search, wilayah filters, presets, and two actionable links per village

4. Traffic behavior:
   - concept: dedicated traffic block with clear provider status
   - implementation: matched honestly without inventing metrics

5. Visual tone:
   - concept: quiet luxury, airy, premium work surface
   - implementation: preserved with soft panels, muted gradients, purposeful pills, and non-flat section anatomy

### Intentional Deviations

- The concept image used a sidebar shell, while implementation keeps the existing shared internal-admin top shell.
- This deviation is intentional to preserve established back-office navigation consistency and avoid introducing a one-off shell only for dashboard.

### Above-the-Fold Copy Diff

- No unapproved fake traffic or fabricated proof strings were added above the fold.
- Visible copy differs from the concept in headline/detail phrasing because implementation is grounded on live data state and shared back-office shell constraints.
- No misleading or redundant explanatory copy was introduced.

## Browser QA Result

- desktop render loaded successfully
- mobile render loaded successfully on explicit `390px` viewport
- no horizontal overflow on either viewport
- core internal-admin access guard worked
- dashboard content rendered without component crash
- console noise observed only from local dev HMR websocket handshake during Playwright headless run; not a dashboard runtime error

## Static QA Result

- `npx tsc --noEmit` ✅
- `npm run lint` ✅
- `npm test` ✅
- `npm run prisma:generate` ✅
- `npm run build` ✅

## Known Limitations

- Traffic analytics is intentionally unavailable until a real provider is configured.
- National total desa reference is still a documented constant, not a DB-managed reference table.
- Some requested long-term ranking ideas from task grooming still need deeper data modeling before they can be trusted, such as:
  - budget-lowest comparisons
  - facility-worst comparisons
  - public traffic high but data low
  - conflict/source mismatch volume

## Runtime Resilience Follow-up

Post-implementation QA on local runtime exposed a resilience gap:

- dashboard filter and ranking read paths could still fail when local Prisma pool hit `P2024`
- root cause was not visual/UI logic, but Prisma-local dependency on read-heavy supporting endpoints
- initial engineering cleanup had improved structure compliance, but runtime resilience coverage was still partial

Fix applied:

- `/api/internal-admin/desa-filter-options` now falls back to Supabase Data API when Prisma local connectivity fails
- internal dashboard summary and ranking loaders now fall back to Supabase-backed read adapters when Prisma local connectivity fails
- ranking UX was also tightened so list data does not auto-render before the user selects a criterion

Related standard added:

- `docs/bmad/standards/back-office-runtime-resilience-standard.md`

## Suggested Next Step

If this dashboard direction is approved, next extension should be:

1. connect a real analytics provider
2. add trustworthy traffic-derived rankings
3. promote selected ranking presets into saved owner playbooks
4. optionally add an official managed coverage-reference table if coverage metadata needs admin editing
