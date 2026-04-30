const guideItems = [
  "Admin Desa adalah akses keanggotaan untuk mewakili satu desa di PantauDesa, bukan tanda bahwa semua data publik desa sudah terverifikasi.",
  "Satu akun hanya boleh mewakili atau mengelola satu desa.",
  "Verifikasi bisa lewat email resmi desa atau token website resmi desa.",
  "Token website harus dipasang di website resmi desa dan perlu diperbarui setiap 6 bulan.",
  "Status PENDING berarti klaim masih diverifikasi. LIMITED berarti akses awal sudah aktif. VERIFIED berarti admin desa terhubung penuh ke kanal resmi.",
  "Hanya Admin Desa VERIFIED yang boleh mengundang admin lain. Admin hasil undangan selalu mulai dari status LIMITED.",
  "Satu desa maksimal memiliki 5 admin dan pengundang bertanggung jawab atas admin yang diundangnya.",
  "Jika email gagal, token tidak ditemukan, atau kamu tidak lagi mewakili desa itu, gunakan Hubungi Admin untuk meminta bantuan.",
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
