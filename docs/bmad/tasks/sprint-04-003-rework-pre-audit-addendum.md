# Addendum — Sprint 04-003 REWORK Pre-Audit Requirement

Date: 2026-04-29
Status: REQUIRED_BEFORE_UJANG_REWORK
Prepared-by: Rangga

Related task:

- `docs/bmad/tasks/sprint-04-003-rework-admin-claim-ui-structure.md`

Related review:

- `docs/bmad/reviews/sprint-04-003-rangga-rework-review.md`

## Owner instruction

Before doing the rework, Ujang must test and audit the current UI/UX first, then capture screenshots so the actual issues are clear.

Do not start patching immediately.

## Required first step before coding

Ujang must:

1. Pull latest `main`.
2. Run app locally.
3. Open current broken admin claim UI before making changes.
4. Capture screenshots for desktop and mobile.
5. Write a short issue list before coding.
6. Only then start the rework.

## Required before screenshots

Capture/check:

```text
/profil/saya — desktop 1280px+
/profil/saya — mobile 360px
/profil/saya — mobile 390px
/profil/saya — mobile 414px
current claim UI/section — desktop 1280px+
current claim UI/section — mobile 360px
current claim UI/section — mobile 390px
current claim UI/section — mobile 414px
```

If `/profil/klaim-admin-desa` already exists or is created during rework, also check:

```text
/profil/klaim-admin-desa — desktop 1280px+
/profil/klaim-admin-desa — mobile 360px
/profil/klaim-admin-desa — mobile 390px
/profil/klaim-admin-desa — mobile 414px
```

## Screenshot handling

- Do not commit bulky screenshots unless Owner/Iwan explicitly requests repository artifacts.
- Screenshots can be kept locally and summarized in the report.
- If possible, include screenshot filenames/paths in the report.
- If screenshots cannot be captured, stop and report why before continuing.

## Pre-audit issue list must cover

Before coding, report what is wrong in the current UI:

- desktop hierarchy issues;
- mobile overflow or cramped layout;
- card density;
- badge/chip clutter;
- text size/readability;
- confusing interactions;
- support button behavior;
- demo/debug wording shown to users;
- component structure risk.

## Required behavior after patch

After rework, Ujang must repeat visual checks on the same viewports.

Build/test passing is not enough.

Manual visual pass is mandatory.

## Commit message addition

The rework commit must include:

```text
Pre-work visual audit:
- screenshots before patch: PASS
- desktop issues identified: PASS
- mobile issues identified: PASS
- issue list written before coding: PASS

Manual visual checks after patch:
- desktop profile: PASS
- desktop claim flow: PASS
- mobile profile 360/390/414: PASS
- mobile claim flow 360/390/414: PASS
```

## Report back addition

Ujang report must include:

```text
Pre-work visual audit:
- screenshots before patch taken: yes/no
- desktop issues found:
- mobile issues found:
- screenshot paths/notes:

Visual checks after patch:
- desktop profile:
- desktop claim:
- mobile profile 360/390/414:
- mobile claim 360/390/414:
- screenshot paths/notes after patch:
```

## Short handoff update

```text
Ujang, before coding the Sprint 04-003 rework, audit the current broken UI first. Run locally, open /profil/saya and the claim UI, capture screenshots at desktop 1280px+ and mobile 360/390/414, then write the issue list before patching. Only after that, rework the layout. After patch, repeat the same visual checks and include the before/after screenshot notes in your report. Build/test passing is not enough; this task requires manual UI/UX visual audit.
```
