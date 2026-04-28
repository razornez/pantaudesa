"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeftRight, Search, X, TrendingUp, TrendingDown,
  Minus, MapPin, ChevronRight, BarChart3,
} from "lucide-react";
import { mockDesa } from "@/lib/mock-data";
import { Desa } from "@/lib/types";
import { formatRupiah, getStatusColor, getStatusLabel, getSerapanColor } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delta(a: number, b: number): "up" | "down" | "same" {
  if (a > b) return "up";
  if (a < b) return "down";
  return "same";
}

function DeltaIcon({ dir, size = 13 }: { dir: "up" | "down" | "same"; size?: number }) {
  if (dir === "up")   return <TrendingUp  size={size} className="text-emerald-500" />;
  if (dir === "down") return <TrendingDown size={size} className="text-rose-500" />;
  return <Minus size={size} className="text-slate-400" />;
}

// ─── Desa picker ──────────────────────────────────────────────────────────────

function DesaPicker({
  selected, exclude, onSelect, label,
}: {
  selected: Desa | null;
  exclude:  string | null;
  onSelect: (d: Desa) => void;
  label:    string;
}) {
  const [query, setQuery] = useState("");
  const [open,  setOpen]  = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return mockDesa.slice(0, 8);
    const q = query.toLowerCase();
    return mockDesa.filter(d =>
      d.nama.toLowerCase().includes(q) ||
      d.kabupaten.toLowerCase().includes(q) ||
      d.provinsi.toLowerCase().includes(q)
    ).filter(d => d.id !== exclude).slice(0, 8);
  }, [query, exclude]);

  if (selected) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{selected.nama}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {selected.kecamatan}, {selected.kabupaten}
            </p>
          </div>
          <button
            onClick={() => { onSelect(null as unknown as Desa); setQuery(""); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {!open ? (
          <div className="flex items-center gap-3 p-4 text-slate-400 hover:text-indigo-600 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Search size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs">Klik untuk memilih desa</p>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari nama desa, kabupaten, provinsi..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                onBlur={() => setTimeout(() => setOpen(false), 200)}
              />
            </div>
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl z-20 overflow-hidden max-h-64 overflow-y-auto">
          {results.map(d => (
            <button
              key={d.id}
              onMouseDown={() => { onSelect(d); setOpen(false); setQuery(""); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{d.nama}</p>
                <p className="text-xs text-slate-400">{d.kabupaten} · {d.provinsi}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${getStatusColor(d.status)}`}>
                {d.persentaseSerapan}%
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Comparison row ───────────────────────────────────────────────────────────

function CompRow({
  label, valA, valB, higher = "up",
}: {
  label:   string;
  valA:    string | number;
  valB:    string | number;
  higher?: "up" | "down"; // "up" = lebih tinggi lebih baik
}) {
  const numA = typeof valA === "number" ? valA : parseFloat(String(valA));
  const numB = typeof valB === "number" ? valB : parseFloat(String(valB));
  const hasNum = !isNaN(numA) && !isNaN(numB);
  const dir    = hasNum ? delta(numA, numB) : "same";
  // Flip jika higher = "down" (misal: jumlah masalah — lebih rendah lebih baik)
  const aWins = hasNum && (higher === "up" ? numA > numB : numA < numB);
  const bWins = hasNum && (higher === "up" ? numB > numA : numB < numA);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-3 border-b border-slate-50 last:border-0">
      {/* Nilai A */}
      <div className={`text-right ${aWins ? "text-emerald-700 font-black" : "text-slate-600"}`}>
        <span className="text-sm">{valA}</span>
      </div>

      {/* Label tengah */}
      <div className="text-center px-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{label}</p>
        {hasNum && <div className="flex justify-center mt-0.5"><DeltaIcon dir={dir} /></div>}
      </div>

      {/* Nilai B */}
      <div className={`text-left ${bWins ? "text-emerald-700 font-black" : "text-slate-600"}`}>
        <span className="text-sm">{valB}</span>
      </div>
    </div>
  );
}

// ─── Desa summary header ──────────────────────────────────────────────────────

function DesaHeader({ desa, align }: { desa: Desa; align: "left" | "right" }) {
  const isLeft = align === "left";
  return (
    <Link href={`/desa/${desa.id}`} className="group block">
      <div className={`flex flex-col gap-1 ${isLeft ? "items-start" : "items-end"}`}>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(desa.status)}`}>
          {getStatusLabel(desa.status)}
        </span>
        <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
          {desa.nama}
        </p>
        <p className={`text-xs text-slate-400 flex items-center gap-1 ${isLeft ? "" : "flex-row-reverse"}`}>
          <MapPin size={10} /> {desa.kecamatan}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <ChevronRight size={12} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          <span className="text-[10px] text-indigo-600 font-semibold">Lihat profil</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BandingkanPage() {
  const [desaA, setDesaA] = useState<Desa | null>(null);
  const [desaB, setDesaB] = useState<Desa | null>(null);

  const canCompare = desaA && desaB;
  const presets = [
    {
      label: "Serapan tertinggi vs terendah",
      hint: "Pura Harapan vs Sumber Rejeki",
      left: mockDesa.find((d) => d.nama === "Desa Pura Harapan"),
      right: mockDesa.find((d) => d.nama === "Desa Sumber Rejeki"),
    },
    {
      label: "Kabupaten yang sama",
      hint: "Sumber Rejeki vs Mekar Sari",
      left: mockDesa.find((d) => d.nama === "Desa Sumber Rejeki"),
      right: mockDesa.find((d) => d.nama === "Desa Mekar Sari"),
    },
    {
      label: "Status Perlu Ditinjau",
      hint: "Pura Harapan vs Pantai Indah",
      left: mockDesa.find((d) => d.nama === "Desa Pura Harapan"),
      right: mockDesa.find((d) => d.nama === "Desa Pantai Indah"),
    },
  ].filter((preset): preset is { label: string; hint: string; left: Desa; right: Desa } =>
    Boolean(preset.left && preset.right)
  );

  // Riwayat serapan terakhir 3 tahun
  const riwayatA = desaA?.riwayat?.slice(-3) ?? [];
  const riwayatB = desaB?.riwayat?.slice(-3) ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full">
          <ArrowLeftRight size={13} /> Perbandingan Desa
        </div>
        <h1 className="text-3xl font-black text-slate-900">Bandingkan Desa</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Pilih dua desa dan lihat perbedaan anggaran, serapan, transparansi, dan kondisi aktual secara berdampingan.
        </p>
      </div>

      {/* ── Picker ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <DesaPicker
          selected={desaA}
          exclude={desaB?.id ?? null}
          onSelect={d => setDesaA(d?.id ? d : null)}
          label="Desa Pertama"
        />
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
          <ArrowLeftRight size={15} className="text-slate-400" />
        </div>
        <DesaPicker
          selected={desaB}
          exclude={desaA?.id ?? null}
          onSelect={d => setDesaB(d?.id ? d : null)}
          label="Desa Kedua"
        />
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-slate-800">
          Tidak tahu mulai dari mana? Coba bandingkan:
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => { setDesaA(preset.left); setDesaB(preset.right); }}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span className="block text-xs font-bold text-indigo-700">{preset.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">{preset.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!canCompare && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <BarChart3 size={22} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            {!desaA && !desaB ? "Pilih dua desa untuk mulai membandingkan."
             : "Pilih desa kedua untuk memulai perbandingan."}
          </p>
          <p className="text-xs text-slate-400">
            Kamu bisa membandingkan serapan anggaran, transparansi, jumlah penduduk, dan banyak lagi.
          </p>
        </div>
      )}

      {/* ── Comparison ─────────────────────────────────────────────────────── */}
      {canCompare && (
        <div className="space-y-4">

          {/* Nama header */}
          <div className="grid grid-cols-[1fr_32px_1fr] items-start gap-3">
            <DesaHeader desa={desaA} align="left" />
            <div />
            <DesaHeader desa={desaB} align="right" />
          </div>

          {/* Progress bars */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Serapan Anggaran</p>
            <div className="space-y-2">
              {[
                { desa: desaA },
                { desa: desaB },
              ].map(({ desa }) => (
                <div key={desa.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 truncate max-w-[160px]">{desa.nama}</span>
                    <span className="font-black text-slate-800">{desa.persentaseSerapan}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getSerapanColor(desa.persentaseSerapan)}`}
                      style={{ width: `${desa.persentaseSerapan}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabel perbandingan */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detail Perbandingan</p>
            </div>
            <div className="px-5">
              <CompRow label="Total Anggaran"  valA={formatRupiah(desaA.totalAnggaran)}        valB={formatRupiah(desaB.totalAnggaran)} />
              <CompRow label="Terealisasi"     valA={formatRupiah(desaA.terealisasi)}           valB={formatRupiah(desaB.terealisasi)} />
              <CompRow label="% Serapan"       valA={`${desaA.persentaseSerapan}%`}             valB={`${desaB.persentaseSerapan}%`} />
              <CompRow label="Penduduk"        valA={desaA.penduduk.toLocaleString("id-ID")}    valB={desaB.penduduk.toLocaleString("id-ID")} />
              <CompRow label="Anggaran/Jiwa"   valA={formatRupiah(Math.round(desaA.totalAnggaran / desaA.penduduk))} valB={formatRupiah(Math.round(desaB.totalAnggaran / desaB.penduduk))} />
              <CompRow label="Fokus Program"   valA={desaA.kategori}  valB={desaB.kategori} />
              <CompRow label="Provinsi"        valA={desaA.provinsi}  valB={desaB.provinsi} />
              {desaA.skorTransparansi && desaB.skorTransparansi && (
                <CompRow label="Skor Transparansi" valA={`${desaA.skorTransparansi.total}/100`} valB={`${desaB.skorTransparansi.total}/100`} />
              )}
            </div>
          </div>

          {/* Riwayat serapan */}
          {riwayatA.length > 0 && riwayatB.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tren Serapan 3 Tahun Terakhir</p>
              </div>
              <div className="px-5">
                {riwayatA.map((rA, i) => {
                  const rB = riwayatB[i];
                  if (!rB) return null;
                  return (
                    <CompRow
                      key={rA.tahun}
                      label={String(rA.tahun)}
                      valA={`${rA.persentaseSerapan}%`}
                      valB={`${rB.persentaseSerapan}%`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Dokumen publik */}
          {desaA.dokumen && desaB.dokumen && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ketersediaan Dokumen Publik</p>
              </div>
              <div className="px-5">
                <CompRow
                  label="Tersedia"
                  valA={`${desaA.dokumen.filter(d => d.tersedia).length}/${desaA.dokumen.length}`}
                  valB={`${desaB.dokumen.filter(d => d.tersedia).length}/${desaB.dokumen.length}`}
                />
              </div>
            </div>
          )}

          {/* CTA ke profil masing-masing */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/desa/${desaA.id}`}
              className="flex items-center justify-center gap-1.5 bg-white border border-indigo-200 text-indigo-700 font-bold text-xs py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Profil {desaA.nama.replace("Desa ", "")} <ChevronRight size={12} />
            </Link>
            <Link
              href={`/desa/${desaB.id}`}
              className="flex items-center justify-center gap-1.5 bg-white border border-indigo-200 text-indigo-700 font-bold text-xs py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Profil {desaB.nama.replace("Desa ", "")} <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
