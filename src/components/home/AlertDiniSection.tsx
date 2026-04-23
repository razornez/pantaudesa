import Link from "next/link";
import { AlertTriangle, TrendingDown, ArrowRight } from "lucide-react";
import { Desa } from "@/lib/types";
import { SECTION } from "@/lib/copy";
import { isDowntrending } from "@/lib/verdicts";

interface Props {
  desa: Desa[];
}

export default function AlertDiniSection({ desa }: Props) {
  const kritis = desa
    .filter((d) => d.persentaseSerapan < 50)
    .sort((a, b) => a.persentaseSerapan - b.persentaseSerapan)
    .slice(0, 4);

  if (kritis.length === 0) return null;

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
          <AlertTriangle size={16} className="text-rose-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-rose-800">{SECTION.alertDini}</h2>
          <p className="text-xs text-rose-600">{SECTION.alertDiniSub(kritis.length)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kritis.map((d) => (
          <Link
            key={d.id}
            href={`/desa/${d.id}`}
            className="group bg-white rounded-xl border border-rose-100 p-3.5 hover:border-rose-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-1 mb-2">
              <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-rose-600 transition-colors">
                {d.nama}
              </p>
              {isDowntrending(d.riwayat) && (
                <TrendingDown size={13} className="text-rose-500 flex-shrink-0 mt-0.5" />
              )}
            </div>
            <p className="text-xs text-slate-500 mb-2">{d.kabupaten}, {d.provinsi}</p>

            <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-rose-500 rounded-full"
                style={{ width: `${d.persentaseSerapan}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-rose-600">{d.persentaseSerapan}%</span>
              <ArrowRight size={12} className="text-rose-400 group-hover:text-rose-600 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
