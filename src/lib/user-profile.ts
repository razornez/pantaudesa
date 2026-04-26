/**
 * user-profile.ts — types, badge system, notifikasi, dan trust score untuk warga.
 * Semua pure functions — tidak ada UI knowledge di sini.
 */

import { getAllVoices, CitizenVoice } from "./citizen-voice";

// ─── Trust badge ──────────────────────────────────────────────────────────────

export type BadgeTier = 1 | 2 | 3 | 4 | 5;

export interface UserBadge {
  tier:        BadgeTier;
  label:       string;
  emoji:       string;
  description: string;
  color:       string;   // Tailwind bg color
  textColor:   string;
  minScore:    number;
}

export const USER_BADGES: Record<BadgeTier, UserBadge> = {
  1: { tier: 1, label: "Warga Peduli",           emoji: "🌱", description: "Mulai ikut memantau dan memahami data desa.",        color: "bg-slate-100",   textColor: "text-slate-600",  minScore: 0   },
  2: { tier: 2, label: "Pemantau Desa",          emoji: "🔎", description: "Aktif mengikuti perkembangan desa dan membaca data.", color: "bg-sky-100",     textColor: "text-sky-700",    minScore: 20  },
  3: { tier: 3, label: "Kontributor Warga",      emoji: "🤝", description: "Mulai memberi kontribusi yang membantu komunitas.",  color: "bg-amber-100",   textColor: "text-amber-700",  minScore: 60  },
  4: { tier: 4, label: "Penjaga Transparansi",   emoji: "🛡️", description: "Konsisten menjaga transparansi dengan cara sehat.",  color: "bg-indigo-100", textColor: "text-indigo-700", minScore: 120 },
  5: { tier: 5, label: "Penggerak Desa Terbuka", emoji: "🏅", description: "Kontributor berdampak yang dipercaya komunitas.",    color: "bg-violet-100", textColor: "text-violet-700", minScore: 250 },
};

// ─── Trust score ──────────────────────────────────────────────────────────────

export interface TrustStats {
  totalSuara:    number;
  totalVoteBenar:number;
  totalHelpful:  number;
  totalReplies:  number;
  resolvedCount: number;
  trustScore:    number;   // computed
  badge:         UserBadge;
}

export function computeTrustStats(username: string): TrustStats {
  const voices = getAllVoices().filter(v => !v.isAnon && v.author === username);

  const totalSuara     = voices.length;
  const totalVoteBenar = voices.reduce((s, v) => s + v.votes.benar, 0);
  const totalHelpful   = voices.reduce((s, v) => s + v.helpful, 0);
  const totalReplies   = voices.reduce((s, v) => s + v.replies.filter(r => !r.isOfficialDesa).length, 0);
  const resolvedCount  = voices.filter(v => v.status === "resolved").length;

  const trustScore = Math.round(
    totalSuara     * 5  +
    totalVoteBenar * 3  +
    totalHelpful   * 2  +
    totalReplies   * 1  +
    resolvedCount  * 10
  );

  const tier = (Object.values(USER_BADGES) as UserBadge[])
    .filter(b => trustScore >= b.minScore)
    .sort((a, b) => b.minScore - a.minScore)[0].tier as BadgeTier;

  return { totalSuara, totalVoteBenar, totalHelpful, totalReplies, resolvedCount, trustScore, badge: USER_BADGES[tier] };
}

// ─── Notifikasi ───────────────────────────────────────────────────────────────

export type NotifType = "reply" | "vote_benar" | "vote_bohong" | "resolved" | "helpful";

export interface UserNotification {
  id:        string;
  type:      NotifType;
  voiceId:   string;
  voiceText: string;   // cuplikan teks suara yang bersangkutan
  fromName:  string;   // siapa yang memicu (anonim → "Seseorang")
  isOfficial:boolean;  // true = dari perangkat desa
  message:   string;   // deskripsi notifikasi
  createdAt: Date;
  isRead:    boolean;
}

const NOTIF_CONFIG: Record<NotifType, { icon: string; color: string; label: string }> = {
  reply:       { icon: "💬", color: "bg-indigo-50 border-indigo-100", label: "Komentar baru"    },
  vote_benar:  { icon: "✅", color: "bg-emerald-50 border-emerald-100", label: "Ditandai Benar" },
  vote_bohong: { icon: "❌", color: "bg-rose-50 border-rose-100",      label: "Ditandai Bohong" },
  resolved:    { icon: "🎉", color: "bg-amber-50 border-amber-100",    label: "Masalah Selesai" },
  helpful:     { icon: "👍", color: "bg-sky-50 border-sky-100",        label: "Berguna bagi warga" },
};

export { NOTIF_CONFIG };

// ─── Mock notifications per user ─────────────────────────────────────────────

const D = (h: number) => new Date(Date.now() - h * 3_600_000);

export const MOCK_NOTIFICATIONS: Record<string, UserNotification[]> = {
  // Pak Muryanto — author v10
  "Pak Muryanto": [
    {
      id: "n1", type: "reply", voiceId: "v10", isOfficial: false,
      voiceText: "Serapan hanya 48% tapi saya tidak melihat ada pembangunan...",
      fromName: "Ibu Ratna", message: "Ibu Ratna membalas suaramu.",
      createdAt: D(2), isRead: false,
    },
    {
      id: "n2", type: "reply", voiceId: "v10", isOfficial: false,
      voiceText: "Serapan hanya 48% tapi saya tidak melihat ada pembangunan...",
      fromName: "Pak Muryanto", message: "Kamu membalas di suara milikmu.",
      createdAt: D(5), isRead: false,
    },
    {
      id: "n3", type: "vote_benar", voiceId: "v10", isOfficial: false,
      voiceText: "Serapan hanya 48% tapi saya tidak melihat ada pembangunan...",
      fromName: "Seseorang", message: "98 orang menandai suaramu sebagai Benar.",
      createdAt: D(8), isRead: true,
    },
    {
      id: "n4", type: "helpful", voiceId: "v10", isOfficial: false,
      voiceText: "Serapan hanya 48% tapi saya tidak melihat ada pembangunan...",
      fromName: "Seseorang", message: "102 orang merasa suaramu berguna.",
      createdAt: D(24), isRead: true,
    },
  ],
  // Ibu Sumarni — author v5
  "Ibu Sumarni": [
    {
      id: "n5", type: "reply", voiceId: "v5", isOfficial: false,
      voiceText: "Sudah minta lihat APBDes ke pak kades, katanya nanti-nanti...",
      fromName: "Pak Cahyo", message: "Pak Cahyo membalas suaramu.",
      createdAt: D(1), isRead: false,
    },
    {
      id: "n6", type: "reply", voiceId: "v5", isOfficial: true,
      voiceText: "Sudah minta lihat APBDes ke pak kades, katanya nanti-nanti...",
      fromName: "BPD Desa", message: "BPD Desa merespons secara resmi suaramu.",
      createdAt: D(3), isRead: false,
    },
    {
      id: "n7", type: "vote_benar", voiceId: "v5", isOfficial: false,
      voiceText: "Sudah minta lihat APBDes ke pak kades...",
      fromName: "Seseorang", message: "41 orang menandai suaramu sebagai Benar.",
      createdAt: D(12), isRead: true,
    },
  ],
};

export function getNotifications(authorName: string): UserNotification[] {
  return MOCK_NOTIFICATIONS[authorName] ?? [];
}

export function getUnreadCount(authorName: string): number {
  return getNotifications(authorName).filter(n => !n.isRead).length;
}

// ─── User voices ──────────────────────────────────────────────────────────────

export function getVoicesByAuthor(authorName: string): CitizenVoice[] {
  return getAllVoices().filter(v => !v.isAnon && v.author === authorName);
}
