# Sprint 05 Batch 3 - Versioning, Intake, Mapping, Review Workbench

## Status
READY FOR EXECUTION.

## Scope

Batch 3 covers:

- S05-008 Village Data Versioning
- S05-009 General Data Audit Trail
- S05-010 Document Intake & Auto Mapping Adapter
- S05-011 Structured Value Diff / Conflict Engine
- S05-012 Internal Data Review Workbench

## Owner Direction

Owner wants Batch 3 to be executed as a larger implementation batch, not docs-only:

- install parser libraries if needed,
- include simple free OCR attempt if feasible,
- build review workbench MVP,
- include a small public government source availability spike,
- never auto-publish mapping output.

## Required Report

Create:

```text
docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md
```

The report must include:

- implemented vs proposed,
- libraries installed/evaluated,
- OCR result,
- public source availability result,
- versioning result,
- audit trail result,
- diff engine result,
- review workbench result,
- QA result,
- guardrails,
- owner test checklist.

## Guardrails

Do not:

- auto-publish parser/OCR/AI/admin-desa output,
- change production environment variables,
- bypass auth/permissions,
- hard-delete version/audit records,
- apply production/shared DB migration without owner approval,
- expose sensitive data in logs,
- publish external source sample data directly.

## QA

Run and report:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx prisma generate
```

## Owner Test Checklist Required

Final output must tell owner:

- page/route to open,
- file types to try,
- button/action to click,
- expected result,
- what should not happen,
- screenshots/logs to share back.
