# Sprint 04-007 Handoff Report (DRAFT)

Date: 2026-04-30
Branch: sprint-04-007-claude-codex-trial
Status: REWORK (owner review requested)
Prepared-by: Claude/Codex trial

## Scope execution order

1. `docs/bmad/tasks/sprint-04-007a-admin-claim-core-browser-flow.md` — reviewed and mapped to current implementation.
2. `docs/bmad/tasks/sprint-04-007b-admin-claim-completion-ux-invite-contact-browser-qa.md` — reviewed and mapped to current implementation.
3. `docs/bmad/checklists/admin-desa-zero-bug-readiness-checklist.md` — applied as gate for this draft handoff.

## Summary

Current `/profil/klaim-admin-desa` flow is now partially wired to real claim APIs (submit, email token, website token, website token check) but 04-007A/04-007B scope is not yet complete end-to-end.

This draft handoff is intentionally marked **REWORK** so owner/reviewer can validate gap list before full implementation and QA close.

## A. 04-007A (Core Browser Flow) status

### A1 Eligibility check before form active
- UI login redirect exists (`/profil/klaim-admin-desa` -> `/login`).
- Full one-user-one-desa eligibility blocking in wizard entry state still needs explicit end-to-end proof and browser evidence.

### A2 Real API wiring
- Backend endpoints exist (`submit`, `generate-email-token`, `generate-website-token`, `check-website-token`, profile).
- Instruction step now executes core API actions from browser UI; however, orchestration still needs hardening (resume/resend/cooldown/switch/timeline/invite/contact).

### A3 Core UI states
- Basic method/status copy exists.
- Required exhaustive loading/success/error state matrix from 04-007A is not fully represented in UI yet.

### A4 Website token UX + 6-month renewal awareness
- Services for website token exist.
- Session-only raw token handling and explicit regenerate-after-refresh UX are not yet completed in wizard state machine.

## B. 04-007B (Completion UX + Invite + Contact + QA) status

### B1 Resume loader
- Profile hook exists, but full resume flow from current backend claim state to actionable continuation is still incomplete.

### B2 Resend/regenerate
- API surface exists but dedicated resend/regenerate UX, cooldown handling, and complete error states still need finalization.

### B3 Method switch
- Not fully implemented as safe method-switch UX in claim wizard.

### B4 Timeline
- No completed simple claim timeline component yet.

### B5 Invite admin UX
- Invite API exists.
- Verified-only invite UI guardrail and complete browser UX/feedback is still pending.

### B6 Hubungi Admin reusable form
- Contact flow with `CONTACT_EMAIL` server-side routing remains pending.

### B7 Guide/FAQ
- Admin Desa guide + FAQ components/content are pending.

## C. Zero-bug readiness gate result

Checklist result for this draft: **REWORK / NOT PASS**.

Blocking gate items not yet complete for PASS handoff:
- `npm run lint` PASS evidence in this iteration,
- `npm run test` PASS evidence in this iteration,
- `npx tsc --noEmit` PASS evidence in this iteration,
- `npx prisma generate` PASS evidence in this iteration,
- `npm run build` PASS evidence in this iteration,
- desktop/mobile browser screenshot evidence for changed UI,
- full 04-007A/04-007B behavior coverage.

## D. Reviewer-focused gap list (next action)

1. Implement full client orchestration hook for claim submission, method actions, token check, and refresh/freshness update.
2. Add explicit eligibility/ownership blocked states aligned with one-user-one-desa rule.
3. Add complete completion UX (resume, resend/regenerate, method switch, timeline).
4. Add verified-only invite UI and error matrix.
5. Add reusable Hubungi Admin form (server-side CONTACT_EMAIL, anti-spam lightweight handling).
6. Add Admin Desa guide/FAQ.
7. Run mandatory gate commands and collect browser screenshot evidence (desktop + mobile).
8. Re-run zero-bug checklist and update this report from REWORK to PASS/BLOCKED.

## E. Draft PR notes

- This report is a **draft review artifact** only.
- No merge to `main` requested.
- Continue iteration on `sprint-04-007-claude-codex-trial` after owner/reviewer feedback.
