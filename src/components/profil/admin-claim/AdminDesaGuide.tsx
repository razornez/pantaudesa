const guideItems = [
  "Admin Desa adalah akses keanggotaan untuk mewakili satu desa di PantauDesa, bukan tanda bahwa semua data publik desa sudah terverifikasi.",
  "Satu akun hanya boleh mewakili atau mengelola satu desa.",
  "Verifikasi admin bisa melalui email resmi desa (tautan verifikasi) atau token yang dipasang di website resmi desa.",
  "Token website harus dipasang di halaman utama atau halaman yang mudah diakses dari website resmi desa.",
  "Token website perlu diperbarui setiap 6 bulan agar hubungan dengan website resmi desa tetap valid dan segar.",
  "Token mentah hanya ditampilkan sekali di sesi aktif dan tidak disimpan di browser maupun database setelah halaman di-refresh.",
  "Jika token mentah hilang setelah refresh, kamu bisa generate ulang token baru dari halaman ini.",
  "Status PENDING artinya klaim masih dalam proses verifikasi. Segera selesaikan verifikasi agar status segera diperbarui.",
  "Status LIMITED artinya kamu sudah punya akses admin awal, tapi belum terhubung penuh ke kanal resmi desa.",
  "Status VERIFIED artinya kamu sudah terhubung penuh ke kanal resmi desa dan boleh mengundang admin lain.",
  "Verifikasi admin desa berbeda dari verifikasi data publik desa. Admin terverifikasi tidak otomatis membuat data publik menjadi terverifikasi.",
  "Data publik desa tetap mengikuti alur review/governance PantauDesa yang terpisah dari status keanggotaan admin.",
  "Hanya Admin Desa dengan status VERIFIED yang boleh mengundang admin lain.",
  "Admin hasil undangan selalu mulai dari status LIMITED, bukan langsung VERIFIED.",
  "Satu desa maksimal memiliki 5 admin. Jika batas sudah tercapai, undangan baru tidak bisa dikirim.",
  "Pengundang bertanggung jawab atas tindakan admin yang diundangnya.",
  "Email verifikasi memiliki batas waktu berlaku. Jika tautan sudah kedaluwarsa, kirim ulang dari halaman ini.",
  "Token website yang sudah digunakan atau kedaluwarsa perlu di-generate ulang untuk dicek kembali.",
  "Hubungi Admin digunakan untuk melaporkan kendala, mencurigai admin palsu, atau meminta bantuan tim PantauDesa.",
  "Jika kamu tidak lagi mewakili suatu desa, hubungi tim PantauDesa agar status admin bisa ditinjau dan diperbarui.",
];

const faqItems = [
  ["Bisa kelola lebih dari satu desa?", "Tidak. Satu akun hanya boleh mewakili satu desa."],
  ["Apakah admin terverifikasi berarti data desa terverifikasi?", "Tidak. Verifikasi admin desa berbeda dengan status verifikasi data publik desa."],
  ["Kenapa hanya VERIFIED yang boleh mengundang?", "Karena undangan admin adalah tindakan sensitif, jadi hanya admin yang sudah terhubung penuh ke kanal resmi yang boleh melakukannya."],
  ["Apa yang terjadi setelah undangan diterima?", "Admin yang menerima undangan akan masuk sebagai LIMITED, bukan VERIFIED."],
  ["Kenapa token website perlu diperbarui 6 bulan?", "Supaya hubungan dengan website resmi desa tetap segar dan tidak stale."],
  ["Kalau tidak punya akses email atau website resmi?", "Gunakan Hubungi Admin dan jelaskan bukti atau kendala yang kamu miliki."],
];

export default function AdminDesaGuide() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-black text-slate-900">Panduan Admin Desa</p>
        <div className="mt-3 space-y-2">
          {guideItems.map((item) => (
            <div key={item} className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-black text-slate-900">FAQ singkat</p>
        <div className="mt-3 space-y-3">
          {faqItems.map(([q, a]) => (
            <div key={q} className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs font-bold text-slate-900">{q}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
