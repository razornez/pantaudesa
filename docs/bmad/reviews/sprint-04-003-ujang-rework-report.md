# Sprint 04-003 Ujang Rework Report

Task: Sprint 04-003 REWORK Admin Claim UI Structure

Status: PASS

Model used: current Codex session
Reasoning effort: medium

## Pre-work visual audit

- screenshots before patch taken: yes
- screenshot paths:
  - `.artifacts/admin-claim-audit/before/desktop-1280-profil-full.png`
  - `.artifacts/admin-claim-audit/before/desktop-1280-claim-section.png`
  - `.artifacts/admin-claim-audit/before/mobile-360-profil-full.png`
  - `.artifacts/admin-claim-audit/before/mobile-360-claim-section.png`
  - `.artifacts/admin-claim-audit/before/mobile-390-claim-section.png`
  - `.artifacts/admin-claim-audit/before/mobile-414-claim-section.png`
- desktop issues found:
  - profile page looked like a dense dashboard instead of a compact entry point
  - wizard, status summary, support content, and demo gallery competed at the same time
  - two-column claim layout felt visually unbalanced
- mobile issues found:
  - card stack was too long and tiring before the actual claim choice
  - badge/chip density made the flow feel noisy
  - stepper existed, but the page still exposed too many sections at once
- confusing interactions found:
  - support method could behave like navigation plus mailto at the same time
  - demo/debug wording leaked into normal user UI

## What changed

- `/profil/saya` now shows only a compact `Akses Admin Desa` entry card
- claim flow moved to `/profil/klaim-admin-desa`
- flow is split into small components under `src/components/profil/admin-claim/`
- only one wizard step is visible at a time
- demo status gallery is removed from normal user UI
- support action is explicit: selecting support no longer opens mail; mail opens only from `Kirim Email Bantuan`

## Routes checked

- `/profil/saya`: PASS
- `/profil/klaim-admin-desa`: PASS
- `/api/admin-claim/profile` public: `401`
- `/api/admin-claim/profile` authed: PASS via logged-in visual audit and flow verification

## QA

- `npx prisma validate`: PASS
- `npx prisma generate`: PASS
- `npx tsc --noEmit`: PASS
- `npm run test`: PASS
- `npm run build`: PASS

## Manual visual checks after patch

- desktop profile: PASS
- desktop claim flow: PASS
- mobile profile `360/390/414`: PASS
- mobile claim flow `360/390/414`: PASS
- screenshot paths after patch:
  - `.artifacts/admin-claim-audit/after/desktop-1280-profil-full.png`
  - `.artifacts/admin-claim-audit/after/desktop-1280-claim-full.png`
  - `.artifacts/admin-claim-audit/after/mobile-360-profil-full.png`
  - `.artifacts/admin-claim-audit/after/mobile-360-claim-full.png`
  - `.artifacts/admin-claim-audit/after/mobile-390-claim-full.png`
  - `.artifacts/admin-claim-audit/after/mobile-414-claim-full.png`

## Visual notes after patch

- desktop profile keeps the admin area compact and secondary to core profile editing
- desktop claim page is centered and uses one primary content surface instead of a mini dashboard
- mobile step nav wraps cleanly without overflow
- village list remains readable at `360px`, `390px`, and `414px`
- support path is now clearly a fallback action, not a surprise side effect

## Structure check

- profile compact card: PASS
- focused wizard route: PASS
- one step visible at a time: PASS
- demo gallery hidden/removed: PASS
- component split: PASS

## Safety

- no schema/migration: PASS
- no new dependency: PASS
- no real email verification enabled: PASS
- no website crawler/checker: PASS
- no invite service: PASS
- no fake admin report service: PASS
- no upload service: PASS
- no AI review API: PASS
- no verified data activation: PASS
- no scraper/numeric extraction: PASS
- no private contact exposure: PASS

## Files changed

- `src/components/profil/ProfileAdminAccessCard.tsx`
- `src/components/profil/admin-claim/adminClaimCopy.ts`
- `src/components/profil/admin-claim/useAdminClaimProfile.ts`
- `src/components/profil/admin-claim/ClaimStatusBadge.tsx`
- `src/components/profil/admin-claim/ProfileAdminAccessEntryCard.tsx`
- `src/components/profil/admin-claim/AdminClaimStepNav.tsx`
- `src/components/profil/admin-claim/AdminClaimDesaPicker.tsx`
- `src/components/profil/admin-claim/AdminClaimMethodPicker.tsx`
- `src/components/profil/admin-claim/AdminClaimInstruction.tsx`
- `src/components/profil/admin-claim/AdminClaimStatusPanel.tsx`
- `src/components/profil/admin-claim/AdminClaimWizard.tsx`
- `src/app/profil/klaim-admin-desa/page.tsx`

## Known risks

- build still shows the existing Turbopack NFT trace warning around `next.config.ts` and Prisma imports; build output still succeeds
