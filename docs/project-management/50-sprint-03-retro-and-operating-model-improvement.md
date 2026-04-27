# Sprint 03 Retro and Operating Model Improvement

Date: 2026-04-27
Status: draft-for-owner-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga
Role: Project Manager + Engineering Manager + Product Operations Reviewer

## Context

This retro reviews Sprint 03 execution around:

- schema recommendation,
- migration creation,
- temp dev DB validation,
- shared Supabase migration apply,
- seed implementation planning,
- AI worker coordination.

Inputs reviewed:

- `docs/company/04-ai-worker-token-budget-policy.md`
- `docs/company/05-ai-command-chain-policy.md`
- `docs/engineering/47-sprint-03-shared-supabase-migration-apply-report.md`
- `docs/engineering/48-rangga-sprint-03-demo-seed-plan-checklist.md`
- `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`

## Executive summary

Sprint 03 made real progress: shared Supabase migration is applied, data foundation tables exist, and seed implementation exists but is not executed yet. The strongest improvement is that the team introduced gates before risky work. The biggest cost was token-heavy coordination and too many docs/checklists around the same decision points. Next sprint should keep the gates, but make them lighter, shorter, and owned by one command channel.

## What went well

1. **Risky database work was gated.**
   Schema, migration, temp dev validation, and shared deploy were separated into explicit steps.

2. **Shared Supabase was protected.**
   The team avoided `migrate reset`, `migrate dev`, `db push`, manual SQL, seed, and read path switch on shared Supabase during migration apply.

3. **Auth/voice safety was preserved.**
   Reports confirm auth/user/voice tables remained present and `Voice.desaId` stayed scalar string.

4. **Temp dev DB validation reduced risk.**
   Migration was validated in temporary Supabase dev DB before shared apply.

5. **Seed scope became safer.**
   Seed implementation is Option A only: `Desa`, `DataSource`, `DokumenPublik`; no numeric APBDes, no read path switch, no `verified` data.

6. **Product/data governance improved.**
   Team clarified that public source visibility is not verification, and document registry should come before numeric extraction.

## What was wasteful / token-heavy

1. **Too many overlapping docs.**
   Several docs repeated the same guardrails: no scraper, no scheduler, no read path, no seed, no verified claim.

2. **Instructions sometimes restated history.**
   Some prompts repeated long context even though repo docs already captured it.

3. **Rangga drafted direct Ujang prompts too often.**
   Even when intended as draft, it created perceived double-command risk.

4. **Review docs were sometimes longer than the actual decision.**
   Useful for safety, but inefficient for routine follow-ups.

5. **QA results were spread across multiple reports.**
   Good for audit, but harder for owner to scan quickly.

## Risks that appeared

1. **Command conflict risk.**
   Owner noticed Iwan and Rangga could appear to both instruct Ujang.

2. **Token budget risk.**
   Codex/Claude may consume too much if every task includes long history instead of file references.

3. **Seed misunderstanding risk.**
   Even non-executed seed can shape assumptions. If later executed, seed data might be mistaken as real unless UI labels are clear.

4. **Read path risk.**
   Switching UI to DB before data status UX is ready could make demo/imported data look official.

5. **Environment risk.**
   Normal `prisma generate` still has Windows DLL-lock issue, even though accepted as non-blocking for migration deploy.

6. **Process fatigue risk.**
   Too many gates can slow the team if every small step needs a long document.

## What should improve before next sprint

1. **Use one-page gate docs.**
   Every gate should have: decision, allowed, blocked, commands, QA, next decision.

2. **Use short prompts only.**
   Reference files instead of pasting context. Follow `docs/company/04-ai-worker-token-budget-policy.md`.

3. **Keep Iwan as single command owner for Ujang.**
   Rangga prepares drafts/checklists/reviews only. Ujang follows Iwan.

4. **Separate decision docs from execution reports.**
   Decision doc says what is allowed. Execution report says what happened.

5. **Create a single sprint dashboard doc.**
   One owner-facing table: gate, status, blocker, next decision, owner.

6. **Avoid broad tasks.**
   Keep tasks small: one output, one owner, one report.

## Work split between Iwan, Rangga, and Ujang

## Iwan — command owner / product gate

Owns:

- final instruction to Ujang,
- approve/block gates,
- product/business priority,
- conflict resolution,
- deciding when to move from planning to execution.

Should produce:

- short command prompts,
- decision notes,
- approval/block comments.

## Rangga — oversight / PM / BA / second opinion

Owns:

- review docs,
- owner visibility,
- risk analysis,
- checklist drafting,
- product/UX/data governance review,
- draft instructions for Iwan only.

Should not:

- direct-command Ujang,
- run DB/migration commands unless explicitly appointed executor,
- duplicate Iwan instructions as if final.

## Ujang — executor / Codex operator

Owns:

- code changes,
- local commands,
- migration/seed execution when approved,
- QA reports,
- blocker reports.

Should:

- follow Iwan only,
- use Rangga docs as supporting checklist,
- report short: commit, changed files, QA, blocker, need Iwan.

## Asep — architecture/technical reviewer when available

Owns:

- schema risk review,
- migration risk review,
- architecture decision review,
- final technical challenge when high risk.

Should:

- return approve/block/needs-adjustment with max 10 bullets.

## Practices from strong tech companies to adapt realistically

## 1. Lightweight RFC for risky changes

Use one-page RFC only for:

- schema,
- migration,
- auth,
- read path,
- production data,
- scraper/scheduler.

Template:

- problem,
- decision,
- allowed scope,
- blocked scope,
- rollback,
- QA.

## 2. Single-threaded owner

For every task, one owner only:

- decision owner: Iwan,
- executor: Ujang,
- reviewer: Rangga/Asep,
- business approver: Owner.

## 3. Written gates, not meetings

Use small written gates instead of long syncs.

Gate states:

- `blocked`
- `approved-plan`
- `approved-execution`
- `executed-pending-review`
- `accepted`

## 4. Definition of Done per task

Every task must define:

- output file/code,
- QA command,
- what not to touch,
- report format.

## 5. Blameless retro

Focus on system improvements, not blaming Iwan/Ujang/Rangga/Asep.

## Recommended lightweight gates before engineering

## Product gate

Use for:

- new user-facing feature,
- UI change,
- public data display,
- copy that affects trust.

Checklist:

- [ ] What user sees.
- [ ] What status labels appear.
- [ ] What data is hidden.
- [ ] What is MVP vs later.

## Design/UX gate

Use for:

- detail page changes,
- APBDes section,
- status badge/disclaimer,
- source display.

Checklist:

- [ ] Page states: demo/imported/needs_review/verified.
- [ ] Empty states.
- [ ] Warning/disclaimer copy.
- [ ] Mobile/readability check.

## Architecture gate

Use for:

- schema,
- migration,
- read path,
- API,
- auth,
- service layer.

Checklist:

- [ ] Models touched.
- [ ] Existing tables impacted.
- [ ] Rollback plan.
- [ ] QA commands.
- [ ] Stop conditions.

## Data governance gate

Use for:

- seed,
- import,
- document registry,
- scraping/source discovery,
- verified claims.

Checklist:

- [ ] DataStatus mapping.
- [ ] Source status.
- [ ] No unreviewed verified data.
- [ ] Hide rules.
- [ ] Review owner.

## Recommended workflow for next sprint

Use this flow:

```text
1. Owner/Iwan sets outcome.
2. Rangga prepares short review/checklist if needed.
3. Iwan sends final short command to Ujang.
4. Ujang executes and reports short.
5. Rangga reviews report if requested.
6. Iwan approves/block next gate.
```

For each task, use:

```text
Read: max 3 docs
Task: 1 sentence
Output: 1 file/path
Do not: blocked areas
Report: commit, QA, blocker, need Iwan
```

## Next decisions needed

1. Should Sprint 03 seed execution be approved, or require readiness check first?
2. Should product UI status badge/disclaimer be designed before read path switch?
3. Should read path remain blocked until seed execution report is accepted?
4. Should `AnggaranDesaSummary` and `APBDesItem` stay empty until numeric policy is ready?
5. Should a single owner dashboard be created for Sprint 04 gates?
6. Should Asep/Claude be used for architecture review before read path switch?

## Summary max 12 bullets

1. Sprint 03 succeeded at the highest-risk part: shared Supabase migration applied with guardrails.
2. The team protected auth/voice and avoided seed/read path/API/scraper scope creep.
3. Temp dev DB validation before shared apply was a strong practice.
4. Seed implementation is safer because it is Option A only and not executed yet.
5. Biggest weakness: token-heavy docs and repeated guardrails.
6. Biggest coordination risk: double-command perception between Iwan and Rangga.
7. Iwan must remain the only command owner for Ujang.
8. Rangga should act as reviewer/drafter/PM, not executor commander.
9. Ujang should receive short file-based prompts and short report format.
10. Next sprint should use lightweight product/design/architecture/data gates.
11. Product/data governance must happen before read path switch.
12. Recommended next decision: approve seed readiness check first, not immediate broad read path work.

## Final recommendation

Do not add heavy process. Add small gates and stricter communication ownership.

The operating model should be:

- Iwan decides and commands.
- Ujang executes.
- Rangga reviews and drafts.
- Asep reviews architecture when available.
- Owner approves business-sensitive gates.

Initiated-by: Iwan request
Reviewed-by: Pending Owner/Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-review
