"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Megaphone, Search, Filter, ArrowRight, X, BarChart2 } from "lucide-react";
import { mockDesa } from "@/lib/mock-data";
import {
  getAllVoices, getVoiceStats,
  VOICE_CATEGORIES, VoiceCategory,
  CitizenVoice,
} from "@/lib/citizen-voice";
import VoiceCard from "@/components/desa/VoiceCard";
import VoiceStats from "@/components/suara/VoiceStats";

// ─── Desa lookup ──────────────────────────────────────────────────────────────

const desaMap = Object.fromEntries(mockDesa.map(d => [d.id, d]));

// ─── Kartu suara global (with desa badge wrapper) ─────────────────────────────

function GlobalVoiceCard({ voice, helpedIds, onHelpful }: {
  voice: CitizenVoice;
  helpedIds: Set<string>;
  onHelpful: (id: string) => void;
}) {
  const desa = desaMap[voice.desaId];
  return (
    <div className="space-y-1.5">
      {desa && (
        <Link
          href={`/desa/${desa.id}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full transition-colors"
        >
          📍 {desa.nama}
          <ArrowRight size={10} />
        </Link>
      )}
      <VoiceCard voice={voice} onHelpful={onHelpful} helpedIds={helpedIds} />
    </div>
  );
}

// ─── Halaman utama ────────────────────────────────────────────────────────────

export default function SuaraWargaPage() {
  const allVoices = useMemo(() => getAllVoices(), []);
  const stats     = useMemo(() => getVoiceStats(), []);

  const [searchDesa,  setSearchDesa]  = useState("");
  const [filterDesa,  setFilterDesa]  = useState("");
  const [filterCat,   setFilterCat]   = useState<VoiceCategory | "">("");
  const [showStats,   setShowStats]   = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [helpedIds,   setHelpedIds]   = useState<Set<string>>(new Set());

  const desaOptions = useMemo(
    () => [...new Set(allVoices.map(v => v.desaId))]
            .map(id => desaMap[id])
            .filter(Boolean)
            .sort((a, b) => a.nama.localeCompare(b.nama)),
    [allVoices]
  );

  const filtered = useMemo(() => {
    let result = allVoices;
    if (filterDesa) result = result.filter(v => v.desaId === filterDesa);
    if (filterCat)  result = result.filter(v => v.category === filterCat);
    return result;
  }, [allVoices, filterDesa, filterCat]);

  const hasFilter = filterDesa || filterCat;

  const handleHelpful = (id: string) => {
    if (helpedIds.has(id)) return;
    setHelpedIds(prev => new Set(prev).add(id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium mb-4">
            <Megaphone size={12} />
            Langsung dari warga
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">Suara Warga</h1>
          <p className="text-indigo-100 text-sm max-w-lg mb-4">
            Kumpulan cerita nyata dari warga desa-desa seluruh Indonesia.
            Bukan laporan formal — ini suara yang jujur, apa adanya.
          </p>
          <div className="flex flex-wrap gap-4 text-sm items-center">
            <div>
              <span className="font-black text-2xl">{stats.total}</span>
              <span className="text-indigo-200 ml-1.5">suara</span>
            </div>
            <div className="w-px bg-white/20 h-5" />
            <div>
              <span className="font-black text-2xl">{stats.desaCount}</span>
              <span className="text-indigo-200 ml-1.5">desa</span>
            </div>
            <div className="w-px bg-white/20 h-5" />
            <div>
              <span className="font-black text-2xl">{stats.resolved}</span>
              <span className="text-indigo-200 ml-1.5">sudah selesai</span>
            </div>

            {/* Toggle stats */}
            <button
              onClick={() => setShowStats(v => !v)}
              className="ml-auto inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              <BarChart2 size={12} />
              {showStats ? "Sembunyikan" : "Lihat"} statistik
            </button>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -right-4 w-48 h-48 bg-white/5 rounded-full" />
      </div>

      {/* ── Stats panel ───────────────────────────────────────────────── */}
      {showStats && <VoiceStats />}

      {/* ── CTA tambah cerita ─────────────────────────────────────────── */}
      {!showAddForm ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-amber-800 mb-0.5">Punya cerita tentang desamu?</p>
            <p className="text-xs text-amber-600">Pilih desamu dan ceritakan langsung — tidak perlu formal.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
          >
            <Megaphone size={13} />
            Ceritakan
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">Pilih desa yang ingin kamu ceritakan:</p>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchDesa}
              onChange={e => setSearchDesa(e.target.value)}
              placeholder="Cari nama desa..."
              className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto">
            {mockDesa
              .filter(d =>
                d.nama.toLowerCase().includes(searchDesa.toLowerCase()) ||
                d.kabupaten.toLowerCase().includes(searchDesa.toLowerCase())
              )
              .map(d => (
                <Link
                  key={d.id}
                  href={`/desa/${d.id}/suara`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700">{d.nama}</p>
                    <p className="text-xs text-slate-400">{d.kabupaten}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* ── Filter bar ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Tampilkan:</span>
          {hasFilter && (
            <button
              onClick={() => { setFilterDesa(""); setFilterCat(""); }}
              className="ml-auto text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors"
            >
              <X size={12} /> Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filterDesa}
            onChange={e => setFilterDesa(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            <option value="">Semua Desa</option>
            {desaOptions.map(d => (
              <option key={d.id} value={d.id}>{d.nama}</option>
            ))}
          </select>

          {(Object.entries(VOICE_CATEGORIES) as [VoiceCategory, typeof VOICE_CATEGORIES[VoiceCategory]][]).map(
            ([cat, { label, emoji, color }]) => (
              <button
                key={cat}
                onClick={() => setFilterCat(prev => prev === cat ? "" : cat)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filterCat === cat ? color + " ring-2 ring-offset-1 ring-current/20" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {emoji} {label}
              </button>
            )
          )}
        </div>

        <p className="text-xs text-slate-400">
          Menampilkan <span className="font-semibold text-slate-600">{filtered.length}</span> dari {allVoices.length} suara
        </p>
      </div>

      {/* ── Feed ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 text-sm">Belum ada suara yang sesuai filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(v => (
            <GlobalVoiceCard key={v.id} voice={v} helpedIds={helpedIds} onHelpful={handleHelpful} />
          ))}
        </div>
      )}
    </div>
  );
}
