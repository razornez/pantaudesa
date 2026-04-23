"use client";

import { APBDesItem } from "@/lib/types";
import { SECTION, BIDANG_CITIZEN_LABELS } from "@/lib/copy";
import { formatRupiah } from "@/lib/utils";

interface Props {
  items: APBDesItem[];
}

function barColor(persen: number): string {
  if (persen >= 85) return "bg-emerald-500";
  if (persen >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

function textColor(persen: number): string {
  if (persen >= 85) return "text-emerald-600";
  if (persen >= 60) return "text-amber-600";
  return "text-rose-600";
}

export default function APBDesBreakdown({ items }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">{SECTION.apbdes}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{SECTION.apbdesSub}</p>
      </div>

      <div className="space-y-5">
        {items.map((item) => {
          const citizen = BIDANG_CITIZEN_LABELS[item.kode];
          const label   = citizen?.label ?? item.bidang;
          const hint    = citizen?.hint;

          return (
            <div key={item.kode}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="flex-shrink-0 w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {item.kode}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 leading-snug">{label}</p>
                    {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
                  </div>
                </div>
                <span className={`flex-shrink-0 text-sm font-black ${textColor(item.persentase)}`}>
                  {item.persentase}%
                </span>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor(item.persentase)}`}
                  style={{ width: `${item.persentase}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400">
                <span>
                  Sudah dipakai:{" "}
                  <span className="text-slate-600 font-medium">{formatRupiah(item.realisasi)}</span>
                </span>
                <span>dari {formatRupiah(item.anggaran)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
