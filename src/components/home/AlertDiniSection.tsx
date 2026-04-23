import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, TrendingDown, ArrowRight } from "lucide-react";
import { Desa } from "@/lib/types";
import { SECTION } from "@/lib/copy";
import { ASSETS } from "@/lib/assets";
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
    <div className="rounded-2xl border border-rose-200 overflow-hidden">

      {/* Header — ilustrasi desa bermasalah sebagai background */}
      <div className="relative h-48 sm:h-52 w-full">
        <Image
          src={ASSETS.illustrationAlert}
          alt="Ilustrasi desa dengan infrastruktur bermasalah"
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        {/* Overlay gelap agar teks terbaca */}
        <div className="absolute inset-0 bg-gradient-to-t from-rose-950/85 via-rose-900/50 to-rose-900/20" />

        {/* Teks judul di atas ilustrasi */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-rose-500/80 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white drop-shadow">{SECTION.alertDini}</h2>
          </div>
          <p className="text-xs text-rose-200 ml-9">{SECTION.alertDiniSub(kritis.length)}</p>
        </div>
      </div>

      {/* Kartu desa kritis */}
      <div className="bg-rose-50 p-4">
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
    </div>
  );
}
