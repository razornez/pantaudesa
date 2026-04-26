# Sprint 01 Implementation Updates

Dokumen ini menjadi pengganti issue comment lokal saat GitHub Issues tidak tersedia di runtime Ujang. Format mengikuti Team Operating System PantauDesa.

## Backlog #7 — Auth UX

## Implementation Update — Ujang

Status: partial

### Done
- Login copy diarahkan menjadi pintu partisipasi warga, bukan form SaaS generik.
- Register copy menjelaskan manfaat akun: simpan desa, ikuti perubahan, kontribusi, dan badge reputasi.
- Blok `Kenapa perlu akun?` ditambahkan ke login dan register.
- Link `Lihat dulu tanpa daftar` ditambahkan ke data publik `/desa`.
- Copy utama dipusatkan di `src/lib/copy.ts`.

### Remaining
- Asep perlu review apakah flow auth cukup copy-only MVP atau perlu perubahan route/guard.
- Iwan perlu review tone final auth agar sesuai narasi produk.

### Need review from Asep/Iwan
- Pastikan copy tidak terasa seperti paywall dan data publik tetap jelas terbuka tanpa akun.

## Backlog #9 — Homepage Highlight

## Implementation Update — Ujang

Status: partial

### Done
- Homepage highlight `Kenapa desa harus dipantau?` diarahkan ke halaman edukasi khusus.
- Halaman `/tentang/kenapa-desa-dipantau` dibuat dengan narasi hangat, adil, dan tidak menuduh.
- CTA halaman edukasi mengarah ke pencarian desa dan panduan kewenangan.
- Copy halaman disimpan di `src/lib/copy.ts`.

### Remaining
- Asep perlu review apakah section homepage cukup static MVP.
- Iwan perlu review final copy sebelum status `done`.

### Need review from Asep/Iwan
- Pastikan narasi "memantau bukan menuduh" sudah cukup kuat untuk pengunjung baru.

## Backlog #10 — Responsibility Guide

## Implementation Update — Ujang

Status: partial

### Done
- Card `Tanyakan ke pihak yang tepat` ditambahkan di detail desa.
- Halaman `/panduan/kewenangan` dibuat dengan kategori desa, kabupaten/kota, provinsi, dan pusat.
- Disclaimer verifikasi sumber resmi ditambahkan di halaman panduan.
- Copy utama panduan disimpan di `src/lib/copy.ts`.

### Remaining
- Asep perlu review apakah taxonomy kewenangan cukup aman untuk MVP static.
- Iwan perlu review copy final agar tidak terlalu absolut secara hukum.

### Need review from Asep/Iwan
- Pastikan placement card di detail desa tidak mengganggu flow baca data anggaran.

## Backlog #8 — Badge MVP

## Implementation Update — Ujang

Status: partial

### Done
- Level badge diselaraskan dengan strategi produk: Warga Peduli sampai Penggerak Desa Terbuka.
- Halaman `/badge` dibuat untuk menjelaskan level, arti, cara naik level, dan aturan anti-spam.
- Profil publik sudah memiliki badge kecil yang bisa diklik untuk melihat detail.
- Profil saya ditambah section `Apa arti badge kamu?`.

### Remaining
- Asep perlu review apakah struktur static/deterministic sudah cukup untuk MVP.
- Iwan perlu review apakah manfaat badge sudah terasa tanpa membuatnya seperti gimmick.

### Need review from Asep/Iwan
- Pastikan badge tidak mendorong spam kontribusi dan tetap menekankan kualitas.

## Backlog #11 — Workflow Status/Progress

## Implementation Update — Ujang

Status: partial

### Done
- Implementation update lokal dibuat untuk #7, #9, #10, #8, dan #11.
- Setiap commit Sprint 01 menggunakan role trace: Initiated-by, Reviewed-by, Executed-by, Status, dan Backlog.
- Project dashboard diperbarui untuk mencerminkan status partial Sprint 01.
- Worklog mengikuti urutan Sprint 01: #7, #9, #10, #8, #11.

### Remaining
- Asep perlu memberi CTO Review eksplisit di GitHub Issues atau dokumen review.
- Iwan/Asep perlu memverifikasi status `partial` menjadi `done` atau `verified`.
- Jika GitHub Issues tersedia, update ini perlu disalin ke issue comment terkait.

### Need review from Asep/Iwan
- Pastikan format progress lokal ini cukup sebagai source of truth sementara sampai issue tracker dipakai.
