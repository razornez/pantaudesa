import { OutputFisik } from "@/lib/types";
import { Target, CheckCircle2 } from "lucide-react";
import { SECTION } from "@/lib/copy";

interface Props {
  items: OutputFisik[];
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

function formatValue(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

export default function OutputFisikCards({ items }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">{SECTION.outputFisik}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{SECTION.outputFisikSub}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <div className="flex items-start gap-1.5 mb-2">
              <Target size={13} className="text-indigo-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-slate-700 leading-tight">{item.label}</span>
            </div>

            {/* Seharusnya ada X / sudah ada Y */}
            <div className="mb-1">
              <p className="text-xs text-slate-400">Seharusnya ada</p>
              <p className="text-sm font-bold text-slate-700">{formatValue(item.target)} {item.satuan}</p>
            </div>
            <div className="mb-2">
              <p className="text-xs text-slate-400">Sudah ada/dikerjakan</p>
              <p className={`text-xl font-black ${textColor(item.persentase)}`}>
                {formatValue(item.realisasi)} <span className="text-xs font-normal text-slate-500">{item.satuan}</span>
              </p>
            </div>

            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full ${barColor(item.persentase)}`}
                style={{ width: `${Math.min(100, item.persentase)}%` }}
              />
            </div>

            <div className="flex items-center gap-1">
              <CheckCircle2 size={11} className={textColor(item.persentase)} />
              <span className={`text-xs font-semibold ${textColor(item.persentase)}`}>
                {item.persentase}% tercapai
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
