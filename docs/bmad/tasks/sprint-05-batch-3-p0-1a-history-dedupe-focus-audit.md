# Sprint 05 Batch 3 - P0-1A History Dedupe & Focus Audit

## Status
READY FOR EXECUTION - follow-up before P0-2.

## Context

After P0-1, owner tested `/internal-admin/intake` and noticed that `Riwayat Intake` appears to have been created again even though a previous flow already had queue/history navigation with a card highlight/glow behavior in the review queue.

Owner concern:

```text
Kenapa riwayat intake bikin lagi ya? Bukannya sebelumnya sudah pernah bikin dengan fitur card menjadi menyala di halaman antrean? Banyak file baru takutnya double/duplikat dengan kegunaan dan fungsi yang sama.
```

This must be checked before continuing to P0-2.

## Goal

Audit whether P0-1 created duplicate UI/data flow for intake history instead of reusing the existing review queue/history/focus behavior. Remove or consolidate duplication if confirmed.

This is not a new feature task. This is dedupe, reuse, and focus-regression audit.

## Required Checks

### 1. Inventory related files and flows

Check all existing files related to:

- internal admin document queue,
- intake workbench history,
- document review queue,
- queue focus/highlight/glow behavior,
- history links to queue cards,
- `AdminDesaDocument` history/activity,
- `/api/internal-admin/intake/history`,
- `/api/internal-admin/desa-version-history`,
- helpers that build queue/focus URLs.

Report which files are:

- existing pre-Batch-3,
- added by Batch 3,
- added by P0-1,
- potentially duplicate.

### 2. Verify whether `Riwayat Intake` duplicates existing queue function

Answer clearly:

- Is `Riwayat Intake` showing the same `AdminDesaDocument` entries already shown in the document/review queue?
- Is the activity list duplicating information already available from queue cards or audit trail?
- Does it create a second source of truth, or only a convenience summary?
- Is it useful on the intake page, or should it be replaced with a compact link to the queue?

### 3. Restore/reuse focus highlight behavior

If there was an existing behavior where clicking history/queue caused the target card to glow/highlight temporarily, do not reimplement a competing version.

Required:

- find the existing focus/highlight implementation if present,
- reuse the existing URL param / helper / style if possible,
- if it was removed/regressed, restore it,
- if it never existed in current branch but exists in older commit, document the source commit/file and restore carefully.

Expected behavior:

```text
click history / queue link -> navigate or focus target card -> card glows green briefly -> fade automatically
```

### 4. Decide the correct UX for intake page history

Possible acceptable outcomes:

A. Keep `Riwayat Intake`, but make it a small launcher to existing queue cards:
   - latest items only,
   - each item links to queue with focus param,
   - no duplicated long activity feed,
   - no separate competing gallery.

B. Remove/compact `Riwayat Intake` if it duplicates the queue:
   - show only `Lihat antrean review` link,
   - show last submitted item if useful,
   - let queue remain the source of truth.

C. Keep history only as troubleshooting/audit collapsed detail:
   - not prominent,
   - clearly secondary,
   - not another review surface.

Recommendation should prioritize:

- one source of truth,
- no duplicate feature surfaces,
- no duplicate data models/endpoints unless justified,
- less UI clutter.

### 5. Check for unnecessary duplicate APIs/helpers/components

If P0-1 added a new endpoint/component/hook that duplicates an existing API/helper, consolidate or document why it must stay.

Do not leave duplicated logic silently.

## Guardrails

Do not:

- change review/publish/fail business logic,
- auto-publish from intake,
- remove data visibility without a replacement path,
- break queue navigation,
- break existing highlight/focus behavior,
- add another new history system.

## Required Report Update

Update:

```text
docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md
```

Add subsection:

```text
P0-1A History Dedupe & Focus Audit
```

Include:

- files audited,
- duplicates found/not found,
- decision for `Riwayat Intake`,
- whether existing queue focus/highlight is reused/restored,
- changes made,
- remaining carry-over if any.

## QA

Run and report:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If build is blocked by Prisma Windows EPERM, document exact error and whether lint/tsc pass.

## Owner Test Checklist

After this follow-up, owner should test:

1. Open `/internal-admin/intake`.
2. Run or submit an intake item.
3. Check whether history area is compact and not duplicating the review queue.
4. Click a history/queue link.
5. Confirm the related review queue card is highlighted/glows briefly.
6. Confirm there is no duplicate confusing review surface.

## Acceptance Criteria

- Duplicate history/queue behavior is audited.
- Duplicate UI/data flow is removed or justified.
- Queue remains the source of truth for review work items.
- Focus/highlight behavior is restored or reused.
- P0-2 does not start until this is reviewed.
