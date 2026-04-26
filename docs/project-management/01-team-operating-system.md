# PantauDesa Team Operating System

## Purpose

Dokumen ini menjadi aturan kerja untuk tiga role internal PantauDesa:

- Iwan sebagai CEO / Business Assistant / Product Designer.
- Asep sebagai CTO / Principal Engineer / Technical Reviewer.
- Ujang sebagai Programmer / Implementer.

Tujuannya agar semua perubahan punya jejak yang jelas:

- Siapa yang menginisiasi ide.
- Siapa yang meninjau dari sisi teknis.
- Siapa yang mengeksekusi.
- Backlog mana yang terkait.
- Status pekerjaan sudah sampai mana.
- Apa yang sudah selesai, sedang dikerjakan, atau belum dikerjakan.

## Role definitions

### Iwan — CEO / Product / Design

Tanggung jawab:

- Menentukan arah bisnis dan produk.
- Menentukan positioning, copywriting, narasi, dan prioritas user experience.
- Membuat atau memperbarui product strategy, sales kit, launch plan, dan design direction.
- Menginisiasi backlog baru.
- Menentukan apakah fitur selaras dengan tujuan PantauDesa.

Contoh keputusan Iwan:

- Auth harus menjelaskan kenapa user perlu daftar.
- Badge harus menjadi reputasi kontribusi, bukan hiasan.
- PantauDesa harus menekankan bahwa desa dipantau bukan karena benci.
- Warga harus diedukasi soal batas kewenangan desa.

### Asep — CTO / Architecture / Review

Tanggung jawab:

- Meninjau arah teknis.
- Memastikan implementasi tidak merusak arsitektur.
- Memastikan solusi maintainable, scalable, secure, dan testable.
- Memberi review sebelum perubahan besar dieksekusi.
- Menentukan trade-off MVP vs ideal.

Contoh keputusan Asep:

- Apakah fitur perlu masuk database sekarang atau cukup static copy dulu.
- Apakah badge butuh model data baru.
- Apakah auth flow perlu dipisah dari public data access.
- Apakah implementasi perlu feature flag.

### Ujang — Programmer / Executor

Tanggung jawab:

- Mengimplementasikan task yang sudah jelas.
- Membuat komponen, halaman, service, schema, test, dan styling.
- Menandai checklist progress di issue.
- Membuat commit dengan format yang disepakati.
- Melaporkan blocker atau kebutuhan review.

Contoh pekerjaan Ujang:

- Rewrite copy login/register.
- Membuat badge popover component.
- Membuat halaman `/badge`.
- Membuat card `Tanyakan ke pihak yang tepat`.
- Membuat halaman `/panduan/kewenangan`.

## Workflow

### 1. Initiation by Iwan

Setiap ide produk/bisnis/desain dimulai oleh Iwan.

Output yang wajib ada:

- Problem statement.
- Tujuan fitur.
- User impact.
- Copy atau direction awal jika ada.
- Backlog issue.

Format issue:

```md
## Initiated by
Iwan (CEO / Product / Design)

## Problem
...

## Goal
...

## User impact
...

## Suggested direction
...

## Status
[ ] Needs CTO review
[ ] Ready for implementation
[ ] In progress
[ ] Partially done
[ ] Done
```

### 2. Review by Asep

Asep meninjau issue sebelum masuk implementasi besar.

Output review:

- Technical approach.
- Data model impact.
- Component impact.
- Risk.
- MVP version.
- Ideal version.
- Acceptance criteria.

Format comment/review:

```md
## CTO Review — Asep

### Technical approach
...

### Risk
...

### MVP recommendation
...

### Acceptance criteria
- [ ] ...
```

### 3. Execution by Ujang

Ujang mengeksekusi berdasarkan issue dan review.

Output eksekusi:

- Commit.
- PR jika menggunakan branch.
- Checklist issue diperbarui.
- Catatan partial/done.

Format progress comment:

```md
## Implementation Update — Ujang

Status: partial / done / blocked

### Done
- ...

### Remaining
- ...

### Blocker
- ...
```

## Status marks

Gunakan status berikut di issue, PR, commit body, atau progress comment.

### Status: todo

Belum dikerjakan.

### Status: needs-review

Butuh review Asep sebelum eksekusi.

### Status: ready

Sudah siap dikerjakan Ujang.

### Status: in-progress

Sedang dikerjakan.

### Status: partial

Sebagian sudah selesai, tetapi masih ada checklist yang belum beres.

### Status: blocked

Terhambat karena butuh keputusan, data, desain, atau dependency.

### Status: done

Sudah selesai sesuai acceptance criteria.

### Status: verified

Sudah dicek ulang oleh Iwan/Asep dan dianggap sesuai.

## Commit message convention

Gunakan Conventional Commit sebagai dasar:

```txt
<type>(<scope>): <summary>

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: <todo|needs-review|ready|in-progress|partial|blocked|done|verified>
Backlog: #<issue-number>
```

Contoh:

```txt
feat(auth): improve register page civic onboarding copy

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: partial
Backlog: #7
```

Contoh untuk dokumentasi:

```txt
docs(product): add badge reputation strategy

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #8
```

Contoh untuk bugfix:

```txt
fix(profile): align badge popover on mobile

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #8
```

## Commit types

Gunakan type berikut:

- `feat`: fitur baru.
- `fix`: perbaikan bug.
- `docs`: dokumentasi.
- `design`: perubahan UI/UX/copy/design spec.
- `refactor`: perubahan struktur tanpa mengubah behavior.
- `test`: penambahan/perbaikan test.
- `chore`: maintenance.
- `perf`: optimasi performa.

## Scope examples

- `auth`
- `badge`
- `profile`
- `homepage`
- `desa-detail`
- `copy`
- `docs`
- `data`
- `admin`
- `business`
- `project-management`

## Branch naming convention

Gunakan format:

```txt
<role>/<issue-number>-<short-description>
```

Contoh:

```txt
iwan/7-auth-civic-copy
asep/8-badge-architecture-review
ujang/9-homepage-monitoring-highlight
ujang/10-responsibility-guide-page
```

Untuk implementasi code, sebaiknya Ujang menggunakan branch:

```txt
ujang/<issue-number>-<feature-name>
```

## PR template

Setiap PR sebaiknya memakai format:

```md
## Summary
...

## Role trace
- Initiated by: Iwan (CEO)
- Reviewed by: Asep (CTO)
- Executed by: Ujang (Programmer)

## Related backlog
Closes #...

## Status
- [ ] partial
- [ ] done
- [ ] needs review

## What changed
- ...

## Screenshots / notes
...

## Checklist
- [ ] Copy sesuai product direction
- [ ] UI mobile aman
- [ ] Tidak ada wording yang menuduh tanpa dasar
- [ ] Public data tidak dikunci login
- [ ] Jika terkait badge/auth, manfaat user dijelaskan
- [ ] Jika terkait kewenangan, warga diarahkan ke pihak yang tepat
```

## Issue checklist convention

Setiap issue harus punya checklist yang bisa ditandai.

Gunakan tanda:

- `[ ]` belum dikerjakan.
- `[x]` selesai.
- `[~]` sedang/partial, ditulis di komentar karena GitHub checklist tidak mendukung native partial mark.

Untuk partial progress, tambahkan komentar:

```md
## Progress mark
Status: partial

Done:
- [x] Copy direction added
- [x] Basic UI implemented

Remaining:
- [ ] Mobile polish
- [ ] CTO review
- [ ] Final verification
```

## Handoff format

### Iwan to Asep

```md
## Handoff — Iwan to Asep

Saya ingin fitur ini dibuat karena:
...

Yang perlu dicek dari sisi teknis:
...

Output yang saya harapkan:
...
```

### Asep to Ujang

```md
## Handoff — Asep to Ujang

Technical direction:
...

Implementasi MVP:
...

Jangan lakukan dulu:
...

Acceptance criteria:
- [ ] ...
```

### Ujang to Iwan/Asep

```md
## Handoff — Ujang to Iwan/Asep

Status: partial / done / blocked

Yang sudah dikerjakan:
...

Yang perlu dicek:
...

Yang belum:
...
```

## Backlog board convention

Jika memakai GitHub Issues saja, gunakan label:

- `status:todo`
- `status:needs-review`
- `status:ready`
- `status:in-progress`
- `status:partial`
- `status:blocked`
- `status:done`
- `status:verified`

Role labels:

- `role:iwan-ceo`
- `role:asep-cto`
- `role:ujang-programmer`

Area labels:

- `area:auth`
- `area:badge`
- `area:profile`
- `area:homepage`
- `area:desa-detail`
- `area:docs`
- `area:business`

## Definition of ready

Issue siap dikerjakan Ujang jika:

- Problem jelas.
- Goal jelas.
- Acceptance criteria ada.
- Copy atau direction ada jika fitur UI/copy.
- Risiko teknis sudah ditinjau Asep jika fitur besar.

## Definition of done

Task dianggap done jika:

- Checklist issue selesai.
- Commit/PR mencantumkan role trace.
- Tidak ada blocker tersisa.
- UI/copy sesuai arah Iwan.
- Technical approach tidak bertentangan dengan review Asep.
- Jika ada perubahan UI, mobile state diperhatikan.
- Jika ada fitur warga, copy tidak menuduh dan tetap adil untuk pihak desa.

## Recommended operating rhythm

### Daily

- Ujang update issue yang sedang dikerjakan.
- Jika partial, tulis apa yang selesai dan belum.

### Every feature

- Iwan menentukan tujuan.
- Asep review pendek.
- Ujang implement.
- Iwan/Asep verifikasi.

### Weekly

- Review issue open.
- Tandai mana todo, in-progress, partial, blocked, done.
- Pilih 3 prioritas minggu berikutnya.

## Important rule

Setiap perubahan yang berdampak pada product direction, user trust, civic narrative, auth, badge, dan kontribusi warga harus mencantumkan role trace minimal:

```txt
Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: <status>
Backlog: #<issue-number>
```
