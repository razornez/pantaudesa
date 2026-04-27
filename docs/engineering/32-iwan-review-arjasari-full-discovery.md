# Iwan Review — Full Arjasari Manual Discovery

Date: 2026-04-27
Reviewer: Iwan
Technical gate: Owner acting as temporary technical gate because Asep unavailable
Input reviewed: `docs/engineering/31-manual-discovery-arjasari-full-11-desa.md`

## Decision

Full manual discovery for 11 desa in Kecamatan Arjasari is accepted.

Kecamatan Arjasari remains a strong pilot area.

## Important gate decision

Owner stated that he can represent Asep for approval.

Iwan accepts this as a **limited technical gate override** for the next planning step:

- allowed: prepare final Sprint 03 schema recommendation,
- not yet allowed: change Prisma schema/database/migration/read path.

Sprint 03 schema implementation should start only after the final schema recommendation is reviewed and explicitly approved by Iwan/Owner.

## Scope reviewed

11 desa:

1. Ancolmekar
2. Arjasari
3. Baros
4. Batukarut
5. Lebakwangi
6. Mangunjaya
7. Mekarjaya
8. Patrolsari
9. Pinggirsari
10. Rancakole
11. Wargaluyu

## Accepted findings

### Active official desa websites observed

- Ancolmekar
- Arjasari
- Baros
- Batukarut
- Lebakwangi
- Mangunjaya
- Patrolsari
- Pinggirsari
- Rancakole
- Wargaluyu

### Needs review / source-status validation

- Mekarjaya

### APBDes / realisasi evidence found

- Ancolmekar
- Lebakwangi
- Mangunjaya
- Patrolsari
- Pinggirsari
- Rancakole
- Wargaluyu

### Not confirmed in this pass

- Arjasari
- Baros
- Batukarut
- Mekarjaya

## Product/trust assessment

This discovery confirms that PantauDesa needs a careful data governance model.

Key observations:

- Source availability is strong but uneven.
- Some desa have strong budget/document evidence.
- Some desa only have profile/contact/aparatur data.
- Some source URLs are stale or need review.
- APBDes/realisasi can appear as article pages, infographics, document references, or historical archives.
- Data cannot be treated as verified just because it is publicly visible.

## Schema implications accepted by Iwan

### 1. `DataSource` should be included from Sprint 03

Reason:

Data source is not just a string. One desa can have multiple sources, and source can come from:

- desa website,
- kecamatan detail page,
- article page,
- archive page,
- document URL,
- source with typo/stale URL.

### 2. `dataStatus` lifecycle must be mandatory

Minimum lifecycle:

- `demo`
- `imported`
- `needs_review`
- `verified`
- `outdated`
- `rejected`

Rule:

- `imported` is not `verified`.
- `needs_review` must not be shown as trusted official data.
- `verified` must require explicit review later.

### 3. `sourceId` should be optional on public data models

Reason:

Early demo seed and partial discovery data need flexibility.

Recommended public models should be able to optionally link to source:

- Desa
- AnggaranDesaSummary
- APBDesItem
- DokumenPublik

### 4. Document registry should come before full numeric APBDes extraction

Reason:

Discovery found many document/article/infographic patterns. Numeric extraction should not be rushed.

Sprint 03 should support document/source registry first before pretending all APBDes numbers can be parsed reliably.

### 5. Raw snapshot and staging remain valuable but can be deferred

Recommendation:

- Include them in design notes.
- Do not necessarily implement them in first Sprint 03 schema unless owner/Iwan explicitly approve.

## Next approved step

Create final Sprint 03 schema recommendation based on:

- current mock-data needs,
- official source strategy,
- Arjasari full discovery,
- data governance requirements,
- deadline pressure.

Required output:

`docs/engineering/33-final-sprint-03-schema-recommendation.md`

## Required content for final schema recommendation

The document must include:

1. Proposed minimal Prisma models.
2. Which models are must-have for Sprint 03.
3. Which models are deferred.
4. Proposed enums.
5. Field list for each model.
6. Relations and optional source links.
7. Data status rule.
8. Seed/demo strategy.
9. Which read path should move first.
10. QA plan before and after schema implementation.
11. Stop conditions.
12. Owner/Iwan approval checklist.

## Boundary still active

Allowed now:

- final schema recommendation doc,
- ERD/pseudo-Prisma in docs,
- implementation plan,
- QA plan,
- risk notes.

Not allowed until final schema recommendation is approved:

- changing `prisma/schema.prisma`,
- creating migration,
- changing database/Supabase,
- changing API/auth/read path,
- creating scraper/scheduler,
- publishing data to UI,
- marking any findings as verified.

## Instruction for Rangga

```text
Rangga, baca `docs/engineering/32-iwan-review-arjasari-full-discovery.md`.

Iwan/Owner accepted the full Arjasari manual discovery.
Next step is to prepare final Sprint 03 schema recommendation, not implementation.

Create:
`docs/engineering/33-final-sprint-03-schema-recommendation.md`

Use inputs:
- docs/engineering/31-manual-discovery-arjasari-full-11-desa.md
- docs/engineering/21-official-source-schema-implications.md
- docs/project-management/13-sprint-03-data-foundation-plan.md
- docs/engineering/03-prisma-model-notes.md
- docs/engineering/04-data-service-layer-plan.md

Do not change schema/database/API/auth/read path/Prisma.
Do not create migration.
Do not implement scraper/scheduler.
Do not publish data to UI.
Do not mark data as verified.

The recommendation must clearly separate:
- must-have Sprint 03 models,
- deferred models,
- dataStatus rules,
- DataSource/source registry design,
- document registry before numeric extraction,
- QA/stop conditions.
```

## Final note

This is progress toward Sprint 03, but still not schema implementation.

Sprint 03 implementation gate remains closed until final schema recommendation is reviewed and approved.

Initiated-by: Iwan (CEO)
Reviewed-by: Owner acting as Technical Gate
Executed-by: Rangga (ChatGPT Freelancer)
Status: approved-for-final-schema-recommendation
Backlog: #13 #4
