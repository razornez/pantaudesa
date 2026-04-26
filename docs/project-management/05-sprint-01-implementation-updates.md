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
