# Auth, Badge, and Civic Narrative Strategy

## Purpose

Dokumen ini menangkap sudut pandang penting untuk pengembangan PantauDesa: fitur login, register, profile, badge, kontribusi, dan edukasi warga harus terasa bermakna, bukan seperti fitur standar aplikasi berlangganan.

PantauDesa harus menjawab pertanyaan pengunjung awam:

- Kenapa saya harus daftar?
- Apa hubungan akun saya dengan pemantauan desa?
- Apa manfaat saya menjadi anggota PantauDesa?
- Apa yang bisa saya lakukan setelah login?
- Apakah PantauDesa dibuat untuk menyerang desa?
- Apa batas tanggung jawab desa dan apa yang bukan kewenangan desa?

Jika pertanyaan ini tidak dijawab, pengunjung bisa bingung, bosan, atau tidak percaya. Karena itu authentication harus menjadi pintu partisipasi, bukan sekadar form.

## Core philosophy

### Pantau bukan karena benci

Narasi utama:

> Desa dipantau bukan karena kita benci desa. Desa dipantau karena desa adalah akar kemakmuran masyarakat. Jika desa transparan, warga lebih percaya. Jika warga ikut mengawasi, pembangunan bisa lebih tepat sasaran.

Versi pendek:

> Memantau desa bukan berarti menuduh. Memantau desa berarti ikut menjaga akar kemakmuran bersama.

Versi emosional:

> Desa adalah tempat hidup banyak keluarga dimulai. Jalan, bantuan, fasilitas umum, pelayanan, dan program warga banyak berawal dari keputusan di desa. Karena itu, transparansi desa bukan ancaman. Transparansi adalah cara membangun kepercayaan.

### Membangun dari bawah

PantauDesa harus menekankan bahwa struktur bangsa yang sehat dimulai dari unit paling dekat dengan warga.

Narasi:

> Kita ingin membenahi struktur dari bawah. Jika desa terbuka, bekerja baik, dan warganya aktif bertanya dengan cara yang benar, maka pengawasan ke tingkat kecamatan, kabupaten, provinsi, hingga pusat akan lebih mudah dibangun.

### Adil untuk warga dan pihak desa

PantauDesa harus adil untuk dua sisi:

- Warga berhak tahu, bertanya, dan meminta informasi publik.
- Pihak desa juga berhak dipahami sesuai kewenangannya, bukan disalahkan atas semua masalah yang sebenarnya menjadi wewenang kecamatan, kabupaten/kota, provinsi, kementerian, atau pemerintah pusat.

## Authentication strategy

### Problem with generic auth wording

Wording berikut harus dihindari sebagai pesan utama:

- Gratis · Tidak perlu kartu kredit.
- Belum punya akun? Daftar gratis.
- Masuk untuk melanjutkan.
- Daftar sekarang.

Wording seperti itu terasa seperti layanan subscription biasa. Untuk PantauDesa, user harus merasa bahwa mendaftar berarti menjadi bagian dari partisipasi warga yang lebih paham dan lebih bertanggung jawab.

### What registration should mean

Akun PantauDesa bukan sekadar identitas login. Akun adalah ruang warga untuk:

- Menyimpan desa yang ingin dipantau.
- Mengikuti perkembangan desa tertentu.
- Memberi kontribusi informasi atau koreksi.
- Mengumpulkan badge kontribusi.
- Membangun reputasi sebagai warga aktif.
- Mendapat ringkasan atau notifikasi perubahan data.
- Mengakses forum atau diskusi komunitas secara lebih bertanggung jawab.

### Register page recommendation

Headline:

> Ikut menjaga desa dari tempat paling dekat: sebagai warga yang peduli.

Alternative headline:

> Buat akun untuk ikut memantau, memahami, dan menjaga transparansi desa.

Subheadline:

> Dengan akun PantauDesa, kamu bisa menyimpan desa yang kamu pedulikan, mengikuti perubahan data, memberi kontribusi, dan membangun reputasi sebagai warga yang aktif mengawal transparansi.

Benefit bullets:

- Simpan desa yang ingin kamu pantau.
- Ikuti perubahan data dan status anggaran.
- Beri kontribusi informasi atau koreksi dengan lebih bertanggung jawab.
- Kumpulkan badge kontribusi sebagai tanda partisipasi.
- Bangun profil warga peduli yang bisa dipercaya komunitas.

Primary CTA:

> Mulai Ikut Memantau

Secondary CTA:

> Lihat dulu tanpa daftar

Microcopy:

> Kamu tetap bisa melihat data publik tanpa akun. Akun diperlukan jika kamu ingin menyimpan desa, berkontribusi, mengikuti perkembangan, dan membangun reputasi komunitas.

### Login page recommendation

Headline:

> Masuk kembali ke ruang pantau desamu.

Subheadline:

> Lanjutkan memantau desa yang kamu simpan, lihat kontribusimu, dan ikuti perkembangan transparansi yang kamu pedulikan.

Primary CTA:

> Masuk ke PantauDesa

Register prompt:

> Baru pertama kali ikut memantau? Buat akun warga peduli.

### Why account explanation block

Title:

> Kenapa perlu akun?

Body:

> Data publik tetap bisa dilihat tanpa akun. Namun akun membantu kamu ikut berperan lebih jauh: menyimpan desa yang kamu pedulikan, mengikuti perubahan data, memberi kontribusi, dan membangun reputasi sebagai warga aktif. Dengan akun, partisipasi tidak lagi anonim dan acak. Kontribusi bisa lebih tertata, aman, dan dipercaya.

### Auth design principles

1. Explain before asking
   - Jangan langsung meminta user daftar.
   - Jelaskan dulu manfaat dan konteks.

2. Public access remains open
   - Jangan membuat data publik terasa terkunci.
   - Akun adalah lapisan partisipasi, bukan pagar akses.

3. Make participation meaningful
   - Login harus membuka fitur kontribusi, watchlist, badge, forum, atau notifikasi.

4. Avoid subscription tone
   - Hindari bahasa kartu kredit, paket, dan daftar gratis sebagai pesan utama.

5. Build trust
   - Jelaskan data apa yang disimpan.
   - Jelaskan kenapa kontribusi perlu identitas.
   - Jelaskan bahwa user tetap bisa melihat data tanpa akun.

## Profile and badge strategy

### Problem with unclear badges

Jika badge hanya menjadi label visual tanpa fungsi, user tidak punya alasan untuk peduli. Badge harus menjawab:

- Saya dapat badge karena apa?
- Badge ini terlihat di mana?
- Apa manfaat badge ini?
- Apa bedanya user biasa dan user dengan badge tinggi?
- Apakah badge menunjukkan reputasi kontribusi?

### Badge design goal

Badge harus menjadi sistem reputasi ringan yang membuat warga merasa kontribusinya dihargai, tanpa mengubah PantauDesa menjadi game yang dangkal.

Badge bukan sekadar dekorasi. Badge adalah tanda:

- Partisipasi.
- Konsistensi.
- Kontribusi.
- Kepercayaan komunitas.
- Pemahaman warga terhadap transparansi desa.

### Public profile badge behavior

Di halaman publik, badge harus terlihat kecil tetapi menarik.

Recommendation:

- Badge menempel kecil di foto profil/avatar.
- Badge bisa diklik atau ditekan.
- Saat diklik, muncul popover/modal kecil berisi:
  - Nama badge.
  - Level badge.
  - Arti badge.
  - Kontribusi yang membuat user mendapat badge.
  - Manfaat atau privilege yang terbuka.

Contoh microcopy popover:

> Penjaga Transparansi
>
> Badge ini diberikan kepada warga yang aktif menyimpan desa pantauan, membaca laporan, dan memberi kontribusi yang membantu komunitas memahami data desa.

## Badge levels

### Level 1 — Warga Peduli

Diberikan kepada:
- User baru yang membuat akun.
- Menyimpan minimal 1 desa.

Meaning:
- User mulai ikut memantau.

Benefits:
- Bisa menyimpan desa pantauan.
- Bisa mengikuti perkembangan desa.
- Bisa melihat riwayat aktivitas pribadi.

### Level 2 — Pemantau Desa

Diberikan kepada:
- User yang aktif membuka detail desa.
- Menyimpan beberapa desa.
- Membaca dokumen atau panduan.

Meaning:
- User mulai memahami data desa dan aktif mengikuti perkembangan.

Benefits:
- Komentar/kontribusi tampil dengan label reputasi.
- Bisa mengikuti lebih banyak desa.
- Mendapat ringkasan perubahan.

### Level 3 — Kontributor Warga

Diberikan kepada:
- User yang memberi koreksi data, link sumber, atau informasi pendukung.
- Kontribusi diverifikasi atau dianggap membantu.

Meaning:
- User tidak hanya membaca, tetapi ikut memperbaiki kualitas informasi.

Benefits:
- Badge tampil di profil publik.
- Kontribusi ditandai sebagai kontribusi komunitas.
- Bisa mengusulkan pembaruan data.

### Level 4 — Penjaga Transparansi

Diberikan kepada:
- User yang konsisten berkontribusi secara bertanggung jawab.
- Kontribusi berkualitas dan tidak menyerang pribadi.

Meaning:
- User menjadi figur komunitas yang dapat dipercaya.

Benefits:
- Komentar/kontribusi lebih dipercaya.
- Bisa membantu moderasi ringan atau memberi sinyal kualitas laporan.
- Bisa mendapat akses awal ke fitur komunitas.

### Level 5 — Penggerak Desa Terbuka

Diberikan kepada:
- User dengan kontribusi tinggi, konsisten, dan berdampak.
- Membantu banyak warga memahami data atau membantu perbaikan transparansi.

Meaning:
- User menjadi simbol partisipasi warga yang sehat.

Benefits:
- Badge khusus di profil publik.
- Bisa menjadi trusted contributor.
- Bisa masuk halaman apresiasi komunitas.
- Bisa ikut memberi masukan prioritas fitur/data.

## Badge benefits must be visible

Di halaman profil, tampilkan section:

Title:

> Apa arti badge kamu?

Content:

- Badge saat ini.
- Cara naik level.
- Manfaat badge ini.
- Kontribusi yang sudah dihitung.
- Badge berikutnya dan syaratnya.

Copy:

> Badge bukan sekadar hiasan. Badge menunjukkan seberapa aktif kamu ikut menjaga transparansi desa dengan cara yang bertanggung jawab.

## Badge anti-abuse rules

Badge tidak boleh mendorong spam atau tuduhan sembarangan.

Rules:

- Kontribusi berkualitas lebih penting daripada jumlah.
- Tuduhan tanpa sumber tidak dihitung sebagai kontribusi.
- Laporan yang menyerang pribadi bisa diturunkan prioritasnya.
- Kontributor dengan reputasi tinggi tetap harus mengikuti aturan komunitas.

## Civic education: batas kewenangan desa

### Why this matters

PantauDesa harus mengedukasi warga bahwa tidak semua masalah di wilayah desa otomatis menjadi tanggung jawab pemerintah desa.

Tujuannya:

- Warga bertanya ke pihak yang tepat.
- Desa tidak selalu menjadi sasaran tuduhan yang keliru.
- Diskusi menjadi lebih adil dan produktif.
- PantauDesa terlihat matang dan bertanggung jawab.

### Governance responsibility explainer

Copy utama:

> Tidak semua masalah di desa adalah kewenangan pemerintah desa. Ada urusan yang menjadi tanggung jawab desa, kecamatan, kabupaten/kota, provinsi, atau pemerintah pusat. PantauDesa membantu warga memahami ke mana pertanyaan sebaiknya diarahkan.

### Example responsibility categories

Catatan: detail hukum dan daftar kewenangan final harus diverifikasi dengan sumber resmi sebelum publikasi.

#### Biasanya terkait desa

- APBDes.
- Program desa.
- Kegiatan pembangunan yang dibiayai anggaran desa.
- Informasi dokumen desa.
- Perangkat desa.
- Musyawarah desa.
- Program pemberdayaan warga yang dikelola desa.

#### Bisa terkait kecamatan/kabupaten/kota

- Jalan kabupaten.
- Perizinan tertentu.
- Program dinas.
- Layanan administrasi di atas desa.
- Pengawasan dan pembinaan pemerintahan desa.

#### Bisa terkait provinsi

- Jalan provinsi.
- Program lintas kabupaten/kota.
- Bantuan provinsi.
- Kebijakan sektoral tingkat provinsi.

#### Bisa terkait pemerintah pusat

- Dana transfer pusat.
- Program nasional.
- Bantuan sosial nasional.
- Regulasi kementerian.

## Placement recommendation

### Homepage

Tambahkan highlight section setelah hero atau setelah ringkasan nasional.

Title:

> Kenapa desa perlu dipantau?

Body:

> Karena desa adalah akar kemakmuran warga. Memantau desa bukan berarti membenci atau menuduh. Justru dengan transparansi, desa bisa lebih dipercaya, warga bisa lebih paham, dan pembangunan bisa lebih tepat sasaran.

CTA:

> Pelajari cara memantau dengan benar

### Detail desa

Tambahkan card setelah status summary atau sebelum CTA pengaduan.

Title:

> Tanyakan ke pihak yang tepat

Body:

> Tidak semua masalah di wilayah desa menjadi kewenangan pemerintah desa. Lihat dulu apakah hal ini terkait APBDes, program desa, kewenangan kabupaten, provinsi, atau pusat agar pertanyaanmu lebih tepat sasaran.

CTA:

> Lihat panduan kewenangan

### Login/register page

Tambahkan block:

Title:

> Akunmu membantu partisipasi lebih tertata

Body:

> Tanpa akun, kamu tetap bisa melihat data publik. Dengan akun, kamu bisa menyimpan desa, mengikuti perkembangan, memberi kontribusi, dan membangun reputasi sebagai warga yang peduli.

### Profile page

Tambahkan block:

Title:

> Kontribusimu ikut membangun transparansi

Body:

> Setiap desa yang kamu pantau, setiap koreksi yang kamu bantu, dan setiap informasi yang kamu sampaikan dengan benar ikut memperkuat budaya transparansi dari bawah.

### Forum/community page

Tambahkan rule highlight:

> Kritik boleh. Tuduhan tanpa dasar tidak. PantauDesa mendorong warga bertanya dengan data, sumber, dan etika.

## Recommended new pages or sections

### `/tentang/kenapa-desa-dipantau`

Purpose:
- Menjelaskan filosofi PantauDesa.
- Menjawab bahwa pemantauan bukan kebencian.
- Menjelaskan desa sebagai akar kemakmuran.

### `/panduan/kewenangan`

Purpose:
- Menjelaskan batas tanggung jawab desa, kecamatan, kabupaten/kota, provinsi, dan pusat.
- Membantu warga bertanya ke pihak yang tepat.

### `/profil/[username]`

Purpose:
- Menampilkan kontribusi user.
- Menampilkan badge.
- Menampilkan desa yang dipantau.
- Menampilkan reputasi kontribusi.

### `/badge`

Purpose:
- Menjelaskan sistem badge.
- Menunjukkan level, syarat, manfaat, dan etika kontribusi.

## Success metrics

Authentication:
- Register conversion naik tanpa menurunkan trust.
- User memahami manfaat akun sebelum daftar.
- Bounce dari login/register turun.

Badge:
- User membuka badge info popover.
- User menyimpan desa pertama.
- User memberi kontribusi berkualitas.
- Profile publik mulai dibagikan.

Civic narrative:
- User memahami bahwa pemantauan bukan tuduhan.
- User menggunakan CTA panduan kewenangan.
- Komentar/laporan lebih tepat sasaran.

## Implementation priority

### Priority 1

- Rewrite login/register copy.
- Tambahkan explanation block "Kenapa perlu akun?".
- Tambahkan homepage highlight "Kenapa desa perlu dipantau?".
- Tambahkan card "Tanyakan ke pihak yang tepat" di detail desa.

### Priority 2

- Buat badge popover di avatar.
- Buat profile badge explanation.
- Buat `/badge` page.
- Buat `/panduan/kewenangan` page.

### Priority 3

- Tambahkan contribution history.
- Tambahkan trusted contributor logic.
- Tambahkan forum/community rules.
- Tambahkan notification/watchlist berdasarkan akun.
