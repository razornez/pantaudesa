/**
 * citizen-voice.ts — types, mock data, dan helpers untuk "Suara Warga".
 *
 * Saat ini menggunakan data statis. Saat backend tersedia,
 * cukup ganti getter functions dengan API calls — komponen tidak perlu diubah.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type VoiceCategory =
  | "infrastruktur"
  | "bansos"
  | "fasilitas"
  | "anggaran"
  | "lingkungan"
  | "lainnya";

/** open = belum ditangani | in_progress = sedang diproses | resolved = sudah selesai */
export type VoiceStatus = "open" | "in_progress" | "resolved";

export interface VoiceReply {
  id:             string;
  voiceId:        string;
  author:         string;
  isAnon:         boolean;
  /** true = balasan resmi dari perangkat desa */
  isOfficialDesa: boolean;
  text:           string;
  createdAt:      Date;
}

export interface CitizenVoice {
  id:              string;
  desaId:          string;
  desaNama?:       string;
  desaKabupaten?:  string;
  desaSlug?:       string;
  category:        VoiceCategory;
  text:            string;
  author:          string;
  isAnon:          boolean;
  createdAt:       Date;
  helpful:         number;
  /** URL foto bukti. Dalam produksi: URL dari storage (S3, dll.) */
  photos:          string[];
  votes:           { benar: number; bohong: number };
  status:          VoiceStatus;
  resolvedAt?:     Date;
  replies:         VoiceReply[];
}

// ─── Kategori config ─────────────────────────────────────────────────────────

export const VOICE_CATEGORIES: Record<VoiceCategory, { label: string; emoji: string; color: string }> = {
  infrastruktur: { label: "Infrastruktur",   emoji: "🛣️",  color: "bg-orange-100 text-orange-700 border-orange-200"   },
  bansos:        { label: "Bansos & BLT",    emoji: "💰",  color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  fasilitas:     { label: "Fasilitas Umum",  emoji: "🏫",  color: "bg-sky-100 text-sky-700 border-sky-200"             },
  anggaran:      { label: "Anggaran",        emoji: "📋",  color: "bg-indigo-100 text-indigo-700 border-indigo-200"    },
  lingkungan:    { label: "Lingkungan",      emoji: "🌿",  color: "bg-teal-100 text-teal-700 border-teal-200"          },
  lainnya:       { label: "Lainnya",         emoji: "💬",  color: "bg-slate-100 text-slate-700 border-slate-200"       },
};

export const STATUS_CONFIG: Record<VoiceStatus, { label: string; short: string; bg: string; text: string; border: string }> = {
  open:        { label: "Belum ditangani",    short: "Belum",   bg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200"    },
  in_progress: { label: "Sedang diproses",    short: "Proses",  bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200"   },
  resolved:    { label: "Sudah diselesaikan", short: "Selesai", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
};

// ─── Avatar helpers ───────────────────────────────────────────────────────────

const AVATAR_BG = [
  "bg-indigo-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500",   "bg-violet-500",  "bg-sky-500",
  "bg-teal-500",   "bg-orange-500",
];

export function getAvatarBg(name: string): string {
  const idx = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_BG.length;
  return AVATAR_BG[idx];
}

export function getInitial(name: string): string {
  return name === "Anonim" ? "?" : name.trim().charAt(0).toUpperCase();
}

// ─── Relative time ────────────────────────────────────────────────────────────

export function relativeTime(date: Date): string {
  const diff  = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  <  1) return "Baru saja";
  if (mins  < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days  ===1) return "Kemarin";
  if (days  <  7) return `${days} hari lalu`;
  if (days  < 30) return `${Math.floor(days / 7)} minggu lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

// ─── Mock helpers ─────────────────────────────────────────────────────────────

const D  = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000);
const r  = (voiceId: string, id: string, author: string, text: string, isOfficial: boolean, daysAgo: number, isAnon = false): VoiceReply =>
  ({ id, voiceId, author, isAnon, isOfficialDesa: isOfficial, text, createdAt: D(daysAgo) });

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALL_VOICES: CitizenVoice[] = [

  // ── Desa 1 — Sukamaju (serapan baik 95%) ─────────────────────────────────

  {
    id: "v1", desaId: "1", category: "infrastruktur",
    text:      "Jalan di RT 04 baru selesai diperbaiki bulan lalu, hasilnya bagus dan mulus. Terima kasih desanya sudah gerak cepat.",
    author: "Pak Hendra", isAnon: false, createdAt: D(3), helpful: 12,
    photos: [], votes: { benar: 18, bohong: 0 }, status: "resolved", resolvedAt: D(32),
    replies: [
      r("v1","r1a","Bu Siti RT 04","Betul, saya bisa konfirmasi. Jalan sekarang sudah nyaman dilalui motor dan mobil.", false, 2),
      r("v1","r1b","Kepala Desa Sukamaju","Terima kasih apresiasinya. Kami memang prioritaskan perbaikan jalan di Q1 sesuai APBDes. Semoga manfaat untuk warga.", true, 2),
    ],
  },

  {
    id: "v4", desaId: "1", category: "infrastruktur",
    text:      "Lampu jalan di gang belakang balai desa masih mati sudah 3 minggu. Mohon segera diperbaiki, warga takut jalan malam.",
    author: "Pak Darto", isAnon: false, createdAt: D(2), helpful: 21,
    photos: ["/images/illustration-alert.webp"],
    votes: { benar: 28, bohong: 1 }, status: "resolved", resolvedAt: D(1),
    replies: [
      r("v4","r4a","Warga RT 04","Betul! Saya yang lapor ini. Sudah 3 minggu gelap gulita, anak-anak takut pulang malam.", false, 2),
      r("v4","r4b","Kepala Desa Sukamaju","Sudah kami koordinasikan ke pengelola PJU. Lampu akan menyala dalam 3 hari kerja. Mohon bersabar.", true, 1),
      r("v4","r4c","Pak Darto","Update: lampu sudah menyala lagi kemarin malam. Terima kasih pak kades sudah cepat!", false, 0),
    ],
  },

  {
    id: "v2", desaId: "1", category: "fasilitas",
    text:      "Posyandu di RT 02 aktif tiap bulan, petugas ramah dan tidak pernah minta bayaran. Mantap.",
    author: "Bu Ratna", isAnon: false, createdAt: D(8), helpful: 7,
    photos: [], votes: { benar: 15, bohong: 0 }, status: "open",
    replies: [],
  },

  {
    id: "v3", desaId: "1", category: "bansos",
    text:      "BLT sudah cair ke keluarga saya, prosesnya lancar dan transparan. Semoga terus begini.",
    author: "Anonim", isAnon: true, createdAt: D(15), helpful: 5,
    photos: [], votes: { benar: 9, bohong: 0 }, status: "open",
    replies: [],
  },

  // ── Desa 2 — Harapan Jaya (serapan sedang 80%) ───────────────────────────

  {
    id: "v5", desaId: "2", category: "anggaran",
    text:      "Sudah minta lihat APBDes ke pak kades, katanya nanti-nanti terus. Padahal ini hak warga kan? Sudah 2 minggu bolak-balik.",
    author: "Ibu Sumarni", isAnon: false, createdAt: D(5), helpful: 34,
    photos: [], votes: { benar: 41, bohong: 2 }, status: "open",
    replies: [
      r("v5","r5a","Pak Cahyo","Saya juga pernah mengalami hal yang sama. Akhirnya saya datang langsung ke kantor kecamatan dan mereka yang membantu.",false,4),
      r("v5","r5b","Anonim","Coba minta ke BPD (Badan Permusyawaratan Desa), mereka punya kewenangan mengawasi kades dan bisa membantu akses dokumen.",true,3),
    ],
  },

  {
    id: "v6", desaId: "2", category: "infrastruktur",
    text:      "Saluran drainase RT 01 sudah mampet 2 bulan. Waktu hujan banjir kecil-kecilan masuk halaman. Sudah lapor ke RT tapi tidak ada tindakan.",
    author: "Anonim", isAnon: true, createdAt: D(12), helpful: 18,
    photos: ["/images/illustration-alert.webp"],
    votes: { benar: 23, bohong: 0 }, status: "in_progress",
    replies: [
      r("v6","r6a","Warga RT 01","Benar sekali. Kemarin waktu hujan deras rumah saya kemasukan air lagi.",false,10),
      r("v6","r6b","Kepala Desa Harapan Jaya","Kami sudah perintahkan tim kebersihan untuk pengecekan minggu depan. Terima kasih laporannya.",true,8),
    ],
  },

  {
    id: "v7", desaId: "2", category: "fasilitas",
    text:      "PAUD di desa ini bagus, gurunya rajin dan gedungnya baru direnovasi. Anak saya senang sekolah di sini.",
    author: "Bu Wulandari", isAnon: false, createdAt: D(20), helpful: 9,
    photos: [], votes: { benar: 11, bohong: 0 }, status: "open",
    replies: [],
  },

  // ── Desa 3 — Maju Bersama (serapan rendah 48%) ───────────────────────────

  {
    id: "v8", desaId: "3", category: "bansos",
    text:      "BLT sudah 3 bulan tidak cair. Sudah lapor ke RT tapi katanya 'lagi diproses'. Ini uang siapa yang diproses? Keluarga saya butuh sekarang.",
    author: "Pak Sugeng", isAnon: false, createdAt: D(1), helpful: 67,
    photos: [], votes: { benar: 78, bohong: 2 }, status: "open",
    replies: [
      r("v8","r8a","Ibu Wati RT 05","Saya konfirmasi. Bahkan tetangga saya yang sudah meninggal masih ada di daftar penerima, tapi yang hidup dan butuh malah tidak dapat.",false,1),
      r("v8","r8b","Pak Yadi","Ini sudah keterlaluan. Ayo kita datang bareng-bareng ke kantor desa besok pagi.",false,0),
      r("v8","r8c","Kepala Desa Maju Bersama","Data BLT sedang dalam proses verifikasi ulang oleh Dinsos. Mohon sabar, kami pastikan semua yang berhak akan menerima.",true,0),
    ],
  },

  {
    id: "v9", desaId: "3", category: "infrastruktur",
    text:      "Jalan utama berlubang parah. Motor saya sudah dua kali rusak karena jalan ini. Dana desa dipakai untuk apa kalau jalan saja tidak diperbaiki?",
    author: "Anonim", isAnon: true, createdAt: D(4), helpful: 89,
    photos: ["/images/illustration-alert.webp"],
    votes: { benar: 112, bohong: 3 }, status: "open",
    replies: [
      r("v9","r9a","Pak Budi Santoso","Saya saksi, jalan ini sudah rusak sejak 2 tahun lalu. Setiap musim hujan lubangnya makin dalam.",false,3),
      r("v9","r9b","Anonim","Anggaran infrastruktur desa 3 ini lebih dari 400 juta. Kemana itu uangnya?",false,3),
      r("v9","r9c","Kepala Desa Maju Bersama","Perbaikan jalan sudah masuk rencana namun terkendala administrasi pengadaan. Kami targetkan selesai Q2 2026.",true,2),
      r("v9","r9d","Anonim","Q2 2026 sudah lewat pak. Janji terus.",false,1),
    ],
  },

  {
    id: "v10", desaId: "3", category: "anggaran",
    text:      "Serapan hanya 48% tapi saya tidak melihat ada pembangunan berarti. Minta APBDes selalu dipersulit. Ini ada apa?",
    author: "Pak Muryanto", isAnon: false, createdAt: D(7), helpful: 102,
    photos: [], votes: { benar: 98, bohong: 1 }, status: "open",
    replies: [
      r("v10","r10a","Ibu Ratna","Saya sudah 3 kali ke kantor desa minta APBDes, selalu bilang 'pak kades lagi tidak ada'.",false,6),
      r("v10","r10b","Pak Muryanto","Saya sudah laporkan ke Inspektorat Kabupaten minggu lalu. Semoga ada tindaklanjut.",false,4),
    ],
  },

  {
    id: "v11", desaId: "3", category: "fasilitas",
    text:      "Posyandu buka tidak teratur, kadang buka kadang tidak ada kabar. Ibu-ibu bingung kapan harus datang. Balita jadi tidak terpantau.",
    author: "Bu Endang", isAnon: false, createdAt: D(10), helpful: 45,
    photos: [], votes: { benar: 52, bohong: 0 }, status: "open",
    replies: [
      r("v11","r11a","Bu Fatimah","Betul. Anak saya bulan lalu tidak dapat imunisasi karena posyandu mendadak tutup tanpa pemberitahuan.",false,8),
    ],
  },

  // ── Desa 7 — Baru Makmur (serapan baik 95%) ──────────────────────────────

  {
    id: "v12", desaId: "7", category: "infrastruktur",
    text:      "Pengerjaan jalan desa sangat rapi dan kualitasnya bagus. Warga ikut mengawasi langsung saat pengerjaan. Contoh yang baik.",
    author: "Pak Zainal", isAnon: false, createdAt: D(6), helpful: 15,
    photos: [], votes: { benar: 18, bohong: 0 }, status: "open",
    replies: [
      r("v12","r12a","Kepala Desa Baru Makmur","Terima kasih pak Zainal. Kami memang mengundang perwakilan warga untuk ikut mengawasi. Transparansi adalah kunci.",true,5),
    ],
  },

  {
    id: "v13", desaId: "7", category: "bansos",
    text:      "Pembagian BLT tertib dan transparan. Ada daftar nama yang ditempel di balai desa, siapapun bisa cek. Ini harusnya standar semua desa.",
    author: "Bu Mahmudah", isAnon: false, createdAt: D(14), helpful: 28,
    photos: [], votes: { benar: 31, bohong: 0 }, status: "open",
    replies: [],
  },

  // ── Desa 9 — Pura Harapan (serapan sangat rendah 35%) ────────────────────

  {
    id: "v14", desaId: "9", category: "anggaran",
    text:      "Dana desa katanya lebih dari Rp 1 miliar, tapi tidak ada yang kelihatan. Mau tanya ke pak kades dipersulit. Ini ada apa sebenarnya?",
    author: "Anonim", isAnon: true, createdAt: D(2), helpful: 156,
    photos: [], votes: { benar: 134, bohong: 5 }, status: "open",
    replies: [
      r("v14","r14a","Pak Sarpan","Saya warga RT 03, bisa konfirmasi. Jangankan pembangunan, laporan APBDes yang ditempel saja tidak ada.",false,1),
      r("v14","r14b","Anonim","Sudah saya laporkan ke Inspektorat Kab. Jayawijaya 2 minggu lalu. Belum ada kabar.",false,1),
    ],
  },

  {
    id: "v15", desaId: "9", category: "infrastruktur",
    text:      "Jalan ke sawah sudah hancur bertahun-tahun. Petani rugi karena sulit angkut hasil panen. Jalan ini harusnya jadi prioritas.",
    author: "Pak Sarpan", isAnon: false, createdAt: D(9), helpful: 78,
    photos: ["/images/illustration-alert.webp"],
    votes: { benar: 89, bohong: 0 }, status: "open",
    replies: [
      r("v15","r15a","Pak Elius","Betul, saya pun sudah rugi banyak karena hasil kebun rusak di jalan. Ini perlu segera ditangani.",false,7),
    ],
  },

  {
    id: "v16", desaId: "9", category: "bansos",
    text:      "Tetangga saya jelas-jelas mampu tapi dapat BLT. Saya yang susah malah tidak dapat. Tolong dicek datanya, ini tidak adil.",
    author: "Anonim", isAnon: true, createdAt: D(3), helpful: 134,
    photos: [], votes: { benar: 98, bohong: 8 }, status: "in_progress",
    replies: [
      r("v16","r16a","Warga RT 02","Saya bisa bersaksi. Data penerima BLT di desa ini banyak yang tidak tepat sasaran.",false,2),
      r("v16","r16b","Kepala Desa Wamena","Kami sedang melakukan verifikasi ulang data bersama Pendamping Desa. Jika ada yang tidak tepat sasaran akan segera dikoreksi.",true,1),
    ],
  },
];

// ─── Getters ──────────────────────────────────────────────────────────────────

export function getVoicesForDesa(desaId: string): CitizenVoice[] {
  return ALL_VOICES
    .filter(v => v.desaId === desaId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getAllVoices(): CitizenVoice[] {
  return [...ALL_VOICES].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getVoiceStats() {
  const total       = ALL_VOICES.length;
  const resolved    = ALL_VOICES.filter(v => v.status === "resolved").length;
  const inProgress  = ALL_VOICES.filter(v => v.status === "in_progress").length;
  const open        = ALL_VOICES.filter(v => v.status === "open").length;
  const desaCount   = new Set(ALL_VOICES.map(v => v.desaId)).size;

  // avg resolution days (only resolved voices with resolvedAt)
  const resolvedWithDate = ALL_VOICES.filter(v => v.status === "resolved" && v.resolvedAt);
  const avgResolutionDays = resolvedWithDate.length
    ? Math.round(resolvedWithDate.reduce((acc, v) => {
        return acc + (v.resolvedAt!.getTime() - v.createdAt.getTime()) / 86_400_000;
      }, 0) / resolvedWithDate.length)
    : null;

  return { total, resolved, inProgress, open, desaCount, avgResolutionDays };
}

export function getDesaRanking(): Array<{ desaId: string; total: number; open: number; resolved: number }> {
  const map: Record<string, { total: number; open: number; resolved: number }> = {};
  for (const v of ALL_VOICES) {
    if (!map[v.desaId]) map[v.desaId] = { total: 0, open: 0, resolved: 0 };
    map[v.desaId].total++;
    if (v.status === "open" || v.status === "in_progress") map[v.desaId].open++;
    if (v.status === "resolved") map[v.desaId].resolved++;
  }
  return Object.entries(map)
    .map(([desaId, s]) => ({ desaId, ...s }))
    .sort((a, b) => b.total - a.total);
}

export function getCategoryStats(): Array<{ category: VoiceCategory; total: number; resolved: number }> {
  const map: Record<string, { total: number; resolved: number }> = {};
  for (const v of ALL_VOICES) {
    if (!map[v.category]) map[v.category] = { total: 0, resolved: 0 };
    map[v.category].total++;
    if (v.status === "resolved") map[v.category].resolved++;
  }
  return (Object.keys(VOICE_CATEGORIES) as VoiceCategory[]).map(cat => ({
    category: cat,
    ...(map[cat] ?? { total: 0, resolved: 0 }),
  }));
}
