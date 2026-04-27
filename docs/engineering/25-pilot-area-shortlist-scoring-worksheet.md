# Pilot Area Shortlist Scoring Worksheet

Date: 2026-04-27
Status: ready-for-owner-candidates
Prepared-by: ChatGPT Freelancer / Rangga

## Purpose

Worksheet ini dipakai setelah owner memberikan 2–3 kandidat wilayah pilot.

Tujuannya bukan memilih area final secara sepihak, tetapi membantu owner/Iwan membandingkan kandidat secara objektif sebelum manual source discovery dimulai.

Reference:

- `docs/engineering/24-pilot-area-selection-criteria.md`
- `docs/engineering/23-manual-source-discovery-template.md`

## Boundary

This worksheet does not authorize:

- scraper
- scheduler
- crawler
- database change
- schema change
- API change
- auth change
- read path change
- Prisma runtime implementation

It only supports pilot area scoring and manual discovery preparation.

## How to use

1. Owner proposes 2–3 candidate areas.
2. Fill candidate identity.
3. Score each criteria 1–5.
4. Add notes for each score.
5. Compare total score.
6. Pick one pilot area for manual source discovery.
7. Use `docs/engineering/23-manual-source-discovery-template.md` after area is selected.

## Scoring rules

1 = poor / unclear / not available.
3 = acceptable / mixed.
5 = strong / clear / available.

Total possible score: 40.

Threshold:

- 30–40: strong pilot candidate.
- 22–29: acceptable pilot candidate.
- 15–21: weak pilot candidate.
- below 15: not recommended for first pilot.

## Candidate A

```text
Candidate area:
Scope type: kecamatan/kabupaten
Province:
Expected sample size: 5–20 desa
Owner/business reason:

Criteria                         Score  Notes
Official source availability      _/5   
Desa website coverage             _/5   
Public document availability      _/5   
Format processability             _/5   
Recency                           _/5   
Access safety                     _/5   
Business relevance                _/5   
Data diversity                    _/5   
Total                             _/40

Recommendation:
- strong / acceptable / weak / not recommended

Main risk:

Next action if selected:
```

## Candidate B

```text
Candidate area:
Scope type: kecamatan/kabupaten
Province:
Expected sample size: 5–20 desa
Owner/business reason:

Criteria                         Score  Notes
Official source availability      _/5   
Desa website coverage             _/5   
Public document availability      _/5   
Format processability             _/5   
Recency                           _/5   
Access safety                     _/5   
Business relevance                _/5   
Data diversity                    _/5   
Total                             _/40

Recommendation:
- strong / acceptable / weak / not recommended

Main risk:

Next action if selected:
```

## Candidate C

```text
Candidate area:
Scope type: kecamatan/kabupaten
Province:
Expected sample size: 5–20 desa
Owner/business reason:

Criteria                         Score  Notes
Official source availability      _/5   
Desa website coverage             _/5   
Public document availability      _/5   
Format processability             _/5   
Recency                           _/5   
Access safety                     _/5   
Business relevance                _/5   
Data diversity                    _/5   
Total                             _/40

Recommendation:
- strong / acceptable / weak / not recommended

Main risk:

Next action if selected:
```

## Comparison summary

```text
Candidate A: [name] — [score]/40 — [recommendation]
Candidate B: [name] — [score]/40 — [recommendation]
Candidate C: [name] — [score]/40 — [recommendation]

Recommended pilot area:
Reason:
Risk:
Manual discovery scope:
```

## Owner prompt to provide candidates

Owner can send candidates using this format:

```text
Rangga, shortlist pilot area candidates:
1. [Kecamatan/Kabupaten name], [Province], reason: [...]
2. [Kecamatan/Kabupaten name], [Province], reason: [...]
3. [Kecamatan/Kabupaten name], [Province], reason: [...]

Use docs/engineering/24-pilot-area-selection-criteria.md to score them.
```

## If owner has no candidate

If owner does not have a preferred area yet, recommend this decision path:

1. Choose one area close to owner/business network.
2. Prefer 1 kecamatan first, not full kabupaten.
3. Prefer area with visible official kecamatan/kabupaten portal.
4. Prefer area where several desa websites are active.
5. Avoid controversial or politically sensitive area for first pilot.

## Final reminder

For first pilot, choose an area that is boring but clean.

A good pilot area helps answer schema and source questions safely. It does not need to be viral.

Initiated-by: Iwan
Reviewed-by: Pending Owner/Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: ready-for-owner-candidates
