# Sprint 05 Batch 3 - Intake Workbench Refactor & UX Polish

## Status
READY FOR EXECUTION - BLOCKER BEFORE OWNER TEST / BATCH 4.

## Context

Owner reviewed the current Intake Workbench implementation and found that the UI became too bulky and visually tiring even though the information is important.

Main technical concern:

```text
src/components/internal-admin/IntakeWorkbench.tsx is too large, around 2000 lines.
```

This is a maintainability and UX risk. It likely violates basic maintainability principles such as separation of concerns, DRY, SOLID-style component boundaries, and readable state management.

## Goal

Refactor Intake Workbench into smaller maintainable components and redesign the UI into a compact, quiet-luxury, mobile-friendly workflow without removing important information.

The feature should remain owner-test ready, but the UI and code must become easier to understand, review, and maintain.

## Hard Rule

Do not add new product scope in this task.

This task is refactor + UX polish only.

Do not change core business behavior unless fixing an obvious bug.

---

# Required Outcomes

## 1. Split `IntakeWorkbench.tsx`

Break the large component into smaller focused components/hooks.

Suggested structure:

```text
src/components/internal-admin/intake/
  IntakeWorkbench.tsx
  IntakeInputPanel.tsx
  IntakeSummaryPanel.tsx
  IntakeCoveragePanel.tsx
  IntakeMappingPanel.tsx
  IntakeDiffPanel.tsx
  IntakeReviewActionPanel.tsx
  IntakeHistoryPanel.tsx
  IntakeTechnicalDetails.tsx
  IntakeEmptyState.tsx
  IntakeStatusBadge.tsx
  IntakeSection.tsx
  useIntakePipeline.ts
  useIntakeHistory.ts
  useDesaOptions.ts
  intake-types.ts
  intake-ui-copy.ts
```

Rules:

- Keep each component focused on one responsibility.
- Keep heavy API/state logic out of presentational components.
- Avoid repeated UI markup for cards/badges/empty states.
- Avoid giant inline render blocks.
- Prefer small reusable components for repeated section/card patterns.
- Keep files readable; target component files under ~250 lines where reasonable.

Acceptance:

- `src/components/internal-admin/IntakeWorkbench.tsx` becomes a small orchestrator, not a 2000-line component.
- State/data fetching is extracted into hooks.
- UI panels are split into clear components.

---

## 2. Make UI Compact And Less Tiring

Owner feedback:

- UI is too bulky.
- Too many large cards.
- Layout feels scattered.
- Important information is present but visually exhausting.

Required UI direction:

- Make the flow linear and compact:
  1. Input
  2. Result summary
  3. Public detail field coverage
  4. Mapping + detected fields
  5. Diff
  6. Review action
  7. History/technical details collapsed
- Use progressive disclosure.
- Collapse technical/parser/OpenAI details by default.
- Collapse history by default or keep it visually secondary.
- Do not show all details at once.
- Keep the main next action obvious.
- Reduce repeated summaries.
- Reduce large whitespace and oversized card padding.
- Use compact badges and short labels.

Acceptance:

- Owner can complete the flow without reading too much.
- Top of page clearly answers:
  - file/read status,
  - fields detected,
  - fields matching detail page,
  - validation status,
  - diff count,
  - next action.

---

## 3. Mobile First / iPhone 12 Mini

Required:

- The workbench must be usable on small screens.
- Avoid side-by-side layouts that break on narrow width.
- Use stacked sections on mobile.
- Keep buttons reachable and clear.
- Do not create long unstructured scroll.
- Important actions should appear near the relevant result.

Acceptance:

- Manual check on narrow viewport is documented.
- Sections remain readable on small screens.

---

## 4. Preserve Important Information Without Clutter

The owner agrees the information is important. The problem is presentation.

Do not remove important data. Instead classify it:

### Always visible

- input mode/file selected
- current status
- mapped field count
- validation status
- coverage summary
- diff summary
- primary action

### Visible after expansion

- parser details
- OpenAI request status/proof
- raw-ish evidence snippets
- technical metadata
- history/activity
- fallback mode details

### Never visible in normal UI/logs

- API keys
- full prompt/response
- full document content
- token/cookie/storage key/DB URL
- sensitive identifiers

---

## 5. Maintain Existing Guardrails

Do not regress:

- no auto-publish,
- OpenAI output remains draft-only,
- local parser fallback remains available,
- OpenAI quota/rate-limit/missing-key is handled gracefully,
- submit review remains explicit,
- publish remains review-only,
- no shared/production migration apply,
- no sensitive logging.

---

## 6. Update BMAD Report

Update:

```text
docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md
```

Add a section:

```text
Intake Workbench Refactor & UX Polish
```

Include:

- before problem summary,
- component split summary,
- UX improvements,
- mobile/narrow viewport notes,
- what owner should retest,
- any remaining carry-over.

---

# QA

Run and report:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If Prisma Windows EPERM blocks build, document exact error and whether lint/tsc pass.

# Owner Test Checklist Required

Final output must include:

- route to open: `/internal-admin/intake`,
- viewport/mobile check instruction,
- file/paste types to test,
- expected compact layout behavior,
- what sections should be collapsed,
- how to check field coverage,
- how to check diff,
- how to submit review,
- what must not happen.

# Final Acceptance Criteria

- `IntakeWorkbench.tsx` is no longer a giant 2000-line component.
- UI is visibly more compact and less scattered.
- Information remains complete but better organized.
- Mobile layout is improved.
- No business flow regression.
- BMAD report is updated.
