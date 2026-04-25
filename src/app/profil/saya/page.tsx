"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Camera, Check, Bell, BellOff,
  MessageSquare, ThumbsUp, CheckCircle2, Clock,
  ChevronRight, RotateCw, MapPin,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  computeTrustStats, getVoicesByAuthor, getNotifications,
  getUnreadCount, NOTIF_CONFIG, USER_BADGES,
  type UserNotification, type BadgeTier,
} from "@/lib/user-profile";
import { VOICE_CATEGORIES, STATUS_CONFIG, relativeTime } from "@/lib/citizen-voice";
import { mockDesa } from "@/lib/mock-data";
import UserAvatar from "@/components/user/UserAvatar";
import BadgePill from "@/components/user/BadgePill";

const desaMap = Object.fromEntries(mockDesa.map(d => [d.id, d.nama]));

type Tab = "profil" | "suara" | "notifikasi";

// ─── Notification item ────────────────────────────────────────────────────────

function NotifItem({ notif, onRead }: { notif: UserNotification; onRead: (id: string) => void }) {
  const cfg = NOTIF_CONFIG[notif.type];
  return (
    <button
      onClick={() => onRead(notif.id)}
      className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-all hover:bg-slate-50 ${
        !notif.isRead ? "bg-indigo-50/40" : ""
      }`}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg border ${cfg.color}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${!notif.isRead ? "font-semibold text-slate-900" : "text-slate-700"}`}>
            {notif.message}
            {notif.isOfficial && (
              <span className="ml-1.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Resmi</span>
            )}
          </p>
          {!notif.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">"{notif.voiceText}"</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{relativeTime(notif.createdAt)}</p>
      </div>
    </button>
  );
}

// ─── Voice row ─────────────────────────────────────────────────────────────────

function VoiceRow({ voice }: { voice: ReturnType<typeof getVoicesByAuthor>[number] }) {
  const cat  = VOICE_CATEGORIES[voice.category];
  const stat = STATUS_CONFIG[voice.status];
  const desa = desaMap[voice.desaId];

  return (
    <Link href={`/desa/${voice.desaId}/suara`} className="group flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      <span className="text-lg flex-shrink-0">{cat.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 line-clamp-2 group-hover:text-slate-900 transition-colors leading-relaxed">
          {voice.text}
        </p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${stat.bg} ${stat.text} ${stat.border}`}>
            {stat.short}
          </span>
          {desa && <span className="text-[10px] text-slate-400">{desa}</span>}
          <span className="text-[10px] text-slate-400">{relativeTime(voice.createdAt)}</span>
          <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-2">
            <span>✅ {voice.votes.benar}</span>
            <span>👍 {voice.helpful}</span>
            <span>💬 {voice.replies.length}</span>
          </span>
        </div>
      </div>
      <ChevronRight size={13} className="text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1" />
    </Link>
  );
}

// ─── Avatar editor ────────────────────────────────────────────────────────────

function AvatarEditor({ nama, current, onChange }: {
  nama: string; current?: string; onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    onChange(url);
  };

  return (
    <div className="relative w-fit">
      <UserAvatar nama={nama} avatarUrl={current} size="xl" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center shadow-sm hover:bg-indigo-700 transition-colors"
      >
        <Camera size={12} className="text-white" />
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

// ─── Trust progress mini ──────────────────────────────────────────────────────

function TrustCard({ score, tier }: { score: number; tier: BadgeTier }) {
  const badge = USER_BADGES[tier];
  const next  = USER_BADGES[(tier < 5 ? tier + 1 : 5) as BadgeTier];
  const pct   = tier < 5
    ? Math.round(((score - badge.minScore) / (next.minScore - badge.minScore)) * 100)
    : 100;

  return (
    <div className={`rounded-2xl p-4 ${badge.color}`}>
      <div className="flex items-center justify-between mb-3">
        <BadgePill badge={badge} showDesc />
        <span className={`text-sm font-black ${badge.textColor} opacity-60`}>{score} poin</span>
      </div>
      <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-current ${badge.textColor} opacity-60`} style={{ width: `${pct}%` }} />
      </div>
      {tier < 5 && (
        <p className={`text-[10px] mt-1.5 ${badge.textColor} opacity-60`}>
          {next.minScore - score} poin lagi → {next.emoji} {next.label}
        </p>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SayaProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tab,       setTab]       = useState<Tab>("profil");
  const [nama,      setNama]      = useState("");
  const [bio,       setBio]       = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [notifs,    setNotifs]    = useState<UserNotification[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) {
      setNama(user.nama);
      setBio(user.bio ?? "");
      setAvatarUrl(user.avatarUrl);
      setNotifs(getNotifications(user.nama));
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  const voices     = getVoicesByAuthor(user.nama);
  const trustStats = computeTrustStats(user.nama);
  const unread     = notifs.filter(n => !n.isRead).length;

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/users/me", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ nama: nama.trim() || user.nama, bio: bio.trim(), avatarUrl }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));

  const TAB_CONFIG: { id: Tab; label: string; badge?: number }[] = [
    { id: "profil",     label: "Profil"        },
    { id: "suara",      label: "Suara",     badge: voices.length > 0 ? voices.length : undefined },
    { id: "notifikasi", label: "Notifikasi", badge: unread > 0 ? unread : undefined },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-5">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link href={`/profil/${user.username}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={15} /> Lihat profil publik
        </Link>
        {saved && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <Check size={13} /> Tersimpan
          </div>
        )}
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Avatar strip */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-16" />
        <div className="px-5 pb-4 -mt-8">
          <div className="flex items-end justify-between mb-4">
            <div className="ring-4 ring-white rounded-full">
              <UserAvatar nama={user.nama} avatarUrl={avatarUrl} size="lg" />
            </div>
            <BadgePill badge={trustStats.badge} compact />
          </div>
          <p className="text-base font-black text-slate-900">{user.nama}</p>
          <p className="text-xs text-slate-400">@{user.username}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-slate-100">
          {TAB_CONFIG.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all ${
                tab === t.id
                  ? "border-indigo-500 text-indigo-600 bg-indigo-50/30"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
              {t.badge !== undefined && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  t.id === "notifikasi" && unread > 0
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Profil ───────────────────────────────────────────────────── */}
      {tab === "profil" && (
        <div className="space-y-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <AvatarEditor nama={user.nama} current={avatarUrl} onChange={setAvatarUrl} />
              <div>
                <p className="text-sm font-semibold text-slate-700">Foto Profil</p>
                <p className="text-xs text-slate-400">Klik ikon kamera untuk ganti</p>
              </div>
            </div>

            {/* Nama */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nama Tampil</label>
              <input
                type="text"
                value={nama}
                onChange={e => setNama(e.target.value)}
                maxLength={60}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
              />
            </div>

            {/* Username — read-only */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                Username <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-normal">Tidak bisa diubah</span>
              </label>
              <div className="w-full px-4 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed">
                @{user.username}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                placeholder="Ceritakan sedikit tentang dirimu..."
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{bio.length}/160</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50 text-sm"
            >
              {saving ? <><RotateCw size={14} className="animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
            </button>
          </form>

          {/* Trust card */}
          {user.role === "WARGA" && (
            <TrustCard score={trustStats.trustScore} tier={trustStats.badge.tier as BadgeTier} />
          )}
        </div>
      )}

      {/* ── Tab: Suara ────────────────────────────────────────────────────── */}
      {tab === "suara" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {voices.length === 0 ? (
            <div className="py-12 text-center px-4">
              <p className="text-3xl mb-3">🤫</p>
              <p className="text-sm font-semibold text-slate-600">Belum ada suara yang kamu bagikan.</p>
              <Link href="/suara" className="mt-3 inline-block text-xs text-indigo-600 font-semibold hover:underline">
                Mulai bersuara →
              </Link>
            </div>
          ) : (
            voices.map(v => <VoiceRow key={v.id} voice={v} />)
          )}
        </div>
      )}

      {/* ── Tab: Notifikasi ───────────────────────────────────────────────── */}
      {tab === "notifikasi" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Notif header */}
          {notifs.length > 0 && unread > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-600">{unread} belum dibaca</p>
              <button onClick={markAllRead} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                Tandai semua dibaca
              </button>
            </div>
          )}

          {notifs.length === 0 ? (
            <div className="py-12 text-center px-4">
              <BellOff size={28} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">Belum ada notifikasi.</p>
              <p className="text-xs text-slate-400 mt-1">Notifikasi akan muncul saat ada yang membalas atau vote suaramu.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifs.map(n => <NotifItem key={n.id} notif={n} onRead={markRead} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
