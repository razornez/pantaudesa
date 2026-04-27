# Iwan Review — Sprint 02.5 Handoff

Date: 2026-04-27
Reviewer: Iwan
Executor reviewed: Rangga / ChatGPT Freelancer as Ujang backup

## Files reviewed

- `docs/engineering/21-official-source-schema-implications.md`
- `docs/engineering/22-pilot-source-discovery-plan.md`
- `docs/project-management/19-backlog-hygiene-plan.md`
- `docs/project-management/13-sprint-03-data-foundation-plan.md`

## Commit references

- `4cad63cb1bd2b831eec7de239ba34a696411432a` — official source schema implications
- `fc1e172f2689540982d9ba01c32df0bb991665e4` — pilot source discovery plan
- `baad9ec57d7c422b17849e4222eb110c38cd6a77` — Sprint 03 blocked gate update

## Scope

Review ini hanya menilai dokumentasi, backlog hygiene, dan readiness arah Sprint 02.5.

Tidak ada review implementasi kode.
Tidak ada approval untuk mulai schema/database.

## Overall decision

Status: reviewed / accepted

Sprint 02.5 handoff dari Rangga cukup baik dan bisa diterima sebagai bridge sebelum Sprint 03.

Namun Sprint 03 schema/database tetap **blocked** sampai output Sprint 02.5 direview oleh CTO/technical authority yang kompeten.

## 1. Can #9 be closed?

Decision: yes, can be closed as done after owner/Iwan confirmation.

Reason:

- Civic narrative sudah ada di homepage melalui `PondasiTransparansiSection`.
- Halaman `/tentang/kenapa-desa-dipantau` sudah ada.
- Copy mendukung prinsip `memantau bukan menuduh`.
- Tidak ada catatan blocker product/copy yang tersisa untuk scope #9.

Recommended status:

- `done`

Suggested issue comment:

```text
Iwan review: #9 can be closed as done. Homepage civic narrative and `/tentang/kenapa-desa-dipantau` are present. Copy tone supports “memantau bukan menuduh” and aligns with PantauDesa product direction.
```

## 2. Can #10 be closed?

Decision: yes, can be closed as done after owner/Iwan confirmation.

Reason:

- `ResponsibilityGuideCard` sudah ada di detail desa.
- Halaman `/panduan/kewenangan` sudah ada.
- Disclaimer kewenangan sudah ada.
- Copy sudah cukup hati-hati dan tidak absolut.
- Fungsi produk #10 tercapai: warga diarahkan bertanya ke pihak yang tepat.

Recommended status:

- `done`

Suggested issue comment:

```text
Iwan review: #10 can be closed as done. Detail desa has responsibility guide card, `/panduan/kewenangan` exists, and copy/disclaimer are careful enough to avoid wrongly blaming desa for every issue.
```

## 3. Is `21-official-source-schema-implications.md` enough for CTO review?

Decision: yes, enough for CTO review.

Strengths:

- Menjelaskan bahwa Sprint 03 schema tidak boleh hanya mengikuti `mock-data.ts`.
- Mengusulkan `DataSource` sebagai model penting sejak Sprint 03.
- Menjelaskan field source registry yang masuk akal: `scopeType`, `scopeName`, `desaId`, `sourceName`, `sourceUrl`, `sourceType`, `accessStatus`, `dataAvailability`, `dataStatus`.
- Menjelaskan kapan `RawSourceSnapshot` dan staging table bisa ditunda.
- Menjaga rule penting: imported data tidak otomatis verified.
- Menyebut hubungan published models dengan source.
- Menandai risiko `Voice.desaId` agar tidak dipaksa relation terlalu cepat.

Iwan recommendation:

- Dokumen ini cukup untuk bahan CTO review.
- Untuk Sprint 03 minimal, Iwan cenderung setuju `DataSource` dan `DataStatus` harus masuk scope.
- `RawSourceSnapshot` dan staging bisa ditunda ke Sprint 04/03.5 kecuali CTO memutuskan perlu sejak awal.

Status:

- accepted for CTO review

## 4. Is `22-pilot-source-discovery-plan.md` suitable for manual discovery?

Decision: yes, suitable.

Strengths:

- Scope jelas: manual discovery, bukan scraping.
- Non-goals jelas: tidak ada crawler, scheduler, DB insert, OCR, parsing otomatis, publish UI.
- Pilot 1 kecamatan atau 1 kabupaten masuk akal.
- Fields manual discovery cukup lengkap untuk memahami real source availability.
- Ada outcome-based recommendation yang baik untuk Sprint 03.
- Ada quality bar yang jelas.

Iwan recommendation:

- Jalankan manual pilot discovery hanya setelah owner memilih area target.
- Kalau owner belum punya area, mulai dari 1 kecamatan dulu.
- Discovery output jangan langsung dianggap verified source; pakai status imported/needs_review nanti.

Status:

- accepted for manual pilot discovery planning

## 5. Is `19-backlog-hygiene-plan.md` enough for owner visibility?

Decision: yes, enough as a backlog hygiene baseline.

Strengths:

- Memisahkan status #9, #10, #12, #13, dan #11 dengan jelas.
- Menyebut #9/#10 ready for Iwan/Owner review.
- Menjaga #12 tetap partial.
- Menjaga #13 sebagai discovery-in-progress.
- Menjaga #11 tetap open untuk workflow cleanup.
- Menyediakan suggested issue comments dan label/status vocabulary.

Remaining limitation:

- Ini masih dokumen plan. Agar owner visibility benar-benar rapi, issue GitHub tetap perlu diupdate/ditutup sesuai keputusan.

Status:

- accepted as owner visibility baseline

## 6. Is Sprint 03 still blocked?

Decision: yes, Sprint 03 schema/database remains blocked.

Reason:

- Official source strategy impacts schema requirements.
- `DataSource`, `DataStatus`, source registry, raw snapshot/staging implications must be reviewed first.
- Sprint 03 cannot safely start by only copying current mock data shape.
- Sprint 03 touches Prisma, Supabase/database, migration, service layer, and read path.

Current gate:

- Sprint 03 planning may continue.
- Sprint 03 schema/database implementation may not start yet.

Blocked actions:

- change `prisma/schema.prisma`
- create migration
- create Supabase table
- change database
- create scraper/scheduler
- change API/auth/read path

## Sprint 02.5 status

Sprint 02.5 documentation handoff: accepted.

Remaining actions before Sprint 03:

1. Owner/Iwan confirm #9 closed.
2. Owner/Iwan confirm #10 closed.
3. Update issue #12 as partial.
4. Update issue #13 as discovery-in-progress.
5. Keep #11 open/in-progress.
6. Choose pilot area for manual source discovery.
7. Technical authority reviews schema implications before schema work starts.

## Final issue status recommendation

| Issue | Recommended status | Notes |
|---|---|---|
| #9 | done | Civic narrative implemented and product/copy fit is acceptable |
| #10 | done | Authority guide implemented and copy/disclaimer acceptable |
| #12 | partial | Critical wording done; full-site audit not proven complete |
| #13 | discovery-in-progress | Strategy docs exist; implementation blocked |
| #11 | open / in-progress | Workflow and issue hygiene still needs cleanup |

## Instruction for Rangga / backup executor

Rangga should not start schema/database work.

If asked to continue, Rangga may help with:

- issue comments/status updates,
- pilot area research after owner chooses target,
- manual discovery template,
- docs cleanup,
- owner visibility report.

Rangga must not touch:

- schema,
- database,
- migration,
- Supabase table,
- API,
- auth,
- scraper,
- scheduler,
- read path.

## Instruction for Ujang when available

Ujang should read this review before doing any Sprint 03 work.

Ujang must not resume Sprint 03 schema/database work until this gate is cleared.

## Commissioner summary

Sprint 02.5 handoff is accepted. #9 and #10 are ready to close. #12 remains partial. #13 is now discovery-in-progress. #11 stays open. Sprint 03 schema/database remains blocked until official source strategy/schema implications are technically reviewed.

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Direction)
Executed-by: Rangga (ChatGPT Freelancer)
Status: reviewed
Backlog: #9 #10 #11 #12 #13
