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
  authorId?:       string | null;
  isAnon:          boolean;
  /** true = author adalah Admin Desa aktif (VERIFIED/LIMITED) untuk desa ini */
  authorIsAdminDesa?: boolean;
  /** Status Admin Desa author jika aktif di desa tersebut */
  authorAdminDesaStatus?: "VERIFIED" | "LIMITED";
  /** Trust tier (1–5) berdasarkan aktivitas warga di semua desa */
  authorTrustTier?: 1 | 2 | 3 | 4 | 5;
  /** state viewer saat ini agar tombol berguna/vote tidak bisa diklik ulang setelah refresh */
  viewerHasHelped?: boolean;
  viewerVoteType?: "BENAR" | "BOHONG";
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

/** Trust tier display config — mirrors user-profile.ts USER_BADGES but usable in VoiceCard without importing mock-data deps */
export const TRUST_TIER_CONFIG: Record<1 | 2 | 3 | 4 | 5, { emoji: string; label: string; color: string }> = {
  1: { emoji: "🌱", label: "Warga Peduli",           color: "bg-slate-100 text-slate-600"    },
  2: { emoji: "🔎", label: "Pemantau Desa",          color: "bg-sky-100 text-sky-700"        },
  3: { emoji: "🤝", label: "Kontributor Warga",      color: "bg-amber-100 text-amber-700"    },
  4: { emoji: "🛡️", label: "Penjaga Transparansi",   color: "bg-indigo-100 text-indigo-700"  },
  5: { emoji: "🏅", label: "Penggerak Desa Terbuka", color: "bg-violet-100 text-violet-700"  },
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
  {
    id: "v1", desaId: "1", category: "infrastruktur",
    text: "Jalan di RT 04 baru selesai diperbaiki bulan lalu, hasilnya bagus dan mulus. Terima kasih desanya sudah gerak cepat.",
    author: "Pak Hendra", isAnon: false, createdAt: D(3), helpful: 12,
    photos: [], votes: { benar: 18, bohong: 0 }, status: "resolved", resolvedAt: D(32),
    replies: [
      r("v1","r1a","Bu Siti RT 04","Betul, saya bisa konfirmasi. Jalan sekarang sudah nyaman dilalui motor dan mobil.", false, 2),
      r("v1","r1b","Kepala Desa Sukamaju","Terima kasih apresiasinya. Kami memang prioritaskan perbaikan jalan di Q1 sesuai APBDes. Semoga manfaat untuk warga.", true, 2),
    ],
  },
  {
    id: "v4", desaId: "1", category: "infrastruktur",
    text: "Lampu jalan di gang belakang balai desa masih mati sudah 3 minggu. Mohon segera diperbaiki, warga takut jalan malam.",
    author: "Pak Darto", isAnon: false, createdAt: D(2), helpful: 21,
    photos: ["/images/illustration-alert.webp"], votes: { benar: 28, bohong: 1 }, status: "resolved", resolvedAt: D(1),
    replies: [
      r("v4","r4a","Warga RT 04","Betul! Saya yang lapor ini. Sudah 3 minggu gelap gulita, anak-anak takut pulang malam.", false, 2),
      r("v4","r4b","Kepala Desa Sukamaju","Sudah kami koordinasikan ke pengelola PJU. Lampu akan menyala dalam 3 hari kerja. Mohon bersabar.", true, 1),
      r("v4","r4c","Pak Darto","Update: lampu sudah menyala lagi kemarin malam. Terima kasih pak kades sudah cepat!", false, 0),
    ],
  },
  {
    id: "v2", desaId: "1", category: "fasilitas",
    text: "Posyandu di RT 02 aktif tiap bulan, petugas ramah dan tidak pernah minta bayaran. Mantap.",
    author: "Bu Ratna", isAnon: false, createdAt: D(8), helpful: 7,
    photos: [], votes: { benar: 15, bohong: 0 }, status: "open",
    replies: [],
  },
  {
    id: "v3", desaId: "1", category: "bansos",
    text: "BLT sudah cair ke keluarga saya, prosesnya lancar dan transparan. Semoga terus begini.",
    author: "Anonim", isAnon: true, createdAt: D(15), helpful: 5,
    photos: [], votes: { benar: 9, bohong: 0 }, status: "open",
    replies: [],
  },
  {
    id: "v5", desaId: "2", category: "anggaran",
    text: "Sudah minta lihat APBDes ke pak kades, katanya nanti-nanti terus. Padahal ini hak warga kan? Sudah 2 minggu bolak-balik.",
    author: "Ibu Sumarni", isAnon: false, createdAt: D(5), helpful: 34,
    photos: [], votes: { benar: 41, bohong: 2 }, status: "open",
    replies: [
      r("v5","r5a","Pak Cahyo","Saya juga pernah mengalami hal yang sama. Akhirnya saya datang langsung ke kantor kecamatan dan mereka yang membantu.",false,4),
      r("v5","r5b","Anonim","Coba minta ke BPD (Badan Permusyawaratan Desa), mereka punya kewenangan mengawasi kades dan bisa membantu akses dokumen.",true,3),
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

  const resolvedWithDate = ALL_VOICES.filter(v => v.status === "resolved" && v.resolvedAt);
  const avgResolutionDays = resolvedWithDate.length
    ? Math.round(resolvedWithDate.reduce((acc, v) => acc + (v.resolvedAt!.getTime() - v.createdAt.getTime()) / 86_400_000, 0) / resolvedWithDate.length)
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
  return Object.entries(map).map(([desaId, s]) => ({ desaId, ...s })).sort((a, b) => b.total - a.total);
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
