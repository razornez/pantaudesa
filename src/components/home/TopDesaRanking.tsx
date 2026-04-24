import Link from "next/link";
import { ArrowRight, TrendingDown } from "lucide-react";
import { Desa } from "@/lib/types";
import { BADGE_STYLES } from "@/lib/badge";
import { formatRupiah, getSerapanColor } from "@/lib/utils";

// ─── Piala SVG (dummy — bisa diganti image nanti) ─────────────────────────────

function TrophySVG({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="relative flex-shrink-0">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-200">
        <span className="text-3xl">🏆</span>
      </div>
      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
        <span className="text-[9px] font-black text-amber-900">#1</span>
      </div>
    </div>
  );
  if (rank === 2) return (
    <div className="relative flex-shrink-0">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-md">
        <span className="text-2xl">🥈</span>
      </div>
      <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center" style={{ width: 18, height: 18 }}>
        <span className="text-[8px] font-black text-white">#2</span>
      </div>
    </div>
  );
  if (rank === 3) return (
    <div className="relative flex-shrink-0">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-md">
        <span className="text-xl">🥉</span>
      </div>
      <div className="absolute -top-1 -right-1 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center" style={{ width: 16, height: 16 }}>
        <span className="text-[7px] font-black text-white">#3</span>
      </div>
    </div>
  );
  return (
    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400 font-black text-sm">
      {rank}
    </div>
  );
}

// ─── Row untuk daftar terbaik ─────────────────────────────────────────────────

function RankRow({ desa, rank }: { desa: Desa; rank: number }) {
  const badge   = desa.profil?.badge;
  const styles  = badge ? BADGE_STYLES[badge.warna] : null;
  const is123   = rank <= 3;

  return (
    <Link
      href={`/desa/${desa.id}`}
      className={`flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0 ${
        rank === 1 ? "bg-amber-50/50 hover:bg-amber-50" : ""
      }`}
    >
      <TrophySVG rank={rank} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold truncate group-hover:text-indigo-600 transition-colors ${is123 ? "text-slate-900" : "text-slate-700"}`}>
            {desa.nama}
          </p>
          {badge && styles && (
            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${styles.bg} ${styles.text} ${styles.border}`}>
              {badge.icon} {badge.label}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">{desa.kecamatan}, {desa.kabupaten}</p>
      </div>

      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-2 justify-end mb-1">
          <div className="hidden sm:block w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getSerapanColor(desa.persentaseSerapan)}`} style={{ width: `${desa.persentaseSerapan}%` }} />
          </div>
          <span className={`text-sm font-black ${desa.persentaseSerapan >= 85 ? "text-emerald-600" : desa.persentaseSerapan >= 65 ? "text-amber-600" : "text-rose-600"}`}>
            {desa.persentaseSerapan}%
          </span>
        </div>
        <p className="text-[10px] text-slate-400">{formatRupiah(desa.totalAnggaran)}</p>
      </div>

      <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
    </Link>
  );
}

// ─── Row untuk daftar terburuk ────────────────────────────────────────────────

function WarningRow({ desa, rank }: { desa: Desa; rank: number }) {
  const badge  = desa.profil?.badge;
  const styles = badge ? BADGE_STYLES[badge.warna] : null;

  return (
    <Link
      href={`/desa/${desa.id}`}
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-rose-50/30 transition-colors group border-b border-slate-50 last:border-0"
    >
      <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-500 font-black text-sm">
        {rank}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-rose-600 transition-colors">{desa.nama}</p>
          {badge && styles && (
            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${styles.bg} ${styles.text} ${styles.border}`}>
              {badge.icon} {badge.label}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">{desa.kecamatan}, {desa.kabupaten}</p>
      </div>

      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-2 justify-end mb-1">
          <TrendingDown size={12} className="text-rose-400" />
          <span className="text-sm font-black text-rose-600">{desa.persentaseSerapan}%</span>
        </div>
        <p className="text-[10px] text-slate-400">{formatRupiah(desa.totalAnggaran)}</p>
      </div>

      <ArrowRight size={14} className="text-slate-300 group-hover:text-rose-400 transition-colors flex-shrink-0" />
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  topBaik:   Desa[];
  topRendah: Desa[];
}

export default function TopDesaRanking({ topBaik, topRendah }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* ── Terbaik ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🏆</span>
            <h2 className="text-base font-bold text-slate-800">Desa Terbaik</h2>
          </div>
          <p className="text-xs text-slate-500 ml-8">Paling rajin menggunakan anggaran desa dengan transparan</p>
        </div>

        {/* Podium top 3 */}
        <div className="px-4 pt-4 pb-2 flex items-end justify-center gap-2">
          {/* 2nd place */}
          {topBaik[1] && (
            <Link href={`/desa/${topBaik[1].id}`} className="flex-1 max-w-[100px] text-center group">
              <div className="bg-gradient-to-b from-slate-100 to-slate-200 rounded-t-xl pt-4 pb-2 px-2 border border-slate-200">
                <p className="text-2xl mb-1">🥈</p>
                <p className="text-[10px] font-bold text-slate-600 truncate group-hover:text-indigo-600 transition-colors">{topBaik[1].nama.replace("Desa ","")}</p>
                <p className="text-sm font-black text-slate-500">{topBaik[1].persentaseSerapan}%</p>
              </div>
              <div className="h-12 bg-slate-200 rounded-b border border-slate-200 flex items-center justify-center">
                <span className="text-xs font-black text-slate-500">#2</span>
              </div>
            </Link>
          )}

          {/* 1st place — taller */}
          {topBaik[0] && (
            <Link href={`/desa/${topBaik[0].id}`} className="flex-1 max-w-[120px] text-center group">
              <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-t-xl pt-5 pb-2 px-2 border border-amber-300 shadow-md shadow-amber-100">
                <p className="text-3xl mb-1">🏆</p>
                <p className="text-[11px] font-bold text-amber-800 truncate group-hover:text-amber-900 transition-colors">{topBaik[0].nama.replace("Desa ","")}</p>
                <p className="text-base font-black text-amber-700">{topBaik[0].persentaseSerapan}%</p>
              </div>
              <div className="h-16 bg-amber-200 rounded-b border border-amber-300 flex items-center justify-center shadow-md shadow-amber-100">
                <span className="text-sm font-black text-amber-700">#1</span>
              </div>
            </Link>
          )}

          {/* 3rd place */}
          {topBaik[2] && (
            <Link href={`/desa/${topBaik[2].id}`} className="flex-1 max-w-[100px] text-center group">
              <div className="bg-gradient-to-b from-orange-100 to-orange-200 rounded-t-xl pt-3 pb-2 px-2 border border-orange-200">
                <p className="text-2xl mb-1">🥉</p>
                <p className="text-[10px] font-bold text-orange-700 truncate group-hover:text-orange-900 transition-colors">{topBaik[2].nama.replace("Desa ","")}</p>
                <p className="text-sm font-black text-orange-600">{topBaik[2].persentaseSerapan}%</p>
              </div>
              <div className="h-9 bg-orange-200 rounded-b border border-orange-200 flex items-center justify-center">
                <span className="text-xs font-black text-orange-600">#3</span>
              </div>
            </Link>
          )}
        </div>

        {/* Rank 4–5 */}
        <div className="mt-2 border-t border-slate-50">
          {topBaik.slice(3).map((d, i) => <RankRow key={d.id} desa={d} rank={i + 4} />)}
        </div>
      </div>

      {/* ── Perlu Pengawasan ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-rose-50 bg-rose-50/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🚨</span>
            <h2 className="text-base font-bold text-slate-800">Desa Perlu Diawasi</h2>
          </div>
          <p className="text-xs text-slate-500 ml-8">Serapan anggaran sangat rendah — warga perlu turun tangan</p>
        </div>

        <div className="divide-y divide-slate-50">
          {topRendah.map((d, i) => <WarningRow key={d.id} desa={d} rank={i + 1} />)}
        </div>
      </div>
    </div>
  );
}
