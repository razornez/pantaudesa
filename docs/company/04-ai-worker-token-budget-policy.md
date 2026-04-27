# AI Worker Token Budget Policy

Date: 2026-04-27
Status: ready
Owner direction: keep instructions concise because Ujang uses Codex and Asep uses Claude.

## Purpose

Dokumen ini mengatur cara memberi instruksi ke AI worker PantauDesa supaya tidak boros token.

AI workers:

- Iwan: CEO / Product / Business / Design direction.
- Ujang: Codex — engineering execution.
- Asep: Claude — technical review / architecture review if used later.
- Rangga: ChatGPT Freelancer — docs, discovery, backup execution.

## Main rule

Instruksi harus:

- singkat,
- langsung ke file yang perlu dibaca,
- jelas output file-nya,
- jelas boundary-nya,
- tidak mengulang konteks panjang yang sudah ada di docs.

Jangan kirim ulang isi dokumen panjang ke AI worker jika dokumen sudah ada di repo.

Cukup arahkan:

```text
Baca file X, Y, Z. Kerjakan output A. Jangan sentuh B. Report ringkas.
```

## Prompt format hemat token

Gunakan format ini:

```text
Role: [Ujang/Rangga/Asep]
Task: [nama task]
Read:
- [file 1]
- [file 2]
Output:
- [file output]
Do:
- [3-5 bullet]
Do not:
- [3-8 boundary]
Report:
- commit
- done
- QA/status
- blocker
```

## Output format hemat token

AI worker harus report pendek:

```text
Done: [task]
Commit: [hash]
Changed:
- [file]
QA:
- [command: pass/fail/not-run]
Blocked:
- [if any]
Need Iwan:
- [decision needed]
```

## Rules for Ujang using Codex

Ujang should use Codex mainly for:

- code implementation,
- schema edits,
- refactor,
- tests,
- local command execution,
- bug fixing,
- migration/seed work,
- service layer implementation.

Prompt to Ujang should be minimal and file-based.

Avoid:

- long product background,
- repeated history,
- full pasted docs,
- vague instruction like “lanjutkan semuanya”.

Good prompt:

```text
Ujang, read docs/engineering/37-iwan-review-sprint-03-schema-implementation-pass.md.
Task: run local QA and migration readiness.
Output: docs/engineering/38-sprint-03-local-qa-and-migration-readiness-report.md.
Do not seed, switch read path, or touch API/auth/scheduler/scraper.
Report command results honestly.
```

## Recommended Codex model usage

Use cheaper/faster Codex mode for:

- small edits,
- docs updates,
- simple bug fixes,
- lint-only fixes,
- small tests.

Use stronger Codex reasoning/frontier mode only for:

- schema/migration,
- cross-file refactor,
- hard TypeScript/Prisma errors,
- service layer design,
- debugging build failures,
- tasks needing repo-wide reasoning.

If Codex offers model choices:

- default/standard Codex model for normal code tasks,
- GPT-5.1 Codex or Codex Max style model for complex agentic coding / long-running repo tasks.

## Rules for Asep using Claude

Asep should use Claude mainly for:

- architecture review,
- risk review,
- schema review,
- plan critique,
- comparing alternatives,
- reviewing large docs.

Prompt to Asep should ask for review decisions, not implementation.

Good prompt:

```text
Asep, read docs/engineering/33-final-sprint-03-schema-recommendation.md and docs/engineering/37-iwan-review-sprint-03-schema-implementation-pass.md.
Review only: schema risk, migration risk, data trust risk.
Output: approve / needs-adjustment / blocked with max 10 bullets.
```

## Recommended Claude model usage

Use cheaper/faster Claude model for:

- summarizing docs,
- issue hygiene,
- simple review,
- copy review,
- checklist creation.

Use Sonnet-class model for:

- most architecture review,
- code review,
- schema review,
- technical planning.

Use Opus-class model only for:

- high-stakes architecture decision,
- complex migration risk,
- deep multi-doc reasoning,
- final CTO-level review before risky changes.

Avoid Opus for routine docs/copy/status updates.

## Rules for Rangga / ChatGPT Freelancer

Use Rangga for:

- docs,
- discovery,
- owner visibility,
- backlog hygiene,
- issue update drafts,
- manual source research,
- second opinion.

Rangga should not implement schema/runtime unless explicitly approved by Iwan/Owner.

## Token-saving practices

1. Reference files instead of pasting contents.
2. Ask for diff summary, not full file recap.
3. Ask for max bullets.
4. Ask for output file path.
5. Ask for command result table.
6. Avoid asking AI to explain obvious context.
7. Keep role boundaries explicit.
8. Use docs as memory, not chat history.

## Standard short prompt to Ujang

```text
Ujang, read [doc path].
Task: [task].
Output: [file path].
Do not touch [blocked areas].
Run/report QA if code changes.
Keep report short: commit, changed files, QA, blockers, need Iwan decision.
```

## Standard short prompt to Asep

```text
Asep, read [doc paths].
Review only: [risk area].
Return: approve / needs-adjustment / blocked.
Max 10 bullets.
No implementation.
```

## Standard short prompt to Rangga

```text
Rangga, read [doc paths].
Task: [docs/discovery/report].
Output: [file path].
No runtime/code/schema changes.
Report: commit, done, risks, next decision.
```

## Final reminder

Do not optimize for the smartest model every time.

Optimize for:

- task risk,
- token cost,
- speed,
- expected output length,
- whether local command execution is needed.

Initiated-by: Iwan (CEO)
Reviewed-by: Owner
Executed-by: Iwan (CEO)
Status: ready
Backlog: #11
