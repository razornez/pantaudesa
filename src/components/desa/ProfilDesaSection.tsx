"use client";

import { useState } from "react";
import {
  Building2, Car, Wrench, Leaf, Globe2, Landmark,
  MapPin, Users, Phone, Mail, ExternalLink, Clock,
  ShoppingBag, ChevronDown, ChevronUp, TrendingUp,
  Stethoscope, GraduationCap, Dumbbell, BookOpen, Store,
} from "lucide-react";
import { ProfilDesa, AsetDesa, FasilitasDesa } from "@/lib/types";
import { formatRupiah, formatRupiahFull } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeDate(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days === 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 7)  return `${days} hari lalu`;
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
  if (days < 365) return `${Math.floor(days / 30)} bulan lalu`;
  return `${Math.floor(days / 365)} tahun lalu`;
}

function updateFreshness(date: Date): { color: string; label: string } {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 7)   return { color: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Data Terbaru" };
  if (days <= 30)  return { color: "text-sky-600 bg-sky-50 border-sky-200",             label: "Cukup Terkini" };
  if (days <= 90)  return { color: "text-amber-600 bg-amber-50 border-amber-200",       label: "Perlu Update" };
  return              { color: "text-rose-600 bg-rose-50 border-rose-200",              label: "Data Lama" };
}

// ─── Aset icon + label ────────────────────────────────────────────────────────

const ASET_ICONS: Record<AsetDesa["jenis"], React.ElementType> = {
  tanah:         MapPin,
  bangunan:      Building2,
  kendaraan:     Car,
  peralatan:     Wrench,
  infrastruktur: Globe2,
  lainnya:       Landmark,
};

const ASET_KONDISI: Record<string, string> = {
  baik:   "bg-emerald-100 text-emerald-700",
  sedang: "bg-amber-100 text-amber-700",
  rusak:  "bg-rose-100 text-rose-700",
};

// ─── Fasilitas icon ───────────────────────────────────────────────────────────

const FASILITAS_ICONS: Record<FasilitasDesa["jenis"], React.ElementType> = {
  pendidikan: GraduationCap,
  kesehatan:  Stethoscope,
  olahraga:   Dumbbell,
  ibadah:     BookOpen,
  umum:       Building2,
  ekonomi:    Store,
};

const FASILITAS_COLORS: Record<FasilitasDesa["jenis"], string> = {
  pendidikan: "bg-sky-100 text-sky-700",
  kesehatan:  "bg-rose-100 text-rose-700",
  olahraga:   "bg-emerald-100 text-emerald-700",
  ibadah:     "bg-violet-100 text-violet-700",
  umum:       "bg-slate-100 text-slate-700",
  ekonomi:    "bg-amber-100 text-amber-700",
};

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Icon size={16} className="text-indigo-600" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

function AsetRow({ aset }: { aset: AsetDesa }) {
  const Icon = ASET_ICONS[aset.jenis];
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{aset.nama}</p>
        <p className="text-xs text-slate-400">{aset.lokasi} · {aset.tahunBeli}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-semibold text-slate-700">{formatRupiah(aset.nilai)}</p>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ASET_KONDISI[aset.kondisi]}`}>
          {aset.kondisi}
        </span>
      </div>
    </div>
  );
}

function FasilitasChip({ f }: { f: FasilitasDesa }) {
  const Icon = FASILITAS_ICONS[f.jenis];
  const color = FASILITAS_COLORS[f.jenis];
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-current/10 ${color}`}>
      <Icon size={14} />
      <div>
        <p className="text-xs font-semibold leading-tight">{f.nama}</p>
        <p className="text-[10px] opacity-70">{f.jumlah} unit · {f.kondisi}{f.ket ? ` · ${f.ket}` : ""}</p>
      </div>
    </div>
  );
}

// ─── History belanja table ────────────────────────────────────────────────────

function HistoryBelanja({ profil }: { profil: ProfilDesa }) {
  const [showAll, setShowAll] = useState(false);
  const items    = profil.historyBelanja;
  const displayed = showAll ? items : items.slice(0, 5);
  const total     = items.reduce((s, i) => s + i.anggaran, 0);
  const totalReal = items.reduce((s, i) => s + i.realisasi, 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 text-slate-400 font-semibold pr-3">Kode</th>
              <th className="text-left py-2 text-slate-400 font-semibold">Uraian Belanja</th>
              <th className="text-right py-2 text-slate-400 font-semibold px-2">Anggaran</th>
              <th className="text-right py-2 text-slate-400 font-semibold px-2">Realisasi</th>
              <th className="text-left py-2 text-slate-400 font-semibold pl-2">Penyedia</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((it, i) => {
              const pct = it.anggaran > 0 ? Math.round(it.realisasi / it.anggaran * 100) : 0;
              return (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2 pr-3 text-slate-400 font-mono">{it.kode}</td>
                  <td className="py-2">
                    <p className="text-slate-700 font-medium">{it.uraian}</p>
                    <p className="text-slate-400">Semester {it.semester} {it.tahun}</p>
                  </td>
                  <td className="py-2 px-2 text-right font-semibold text-slate-700 whitespace-nowrap">{formatRupiah(it.anggaran)}</td>
                  <td className="py-2 px-2 text-right whitespace-nowrap">
                    <span className={`font-semibold ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                      {formatRupiah(it.realisasi)}
                    </span>
                    <p className={`text-[10px] ${pct >= 80 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-rose-500"}`}>{pct}%</p>
                  </td>
                  <td className="py-2 pl-2 text-slate-500">{it.penyedia ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td colSpan={2} className="py-2 font-bold text-slate-700">Total</td>
              <td className="py-2 px-2 text-right font-bold text-indigo-700 whitespace-nowrap">{formatRupiah(total)}</td>
              <td className="py-2 px-2 text-right font-bold text-emerald-700 whitespace-nowrap">{formatRupiah(totalReal)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {items.length > 5 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-all"
        >
          {showAll ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showAll ? "Sembunyikan" : `Lihat ${items.length - 5} transaksi lainnya`}
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  profil: ProfilDesa;
  nama:   string;
}

export default function ProfilDesaSection({ profil, nama }: Props) {
  const freshness   = updateFreshness(profil.terakhirDiperbarui);
  const totalAset   = profil.aset.reduce((s, a) => s + a.nilai, 0);

  return (
    <div className="space-y-4">

      {/* ── Header info + update timestamp ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Profil {nama}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Informasi umum, aset, fasilitas, dan potensi desa</p>
          </div>
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${freshness.color}`}>
            <Clock size={11} />
            {freshness.label} · {relativeDate(profil.terakhirDiperbarui)}
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Luas Wilayah",       value: `${profil.luasWilayah} km²` },
            { label: "Jumlah Dusun",       value: `${profil.jumlahDusun} dusun` },
            { label: "Jumlah RT/RW",       value: `${profil.jumlahRt} RT / ${profil.jumlahRw} RW` },
            { label: "Jumlah KK",          value: `${profil.jumlahKk.toLocaleString("id-ID")} KK` },
            { label: "Mata Pencaharian",   value: profil.mataPencaharian },
            { label: "Potensi Unggulan",   value: profil.potensiUnggulan },
            ...(profil.luasSawah ? [{ label: "Luas Sawah", value: `${profil.luasSawah} ha` }] : []),
            ...(profil.luasHutan ? [{ label: "Luas Hutan/Kebun", value: `${profil.luasHutan} ha` }] : []),
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-slate-700 leading-tight">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Kontak & web */}
        <div className="flex flex-wrap gap-2">
          {profil.website && (
            <a href={profil.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ExternalLink size={12} /> Web Profil Desa
            </a>
          )}
          {!profil.website && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Globe2 size={12} /> Belum punya website
            </span>
          )}
          {profil.telepon && (
            <a href={`tel:${profil.telepon}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Phone size={12} /> {profil.telepon}
            </a>
          )}
          {profil.email && (
            <a href={`mailto:${profil.email}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Mail size={12} /> {profil.email}
            </a>
          )}
        </div>
      </div>

      {/* ── BUMDes ─────────────────────────────────────────────────────── */}
      {profil.bumdes && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionHeader icon={ShoppingBag} title="BUMDes (Badan Usaha Milik Desa)" sub="Usaha ekonomi produktif milik desa" />

          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              profil.bumdes.status === "aktif"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : profil.bumdes.status === "dalam_pembentukan"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}>
              {profil.bumdes.status === "aktif" ? "✅ Aktif" : profil.bumdes.status === "dalam_pembentukan" ? "🔄 Dalam Pembentukan" : "⛔ Tidak Aktif"}
            </span>
            <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
              Berdiri {profil.bumdes.tahunBerdiri}
            </span>
          </div>

          <p className="text-sm font-bold text-slate-800 mb-0.5">{profil.bumdes.nama}</p>
          <p className="text-xs text-slate-500 mb-3">{profil.bumdes.bidangUsaha}</p>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">{profil.bumdes.deskripsi}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
              <p className="text-[10px] text-indigo-500 font-medium mb-1 flex items-center gap-1">
                <Landmark size={10} /> Modal Awal
              </p>
              <p className="text-sm font-bold text-indigo-700">{formatRupiahFull(profil.bumdes.modal)}</p>
            </div>
            {profil.bumdes.omsetPerTahun && (
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-[10px] text-emerald-500 font-medium mb-1 flex items-center gap-1">
                  <TrendingUp size={10} /> Omset/Tahun (est.)
                </p>
                <p className="text-sm font-bold text-emerald-700">{formatRupiahFull(profil.bumdes.omsetPerTahun)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Aset Desa ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <SectionHeader
          icon={Building2}
          title="Aset Desa"
          sub={`${profil.aset.length} aset terdaftar · estimasi total ${formatRupiah(totalAset)}`}
        />
        <div>
          {profil.aset.map((aset, i) => <AsetRow key={i} aset={aset} />)}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-500">Total Nilai Aset (Estimasi)</span>
          <span className="text-sm font-bold text-indigo-700">{formatRupiahFull(totalAset)}</span>
        </div>
      </div>

      {/* ── Fasilitas ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <SectionHeader icon={Users} title="Fasilitas Umum" sub={`${profil.fasilitas.length} jenis fasilitas`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {profil.fasilitas.map((f, i) => <FasilitasChip key={i} f={f} />)}
        </div>
      </div>

      {/* ── History Belanja ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <SectionHeader
          icon={TrendingUp}
          title="Rincian Penggunaan Anggaran"
          sub="Transparansi belanja desa per mata anggaran"
        />
        <HistoryBelanja profil={profil} />
      </div>
    </div>
  );
}
