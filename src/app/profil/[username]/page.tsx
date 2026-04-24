"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin, Calendar, MessageSquare, ThumbsUp,
  CheckCircle2, Clock, ArrowRight, ExternalLink,
} from "lucide-react";
import { MOCK_ACCOUNTS } from "@/lib/auth-mock";
import {
  computeTrustStats, getVoicesByAuthor, USER_BADGES,
  type BadgeTier,
} from "@/lib/user-profile";
import { VOICE_CATEGORIES, STATUS_CONFIG, relativeTime } from "@/lib/citizen-voice";
import { mockDesa } from "@/lib/mock-data";
import UserAvatar from "@/components/user/UserAvatar";
import BadgePill from "@/components/user/BadgePill";
import { useAuth } from "@/lib/auth-context";

const desaMap = Object.fromEntries(mockDesa.map(d => [d.id, d.nama]));

// ─── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-2.5">
      <span className="text-xl">{icon}</span>
      <span className="text-lg font-black text-slate-900">{value}</span>
      <span className="text-[10px] font-medium text-slate-400 text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Badge progress bar ────────────────────────────────────────────────────────

function TrustProgress({ score }: { score: number }) {
  const tiers = Object.values(USER_BADGES);
  const current = [...tiers].filter(b => score >= b.minScore).sort((a, b) => b.minScore - a.minScore)[0];
  const next    = tiers.find(b => b.minScore > score);
  const pct     = next
    ? Math.round(((score - current.minScore) / (next.minScore - current.minScore)) * 100)
    : 100;

  return (
    <div className="space-y-2">
      {/* Badge tier icons */}
      <div className="flex items-center gap-1 justify-between">
        {tiers.map(b => (
          <div
            key={b.tier}
            className={`flex flex-col items-center gap-0.5 transition-all ${
              score >= b.minScore ? "opacity-100 scale-110" : "opacity-30"
            }`}
          >
            <span className="text-lg">{b.emoji}</span>
            <span className="text-[8px] font-bold text-slate-500">{b.label.split(" ")[0]}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            current.tier >= 4 ? "bg-violet-500" : current.tier === 3 ? "bg-amber-400" : "bg-indigo-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400">
        <span>Skor: <span className="font-bold text-slate-600">{score}</span></span>
        {next && <span>Butuh <span className="font-bold">{next.minScore - score}</span> lagi → {next.emoji} {next.label}</span>}
        {!next && <span className="text-violet-600 font-bold">Level Tertinggi 🎉</span>}
      </div>
    </div>
  );
}

// ─── Voice card (mini) ────────────────────────────────────────────────────────

function VoiceMiniCard({ voice }: { voice: ReturnType<typeof getVoicesByAuthor>[number] }) {
  const cat  = VOICE_CATEGORIES[voice.category];
  const stat = STATUS_CONFIG[voice.status];
  const desa = desaMap[voice.desaId];

  return (
    <Link
      href={`/desa/${voice.desaId}/suara`}
      className="group block bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all p-4"
    >
      {/* Meta row */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.color}`}>
          {cat.emoji} {cat.label}
        </span>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${stat.bg} ${stat.text} ${stat.border}`}>
          {voice.status === "resolved" ? <CheckCircle2 size={8} /> : <Clock size={8} />}
          {stat.short}
        </span>
        {desa && (
          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
            <MapPin size={9} /> {desa}
          </span>
        )}
        <span className="text-[10px] text-slate-400 ml-auto">{relativeTime(voice.createdAt)}</span>
      </div>

      {/* Text */}
      <p className="text-sm text-slate-700 leading-relaxed line-clamp-2 group-hover:text-slate-900 transition-colors">
        {voice.text}
      </p>

      {/* Footer stats */}
      <div className="flex items-center gap-3 mt-2.5">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          ✅ {voice.votes.benar}
        </span>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <ThumbsUp size={10} /> {voice.helpful}
        </span>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <MessageSquare size={10} /> {voice.replies.length}
        </span>
        <ArrowRight size={11} className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors" />
      </div>
    </Link>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PublicProfilePage() {
  const params   = useParams();
  const username = params.username as string;
  const { user } = useAuth();

  // Cari user berdasarkan username
  const profileUser = useMemo(
    () => Object.values(MOCK_ACCOUNTS).find(a => a.username === username) ?? null,
    [username]
  );

  const voices = useMemo(
    () => profileUser ? getVoicesByAuthor(profileUser.nama) : [],
    [profileUser]
  );

  const stats = useMemo(
    () => profileUser ? computeTrustStats(profileUser.nama) : null,
    [profileUser]
  );

  const isOwn = user?.username === username;

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🙈</p>
        <h1 className="text-xl font-black text-slate-800 mb-2">Profil tidak ditemukan</h1>
        <p className="text-sm text-slate-500">Pengguna @{username} tidak ada atau sudah dihapus.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const joinDate = profileUser.joinedAt.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

      {/* ── Profile card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Cover — gradient berdasarkan badge tier */}
        <div className={`h-24 ${
          stats?.badge.tier === 5 ? "bg-gradient-to-r from-violet-500 to-purple-600" :
          stats?.badge.tier === 4 ? "bg-gradient-to-r from-indigo-500 to-indigo-600" :
          stats?.badge.tier === 3 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
          stats?.badge.tier === 2 ? "bg-gradient-to-r from-sky-400 to-sky-500" :
          "bg-gradient-to-r from-slate-300 to-slate-400"
        }`} />

        {/* Avatar + info */}
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-8 mb-3">
            <div className="ring-4 ring-white rounded-full">
              <UserAvatar nama={profileUser.nama} avatarUrl={profileUser.avatarUrl} size="xl" />
            </div>
            {isOwn && (
              <Link
                href="/profil/saya"
                className="text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                Edit Profil
              </Link>
            )}
          </div>

          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-xl font-black text-slate-900">{profileUser.nama}</h1>
              <p className="text-sm text-slate-400 font-medium">@{profileUser.username}</p>
            </div>
            {stats && <BadgePill badge={stats.badge} />}
          </div>

          {profileUser.bio && (
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{profileUser.bio}</p>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar size={11} /> Bergabung {joinDate}
            </span>
            {profileUser.role === "warga" && (
              <span className="flex items-center gap-1">
                <MessageSquare size={11} /> {voices.length} suara
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Trust stats ───────────────────────────────────────────────────── */}
      {stats && profileUser.role === "warga" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Stat pills */}
          <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            <StatPill label="Suara" value={stats.totalSuara}     icon="📢" />
            <StatPill label="Terbukti Benar" value={stats.totalVoteBenar} icon="✅" />
            <StatPill label="Berguna" value={stats.totalHelpful} icon="👍" />
            <StatPill label="Diselesaikan" value={stats.resolvedCount} icon="🎉" />
          </div>

          {/* Badge progress */}
          <div className="px-5 py-4">
            <p className="text-xs font-bold text-slate-600 mb-3">Perjalanan Kepercayaan</p>
            <TrustProgress score={stats.trustScore} />
          </div>
        </div>
      )}

      {/* ── Voice history ─────────────────────────────────────────────────── */}
      {voices.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-700 px-1">Riwayat Suara ({voices.length})</p>
          {voices.map(v => <VoiceMiniCard key={v.id} voice={v} />)}
        </div>
      )}

      {voices.length === 0 && profileUser.role === "warga" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <p className="text-3xl mb-3">🤫</p>
          <p className="text-sm font-semibold text-slate-600">Belum ada suara yang dibagikan.</p>
          {isOwn && (
            <Link href="/suara" className="mt-3 inline-block text-xs text-indigo-600 font-semibold hover:underline">
              Mulai bersuara →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
