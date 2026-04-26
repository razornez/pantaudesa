# PantauDesa Design Brief

## Design goal

PantauDesa harus terasa seperti produk civic-tech yang serius, terpercaya, dan mudah dipahami warga umum.

Bukan dashboard yang dingin dan birokratis. Bukan juga desain yang terlalu playful sehingga mengurangi kredibilitas.

Arah desain:

> Clean, trustworthy, citizen-friendly, data-driven, participatory, fair, dan mobile-first.

## Current product signal

Dari struktur UI saat ini, PantauDesa sudah mengarah ke:

- Homepage dengan hero dan CTA pencarian desa.
- Ringkasan nasional.
- Stats cards.
- Alert dini.
- Trend chart.
- Donut chart distribusi.
- Leaderboard desa/provinsi.
- Detail desa dengan APBDes, dokumen, perangkat, riwayat, dan pengaduan.
- Auth/profile/badge sebagai pintu partisipasi warga.

Arah ini sudah tepat. Fokus berikutnya adalah memperkuat narasi, trust, conversion flow, alasan user daftar, badge sebagai reputasi kontribusi, dan edukasi batas kewenangan.

## Primary user journey

### Journey warga tanpa akun

1. Warga masuk ke homepage.
2. Warga membaca headline: uang desa bisa dicek.
3. Warga melihat highlight: memantau desa bukan berarti membenci desa.
4. Warga klik "Cari Desamu Sekarang".
5. Warga mencari nama desa/kecamatan/kabupaten.
6. Warga membuka detail desa.
7. Warga memahami status anggaran.
8. Warga melihat apakah isu tersebut kewenangan desa atau pihak lain.
9. Warga membagikan link atau membaca panduan tindakan.

### Journey warga dengan akun

1. Warga memahami kenapa akun dibutuhkan.
2. Warga daftar karena ingin menyimpan desa, mengikuti perubahan, dan berkontribusi.
3. Warga menyimpan desa pantauan.
4. Warga melihat badge awal.
5. Warga mulai memberi kontribusi informasi/koreksi secara bertanggung jawab.
6. Badge dan profil publik menjadi tanda reputasi kontribusi.

### Journey media/NGO

1. Masuk homepage.
2. Melihat alert/ranking.
3. Membuka desa dengan serapan rendah.
4. Membandingkan wilayah.
5. Menggunakan data sebagai bahan laporan/story.

## Information hierarchy

Homepage:

1. Hero: masalah + janji produk.
2. Highlight: kenapa desa perlu dipantau.
3. Search CTA.
4. Ringkasan nasional.
5. Alert dini.
6. Chart tren.
7. Distribusi status desa.
8. Leaderboard.
9. Edukasi hak warga dan batas kewenangan.
10. CTA daftar yang menjelaskan manfaat akun.
11. Footer disclaimer.

Detail desa:

1. Nama desa + lokasi.
2. Status serapan.
3. Ringkasan uang diterima/dipakai/belum jelas.
4. Card: tanyakan ke pihak yang tepat.
5. Skor transparansi.
6. APBDes per bidang.
7. Output fisik.
8. Dokumen publik.
9. Perangkat yang bisa ditanya.
10. Riwayat tahunan.
11. CTA pengaduan/permintaan dokumen.

Login/register:

1. Headline yang menjelaskan misi partisipasi.
2. Penjelasan "Kenapa perlu akun?".
3. Benefit akun.
4. Form.
5. Link melihat data tanpa akun.
6. Trust/privacy microcopy.

Profile:

1. Avatar + badge kecil yang bisa diklik.
2. Nama user dan ringkasan kontribusi.
3. Badge saat ini + arti badge.
4. Cara naik level.
5. Desa yang dipantau.
6. Riwayat kontribusi.
7. Prinsip kontribusi sehat.

## Visual direction

### Tone

- Transparan.
- Tegas tapi tidak menuduh.
- Ramah warga.
- Modern.
- Profesional.
- Partisipatif.
- Adil untuk warga dan pihak desa.

### UI style

- Background lembut: slate/neutral.
- Card putih dengan border halus.
- Radius besar untuk terasa modern.
- Data cards yang cepat dipindai.
- Chart sederhana dan tidak berlebihan.
- Status color harus konsisten:
  - Baik: positif.
  - Sedang: perhatian.
  - Rendah: perlu diawasi.
- Badge visual harus terasa hangat, personal, dan punya makna kontribusi.

### Typography

- Headline kuat dan pendek.
- Body copy sederhana.
- Hindari paragraf panjang.
- Gunakan label yang menjelaskan makna angka.
- Auth copy harus menjelaskan manfaat sebelum meminta tindakan.

### Illustration/image

Gunakan visual warga/desa sebagai penguat emosi, bukan dekorasi kosong.

Prinsip:
- Menampilkan warga sebagai pemilik data.
- Hindari visual yang terlalu menyerang perangkat desa.
- Fokus pada partisipasi dan hak publik.
- Tampilkan desa sebagai akar kehidupan sosial, bukan sebagai objek kecurigaan.

## Copywriting rules

Gunakan bahasa seperti:

- "Uang desamu sudah dipakai untuk apa?"
- "Warga berhak tahu."
- "Desa ini perlu diawasi."
- "Dokumen ini bisa kamu minta."
- "Tanyakan ke perangkat desa terkait."
- "Memantau desa bukan berarti menuduh."
- "Desa adalah akar kemakmuran warga."
- "Tanyakan ke pihak yang tepat."
- "Akunmu membantu partisipasi lebih tertata."

Hindari:

- "Korupsi"
- "Penyelewengan"
- "Kepala desa bermasalah"
- "Dana dicuri"
- "Daftar gratis" sebagai pesan utama auth
- "Gratis · Tidak perlu kartu kredit"

Kecuali ada data hukum/resmi yang benar-benar mendukung.

## Key components to prioritize

### 1. Search Desa Hero

Goal:
- Pengguna langsung tahu apa yang bisa dilakukan.

Elements:
- Headline.
- Subtitle.
- Search input atau CTA.
- Badge jumlah desa/tahun data.

### 2. Why Monitor Desa Highlight

Goal:
- Menjelaskan filosofi PantauDesa sejak awal.

Placement:
- Homepage setelah hero atau setelah ringkasan nasional.

Copy:

> Karena desa adalah akar kemakmuran warga. Memantau desa bukan berarti membenci atau menuduh. Justru dengan transparansi, desa bisa lebih dipercaya, warga bisa lebih paham, dan pembangunan bisa lebih tepat sasaran.

CTA:

> Pelajari cara memantau dengan benar

### 3. Status Summary Card

Goal:
- Warga cepat memahami kondisi desa.

Elements:
- Total anggaran.
- Terealisasi.
- Belum terserap.
- Persentase.
- Status.
- Microcopy: "Apa artinya?"

### 4. Responsibility Guide Card

Goal:
- Mengurangi salah tuduh dan membantu warga bertanya ke pihak tepat.

Placement:
- Detail desa setelah status summary atau sebelum CTA pengaduan.

Copy:

> Tidak semua masalah di wilayah desa menjadi kewenangan pemerintah desa. Lihat dulu apakah hal ini terkait APBDes, program desa, kewenangan kabupaten, provinsi, atau pusat agar pertanyaanmu lebih tepat sasaran.

CTA:

> Lihat panduan kewenangan

### 5. Early Warning Card

Goal:
- Menunjukkan desa yang perlu perhatian.

Elements:
- Nama desa.
- Lokasi.
- Persentase serapan.
- Alasan masuk alert.
- CTA detail.

### 6. Document Checklist

Goal:
- Mengubah data menjadi tindakan warga.

Elements:
- Nama dokumen.
- Status tersedia/belum.
- Tahun.
- Hint: "Kamu berhak meminta dokumen ini."

### 7. Citizen Action CTA

Goal:
- Memberikan langkah berikutnya.

CTA options:
- Cari desa lain.
- Bagikan halaman.
- Minta dokumen.
- Lapor ke kanal resmi.
- Lihat panduan kewenangan.

### 8. Auth Meaning Block

Goal:
- Menjawab kenapa user perlu daftar.

Placement:
- Login/register page.

Title:

> Kenapa perlu akun?

Body:

> Data publik tetap bisa dilihat tanpa akun. Namun akun membantu kamu ikut berperan lebih jauh: menyimpan desa yang kamu pedulikan, mengikuti perubahan data, memberi kontribusi, dan membangun reputasi sebagai warga aktif. Dengan akun, partisipasi tidak lagi anonim dan acak. Kontribusi bisa lebih tertata, aman, dan dipercaya.

### 9. Profile Badge Popover

Goal:
- Membuat badge terasa hidup, informatif, dan memotivasi kontribusi sehat.

Behavior:
- Badge menempel kecil di avatar/foto profil.
- Badge bisa diklik.
- Popover/modal menampilkan nama badge, arti, level, kontribusi, dan manfaat.

Example:

> Penjaga Transparansi
>
> Badge ini diberikan kepada warga yang aktif menyimpan desa pantauan, membaca laporan, dan memberi kontribusi yang membantu komunitas memahami data desa.

## Mobile UX priorities

- Search harus mudah diakses.
- Card jangan terlalu lebar/berat.
- Chart harus tetap terbaca.
- Table perlu alternatif card view di mobile.
- CTA harus jelas dan reachable.
- Auth benefit harus terbaca sebelum form.
- Badge popover harus nyaman ditekan di layar kecil.

## Trust elements

Tambahkan:

- Disclaimer data.
- Sumber data.
- Tanggal pembaruan.
- Penjelasan metodologi skor.
- Catatan bahwa serapan rendah bukan otomatis pelanggaran.
- Penjelasan bahwa tidak semua masalah adalah kewenangan desa.
- Penjelasan data publik tetap bisa dilihat tanpa akun.
- Penjelasan aturan kontribusi agar tidak menjadi ruang tuduhan tanpa dasar.

## Design checklist before launch

- [ ] Homepage punya headline yang kuat.
- [ ] Ada highlight "Kenapa desa perlu dipantau?".
- [ ] Search desa mudah ditemukan.
- [ ] Status warna konsisten.
- [ ] Detail desa bisa dipahami tanpa istilah teknis.
- [ ] Ada card "Tanyakan ke pihak yang tepat".
- [ ] Ada disclaimer data.
- [ ] Ada CTA tindakan warga.
- [ ] Login/register menjelaskan manfaat akun.
- [ ] Auth wording tidak terasa seperti subscription biasa.
- [ ] Badge profil punya arti, level, dan manfaat.
- [ ] Mobile view nyaman.
- [ ] Loading/error/empty state tersedia.
- [ ] Copy tidak menuduh.
- [ ] Chart punya label yang jelas.
