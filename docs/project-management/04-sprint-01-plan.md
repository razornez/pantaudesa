# Sprint 01 Plan — Civic Trust and Participation Foundation

Sprint owner: Iwan
Technical reviewer: Asep
Executor: Ujang
Duration: 1 week

## Sprint goal

Membuat pengunjung memahami:

1. Kenapa PantauDesa ada.
2. Kenapa desa perlu dipantau.
3. Kenapa akun dibutuhkan.
4. Bagaimana warga bisa ikut berkontribusi dengan benar.
5. Bagaimana warga bertanya ke pihak yang tepat.

## Sprint theme

> Civic trust before feature expansion.

Sebelum menambah fitur besar, PantauDesa harus punya fondasi narasi, trust, auth meaning, dan responsibility guide yang jelas.

## Sprint scope

### Must finish

1. #7 Auth UX copy and structure.
2. #9 Homepage highlight: kenapa desa perlu dipantau.
3. #10 Responsibility guide card and page.
4. #11 Apply workflow status/progress at minimum for active issues.

### Should finish

5. #8 Badge display and popover MVP.

### Not in this sprint

- Full badge scoring engine.
- Full admin panel.
- Full data import.
- Forum.
- Paid monetization features.
- Advanced analytics.

## Day-by-day plan

### Day 1 — Asep review and technical alignment

Owner: Asep

Tasks:
- Review #7, #8, #9, #10, #11.
- Add CTO Review comments.
- Mark status for each issue: ready / needs-adjustment / blocked.
- Confirm source-of-truth location for copy.
- Confirm whether each feature is static MVP or needs data model.

Expected output:
- Ujang can start #7 without ambiguity.

### Day 2 — Auth UX MVP

Owner: Ujang

Tasks:
- Audit login/register wording.
- Replace subscription-like copy.
- Add `Kenapa perlu akun?` block.
- Add public access reassurance.
- Add primary CTA `Mulai Ikut Memantau`.
- Add secondary CTA `Lihat dulu tanpa daftar`.

Expected output:
- Auth feels like civic participation, not SaaS paywall.

Related issue: #7

### Day 3 — Homepage civic narrative

Owner: Ujang

Tasks:
- Add homepage section `Kenapa desa perlu dipantau?`.
- Add CTA to `/tentang/kenapa-desa-dipantau`.
- Create simple page if route does not exist.
- Ensure copy is warm, fair, non-accusatory.

Expected output:
- Visitor understands PantauDesa is not anti-desa.

Related issue: #9

### Day 4 — Responsibility guide

Owner: Ujang

Tasks:
- Add detail desa card `Tanyakan ke pihak yang tepat`.
- Create `/panduan/kewenangan` page.
- Add general responsibility categories.
- Add disclaimer that legal/authority details need official verification.

Expected output:
- Warga understand not every problem is desa responsibility.

Related issue: #10

### Day 5 — Badge MVP and workflow cleanup

Owner: Ujang + Asep

Tasks:
- Create initial badge level data/static config.
- Add badge display to profile/avatar if profile exists.
- Add simple `/badge` page if profile is not ready.
- Add issue progress comments.
- Ensure commits use role trace.

Expected output:
- Badge concept becomes visible or at least ready as UI/content page.

Related issues: #8, #11

### Day 6 — Review and verification

Owner: Asep + Iwan

Tasks:
- Asep reviews code and risks.
- Iwan reviews product/copy alignment.
- Mark issues partial/done/blocked.
- Update project dashboard progress.

Expected output:
- Clear progress report for Komisaris.

### Day 7 — Commissioner report

Owner: Iwan

Tasks:
- Read issues, commits, and dashboard.
- Report progress percentage.
- Explain what changed.
- Explain next sprint recommendation.

Expected output:
- Komisaris gets executive report.

## Acceptance criteria

Sprint 01 is successful if:

- [ ] Auth/register explains why users should create an account.
- [ ] Public data is not positioned as locked behind login.
- [ ] Homepage explains why desa needs to be monitored.
- [ ] Copy clearly states monitoring is not hatred or accusation.
- [ ] Detail desa or guide explains responsibility boundaries.
- [ ] Badge concept has at least a visible explanation page or MVP UI.
- [ ] Active issues have status/progress comments.
- [ ] Commits use role trace.
- [ ] Project dashboard is updated after implementation.

## Definition of done

Sprint 01 is done when:

- #7 is done or partial with clear remaining tasks.
- #9 is done or partial with visible homepage/page work.
- #10 is done or partial with visible guide/card work.
- #8 is at least planned/partial.
- #11 has visible workflow adoption.
- Asep has reviewed technical direction.
- Iwan can answer progress percentage based on repo evidence.

## Risk control

### Risk: Ujang starts before Asep review

Allowed only for copy-only MVP. Mark status as partial and request Asep review.

### Risk: copy is too accusatory

Iwan must review before done/verified.

### Risk: authority guide becomes legally inaccurate

Keep language general and add disclaimer pending official verification.

### Risk: badge becomes overbuilt

Use static MVP first. No scoring engine in Sprint 01.

## Sprint 01 prompt for Asep

```text
Asep, baca Sprint 01 plan di `docs/project-management/04-sprint-01-plan.md`.
Review issue #7, #8, #9, #10, dan #11.
Tentukan mana yang ready, needs-adjustment, atau blocked.
Jangan overengineering. Fokus MVP yang aman untuk Ujang eksekusi minggu ini.
```

## Sprint 01 prompt for Ujang

```text
Ujang, baca Sprint 01 plan di `docs/project-management/04-sprint-01-plan.md`.
Kerjakan urutan: #7, #9, #10, #8, #11.
Ikuti CTO Review Asep jika sudah ada.
Setiap commit wajib pakai role trace dan setiap issue wajib diberi update status.
```
