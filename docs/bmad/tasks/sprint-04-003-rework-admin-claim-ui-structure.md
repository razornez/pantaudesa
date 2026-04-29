# Task Sprint 04-003 REWORK — Admin Claim UI Structure and Visual Cleanup

Status: READY_FOR_UJANG_REWORK
Executor: Ujang / Asep
Prepared-by: Rangga
Date: 2026-04-29

## Recommended model for Ujang

```text
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
```

Why:

- This is a UI structure rework across profile/admin claim components.
- The issue is visual architecture and responsive layout, not just a tiny class patch.

Escalate to:

```text
Model: GPT-5.1
Reasoning effort: high
```

Only if auth/session, route, or API bugs appear during rework.

## Problem statement

Owner rejected the current UI because desktop and mobile look broken/chaotic.

Reviewed commits:

- `4c8bfbdf232a6f3da9f986b370cd75474d96a2dc`
- `f11942f48f705ad286c2fa038d4c148e1ae205be`

Rangga verdict:

```text
REWORK_REQUIRED_VISUAL_AND_STRUCTURE
```

Review file:

- `docs/bmad/reviews/sprint-04-003-rangga-rework-review.md`

## Main issue

The current UI tries to show too much at once inside the profile page.

It became a dense mini-dashboard instead of a simple guided claim flow.

Current problematic patterns:

- huge `ProfileAdminAccessCard.tsx` component;
- many nested cards;
- too many badges/chips;
- stepper + search + method cards + instruction + demo states + sidebar all visible together;
- long text inside small cards;
- desktop two-column layout feels unbalanced;
- mobile likely feels cramped and chaotic;
- demo/debug wording appears in normal user flow.

## Rework goal

Make admin claim UI simple, guided, and visually calm.

Profile page should not become a full dashboard.

Expected result:

1. Profile page shows a compact `Akses Admin Desa` entry card.
2. Claim flow opens as a focused page/section with one step visible at a time.
3. Mobile is clean and readable.
4. Desktop has balanced width and hierarchy.
5. Demo/admin state data exists but does not dominate the public user flow.
6. Code is split into clean components.

## Rework approach

Do not keep patching tiny Tailwind classes on the current large component.

Restructure it.

### Recommended structure

Keep profile page compact:

```text
/profil/saya
  - profile info
  - small Akses Admin Desa card
  - button: Klaim sebagai Admin Desa
  - button/link: Hubungi Kami
```

Move guided flow to focused route if possible:

```text
/profil/klaim-admin-desa
```

or use a clearly separated focused section below profile only if route creation is too risky.

Preferred:

- dedicated route/page for claim wizard.

Why:

- profile remains clean;
- wizard has enough space;
- mobile flow is easier;
- user focus is clearer.

## Required UI behavior

## A. Profile entry card

On `/profil/saya`, show one compact card only.

Content:

```text
Akses Admin Desa
Jika kamu adalah perwakilan desa, ajukan akses untuk mengelola informasi sumber dan dokumen desa.
```

Actions:

```text
Klaim sebagai Admin Desa
Hubungi Kami
```

Also show compact current status if available:

- `Belum mengajukan`
- `Menunggu verifikasi`
- `Akses terbatas`
- `Admin Desa Terverifikasi`
- `Akses sedang ditinjau`

No demo state gallery on profile page.

No giant wizard embedded in profile.

## B. Claim wizard page/section

Show one step at a time.

Step labels:

1. Pilih desa
2. Cara verifikasi
3. Instruksi
4. Status

### Step 1 — Pilih desa

Keep it simple.

Layout:

- title,
- short helper text,
- search input,
- list of desa as clean rows/cards,
- selected desa summary.

Mobile:

- one column;
- no sidebars;
- no more than one dense card stack.

Desktop:

- max width around `3xl` or `4xl`;
- centered;
- avoid large two-column dashboard unless visually necessary.

### Step 2 — Cara verifikasi

Show 3 method cards, but cleaner and shorter.

Methods:

1. Email resmi
2. Website resmi
3. Hubungi Kami

Cards should be compact:

- icon,
- title,
- 1 short sentence,
- CTA.

Remove long notes from cards.

Move detail text to Step 3 only.

### Step 3 — Instruksi

Show only selected method instruction.

For email:

```text
Nanti sistem akan mengirim tautan ke email resmi desa. Fitur pengiriman akan diaktifkan pada batch berikutnya.
```

For website:

```text
Nanti kamu akan mendapatkan kode unik untuk ditempel di website resmi desa.
```

For support:

- show mailto button;
- show email format in a compact collapsible/textarea-like box;
- do not auto-open email when user merely selects the card in Step 2.

Important:

- Selecting `Hubungi Kami` method should not instantly open mail client.
- Mail client opens only when user clicks explicit `Kirim Email Bantuan` button.

### Step 4 — Status

Show only the current user status.

Do not show all demo statuses as a gallery in normal user flow.

If a demo/test view is needed, hide it behind a small dev-only/debug section or remove from user UI.

## C. Demo state handling

DB-backed demo data is okay for QA, but visual UI must not show a huge demo gallery to normal users.

Remove or hide:

- `Contoh status yang bisa muncul`
- multiple demo status cards grid
- `Dibaca dari database`
- `Demo fallback`

Allowed:

- small `Data contoh` label only if current session is a demo account;
- dev-only debug note in development environment.

## D. Component split requirement

Break up current large component.

Suggested files:

```text
src/components/profil/admin-claim/ProfileAdminAccessCard.tsx
src/components/profil/admin-claim/AdminClaimWizard.tsx
src/components/profil/admin-claim/AdminClaimStepNav.tsx
src/components/profil/admin-claim/AdminClaimDesaPicker.tsx
src/components/profil/admin-claim/AdminClaimMethodPicker.tsx
src/components/profil/admin-claim/AdminClaimInstruction.tsx
src/components/profil/admin-claim/AdminClaimStatusPanel.tsx
src/components/profil/admin-claim/adminClaimCopy.ts
```

If exact folder differs, keep equivalent clean separation.

Target:

- no single component around 600+ lines;
- main component should orchestrate, not contain everything;
- presentational components should be small and readable.

## E. Visual requirements

### Desktop

- centered content;
- clear max-width;
- avoid unbalanced two-column dashboard;
- profile page stays clean;
- wizard page has strong hierarchy;
- no cluttered badge clouds;
- no excessive nested rounded cards.

### Mobile

- one-column layout;
- no horizontal overflow;
- step nav should fit or become compact;
- cards should not feel stacked endlessly;
- buttons full-width where helpful;
- text should be readable, not tiny everywhere;
- avoid many `text-[10px]` notes.

### Copy and tone

Use simple user-facing language.

Avoid in normal UI:

- database,
- demo fallback,
- DB-backed,
- client-hydrated,
- raw technical state.

Allowed for dev/debug only.

## F. Safety boundaries

Still do not implement:

- real email magic link sending,
- website token crawler/checker,
- invite acceptance flow,
- fake admin report service,
- upload service,
- AI review API,
- verified data activation,
- scraper,
- numeric extraction.

Do not create self-promotion or fake verified behavior.

Do not expose private email/phone.

`User.role = DESA` alone must not be treated as verified desa admin.

## G. Data/API boundaries

Keep existing DB-backed read helper/API if valid.

Allowed:

- reshape frontend data usage;
- add small server route/page if needed;
- keep demo seed as is if safe;
- remove demo state gallery from user UI while keeping data available.

Do not:

- add migration;
- change schema;
- rerun seed unless needed and approved;
- add dependency.

## H. QA requirements

Run:

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
npm run build
```

Route checks:

- `/profil/saya`
- `/profil/klaim-admin-desa` if route is created
- `/api/admin-claim/profile` public should remain 401
- `/api/admin-claim/profile` authed should remain 200

Mobile checks:

- `/profil/saya` at 360px, 390px, 414px
- claim wizard at 360px, 390px, 414px

Desktop checks:

- `/profil/saya` at 1280px+
- claim wizard at 1280px+

Visual pass must be manually checked.

Build passing alone is not enough.

## Acceptance criteria

1. `/profil/saya` no longer shows a large dashboard-like claim wizard.
2. Profile page shows only compact `Akses Admin Desa` entry card.
3. Claim flow is focused in a route or clearly separated section.
4. Only one wizard step is visible at a time.
5. Demo state gallery is removed/hidden from normal user UI.
6. Selecting support method does not instantly open mail client.
7. Mail client opens only from explicit support action.
8. Desktop layout is visually balanced.
9. Mobile layout has no horizontal overflow.
10. Mobile layout is readable and not cramped.
11. Component structure is split and maintainable.
12. No new dependency.
13. No schema/migration.
14. No real verification service accidentally implemented.
15. QA passes.
16. Manual visual checks are reported.

## Commit message requirement

```text
fix(admin): rework claim UI structure for profile and mobile

What changed:
- ...

Visual rework:
- profile page compact card: PASS
- focused claim wizard: PASS
- demo gallery removed/hidden: PASS
- support action explicit: PASS

QA:
- prisma validate: PASS
- prisma generate: PASS
- tsc: PASS
- test: PASS
- build: PASS
- route checks: PASS

Manual visual checks:
- desktop profile: PASS
- desktop claim flow: PASS
- mobile profile 360/390/414: PASS
- mobile claim flow 360/390/414: PASS

Guardrails:
- no schema/migration
- no seed rerun unless approved
- no real email verification
- no website crawler/checker
- no invite service
- no fake admin report service
- no upload service
- no AI API
- no verified data activation
- no scraper/numeric extraction
- no new dependency

Known risks/blockers:
- ...
```

## Report back

```text
Task: Sprint 04-003 REWORK Admin Claim UI Structure
Status: PASS / REWORK / BLOCKED
Model used:
Reasoning effort:
Routes checked:
- /profil/saya:
- /profil/klaim-admin-desa:
- /api/admin-claim/profile public:
- /api/admin-claim/profile authed:
QA:
- prisma validate:
- prisma generate:
- tsc:
- test:
- build:
Visual checks:
- desktop profile:
- desktop claim:
- mobile profile 360/390/414:
- mobile claim 360/390/414:
Structure check:
- profile compact card:
- focused wizard:
- one step visible:
- demo gallery hidden/removed:
- component split:
Safety:
- no self-promotion:
- no private contact exposure:
- no real verification enabled:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

## Short handoff

```text
Ujang, STOP treating the current admin claim UI as accepted. Owner rejected it because desktop and mobile are visually chaotic. Pull latest main and read docs/bmad/tasks/sprint-04-003-rework-admin-claim-ui-structure.md fully. Use GPT-5.1 Codex mini with medium reasoning. Rework the structure: profile page must only show a compact Akses Admin Desa entry card, and the claim flow must be focused with one step visible at a time. Remove/hide the demo status gallery from normal user UI, make support action explicit, split the giant component, and manually check desktop + mobile 360/390/414. Do not add schema, dependency, real verification service, crawler, upload, AI, invite, fake report service, verified activation, scraper, or numeric extraction. Commit with visual QA notes and report SHA + screenshots/route summary if possible.
```

If Asep takes over:

```text
Asep, pull latest main, read docs/bmad/tasks/sprint-04-003-rework-admin-claim-ui-structure.md fully, and continue only the visual/structure rework. Do not widen scope. Manual desktop/mobile visual pass is required before commit.
```
