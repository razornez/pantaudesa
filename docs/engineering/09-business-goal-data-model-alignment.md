# Business Goal and Data Model Alignment

Assessment task: A-02
Status: draft for Iwan review

## Scope

Dokumen ini menghubungkan goal bisnis PantauDesa dengan rancangan model data minimal Sprint 03. Ini bukan proposal final schema dan belum boleh dipakai untuk implementasi tanpa CTO review.

## Goal bisnis PantauDesa

Berdasarkan `docs/business/01-product-strategy.md`, PantauDesa adalah dashboard warga untuk mencari, memahami, dan mengawasi penggunaan anggaran desa dengan cara yang adil, jelas, dan bertanggung jawab.

Goal inti:

- Membuat data APBDes, realisasi, dokumen publik, dan sinyal risiko mudah dipahami warga.
- Membantu warga tahu "uang desa saya berapa", "sudah dipakai untuk apa", "dokumen apa yang bisa diminta", dan "siapa yang perlu ditanya".
- Menjadi civic-tech yang membangun trust, bukan mesin tuduhan.
- Menjaga data publik tetap bisa diakses tanpa akun.
- Menjadikan auth sebagai pintu partisipasi: simpan desa, ikut perkembangan, kontribusi, dan reputasi.
- Menjadikan badge sebagai reputasi kontribusi, bukan gimmick.
- Menyiapkan produk sebagai portfolio dan basis layanan dashboard transparansi publik.

North star product:

- Warga berhasil menemukan desa, memahami status anggaran, dan tahu tindakan berikutnya dalam kurang dari 2 menit.

## Kenapa model data harus mendukung trust

PantauDesa menjual trust sebagai nilai produk. Jika data model salah, UI bisa terlihat rapi tetapi kepercayaan rusak.

Trust membutuhkan:

- Identitas desa yang jelas.
- Tahun data yang jelas.
- Anggaran dan realisasi yang tidak tercampur antar tahun.
- Sumber data yang bisa dijelaskan.
- Status data yang membedakan demo, imported, needs_review, verified, outdated, rejected.
- Dokumen publik yang tidak direduksi menjadi klaim tanpa status.
- APBDes item yang bisa dilacak asal dan statusnya.

Tanpa data status, user bisa mengira dummy data adalah data resmi. Tanpa source, user tidak tahu apakah angka berasal dari demo seed, import manual, atau sumber resmi. Tanpa pemisahan model, data historis dan detail APBDes bisa sulit diaudit.

## Alignment model minimal dengan bisnis

### `Desa`

Business purpose:

- Menjadi identitas utama untuk warga mencari desa.
- Menjadi anchor untuk semua data anggaran, dokumen, suara warga, dan data source.

Mendukung bisnis dengan:

- Search/list desa.
- Detail desa.
- Route publik yang stabil.
- Wilayah untuk filter/ranking.
- Metadata seperti website atau jumlah penduduk untuk konteks warga.
- `dataStatus` untuk menjelaskan status identitas/data profil desa.

Risiko jika salah:

- Desa mirip bisa tertukar.
- Voice warga bisa terhubung ke desa yang salah.
- URL berubah bisa merusak share/link.
- Filter wilayah dan ranking tidak kredibel.

### `AnggaranDesaSummary`

Business purpose:

- Menyimpan ringkasan uang desa per tahun.
- Menjadi dasar homepage stats, cards, leaderboard, alert dini, dan detail hero.

Mendukung bisnis dengan:

- Menjawab pertanyaan warga: "uang desa berapa" dan "sudah dipakai berapa".
- Membantu media/komunitas melihat desa yang perlu dicek.
- Mendukung status serapan `baik/sedang/rendah`.
- Menjaga data anggaran terpisah per tahun.

Risiko jika salah:

- Angka total/realisasi bisa tercampur antar tahun.
- Leaderboard salah dan memicu tuduhan tidak adil.
- Persentase bisa salah jika disimpan/dihitung tanpa aturan.
- Data demo bisa terlihat verified jika status tidak ada.

### `APBDesItem`

Business purpose:

- Menjelaskan uang desa dipakai untuk bidang apa saja.
- Membuat detail desa actionable, bukan hanya angka total.

Mendukung bisnis dengan:

- Warga bisa memahami kategori penggunaan anggaran.
- Komunitas bisa melihat pola bidang yang perlu dicek.
- Media bisa mendapat konteks lebih dalam dari angka ringkasan.
- Data item bisa diberi source/status sendiri.

Risiko jika salah:

- Semua rincian jadi JSON besar yang sulit difilter, divalidasi, atau dihubungkan ke source.
- Kode bidang tidak konsisten dan sulit dipakai untuk import.
- Persentase/realisasi item tidak cocok dengan summary.

### `DokumenPublik`

Business purpose:

- Menunjukkan dokumen apa yang seharusnya bisa diminta/dilihat warga.
- Menghubungkan transparansi dengan tindakan warga.

Mendukung bisnis dengan:

- Warga tahu dokumen APBDes/RKP/LPPD apa yang perlu ditanyakan.
- Pemerintah desa punya ruang untuk memperlihatkan keterbukaan.
- Trust layer bisa membedakan "tersedia", "belum", dan "unknown".

Risiko jika salah:

- Boolean `tersedia` saja terlalu miskin untuk data nyata.
- Tanpa `url/source/status`, dokumen bisa dianggap resmi padahal belum diverifikasi.
- Checklist bisa terasa menuduh jika status tidak netral.

### `DataSource`

Business purpose:

- Menjadi catatan asal data agar PantauDesa tidak sekadar menampilkan angka.
- Menopang trust layer dan transisi demo ke imported/verified.

Mendukung bisnis dengan:

- Warga tahu data masih demo, imported, atau verified.
- Tim bisa audit asal data.
- Import/automation nanti punya registry sumber.
- B2B/B2G dashboard bisa menjelaskan data lineage ke klien.

Risiko jika salah:

- Data dari spreadsheet, demo seed, dan official source tercampur.
- Tidak ada dasar untuk menaikkan status ke verified.
- Sulit menjawab komplain "angka ini dari mana".

## Data status dan user trust

Status yang perlu dipahami:

- `demo`: ilustrasi/mock/seed demo.
- `imported`: sudah masuk dari sumber tertentu, belum tentu benar.
- `needs_review`: menunggu pengecekan.
- `verified`: sudah dicek sebelum tampil sebagai kredibel.
- `outdated`: lama dan perlu update.
- `rejected`: tidak layak tampil karena salah/tidak valid.

Bagaimana status membantu user:

- Mencegah user memakai data demo sebagai tuduhan.
- Membuat imported data tidak langsung dianggap resmi.
- Memberi sinyal kapan data aman dipakai untuk laporan lebih serius.
- Menjaga tone adil untuk pihak desa.
- Membantu PantauDesa terlihat jujur dan bertanggung jawab.

Aturan product yang harus dijaga:

- Public data tetap terlihat, tapi statusnya harus jelas.
- Verified tidak boleh dicampur dengan demo/imported.
- Jika satu section belum verified, UI harus menampilkan status yang lebih hati-hati.
- Disclaimer tidak boleh hilang hanya karena data pindah ke DB.

## Risiko bisnis jika schema salah

- Trust publik turun karena data demo dianggap resmi.
- Media/komunitas bisa mengutip angka yang salah.
- Desa bisa merasa diserang karena status/angka tidak jelas.
- Klien B2B/B2G ragu memakai PantauDesa sebagai dashboard transparansi.
- Import/admin/scheduler nanti jadi mahal diperbaiki.
- Roadmap auth/badge/kontribusi susah terhubung ke data desa yang stabil.
- Monetisasi dashboard transparansi melemah karena data lineage tidak bisa dijelaskan.

## Alignment dengan auth dan badge

Auth bukan paywall. Data publik tetap terbuka. Akun adalah layer partisipasi.

Model data desa yang baik harus mendukung:

- saved/watchlist desa nanti,
- kontribusi warga terkait desa tertentu,
- reputasi kontribusi yang tidak mendorong spam,
- koreksi data dengan source,
- history status data jika nanti ada verification workflow.

Karena itu, `Desa` harus menjadi anchor yang stabil, dan `Voice.desaId` perlu strategi relation/migration yang hati-hati.

## Kesimpulan Ujang

Untuk Sprint 03, model minimal yang paling selaras dengan goal bisnis adalah:

- `Desa` untuk identitas dan anchor.
- `AnggaranDesaSummary` untuk ringkasan per tahun.
- `APBDesItem` untuk rincian yang bisa diaudit.
- `DokumenPublik` untuk hak warga dan transparency checklist.
- `DataSource` untuk trust, lineage, dan status.

Namun keputusan final relation, enum style, seed, fallback, dan read path harus menunggu CTO review. Yang aman sekarang adalah menyiapkan dokumen, validation report, dan batas risiko.

