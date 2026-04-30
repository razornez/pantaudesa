# Admin Claim Layout QA Notes

Date: 2026-04-30
Route: `/profil/klaim-admin-desa`

## Scope

- Reposition `Progress Klaim Admin` as a compact companion sidebar on large screens.
- Keep mobile as a single-column flow where progress does not dominate the first viewport.
- Preserve claim business logic and API behavior.

## Before

- Timeline occupied too much vertical space and visually competed with the claim wizard.
- Desktop felt page-heavy because progress, wizard, invite/contact, guide, and FAQ stacked with similar visual weight.
- Mobile risked showing progress too prominently before the main form flow.

## After

- Desktop/tablet wide:
  - Main wizard is the primary left column.
  - Timeline is moved into a sticky right sidebar with compact spacing.
  - Page container widened so the 75/25 split has enough horizontal room.
- Mobile:
  - Layout stays one column.
  - Progress is hidden behind a compact `details` block labeled `Lihat progress klaim`.
  - CTA flow remains centered on the active wizard step.
- Secondary sections:
  - Invite and contact forms now share a responsive grid on larger screens.
  - Guide and FAQ are visually compressed to reduce perceived page length.

## QA Notes

### Desktop

- Target viewport reviewed by layout rules: `1440px` equivalent
- Expected result from code:
  - `max-w-6xl` page wrapper creates room for sidebar layout.
  - Wizard area uses `lg:grid-cols-[minmax(0,1fr)_260px]` and `xl` expands sidebar to `280px`.
  - Timeline remains visible as a compact sticky sidebar and no longer stretches the main reading flow.

### Mobile

- Target viewport reviewed by layout rules: `390px` equivalent
- Expected result from code:
  - Timeline sidebar is removed from initial flow on mobile via `lg:hidden`.
  - Compact progress appears inside a collapsible `details`, reducing first-screen dominance.
  - Main claim step stays above guide/FAQ/contact content.

### States considered

- Unauthenticated: route still redirects to `/login` from page-level auth guard.
- PENDING: compact progress supports active-claim reading without dominating the wizard.
- LIMITED: summary text surfaces partial access state while keeping wizard flow primary.
- VERIFIED: summary text confirms verified state; invite form remains available below.
- Error/loading/success: unchanged business logic, same step components and hooks remain in place.

## Quality Gates

- `npm run lint`: PASS
- `npx tsc --noEmit`: FAIL, pre-existing import/export mismatch in `src/components/profil/admin-claim/useAdminClaimFlow.ts` against `@/lib/admin-claim/client`
- `npm run build`: FAIL
  - sandbox run failed in Prisma filesystem access
  - escalated rerun still failed during `prisma generate` on rename of `src/generated/prisma/query_engine-windows.dll.node.tmp*`

## Residual Risk

- Visual behavior is based on component/layout verification plus successful linting, but not on automated browser screenshots.
- Build health is currently blocked by Prisma generation issues outside this layout patch.
- Full type safety for the route cannot be claimed until the pre-existing `useAdminClaimFlow` import errors are resolved.
