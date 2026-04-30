"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Upload, FileText, Settings, LogOut,
  CheckCircle2, Clock, XCircle, TrendingUp, ArrowRight,
  MapPin, Users, Globe2, Bell, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { MOCK_UPLOADS, UploadedDoc } from "@/lib/auth-mock";
import { mockDesa } from "@/lib/mock-data";
import { ASSETS } from "@/lib/assets";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG = {
  menunggu_review: { label: "Menunggu Review", icon: Clock,        bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  disetujui:       { label: "Disetujui",        icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  ditolak:         { label: "Ditolak",           icon: XCircle,      bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200"    },
};

// ─── Doc row ──────────────────────────────────────────────────────────────────

function DocRow({ doc }: { doc: UploadedDoc }) {
  const cfg  = STATUS_CFG[doc.status];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <FileText size={16} className={cfg.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{doc.nama}</p>
        <p className="text-[10px] text-slate-400">{doc.jenis} · {doc.tahun} · {doc.fileSize}</p>
      </div>
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
        <Icon size={10} /> {cfg.label}
      </span>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, bg, text, icon }: {
  label: string; value: string | number; sub?: string;
  bg: string; text: string; icon: string;
}) {
  return (
    <div className={`rounded-2xl p-4 ${bg}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className={`text-2xl font-black ${text}`}>{value}</p>
      <p className={`text-xs font-semibold mt-0.5 ${text} opacity-80`}>{label}</p>
      {sub && <p className={`text-[10px] mt-0.5 ${text} opacity-55`}>{sub}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DesaAdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "DESA")) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const myDocs  = MOCK_UPLOADS.filter(d => d.desaId === user.desaId);
  const desa    = mockDesa.find(d => d.id === user.desaId);
  const pending = myDocs.filter(d => d.status === "menunggu_review").length;
  const approved= myDocs.filter(d => d.status === "disetujui").length;
  const rejected= myDocs.filter(d => d.status === "ditolak").length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={ASSETS.logo} alt="PantauDesa" width={28} height={28} className="w-full h-full object-cover" />
            </Link>
            <div className="w-px h-4 bg-slate-200" />
            <p className="text-sm font-bold text-slate-700 truncate max-w-[180px] sm:max-w-none">
              {user.desaNama}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell size={16} className="text-slate-500" />
              {pending > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
                {user.nama.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:block truncate max-w-[120px]">{user.nama}</span>
            </div>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              title="Keluar"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Welcome ───────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 right-8 w-20 h-20 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-indigo-200 text-xs font-semibold mb-1">Selamat datang kembali 👋</p>
              <h1 className="text-xl font-black leading-tight">{user.nama}</h1>
              <p className="text-indigo-200 text-xs mt-1 flex items-center gap-1">
                <MapPin size={10} /> {user.desaNama}
              </p>
            </div>
            {pending > 0 && (
              <div className="flex-shrink-0 bg-amber-400/20 border border-amber-300/40 rounded-2xl px-4 py-3 text-center">
                <p className="text-2xl font-black text-amber-300">{pending}</p>
                <p className="text-[10px] text-amber-200 font-semibold">menunggu<br/>review</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Upload Dokumen", icon: Upload, href: "/desa-admin/dokumen", bg: "bg-indigo-600 text-white", sub: "APBDes, LPPD, RKP" },
            { label: "Profil Desa",    icon: Settings, href: "/desa-admin/profil", bg: "bg-white border border-slate-200 text-slate-700", sub: "Edit info & kontak" },
            { label: "Dokumenku",      icon: FileText, href: "/desa-admin/dokumen", bg: "bg-white border border-slate-200 text-slate-700", sub: `${myDocs.length} dokumen` },
            { label: "Lihat Profil",   icon: Globe2, href: desa ? `/desa/${desa.id}` : "/desa", bg: "bg-white border border-slate-200 text-slate-700", sub: "Tampilan publik" },
          ].map(a => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href} className={`rounded-2xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-all shadow-sm ${a.bg}`}>
                <Icon size={20} />
                <div>
                  <p className="text-sm font-bold leading-tight">{a.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{a.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Stats + recent docs ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Stats */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700">Status Dokumen</h2>
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Disetujui"     value={approved} icon="✅" bg="bg-emerald-50" text="text-emerald-700" />
              <StatCard label="Proses Review" value={pending}  icon="⏳" bg="bg-amber-50"   text="text-amber-700"  />
              <StatCard label="Ditolak"       value={rejected} icon="❌" bg="bg-rose-50"    text="text-rose-700"   />
            </div>
            {desa && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2.5">
                <p className="text-xs font-bold text-slate-600">Info Desa</p>
                {[
                  { icon: Users, label: "Penduduk", val: `${desa.penduduk.toLocaleString("id-ID")} jiwa` },
                  { icon: TrendingUp, label: "Serapan", val: `${desa.persentaseSerapan}%` },
                  { icon: MapPin, label: "Wilayah", val: `${desa.kecamatan}, ${desa.kabupaten}` },
                ].map(i => {
                  const Icon = i.icon;
                  return (
                    <div key={i.label} className="flex items-center gap-2">
                      <Icon size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-500">{i.label}:</span>
                      <span className="text-xs font-semibold text-slate-700 ml-auto truncate">{i.val}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent docs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700">Dokumen Terbaru</h2>
              <Link href="/desa-admin/dokumen" className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-800 transition-colors">
                Lihat semua <ChevronRight size={12} />
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 px-4 py-2">
              {myDocs.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-slate-400 text-sm mb-2">Belum ada dokumen diunggah.</p>
                  <Link href="/desa-admin/dokumen" className="text-xs text-indigo-600 font-semibold hover:underline">
                    Upload sekarang →
                  </Link>
                </div>
              ) : (
                myDocs.slice(0, 4).map(d => <DocRow key={d.id} doc={d} />)
              )}
            </div>
          </div>
        </div>

        {/* ── Rejected docs — perlu perhatian ──────────────────────────── */}
        {myDocs.filter(d => d.status === "ditolak").length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-rose-800 mb-1">⚠️ Dokumen perlu diupload ulang</p>
            {myDocs.filter(d => d.status === "ditolak").map(d => (
              <div key={d.id} className="mt-2 bg-white rounded-xl border border-rose-100 px-3 py-2.5">
                <p className="text-xs font-semibold text-slate-800">{d.nama}</p>
                <p className="text-[10px] text-rose-600 mt-0.5">{d.reviewNote}</p>
                <Link href="/desa-admin/dokumen" className="text-[10px] text-indigo-600 font-bold mt-1.5 inline-flex items-center gap-0.5 hover:underline">
                  Upload ulang <ArrowRight size={10} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
