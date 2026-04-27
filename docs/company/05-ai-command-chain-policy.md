# AI Command Chain Policy

Date: 2026-04-27
Status: ready
Owner direction: prevent double-command and conflicting instructions between AI workers.

## Main decision

Iwan is the command owner for Ujang.

Rangga does not direct-command Ujang.

## Roles

### Iwan

Iwan owns final instruction to Ujang.

Responsibilities:

- decide next task,
- send final prompt/instruction to Ujang,
- approve or block execution gates,
- review Ujang reports,
- resolve conflict between documents/instructions,
- protect product/business direction.

### Ujang

Ujang follows Iwan's final instruction.

Responsibilities:

- execute tasks from Iwan,
- report back to Iwan,
- flag blockers,
- flag conflicting instructions,
- do not follow Rangga drafts as direct commands unless Iwan explicitly adopts them.

### Rangga

Rangga supports Iwan.

Responsibilities:

- prepare draft instructions,
- prepare checklist,
- prepare review notes,
- prepare second opinion,
- prepare docs/visibility reports.

Rangga does not send final operational command to Ujang.

## Conflict rule

If there is a difference between Iwan's instruction and Rangga's checklist/draft:

1. Ujang follows Iwan first.
2. Ujang flags the difference to Iwan.
3. Iwan decides whether to update the command or ignore the checklist item.

## Temp dev DB validation rule

For Sprint 03 temp dev DB validation:

- `docs/engineering/46-rangga-temp-dev-db-validation-oversight-checklist.md` is supporting checklist only.
- Final command to Ujang comes from Iwan.
- Ujang reports to Iwan.
- Rangga may review Ujang's report afterward if requested by owner/Iwan.

## Standard flow

```text
Owner gives direction
→ Iwan decides command
→ Iwan sends instruction to Ujang
→ Ujang executes
→ Ujang reports to Iwan
→ Iwan reviews
→ Rangga may provide checklist/second opinion if requested
```

## Standard short command from Iwan to Ujang

```text
Ujang, read [Iwan decision doc].
Use [Rangga checklist doc] as support only.
Follow Iwan instruction if there is conflict.
Task: [task].
Output: [file].
Do not touch [blocked areas].
Report short: commit, commands, pass/fail, blockers, need Iwan decision.
```

## Final note

Docs/checklists help reduce mistakes, but final execution authority must stay single-source to avoid confusion.

Initiated-by: Iwan (CEO)
Reviewed-by: Owner
Executed-by: Iwan (CEO)
Status: ready
Backlog: #11
