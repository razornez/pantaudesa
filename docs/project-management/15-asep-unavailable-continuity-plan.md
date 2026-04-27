# Asep Unavailable Continuity Plan

## Status

Asep masih belum available. Project harus tetap jalan.

Dokumen ini menjadi aturan kerja sementara agar PantauDesa tetap bergerak tanpa bergantung penuh pada Asep, tetapi tetap tidak merusak arsitektur.

## Main decision

Ujang boleh merangkap sebagai:

- Software Engineer,
- QA executor,
- technical note taker,
- local validation runner,
- implementation planner.

Namun Ujang **belum boleh** menjadi final CTO untuk keputusan arsitektur besar.

Iwan tetap memegang product direction dan final product/copy verification.

## Role sementara

### Iwan

Iwan bertugas:

- menentukan prioritas sprint,
- membuka task yang aman,
- memberi product/copy review,
- menilai risiko bisnis,
- menahan task yang terlalu teknis,
- membuat keputusan go/no-go dari sisi produk.

Iwan tidak review detail teknis kode seperti CTO.

### Ujang

Ujang bertugas:

- implement task yang sudah punya scope jelas,
- menjalankan QA lokal,
- mencatat hasil command,
- membuat risk notes,
- menandai blocker,
- tidak menyembunyikan error,
- membuat dokumentasi teknis agar Asep bisa review nanti.

## Work categories

## Category A — boleh lanjut tanpa Asep

Ujang boleh lanjut jika task hanya menyentuh:

- copy/UI kecil,
- trust layer,
- empty state,
- docs,
- QA checklist,
- test/reporting,
- mapping data,
- service layer proposal docs,
- non-runtime documentation,
- minor visual polish yang tidak mengubah data flow.

Syarat:

- scope jelas,
- tidak menyentuh schema/API/auth/scheduler,
- ada acceptance criteria,
- ada report ke Iwan,
- ada QA notes.

## Category B — boleh discovery/proposal saja

Boleh dipelajari, dipetakan, dan dibuat proposal, tetapi belum boleh implement:

- Prisma schema,
- Supabase table,
- service layer DB,
- migration,
- seed strategy,
- route strategy id/slug,
- generateStaticParams strategy,
- Voice relation to Desa,
- DB fallback strategy.

Output hanya docs/proposal, bukan perubahan runtime.

## Category C — blocked sampai CTO review

Tidak boleh dieksekusi tanpa Asep atau CTO replacement:

- mengubah `prisma/schema.prisma`,
- membuat migration,
- membuat atau mengubah table Supabase,
- membuat API route baru,
- mengubah auth flow,
- mengubah `src/lib/auth.ts`,
- mengubah relation `Voice.desaId`,
- membuat scheduler,
- membuat scraper,
- membuat admin import production,
- memindahkan read path utama dari mock ke DB,
- deploy production.

## QA responsibility for Ujang

Karena Asep tidak available, setiap task Ujang harus menyertakan QA report.

Minimal QA report:

```md
## QA Report — Ujang

### Commands run
- [ ] npm run test
- [ ] npm run lint
- [ ] npx tsc --noEmit
- [ ] npx prisma validate, jika terkait Prisma atau env
- [ ] npm run build, jika environment memungkinkan

### Manual smoke test
- [ ] Homepage
- [ ] Daftar desa
- [ ] Detail desa
- [ ] Login/register jika task menyentuh auth copy
- [ ] Mobile width check jika task menyentuh UI/copy panjang

### Result
- Pass:
- Fail:
- Known existing issue:
- New issue introduced:

### Notes
...
```

Jika command gagal karena existing issue atau environment, Ujang harus menulis alasan. Jangan mengarang pass.

## Rule: no silent failure

Kalau ada error, Ujang wajib tulis:

- command apa yang gagal,
- error ringkas,
- apakah error existing atau akibat perubahan baru,
- apakah task tetap aman untuk product review,
- apakah perlu stop.

## Temporary review flow

```txt
Iwan membuka task aman
→ Ujang implement
→ Ujang menjalankan QA lokal
→ Ujang update docs/report
→ Iwan review product/copy/alignment
→ Status: verified-by-product atau needs-adjustment
→ Technical review final ditunda sampai Asep kembali
```

## Status vocabulary

Gunakan status:

- `ready`
- `in-progress`
- `qa-running`
- `qa-pass-with-known-risks`
- `qa-failed`
- `verified-by-product`
- `blocked-technical-review`
- `deferred-until-asep`

## Sprint 02 continuation

Sprint 02 boleh lanjut untuk task aman:

1. Data trust layer dan disclaimer.
2. Wording awam critical/medium yang sudah discope jelas.
3. UX empty state.
4. QA report dan smoke test.
5. Docs readiness untuk Sprint 03.

Sprint 02 tidak boleh berubah menjadi Sprint 03 implementation.

## Sprint 03 preparation while Asep unavailable

Ujang boleh lanjut menyiapkan:

- schema proposal di docs,
- ERD draft di docs,
- seed plan di docs,
- service layer interface proposal di docs,
- QA plan untuk data foundation,
- risk register untuk data foundation.

Tapi belum boleh mengubah runtime/schema.

## Next recommended task

Karena Ujang sudah pass assessment gate, task berikutnya yang aman adalah membuat **Sprint 03 Technical Proposal Pack**, bukan implementasi.

Output proposal:

1. `docs/engineering/13-sprint-03-proposed-schema.md`
2. `docs/engineering/14-sprint-03-proposed-service-contract.md`
3. `docs/engineering/15-sprint-03-seed-and-migration-plan.md`
4. `docs/engineering/16-sprint-03-risk-register.md`
5. `docs/engineering/17-sprint-03-qa-plan.md`

Ini akan membuat Asep nanti tinggal review keputusan, bukan mulai dari nol.

## Product/business reason

Kita dikejar deadline, jadi kerjaan tidak boleh berhenti. Tapi karena schema berpengaruh ke bisnis dan trust, kita pilih jalan tengah:

- Ujang lanjut sebagai QA + planner + implementer untuk task aman.
- Iwan tetap arahkan produk.
- Keputusan arsitektur irreversible ditahan.
- Semua proposal dibuat detail agar saat Asep balik, review cepat.

## Prompt untuk Ujang

```text
Ujang, baca `docs/project-management/15-asep-unavailable-continuity-plan.md`.

Asep masih belum available, jadi kamu merangkap sebagai Software Engineer + QA executor + technical note taker.

Kamu boleh lanjut task aman dan membuat proposal teknis, tapi belum boleh mengambil keputusan arsitektur final.

Setiap task wajib ada QA Report.
Jangan ada silent failure.
Kalau command gagal, tulis error dan statusnya.

Jangan ubah schema, migration, Supabase table, API route, auth flow, scheduler, scraper, atau read path mock ke DB.

Tugas berikutnya: tunggu dokumen Sprint 03 Technical Proposal Pack dari Iwan, lalu kerjakan proposalnya dalam docs saja.
```

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Direction)
Executed-by: Iwan (CEO)
Status: ready
Backlog: #4 #13
