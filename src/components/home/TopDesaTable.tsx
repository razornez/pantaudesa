import Link from "next/link";
import { Desa } from "@/lib/types";
import { formatRupiah, getStatusColor, getSerapanColor } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface Props {
  desa: Desa[];
  title: string;
  subtitle: string;
}

export default function TopDesaTable({ desa, title, subtitle }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="divide-y divide-slate-50">
        {desa.map((d, i) => (
          <Link
            key={d.id}
            href={`/desa/${d.id}`}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
          >
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                {d.nama}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {d.kecamatan}, {d.kabupaten}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-2 justify-end">
                <div className="hidden sm:block">
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getSerapanColor(d.persentaseSerapan)}`}
                      style={{ width: `${d.persentaseSerapan}%` }}
                    />
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(d.status)}`}>
                  {d.persentaseSerapan}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 hidden sm:block">{formatRupiah(d.totalAnggaran)}</p>
            </div>
            <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
