"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { StatusSerapan } from "@/lib/types";
import { FILTER, STATUS_FILTER_LABELS } from "@/lib/copy";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  provinsi: string;
  onProvinsi: (v: string) => void;
  status: StatusSerapan;
  onStatus: (v: StatusSerapan) => void;
  provinsiList: string[];
  totalResults: number;
}

type StatusOption = { value: StatusSerapan; color: string };

const STATUS_OPTIONS: StatusOption[] = [
  { value: "semua",  color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "baik",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "sedang", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "rendah", color: "bg-rose-100 text-rose-700 border-rose-200" },
];

export default function SearchFilterBar({
  search, onSearch, provinsi, onProvinsi, status, onStatus, provinsiList, totalResults,
}: Props) {
  const hasFilter = search || provinsi || status !== "semua";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={FILTER.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition placeholder-slate-400"
          />
          {search && (
            <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="relative">
          <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={provinsi}
            onChange={(e) => onProvinsi(e.target.value)}
            className="pl-8 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition appearance-none cursor-pointer"
          >
            <option value="">{FILTER.allProvinsi}</option>
            {provinsiList.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mr-1">
          <SlidersHorizontal size={12} /> {FILTER.filterLabel}
        </span>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatus(opt.value)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
              status === opt.value
                ? opt.color + " ring-2 ring-offset-1 ring-indigo-300 font-semibold"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}
          >
            {STATUS_FILTER_LABELS[opt.value]}
          </button>
        ))}
        {hasFilter && (
          <button
            onClick={() => { onSearch(""); onProvinsi(""); onStatus("semua"); }}
            className="ml-auto text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors"
          >
            <X size={12} /> {FILTER.reset}
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400">{FILTER.totalResults(totalResults)}</p>
    </div>
  );
}
