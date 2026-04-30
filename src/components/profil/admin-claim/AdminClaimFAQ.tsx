export default function AdminClaimFAQ() {
  const faqs = [
    {
      q: "Bisakah saya mengelola lebih dari satu desa?",
      a: "Tidak. Satu akun hanya boleh mewakili atau mengelola satu desa di PantauDesa.",
    },
    {
      q: "Apakah admin terverifikasi berarti data desa juga terverifikasi?",
      a: "Tidak. Admin terverifikasi adalah status keanggotaan admin, bukan status verifikasi data publik desa. Data publik desa tetap mengikuti alur review/governance yang terpisah.",
    },
    {
      q: "Mengapa hanya Admin Desa VERIFIED yang boleh mengundang admin lain?",
      a: "Mengundang admin adalah tindakan yang sensitif karena pengundang bertanggung jawab atas siapa yang diundang. Hanya admin yang sudah terhubung penuh ke kanal resmi desa (status VERIFIED) yang dianggap cukup terpercaya untuk tindakan ini.",
    },
    {
      q: "Apa yang terjadi setelah seseorang menerima undangan admin?",
      a: "Admin yang menerima undangan akan masuk sebagai Admin Desa LIMITED, bukan VERIFIED. Mereka harus melalui verifikasi sendiri untuk naik ke status VERIFIED.",
    },
    {
      q: "Bisakah admin LIMITED mengundang admin lain?",
      a: "Tidak. Hanya Admin Desa VERIFIED yang boleh mengundang admin baru. Admin LIMITED perlu menyelesaikan verifikasi sendiri terlebih dahulu.",
    },
    {
      q: "Mengapa batas maksimal admin per desa adalah 5 orang?",
      a: "Untuk menjaga akuntabilitas dan mengurangi risiko penyalahgunaan. Setiap undangan membuat pengundang bertanggung jawab atas tindakan admin yang diundang.",
    },
    {
      q: "Apakah verifikasi admin desa otomatis memverifikasi semua data publik desa?",
      a: "Tidak. Verifikasi admin desa dan verifikasi data publik desa adalah dua hal yang terpisah. Data publik tetap melalui proses review/governance PantauDesa.",
    },
    {
      q: "Mengapa verifikasi website perlu diperbarui setiap 6 bulan?",
      a: "Hubungan antara akun admin dan website resmi desa perlu dijaga agar tetap segar dan valid. Pembaruan berkala memastikan bahwa admin yang tercatat masih memiliki akses ke website resmi desa.",
    },
    {
      q: "Apa yang harus saya lakukan jika tidak punya akses ke email resmi desa?",
      a: "Gunakan metode verifikasi melalui website resmi desa. Jika keduanya tidak memungkinkan, gunakan fitur Hubungi Admin dan jelaskan kendala atau bukti pendukung yang kamu miliki.",
    },
    {
      q: "Apa yang harus saya lakukan jika tidak punya akses ke website resmi desa?",
      a: "Gunakan metode verifikasi melalui email resmi desa. Jika keduanya tidak memungkinkan, gunakan fitur Hubungi Admin dan jelaskan kendala atau bukti pendukung yang kamu miliki.",
    },
    {
      q: "Apa yang harus saya lakukan jika salah mengirim undangan ke email yang salah?",
      a: "Saat ini belum ada fitur untuk membatalkan undangan yang sudah terkirim. Undangan yang salah akan tetap berlaku sampai masa berlakunya habis. Hubungi Admin jika perlu bantuan.",
    },
    {
      q: "Apa yang harus saya lakukan jika tautan undangan sudah kedaluwarsa?",
      a: "Minta pengundang untuk mengirim undangan baru. Tautan undangan memiliki batas waktu berlaku dan tidak bisa digunakan lagi setelah habis masa berlakunya.",
    },
    {
      q: "Apa yang harus saya lakukan jika saya menduga ada admin palsu?",
      a: "Jangan langsung menuduh secara publik. Gunakan fitur Hubungi Admin untuk melaporkan kecurigaan kamu secara aman. Tim PantauDesa akan meninjaunya secara internal.",
    },
    {
      q: "Bagaimana cara menghubungi tim PantauDesa?",
      a: "Gunakan formulir Hubungi Admin yang tersedia di halaman Klaim Admin Desa. Isikan subjek, deskripsi, dan bukti pendukung, lalu kirim. Pesan akan diteruskan ke tim PantauDesa.",
    },
    {
      q: "Apa yang harus saya lakukan jika saya tidak lagi mewakili desa tersebut?",
      a: "Hubungi tim PantauDesa melalui fitur Hubungi Admin agar status admin desa kamu bisa ditinjau dan diperbarui sesuai kondisi terbaru.",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-sm font-black text-slate-900">Pertanyaan Umum (FAQ)</p>
      <div className="mt-3 space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group rounded-xl border border-slate-100 bg-slate-50">
            <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-xs font-bold text-slate-900 list-none">
              {faq.q}
              <span className="ml-2 text-slate-400 transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="border-t border-slate-100 px-3 pb-2 pt-1 text-xs leading-relaxed text-slate-600">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
