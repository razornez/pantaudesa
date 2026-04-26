# Next Brief for Asep and Ujang

## Context

Iwan sudah menetapkan arah produk terbaru untuk PantauDesa:

1. Auth/login/register harus menjadi pintu partisipasi warga, bukan form standar seperti layanan subscription.
2. Badge harus menjadi sistem reputasi kontribusi, bukan sekadar hiasan profil.
3. PantauDesa harus menekankan bahwa desa dipantau bukan karena benci, tetapi karena desa adalah akar kemakmuran warga.
4. Warga harus dibantu memahami batas kewenangan desa agar tidak salah menuduh pihak desa untuk masalah yang berada di level kecamatan, kabupaten/kota, provinsi, atau pusat.

## Alignment statement

Mulai sprint berikutnya, Asep dan Ujang harus menganggap empat hal ini sebagai prioritas produk utama:

- Auth meaning.
- Badge reputation.
- Civic narrative.
- Responsibility guide.

Semua implementasi harus menjaga nada PantauDesa: tegas, hangat, adil, tidak menuduh, dan mudah dipahami warga awam.

---

# Brief for Asep — CTO

## Main responsibility

Asep bertugas memastikan arah Iwan bisa diimplementasikan dengan struktur teknis yang rapi, scalable, dan tidak membuat produk menjadi berantakan.

## Priority review

Asep harus review issue berikut:

- #7 Improve auth UX: jelaskan kenapa user perlu daftar.
- #8 Design badge system sebagai reputasi kontribusi warga.
- #9 Tambahkan highlight: kenapa desa perlu dipantau.
- #10 Tambahkan panduan kewenangan agar warga bertanya ke pihak yang tepat.
- #11 Terapkan team operating system Iwan-Asep-Ujang.

## CTO questions to answer

### For #7 Auth UX

Asep harus menjawab:

- Apakah auth hanya perlu copy update dulu, atau perlu perubahan flow?
- Data publik mana yang tetap bisa diakses tanpa login?
- Fitur apa yang memang harus login: simpan desa, kontribusi, badge, watchlist, forum?
- Apakah perlu guard/route protection baru?

Recommended MVP:

- Jangan kunci data publik.
- Update copy login/register.
- Tambahkan explanation block.
- Pastikan CTA dan secondary CTA jelas.

### For #8 Badge System

Asep harus menjawab:

- Untuk MVP, badge cukup static/mock atau langsung perlu data model?
- Apakah perlu tabel `UserBadge`, `Contribution`, atau `UserReputation`?
- Badge calculation dilakukan manual, event-based, atau aggregation?
- Bagaimana mencegah spam contribution?

Recommended MVP:

- Mulai dari badge display static/deterministic.
- Siapkan type/interface dulu.
- Jangan overbuild scoring engine di tahap awal.
- Buat arsitektur mudah diperluas ke database.

### For #9 Civic Narrative

Asep harus menjawab:

- Apakah section homepage cukup component static?
- Apakah perlu page `/tentang/kenapa-desa-dipantau`?
- Apakah copy masuk ke `src/lib/copy.ts` agar konsisten?

Recommended MVP:

- Tambahkan section homepage.
- Tambahkan page edukasi sederhana.
- Semua copy penting masuk ke source of truth copy.

### For #10 Responsibility Guide

Asep harus menjawab:

- Apakah panduan kewenangan cukup static content dulu?
- Apakah nanti perlu taxonomy kewenangan per isu?
- Di halaman detail desa, card ini ditempatkan di mana agar tidak mengganggu flow?

Recommended MVP:

- Buat static page `/panduan/kewenangan`.
- Tambahkan card di detail desa.
- Tambahkan disclaimer bahwa detail kewenangan perlu diverifikasi dengan sumber resmi.

## Asep output expected

Asep harus menambahkan komentar review di tiap issue dengan format:

```md
## CTO Review — Asep

Status: ready / needs-adjustment / blocked

### Technical direction
...

### MVP recommendation
...

### Risks
...

### Acceptance criteria for Ujang
- [ ] ...
```

---

# Brief for Ujang — Programmer

## Main responsibility

Ujang bertugas mengeksekusi perubahan yang sudah jelas, mengikuti arahan Iwan dan review Asep.

Ujang tidak perlu menunggu semua fitur besar selesai. Mulai dari MVP kecil yang rapi, jelas, dan bisa dilihat hasilnya.

## First implementation priority

Urutan kerja Ujang:

1. #7 Auth UX copy and structure.
2. #9 Homepage highlight: kenapa desa perlu dipantau.
3. #10 Responsibility guide card and page.
4. #8 Badge display and popover MVP.
5. #11 Apply workflow labels/status gradually.

## Implementation instruction for #7

Scope MVP:

- Audit login/register wording.
- Replace wording seperti `Gratis`, `Tidak perlu kartu kredit`, `Daftar gratis` jika menjadi pesan utama.
- Tambahkan block `Kenapa perlu akun?`.
- Jelaskan data publik tetap bisa dilihat tanpa akun.
- CTA utama: `Mulai Ikut Memantau`.
- Secondary CTA: `Lihat dulu tanpa daftar`.

Do not:

- Jangan kunci halaman publik di balik login.
- Jangan membuat auth terasa seperti paywall.
- Jangan membuat form terlalu panjang.

## Implementation instruction for #9

Scope MVP:

- Tambahkan section homepage `Kenapa desa perlu dipantau?`.
- Gunakan copy dari docs.
- Tambahkan CTA menuju `/tentang/kenapa-desa-dipantau`.
- Buat page sederhana jika belum ada.

Do not:

- Jangan memakai bahasa menyerang desa.
- Jangan menyimpulkan pelanggaran/korupsi.

## Implementation instruction for #10

Scope MVP:

- Tambahkan card `Tanyakan ke pihak yang tepat` di detail desa.
- Buat page `/panduan/kewenangan`.
- Jelaskan kategori umum: desa, kabupaten/kota, provinsi, pusat.
- Tambahkan disclaimer verifikasi sumber resmi.

Do not:

- Jangan membuat daftar kewenangan terlalu absolut sebelum diverifikasi.
- Jangan membuat warga merasa semua masalah adalah tanggung jawab desa.

## Implementation instruction for #8

Scope MVP:

- Tampilkan badge kecil di avatar/profile.
- Badge bisa diklik.
- Popover menampilkan nama, arti, level, manfaat.
- Tambahkan section profile `Apa arti badge kamu?`.
- Buat halaman `/badge` sederhana.

Do not:

- Jangan membuat scoring engine kompleks dulu.
- Jangan membuat badge berbasis jumlah aktivitas mentah yang mendorong spam.

## Ujang output expected

Setiap update issue harus memakai format:

```md
## Implementation Update — Ujang

Status: partial / done / blocked

### Done
- ...

### Remaining
- ...

### Need review from Asep/Iwan
- ...
```

Setiap commit harus memakai format:

```txt
<type>(<scope>): <summary>

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: <status>
Backlog: #<issue-number>
```

---

# Shared rules for Asep and Ujang

## Product rules

- Data publik tetap bisa dilihat tanpa akun.
- Auth harus menjelaskan manfaat partisipasi.
- Badge harus punya arti dan manfaat.
- Copy tidak boleh menuduh desa tanpa dasar.
- PantauDesa harus adil untuk warga dan pihak desa.
- Jika membahas kewenangan, selalu beri ruang bahwa detail perlu diverifikasi.

## Technical rules

- Copy penting sebaiknya masuk source of truth, bukan hardcoded tersebar.
- MVP dulu, jangan overengineering.
- Pastikan mobile UX aman.
- Pastikan perubahan kecil bisa direview per issue.
- Jangan gabungkan banyak fitur besar dalam satu commit.

## Communication rules

Asep dan Ujang harus selalu menandai status:

- `ready` jika siap dikerjakan.
- `partial` jika sebagian selesai.
- `blocked` jika butuh keputusan.
- `done` jika selesai implementasi.
- `verified` jika sudah dicek ulang.

## Immediate next action

Asep:

1. Review #7, #8, #9, #10.
2. Beri technical direction singkat.
3. Tandai mana yang ready untuk Ujang.

Ujang:

1. Mulai dari #7 setelah arahan Asep.
2. Jika belum ada review Asep, boleh mulai dari copy-only MVP dengan status `partial`.
3. Update issue setelah setiap bagian selesai.

## Sprint focus

Sprint berikutnya fokus pada:

> Membuat pengunjung paham kenapa PantauDesa ada, kenapa desa perlu dipantau, kenapa akun dibutuhkan, dan bagaimana warga bisa ikut berkontribusi dengan benar.
