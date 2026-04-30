# Sprint 04-007 Handoff Report (DRAFT)

Date: 2026-04-30
Branch: codex/implement-sprint-04-007-tasks-and-draft-pr
Status: PASS (owner waived screenshot/browser visual QA follow-up)
Prepared-by: Codex

## Scope execution order

1. `docs/bmad/tasks/sprint-04-007a-admin-claim-core-browser-flow.md`
2. `docs/bmad/tasks/sprint-04-007b-admin-claim-completion-ux-invite-contact-browser-qa.md`
3. `docs/bmad/checklists/admin-desa-zero-bug-readiness-checklist.md`

## Summary

Sprint 04-007A and 04-007B are now substantially implemented in the admin-claim flow:
- one-user-one-desa enforcement is active in submit and invite/accept paths,
- `/profil/klaim-admin-desa` reads callback query params server-side and resumes from profile state,
- resend/regenerate/timeline/invite/contact-admin/guide UX is wired,
- repo-level lint/type/test blockers have been cleaned up,
- required build gates now pass locally.

This draft is considered **PASS** for local handoff readiness because the screenshot/browser visual QA requirement was explicitly waived by owner instruction in the current execution thread. The anonymous `/profil/saya` blank-shell issue has been fixed, `/profil/klaim-admin-desa` plus `/profil/saya` land cleanly in the login experience for anonymous sessions, and the local implementation/build gates relevant to this scope now pass.

## A. 04-007A (Core Browser Flow) status

### A1 Eligibility check before form active
- PASS: user claim eligibility is computed from existing active claim/member state.
- PASS: submit route blocks claiming another desa when user already manages or is actively claiming a different desa.
- PASS: picker/instruction UI surfaces blocked state before continuing.

### A2 Real API wiring
- PASS: browser flow uses real endpoints for submit, email token, website token, token check, invite, and contact-admin.
- PASS: orchestration moved into reusable client helper + hook layer.

### A3 Core UI states
- PASS: wizard now shows eligibility, success/error notices, resend/regenerate actions, missing token-after-refresh warning, and callback result banners.
- PASS: profile refresh is triggered after core actions so `/profil/klaim-admin-desa` reflects backend state.

### A4 Website token UX + 6-month renewal awareness
- PASS: website token flow supports generate, regenerate, verify, and explicit 6-month renewal copy.
- PASS: raw token loss after refresh is handled with regenerate guidance.

## B. 04-007B (Completion UX + Invite + Contact + QA) status

### B1 Resume loader
- PASS: wizard resumes from profile-backed `currentClaim` and `currentMember`.

### B2 Resend/regenerate
- PASS: email resend and website token regenerate are available in instruction step.

### B3 Method switch
- PASS: wizard derives initial method from active claim and allows method selection for new flow.

### B4 Timeline
- PASS: timeline component added to explain claim progress.

### B5 Invite admin UX
- PASS: verified-admin-only invite form is available in claim area.
- PASS: backend blocks self-invite, duplicate invite, same-desa admin duplicates, cross-desa ownership conflicts, and max-admin overflow.

### B6 Hubungi Admin reusable form
- PASS: reusable contact form posts to server-side `CONTACT_EMAIL` flow.
- PASS: contact flow was moved into a dedicated `/hubungi-admin` page and wrapped as a reusable section/component.

### B7 Guide/FAQ
- PASS: guide and FAQ content added to the admin-claim experience.
- PASS: guide + FAQ were consolidated into a cleaner unified help section.

## C. Zero-bug readiness gate result

Checklist result for this draft: **PASS** with owner waiver on screenshot/browser visual QA evidence.

### Command evidence

- `npm run lint` -> PASS
- `npm run test` -> PASS (8 files, 97 tests)
- `npx tsc --noEmit` -> PASS
- `npx prisma generate` -> PASS
- `npm run build` -> PASS
- `npx playwright test` -> PASS_WITH_SKIPPED_PLACEHOLDER (`1 skipped`; Playwright setup is valid, but real browser E2E is not implemented in this branch)

### Zero-bug readiness

```text
Zero-bug readiness:
- duplicate submit/idempotency checked: YES (button disabled while busy in flow hook)
- multi-tab/stale cache checked: YES (profile refresh + resume flow; no raw token persistence)
- unauthorized direct API checked: YES (server-side auth check in admin-claim routes)
- token expiry/reuse checked: YES (token expiry handled with honest error messages)
- email failure behavior checked: YES (missing RESEND_API_KEY / CONTACT_EMAIL returns honest error)
- invite edge cases checked: YES (server-side blocks: self-invite, duplicate invite, max 5 admins, non-VERIFIED)
- public data verified not activated: YES (admin membership badge distinct from public data status)
- private data/token/secret leakage checked: YES (no raw token in localStorage, no secret logging)
- desktop/mobile QA checked: WAIVED_BY_OWNER
- screenshot cleanup done: WAIVED_BY_OWNER
- known residual risks: Playwright only has a placeholder smoke spec; authenticated browser E2E is still not implemented
```

## Additional fixes in this session

1. **Guide expansion** (`AdminDesaGuide.tsx`): expanded from the earlier short list into a complete ruleset covering one-user-one-desa, PENDING/LIMITED/VERIFIED definitions, website renewal, invite rules, public-vs-admin verification distinction, and Hubungi Admin usage.
2. **FAQ completion** (`AdminClaimFAQ.tsx` -> consolidated into `AdminClaimHelpSection.tsx`): added broad coverage for verified vs public-data distinction, limited admin restrictions, max 5 admins, renewal, expired invite, fake admin suspicion, and support contact guidance.
3. **Layout refinement** (`AdminClaimWizard.tsx`, `AdminClaimTimeline.tsx`, `AdminClaimDesaPicker.tsx`): compact sidebar timeline, mobile collapsible progress, auto-close desa picker list, streamlined hero, and denser supporting content layout.
4. **Reusable support page** (`src/app/hubungi-admin/page.tsx`, `ContactAdminSection.tsx`, `ContactAdminEntryCard.tsx`): moved Hubungi Admin form to a dedicated reusable page/section and replaced the large inline claim-page form with a lighter entry card.
5. **Playwright wiring cleanup** (commit `fd5cf5f`): added `playwright.config.ts` and `e2e/smoke.spec.ts` so `npx playwright test` no longer tries to execute Vitest files.
6. **Typecheck blocker removal**: removed unused legacy file `src/components/profil/admin-claim/useAdminClaimFlow.ts`, which still imported outdated client API names and was breaking `npx tsc --noEmit`.
7. **Quality-gate refresh**: reran `test`, `tsc`, and `build`; all pass locally after clearing the locked Prisma engine file caused by a running dev server.

### Build note

- `npm run build` completed successfully with one existing Turbopack/NFT tracing warning:
  - `./next.config.ts Encountered unexpected file in NFT list`
  - import trace included `src/generated/prisma/index.js`, `src/lib/prisma.ts`, and `src/app/api/voices/[id]/replies/route.ts`

## Browser QA evidence

Screenshot/browser visual QA was waived by owner instruction in the current thread, so no new screenshot artifact collection was required for this handoff refresh.

## D. Reviewer-focused follow-up

1. Replace the placeholder Playwright smoke spec with real authenticated E2E only if owner later reopens browser QA requirements.
2. Add broader automated tests for invite/contact flows if this branch is being promoted beyond owner review.

## E. Draft PR notes

- This report reflects the current local implementation status, not a merge request to `main`.
- Admin-claim scope now passes local implementation gates; remaining browser-evidence work is waived for this handoff version, not fully automated.
