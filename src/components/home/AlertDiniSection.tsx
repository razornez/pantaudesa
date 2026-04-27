import Link from "next/link";
import Image from "next/image";
import { Search, TrendingDown, ArrowRight } from "lucide-react";
import { Desa } from "@/lib/types";
import { SECTION } from "@/lib/copy";
import { ASSETS } from "@/lib/assets";
import { isDowntrending } from "@/lib/verdicts";

interface Props {
  desa: Desa[];
}

export default function AlertDiniSection({ desa }: Props) {
  const perluDitinjau = desa
    .filter((d) => d.persentaseSerapan < 50)
    .sort((a, b) => a.persentaseSerapan - b.persentaseSerapan)
    .slice(0, 4);

  if (perluDitinjau.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 overflow-hidden">

      {/* Header */}
      <div className="relative h-48 sm:h-52 w-full">
        <Image
          src={ASSETS.illustrationAlert}
          alt="Ilustrasi warga meninjau kondisi desa"
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-amber-900/20" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-amber-500/85 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Search size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white drop-shadow">{SECTION.alertDini}</h2>
          </div>
          <p className="text-xs text-amber-100 ml-9">{SECTION.alertDiniSub(perluDitinjau.length)}</p>
        </div>
      </div>

      {/* Kartu desa yang perlu ditinjau */}
      <div className="bg-amber-50 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {perluDitinjau.map((d) => (
            <Link
              key={d.id}
              href={`/desa/${d.id}`}
              className="group bg-white rounded-xl border border-amber-100 p-3.5 hover:border-amber-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-amber-700 transition-colors">
                  {d.nama}
                </p>
                {isDowntrending(d.riwayat) && (
                  <TrendingDown size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                )}
              </div>
              <p className="text-xs text-slate-500 mb-2">{d.kabupaten}, {d.provinsi}</p>

              <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${d.persentaseSerapan}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-amber-700">{d.persentaseSerapan}% perlu dicek</span>
                <ArrowRight size={12} className="text-amber-400 group-hover:text-amber-700 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
