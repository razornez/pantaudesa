/**
 * copy.ts — satu sumber kebenaran untuk seluruh teks UI PantauDesa.
 *
 * Prinsip: tidak ada string UI yang di-hardcode di dalam komponen.
 * Setiap perubahan bahasa cukup dilakukan di sini.
 */

// ─── Status desa ─────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  baik:   "Kinerjanya Baik",
  sedang: "Perlu Ditingkatkan",
  rendah: "Perlu Diawasi",
};

export const STATUS_FILTER_LABELS: Record<string, string> = {
  semua:  "Semua Desa",
  baik:   "Kinerja Baik ≥85%",
  sedang: "Perlu Ditingkatkan (60–84%)",
  rendah: "Perlu Diawasi (<60%)",
};

// ─── Bidang APBDes → label ramah warga ───────────────────────────────────────

export const BIDANG_CITIZEN_LABELS: Record<string, { label: string; hint: string }> = {
  "1": {
    label: "Operasional Kantor & Gaji Perangkat Desa",
    hint:  "Biaya menjalankan roda pemerintahan desa sehari-hari",
  },
  "2": {
    label: "Pembangunan Fisik (Jalan, Gedung, Drainase, dll.)",
    hint:  "Infrastruktur yang bisa kamu lihat dan rasakan langsung",
  },
  "3": {
    label: "Program Sosial & Kemasyarakatan",
    hint:  "Kegiatan sosial, budaya, keagamaan, dan keamanan warga",
  },
  "4": {
    label: "Pelatihan & Pemberdayaan Warga",
    hint:  "Program untuk meningkatkan kemampuan dan kesejahteraan warga",
  },
  "5": {
    label: "Dana Siaga Bencana & Darurat",
    hint:  "Cadangan untuk situasi tak terduga — bencana alam, wabah, dll.",
  },
};

// ─── Judul seksi ──────────────────────────────────────────────────────────────

export const SECTION = {
  // Home page
  ringkasanNasional:    "Kondisi Anggaran Desa Se-Indonesia",
  ringkasanNasionalSub: "Gambaran besar penggunaan uang negara untuk desa-desa di seluruh Indonesia",
  alertDini:            "Desa yang Harus Kamu Perhatikan",
  alertDiniSub: (n: number) =>
    `${n} desa baru menggunakan kurang dari separuh anggarannya — warga perlu bertanya ke kepala desa`,
  tren:          "Bagaimana Tren Penggunaan Anggaran Tahun Ini?",
  trenSub:       "Akumulasi anggaran yang sudah dipakai vs total yang seharusnya dipakai sepanjang tahun",
  distribusi:    "Berapa Banyak Desa yang Bermasalah?",
  distribusiSub: "Proporsi desa berdasarkan kinerja penggunaan anggarannya",
  topBaik:       "Desa Paling Rajin",
  topBaikSub:    "5 desa yang paling aktif dan bertanggung jawab menggunakan anggarannya",
  topRendah:     "Desa yang Harus Diawasi",
  topRendahSub:  "5 desa dengan penggunaan anggaran paling rendah — warga perlu turun tangan",
  peringkat:     "Provinsi Mana yang Desanya Paling Baik?",
  peringkatSub:  "Rata-rata kinerja penggunaan anggaran per provinsi",

  // Detail desa
  pendapatan:    "Dari Mana Uang Desa Ini Berasal?",
  pendapatanSub: "Desa mendapat anggaran dari beberapa sumber — semuanya uang rakyat",
  skor:          "Seberapa Terbuka Desa Ini ke Warganya?",
  skorSub:       "Dinilai dari keterbukaan informasi, ketepatan laporan, dan respons terhadap warga",
  outputFisik:   "Apa yang Seharusnya Sudah Ada atau Dikerjakan?",
  outputFisikSub:"Hasil nyata yang seharusnya bisa kamu lihat dan rasakan dari anggaran ini",
  apbdes:        "Anggaran Ini Dipakai untuk Apa Saja?",
  apbdesSub:     "Rincian penggunaan per bidang — kamu berhak mengetahui ini",
  perangkat:     "Siapa yang Harus Kamu Tanya?",
  perangkatSub:  "Pejabat desa yang bertanggung jawab atas pengelolaan anggaran ini",
  riwayat:       "Apakah Kinerjanya Membaik dari Tahun ke Tahun?",
  riwayatSub:    "Persentase anggaran yang digunakan dari 2020 hingga 2024",
  dokumen:       "Dokumen yang Bisa Kamu Minta ke Desa",
  dokumenSub:    "Berdasarkan UU Desa No. 6/2014, warga berhak mengakses semua dokumen ini secara gratis",
} as const;

// ─── Stats cards (home) ───────────────────────────────────────────────────────

export const STATS = {
  totalAnggaran: {
    label: "Total Uang Negara untuk Desa",
    sub:   (terealisasi: string) => `Sudah dipakai ${terealisasi}`,
  },
  totalDesa: {
    label: "Desa yang Sedang Dipantau",
    sub:   "Desa aktif dalam pengawasan publik",
  },
  rataRataSerapan: {
    label: "Rata-rata Penggunaan Anggaran",
    sub:   "Dari seluruh desa yang dipantau",
  },
  desaBaik: {
    label: "Desa dengan Kinerja Baik",
    sub:   (pct: number) => `${pct}% dari total desa terpantau`,
  },
  desaSedang: {
    label: "Desa yang Perlu Ditingkatkan",
    sub:   (pct: number) => `${pct}% dari total desa terpantau`,
  },
  desaRendah: {
    label: "Desa yang Perlu Diawasi",
    sub:   (pct: number) => `${pct}% dari total desa terpantau`,
  },
} as const;

// ─── Skor transparansi ────────────────────────────────────────────────────────

export const SKOR = {
  labels: {
    transparan: "Desa ini cukup terbuka ke warganya",
    cukup:      "Masih ada informasi yang sulit diakses warga",
    rendah:     "Desa ini kurang terbuka — kamu berhak meminta informasi",
  },
  metricLabels: {
    ketepatan:   "Laporan disampaikan tepat waktu?",
    kelengkapan: "Dokumen publik bisa diakses warga?",
    konsistensi: "Anggaran dipakai secara konsisten?",
    responsif:   "Cepat merespons pertanyaan warga?",
  },
  nationalLabel: "Rata-rata Keterbukaan Desa se-Indonesia",
  nationalSub:   "Komposit dari ketepatan laporan, kelengkapan dokumen, konsistensi serapan & responsivitas",
} as const;

// ─── Sumber pendapatan desa ───────────────────────────────────────────────────

export const PENDAPATAN = {
  danaDesa:         { label: "Dana dari Pemerintah Pusat",    hint: "Transfer langsung dari APBN" },
  add:              { label: "Alokasi dari Kabupaten (ADD)",  hint: "Bagian dari Dana Alokasi Umum kabupaten" },
  pades:            { label: "Pendapatan Asli Desa",          hint: "Hasil usaha, aset, dan retribusi desa" },
  bantuanKeuangan:  { label: "Bantuan Keuangan Lain",         hint: "Dari provinsi, kabupaten, atau pihak lain" },
} as const;

// ─── Item anggaran di detail desa ────────────────────────────────────────────

export const BUDGET_ITEMS = {
  totalAnggaran: { label: "Uang yang Diterima Desa" },
  terealisasi:   { label: "Sudah Digunakan" },
  belumTerserap: { label: "Belum Jelas Penggunaannya" },
  persentase:    { label: "Sudah Terpakai" },
} as const;

// ─── Card desa (list) ─────────────────────────────────────────────────────────

export const CARD = {
  anggaran:    "Uang yang Diterima",
  realisasi:   "Sudah Dipakai",
  penyerapan:  "Anggaran terpakai",
} as const;

// ─── Tabel desa ───────────────────────────────────────────────────────────────

export const TABLE_HEADERS = {
  nama:      "Nama Desa",
  wilayah:   "Wilayah",
  anggaran:  "Uang Diterima",
  realisasi: "Sudah Dipakai",
  serapan:   "% Terpakai",
} as const;

// ─── Donut chart ──────────────────────────────────────────────────────────────

export const DONUT_LABELS = {
  baik:   "Kinerja Baik (≥85%)",
  sedang: "Perlu Ditingkatkan (60–84%)",
  rendah: "Perlu Diawasi (<60%)",
} as const;

// ─── Hero homepage ────────────────────────────────────────────────────────────

export const HERO = {
  badge:     (tahun: number, total: number) => `Data ${tahun} · ${total} Desa Terpantau`,
  title:     "Uang desamu sudah dipakai untuk apa?",
  subtitle:  "Setiap tahun desamu mendapat miliaran rupiah dari negara. Uang itu untuk kamu — rakyatnya. Cari desamu dan lihat: sudah dipakai dengan benar atau belum.",
  ctaSearch: "Cari Desamu Sekarang",
  ctaAll:    "Lihat Semua Desa",
} as const;

// ─── Dokumen publik ───────────────────────────────────────────────────────────

export const DOKUMEN = {
  tersedia: "Lihat dokumen",
  belum:    "Belum ada — kamu berhak memintanya!",
} as const;

// ─── Pengaduan ────────────────────────────────────────────────────────────────

export const PENGADUAN = {
  title:       "Ada yang Tidak Beres?",
  subtitle:    "Jika ada yang tidak sesuai — jalan rusak padahal ada anggarannya, bansos tidak merata, fasilitas dijanjikan tapi tidak ada — kamu berhak melapor. Suaramu penting.",
  lapor:       "Lapor ke LAPOR.go.id",
  inspektorat: (kab: string) => `Hubungi Inspektorat ${kab}`,
} as const;

// ─── Filter bar ───────────────────────────────────────────────────────────────

export const FILTER = {
  searchPlaceholder: "Cari nama desa, kecamatan, atau kabupaten...",
  allProvinsi:       "Semua Provinsi",
  filterLabel:       "Tampilkan:",
  totalResults:      (n: number) => `Ditemukan ${n} desa`,
  reset:             "Reset filter",
} as const;

// ─── Footer ───────────────────────────────────────────────────────────────────

export const FOOTER = {
  tagline:   "Kami hadir untuk menjawab pertanyaan yang selama ini tidak pernah dijawab — tentang uang desamu.",
  copyright: (year: number) => `© ${year} PantauDesa`,
  note:      "Data bersifat ilustrasi. Integrasi data resmi sedang disiapkan.",
} as const;
