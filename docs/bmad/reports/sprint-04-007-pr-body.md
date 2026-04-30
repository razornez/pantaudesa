# Sprint 04-007 PR Body Draft

## Summary

This branch completes the local handoff work for Sprint 04-007 admin-claim scope:

- refines `/profil/klaim-admin-desa` layout so the wizard remains the primary focus and claim progress is a compact companion sidebar on wider screens,
- consolidates guide + FAQ into a cleaner help section,
- moves `Hubungi Admin` into a reusable dedicated page/section,
- adds Playwright wiring so `npx playwright test` no longer targets Vitest files,
- removes the unused legacy admin-claim hook that was still breaking typecheck,
- refreshes the handoff report to local `PASS`.

## Zero-Bug Gate

Local gate status is **not REWORK** anymore.

- `npm run lint` -> PASS
- `npm run test` -> PASS
- `npx tsc --noEmit` -> PASS
- `npx prisma generate` -> PASS
- `npm run build` -> PASS
- `npx playwright test` -> PASS with `1 skipped` placeholder smoke spec

## QA / Waiver Note

Screenshot and browser-visual QA evidence were **waived by owner instruction** for this handoff refresh.

- `desktop/mobile screenshot evidence`: `WAIVED_BY_OWNER`
- `browser visual QA artifact collection`: `WAIVED_BY_OWNER`
- residual risk: authenticated browser E2E is still not implemented; Playwright currently validates setup only

## Deployment Note

Please do **not merge yet** until the Vercel deployment/status for commit `bc1c4bc` is confirmed green in GitHub/Vercel.

Local `npm run build` now passes, so there is no remaining reproducible local build blocker in this branch. If Vercel still reports failure, the next reviewer should check the actual deployment log/status in the platform UI because this workspace is not linked to the target Vercel project.
