# BMAD Standard — UI/UX Standard

Status: **ACTIVE STANDARD**  
Scope: semua halaman public, user profile, Admin Desa, Internal Admin, modal, form, table/list, dashboard-lite, dan mobile view PantauDesa.  
Goal: UI rapi, cepat dipahami, mobile-friendly, ringan, dan nyaman untuk user non-teknis.

---

## 1. Core UX Principles

PantauDesa dipakai oleh banyak tipe user:

- warga biasa
- admin desa
- admin internal
- user yang tidak terlalu paham teknologi
- user yang memakai HP kecil dan jaringan kurang stabil

Karena itu UI harus:

1. **Jelas** — user paham apa yang terjadi dan langkah berikutnya.
2. **Ringkas** — jangan terlalu banyak teks dan card.
3. **Mobile-first** — iPhone 12 mini wajib dicek.
4. **Tidak membingungkan** — hindari status ganda, summary redundan, dan copy teknis.
5. **Cepat terasa** — shell/shimmer muncul cepat, jangan blank/freeze.
6. **Konsisten** — badge, card, modal, tab, copy, dan spacing seragam.
7. **Accessible** — keyboard, focus, contrast, label, dan target tap harus layak.
8. **Trustworthy** — jangan tampilkan data palsu sebagai data asli.

---

## 2. Design Direction

Back office PantauDesa menggunakan style:

```text
Quiet luxury
```

Artinya:

- subtle
- bersih
- tidak terlalu ramai
- spacing lega tapi efisien
- warna lembut
- border/shadow tipis
- typography jelas
- card tidak terlalu besar
- animasi halus dan tidak berlebihan

Avoid:

- warna terlalu mencolok tanpa fungsi
- card terlalu banyak
- gradient berlebihan
- shadow terlalu berat
- icon terlalu besar
- text block panjang
- badge terlalu ramai

---

## 3. Mobile-First Rules

Wajib cek minimal:

```text
iPhone 12 mini / width 360px
```

Rules:

- Tidak boleh horizontal overflow kecuali area chip/tab yang memang sengaja scroll horizontal.
- Summary/chip yang banyak boleh horizontal scroll tipis, bukan turun banyak baris.
- Button harus mudah ditekan.
- Icon action di mobile ideal 12–16px.
- Card list jangan terlalu tinggi.
- Hindari 1 card 1 baris kalau informasi bisa dibuat compact tanpa mengorbankan kejelasan.
- Modal harus bisa scroll dan tombol tetap bisa dijangkau.
- Sticky bottom action boleh digunakan untuk modal/form panjang.
- Gunakan safe-area untuk iPhone/Safari jika tombol di bawah.

Acceptance:

```text
[ ] Tidak ada UI berdempetan
[ ] Tidak ada text penting yang wrap aneh
[ ] Tidak ada tombol keluar layar
[ ] Tidak ada modal yang tidak bisa scroll
[ ] Tidak ada card terlalu panjang tanpa alasan
```

---

## 4. Information Density Rules

Terlalu banyak informasi membuat user cepat lelah.

Rules:

- Jangan tampilkan summary yang sama dua kali.
- Jika header sudah punya summary, jangan ulang dalam card tepat di bawahnya.
- Gunakan metric/chip hanya untuk data yang benar-benar membantu keputusan.
- Hindari 4–6 card besar untuk data yang bisa jadi chip kecil.
- Di mobile, summary lebih baik compact chip/grid kecil.
- Jangan tampilkan field teknis yang tidak perlu untuk user.
- Gunakan progressive disclosure: detail muncul saat klik/expand/modal.

Example bad:

```text
Header: 13 total klaim, 3 diperiksa, 4 ditolak
Row bawah: Baru 3, Diperiksa 3, Disetujui 3
```

Fix:

```text
Pilih salah satu summary utama saja.
```

---

## 5. Copywriting Rules

Copy harus bahasa Indonesia sederhana.

Rules:

- Hindari istilah teknis tanpa penjelasan.
- Jangan tampilkan enum mentah.
- Gunakan kata kerja yang jelas: “Setujui”, “Tolak”, “Unggah”, “Lihat detail”.
- Rejection/error harus menjelaskan cara memperbaiki.
- Sensitive step harus punya helper text singkat.
- Jangan terlalu panjang.
- Jangan menakut-nakuti user, tapi tetap jelas konsekuensinya.

Good:

```text
Dokumen belum bisa diproses karena file buram. Unggah ulang dokumen yang lebih jelas.
```

Bad:

```text
FAILED_VALIDATION_ERROR_DOCUMENT_UNREADABLE
```

---

## 6. Status, Badge, and Label Rules

Badges harus konsisten.

Rules:

- Gunakan badge untuk status penting saja.
- Jangan menumpuk banyak badge di satu baris jika membuat wrap berantakan.
- Status harus punya tone konsisten:
  - success: approved/published/verified
  - warning: pending/in review/due soon
  - danger: rejected/failed/overdue
  - info: neutral/processing
- Jangan pakai warna berbeda untuk arti yang sama.
- Badge text harus pendek.
- Di mobile, badge harus `whitespace-nowrap` bila memungkinkan.

Examples:

```text
Verified
Terbatas
Diproses
Tayang
Gagal
Menunggu
```

Avoid:

```text
Verified Resmi Aktif Admin Desa
```

---

## 7. Navigation and Tabs

Rules:

- Tab tidak perlu terlihat seperti card besar.
- Active tab cukup dengan text color + underline jika ruang sempit.
- Semua tab harus konsisten, bukan hanya tab aktif tertentu.
- Horizontal scroll boleh untuk mobile.
- Jangan ada border/shadow berlebihan pada setiap tab item.
- Label tab pendek.

Back office Admin Desa tabs:

```text
Profil
List Admin
Dokumen
Suara
Notifikasi
```

Internal Admin tabs:

```text
Pengajuan
Dokumen
Perpanjangan
```

---

## 8. Card Rules

Card harus membantu grouping, bukan membuat halaman terasa berat.

Rules:

- Gunakan card untuk unit informasi yang memang berbeda.
- Jangan terlalu banyak nested card.
- Jangan membuat card summary besar kalau chip cukup.
- Padding mobile lebih kecil dari desktop.
- Gunakan shadow/border tipis.
- Card clickable harus jelas tapi tidak berlebihan.
- Empty card harus punya pesan jelas.

Recommended padding:

```text
Mobile card: p-3 / p-4
Desktop card: p-5 / p-6
```

---

## 9. Forms

Rules:

- Label wajib jelas.
- Placeholder bukan pengganti label.
- Required field harus jelas.
- Helper text hanya untuk field yang butuh konteks.
- Error berada dekat field.
- Submit button harus jelas status loading-nya.
- Jangan pakai field manual jika data bisa otomatis dari profile/database.
- Form sensitif harus memberi instruksi singkat.

Examples:

- Suara warga wajib login → jangan tampilkan field “Namamu”.
- Admin desa reject claim → wajib ada alasan dan instruksi perbaikan.
- Upload dokumen → tampilkan batas ukuran, format, dan tanggung jawab.

---

## 10. Modal and Dialog Rules

Rules:

- Modal mobile harus scrollable.
- Panel modal harus punya `max-height` berdasarkan viewport.
- Gunakan `100dvh` jika perlu untuk mobile browser.
- Tombol utama/batal harus tetap bisa dijangkau.
- Gunakan sticky bottom action untuk modal panjang.
- Jangan biarkan keyboard/mobile bar menutup tombol.
- Modal harus punya title jelas.
- Destructive modal harus jelaskan konsekuensi.

Mobile modal acceptance:

```text
[ ] Bisa scroll sampai bawah
[ ] Tombol aksi terlihat dan bisa ditekan
[ ] Tidak ketutup browser bottom bar
[ ] Tidak overflow horizontal
```

---

## 11. Loading, Skeleton, and Empty State

Rules:

- Gunakan skeleton/shimmer untuk halaman yang query data.
- Jangan tampilkan spinner kosong untuk halaman kompleks.
- Skeleton harus mirip struktur konten.
- Jangan gunakan fake data.
- Jika data belum load, jangan tampilkan data lama yang salah.
- Empty state harus jujur.

Good empty state:

```text
Belum ada dokumen yang diunggah.
```

Bad:

```text
Data tidak tersedia
```

Jika error:

```text
Data belum bisa dimuat. Coba refresh atau hubungi admin jika masalah berlanjut.
```

---

## 12. Performance UX Rules

Target:

```text
Shell/shimmer tampil < 1 detik
Data utama ideal < 1 detik
Jika data > 1 detik, user tetap melihat loading yang jelas
Jika data > 2 detik, wajib investigasi
```

UX rules:

- Jangan biarkan halaman blank.
- Jangan blocking semua layout karena satu query berat.
- Gunakan loading route segment.
- Gunakan compact skeleton agar halaman tidak terasa berat.
- Hindari skeleton terlalu banyak dan terlalu panjang.

---

## 13. Accessibility Rules

Minimum:

- Button punya label jelas.
- Icon-only button punya `aria-label`.
- Form input punya label.
- Modal punya role/dialog pattern atau accessible title.
- Focus ring tidak dihapus.
- Contrast teks harus cukup.
- Touch target minimal nyaman untuk mobile.
- Jangan bergantung pada warna saja untuk status; gunakan label text.

---

## 14. Table/List Rules

Back office lebih sering pakai list/card dibanding table di mobile.

Rules:

- Desktop boleh table jika kolom banyak dan user butuh scan cepat.
- Mobile gunakan card compact.
- List item harus punya hierarchy:
  - title
  - subtitle/context
  - status
  - action
- Action utama jangan terlalu banyak di satu item.
- Detail tambahan bisa masuk modal/expand.

---

## 15. Public Page Rules

Public page harus terasa ringan dan kredibel.

Rules:

- Jangan tampilkan draft/rejected data.
- Jangan tampilkan dummy sebagai data asli.
- Jika data belum lengkap, tampilkan empty state jujur.
- Sumber data ditampilkan jika membantu trust.
- Search/highlight harus langsung jelas.
- Loading beranda harus punya shimmer, bukan freeze.

---

## 16. Back Office Specific Rules

### Admin Desa

- Bahasa harus mudah dipahami admin non-teknis.
- Jangan terlalu banyak tab/summary dalam satu layar.
- Badge admin verified/limited harus kecil dan rapi.
- “Dashboard” besar tidak perlu jika belum ada kebutuhan jelas.
- List admin, dokumen, suara, notifikasi harus compact.

### Internal Admin

- Fokus pada antrean kerja, bukan dashboard analytics besar.
- Approval/reject harus memberi konteks cukup.
- Reject modal wajib scrollable dan punya instruksi perbaikan.
- Summary jangan double.
- Data sensitif jangan terlalu terekspos di list jika tidak perlu.

---

## 17. Screenshot QA Rules

Saat diminta screenshot evidence:

- Jangan screenshot ketika masih shimmer/loading.
- Jangan screenshot halaman login kecuali yang diuji memang login.
- Jika layout rusak saat screenshot, langsung fix dulu.
- Cek mobile iPhone 12 mini.
- Cek desktop minimal 1366px.
- Screenshot harus mencakup perubahan UI yang relevan.

---

## 18. UI/UX Completion Checklist

```text
[ ] Mobile iPhone 12 mini dicek
[ ] Tidak ada horizontal overflow tidak sengaja
[ ] Tidak ada text wrap aneh pada badge/action penting
[ ] Tidak ada summary redundan
[ ] Tidak ada card terlalu besar tanpa alasan
[ ] Modal mobile bisa scroll
[ ] Button penting bisa dijangkau
[ ] Empty state jujur
[ ] Loading state ada
[ ] Error state jelas
[ ] Copy sederhana dan tidak terlalu panjang
[ ] Tidak ada enum mentah tampil ke user
[ ] Focus ring/accessibility tidak rusak
[ ] Screenshot QA tidak diambil saat loading/login salah
```

---

## 19. Done Means

UI/UX task selesai jika:

- user paham apa yang terjadi
- halaman nyaman di mobile
- tidak ada data palsu
- tidak ada layout berantakan
- tidak ada info double
- loading/error/empty state jelas
- screenshot/regression sudah dicek bila diperlukan
