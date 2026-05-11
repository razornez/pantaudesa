"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export interface AdminDesaFilter {
  q: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
}

interface FilterOptions {
  provinsi: string[];
  kabupaten: string[];
  kecamatan: string[];
}

interface Props {
  onChange: (filter: AdminDesaFilter) => void;
}

/**
 * Reusable admin desa filter bar — search + provinsi + kabupaten + kecamatan.
 * Matches the filter UX on the public /desa page but backed by admin APIs.
 * Used in: Data per Desa tab, Versi & Audit tab, Log Aktivitas tab.
 */
export default function AdminDesaFilterBar({ onChange }: Props) {
  const [q, setQ]               = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [kabupaten, setKabupaten] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [options, setOptions]   = useState<FilterOptions>({ provinsi: [], kabupaten: [], kecamatan: [] });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadOptions = useCallback((prov: string, kab: string) => {
    const params = new URLSearchParams();
    if (prov) params.set("provinsi", prov);
    if (kab)  params.set("kabupaten", kab);
    fetch(`/api/internal-admin/desa-filter-options?${params.toString()}`)
      .then(r => r.json())
      .then((d: FilterOptions) => setOptions(d))
      .catch(() => {});
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadOptions("", ""); }, [loadOptions]);

  const emit = useCallback((next: AdminDesaFilter) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(next), 300);
  }, [onChange]);

  const handleQ = (v: string) => {
    setQ(v);
    emit({ q: v, provinsi, kabupaten, kecamatan });
  };
  const handleProvinsi = (v: string) => {
    setProvinsi(v); setKabupaten(""); setKecamatan("");
    loadOptions(v, "");
    emit({ q, provinsi: v, kabupaten: "", kecamatan: "" });
  };
  const handleKabupaten = (v: string) => {
    setKabupaten(v); setKecamatan("");
    loadOptions(provinsi, v);
    emit({ q, provinsi, kabupaten: v, kecamatan: "" });
  };
  const handleKecamatan = (v: string) => {
    setKecamatan(v);
    emit({ q, provinsi, kabupaten, kecamatan: v });
  };

  const hasFilter = q || provinsi || kabupaten || kecamatan;
  const clearAll = () => {
    setQ(""); setProvinsi(""); setKabupaten(""); setKecamatan("");
    loadOptions("", "");
    onChange({ q: "", provinsi: "", kabupaten: "", kecamatan: "" });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden />
          <input type="text" value={q} onChange={e => handleQ(e.target.value)}
            placeholder="Cari nama desa, kecamatan, kabupaten..."
            className="field-lux text-sm pl-8 w-full" />
          {q && (
            <button type="button" onClick={() => handleQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <X size={12} aria-hidden />
            </button>
          )}
        </div>

        {/* Provinsi */}
        <div className="relative">
          <SlidersHorizontal size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden />
          <select value={provinsi} onChange={e => handleProvinsi(e.target.value)}
            aria-label="Filter provinsi"
            className="select-lux text-sm pl-7 pr-6 min-w-[130px]">
            <option value="">Semua Provinsi</option>
            {options.provinsi.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Kabupaten */}
        <select value={kabupaten} onChange={e => handleKabupaten(e.target.value)}
          aria-label="Filter kabupaten"
          className="select-lux text-sm pr-6 min-w-[150px]">
          <option value="">Semua Kabupaten</option>
          {options.kabupaten.map(k => <option key={k} value={k}>{k}</option>)}
        </select>

        {/* Kecamatan */}
        <select value={kecamatan} onChange={e => handleKecamatan(e.target.value)}
          aria-label="Filter kecamatan"
          className="select-lux text-sm pr-6 min-w-[140px]">
          <option value="">Semua Kecamatan</option>
          {options.kecamatan.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {/* Active filter chips */}
      {hasFilter && (
        <div className="flex flex-wrap items-center gap-1.5">
          {provinsi  && <FilterChip label={`Provinsi: ${provinsi}`}  onRemove={() => handleProvinsi("")} />}
          {kabupaten && <FilterChip label={`Kab: ${kabupaten}`}       onRemove={() => handleKabupaten("")} />}
          {kecamatan && <FilterChip label={`Kec: ${kecamatan}`}       onRemove={() => handleKecamatan("")} />}
          <button type="button" onClick={clearAll}
            className="text-[10.5px] text-slate-400 hover:text-rose-600 transition-colors px-1">
            Hapus semua filter ✕
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-indigo-50 text-indigo-700"
      style={{ boxShadow: "inset 0 0 0 1px rgba(67,56,202,0.12)" }}>
      {label}
      <button type="button" onClick={onRemove} className="text-indigo-400 hover:text-indigo-700 ml-0.5">✕</button>
    </span>
  );
}
