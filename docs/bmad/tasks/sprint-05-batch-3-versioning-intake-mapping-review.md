# Sprint 05 Batch 3 - Versioning, Intake, Mapping, Review Workbench

## Status
READY FOR EXECUTION.

## Delivery Mode

This is an **accelerated feature batch**.

Owner direction is to chase a visible end-to-end MVP quickly, not to keep splitting every part into small carry-over tasks.

Work should prioritize shipping a usable internal flow over perfect architecture, while still respecting the hard guardrails below.

In plain language:

```text
Build the big feature path now:
upload/input -> extract -> mapping draft -> validate -> diff/conflict -> internal review -> publish only after review
```

Batch 3 should not stop at documentation if a safe implementation path exists.

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
- install/evaluate multiple parsers in one batch if this avoids carry-over,
- include simple free OCR attempt if feasible,
- build review workbench MVP,
- include a small public government source availability spike,
- connect the pieces enough that owner can test the workflow,
- never auto-publish mapping output.

## Target MVP Flow

The target flow for this batch is:

```text
Admin/Internal source input
-> file/text extraction
-> mapping draft
-> validation result
-> structured diff/conflict output
-> Internal Admin review workbench
-> reviewed publish path only if existing business rules allow it
```

Supported input families to attempt in this batch:

- TXT / manual text
- DOCX
- XLSX / Excel
- PDF text-based
- simple OCR path for scanned PDF/image if feasible

Candidate libraries may include:

- `mammoth` for DOCX
- `xlsx` or safer maintained alternative for Excel
- `pdf-parse` or `pdfjs-dist` for PDF text
- `papaparse` if CSV is needed
- `tesseract.js` or another free/simple OCR option
- `jsondiffpatch`, `fast-json-patch`, or `deep-diff` for diff, if useful

Library selection must be justified in the report.

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
- owner test checklist,
- short report for Rangga and owner in prompt-ready copy-paste format.

## Guardrails

Do not:

- auto-publish parser/OCR/AI/admin-desa output,
- change production environment variables,
- bypass auth/permissions,
- hard-delete version/audit records,
- apply production/shared DB migration without owner approval,
- expose sensitive data in logs,
- publish external source sample data directly,
- access restricted/private/BNBA data,
- silently hide parser/OCR/source-access failures.

Allowed with documentation:

- package install for parsers/OCR/diff,
- local/dev migration draft or schema proposal if needed,
- internal review UI MVP,
- bounded public source availability check using public data only,
- draft-only sample import if safe and clearly marked as non-public.

## QA

Run and report:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx prisma generate
```

If package/schema changes are made, run relevant smoke tests too.

## Owner Test Checklist Required

Final output must tell owner:

- page/route to open,
- file types to try,
- button/action to click,
- expected result,
- what should not happen,
- screenshots/logs to share back.

## Acceptance Criteria

- owner can test at least one visible intake/mapping/review path,
- parser/OCR/diff decisions are documented,
- versioning/audit foundation is implemented safely or documented as blocked with exact reason,
- workbench MVP exists or exact blocker is documented,
- no auto-publish occurs,
- no sensitive data is logged,
- no production/shared DB migration is applied without owner approval.
