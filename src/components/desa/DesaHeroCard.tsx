"use client";

import { useState } from "react";
import { MapPin, Globe2, Clock, Users, Home, Layers, Target, Sparkles, X } from "lucide-react";
import { Desa } from "@/lib/types";
import { formatRupiah, getStatusColor, getStatusLabel, getSerapanColor } from "@/lib/utils";
import { BADGE_STYLES } from "@/lib/badge";
import VerdictBanner from "@/components/ui/VerdictBanner";
import { getAbsorptionVerdict } from "@/lib/verdicts";

// ─── Badge inline popup ───────────────────────────────────────────────────────

function BadgePopup({ badge, onClose }: { badge: NonNullable<Desa["profil"]>["badge"]; onClose: () => void }) {
  const styles = BADGE_STYLES[badge.warna];
  return (
    <div className="absolute top-full left-0 mt-2 z-30 w-72 animate-fade-up">
      <div className={`rounded-2xl border shadow-xl p-4 ${styles.bg} ${styles.border}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{badge.icon}</span>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ${styles.text}`}>Level {badge.level} dari 5</p>
              <p className={`text-sm font-black ${styles.text}`}>{badge.label}</p>
            </div>
          </div>
          <button onClick={onClose} className={`${styles.text} opacity-50 hover:opacity-100 transition-opacity`}>
            <X size={14} />
          </button>
        </div>
        <p className={`text-xs leading-relaxed ${styles.text} opacity-75`}>{badge.deskripsi}</p>
        {/* Level dots */}
        <div className="flex gap-1.5 mt-3">
          {[1,2,3,4,5].map(l => (
            <div key={l} className={`flex-1 h-1.5 rounded-full ${l <= badge.level ? "bg-current opacity-70" : "bg-current opacity-15"} ${styles.text}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Freshness badge ──────────────────────────────────────────────────────────

function freshnessConfig(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  const label = days === 0 ? "Hari ini" : days === 1 ? "Kemarin" : days < 7 ? `${days} hari lalu` : days < 30 ? `${Math.floor(days/7)} mgg lalu` : `${Math.floor(days/30)} bln lalu`;
  if (days <= 7)  return { label, color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (days <= 30) return { label, color: "text-sky-700 bg-sky-50 border-sky-200" };
  if (days <= 90) return { label, color: "text-amber-700 bg-amber-50 border-amber-200" };
  return           { label, color: "text-rose-700 bg-rose-50 border-rose-200" };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props { desa: Desa }

export default function DesaHeroCard({ desa }: Props) {
  const [showBadge, setShowBadge] = useState(false);

  const selisih = desa.totalAnggaran - desa.terealisasi;
  const verdict = getAbsorptionVerdict(desa.persentaseSerapan, selisih);
  const profil  = desa.profil;
  const badge   = profil?.badge;
  const fresh   = profil?.terakhirDiperbarui ? freshnessConfig(profil.terakhirDiperbarui) : null;
  const badgeStyles = badge ? BADGE_STYLES[badge.warna] : null;

  const metaItems = [
    { icon: MapPin,  label: desa.kecamatan + ", " + desa.kabupaten },
    { icon: Users,   label: `${desa.penduduk.toLocaleString("id-ID")} jiwa` },
    ...(profil ? [
      { icon: Home,    label: `${profil.jumlahKk.toLocaleString("id-ID")} KK · ${profil.jumlahDusun} dusun` },
      { icon: Layers,  label: `${profil.luasWilayah} km²` },
      { icon: Target,  label: profil.mataPencaharian },
    ] : []),
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── Top stripe: nama + status + badge ──────────────────────────── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Nama + badge pill inline */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{desa.nama}</h1>

              {/* Badge pill — klik untuk popup */}
              {badge && badgeStyles && (
                <div className="relative">
                  <button
                    onClick={() => setShowBadge(v => !v)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-all hover:brightness-95 active:scale-95 ${badgeStyles.bg} ${badgeStyles.text} ${badgeStyles.border}`}
                    title="Klik untuk info badge"
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                    <Sparkles size={9} className="opacity-60" />
                  </button>
                  {showBadge && <BadgePopup badge={badge} onClose={() => setShowBadge(false)} />}
                </div>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {metaItems.map((m, i) => {
                const Icon = m.icon;
                return (
                  <span key={i} className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Icon size={11} className="text-slate-400 flex-shrink-0" />
                    {m.label}
                  </span>
                );
              })}
            </div>

            {/* Website + freshness */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {profil?.website ? (
                <a href={profil.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                >
                  <Globe2 size={11} /> {profil.website.replace("https://", "")}
                </a>
              ) : (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Globe2 size={11} /> Belum punya website
                </span>
              )}
              {fresh && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${fresh.color}`}>
                  <Clock size={9} /> Data: {fresh.label}
                </span>
              )}
            </div>
          </div>

          {/* Status badge (kanan) */}
          <span className={`self-start flex-shrink-0 text-sm font-semibold px-3 py-1 rounded-full border ${getStatusColor(desa.status)}`}>
            {getStatusLabel(desa.status)}
          </span>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div className="px-5 pb-2">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Anggaran terpakai · {desa.tahun}</span>
          <span className="font-black text-slate-700 text-sm">{desa.persentaseSerapan}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${getSerapanColor(desa.persentaseSerapan)}`} style={{ width: `${desa.persentaseSerapan}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-slate-300 mt-1">
          <span>Rp 0</span><span>{formatRupiah(desa.totalAnggaran)}</span>
        </div>
      </div>

      {/* ── Verdict ──────────────────────────────────────────────────────── */}
      <div className="px-5 pb-4">
        <VerdictBanner verdict={verdict} />
      </div>

      {/* ── Potensi strip ─────────────────────────────────────────────────── */}
      {profil && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Target size={10} className="text-indigo-400" />
            <span className="font-semibold text-slate-600">Fokus:</span> {desa.kategori}
          </span>
          <span className="text-[11px] text-slate-500">
            ✨ <span className="font-semibold text-slate-600">Potensi:</span> {profil.potensiUnggulan}
          </span>
          {profil.luasSawah && (
            <span className="text-[11px] text-slate-400">🌾 Sawah {profil.luasSawah} ha</span>
          )}
          {profil.luasHutan && (
            <span className="text-[11px] text-slate-400">🌿 Kebun {profil.luasHutan} ha</span>
          )}
        </div>
      )}
    </div>
  );
}
