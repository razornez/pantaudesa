import { TrendingUp, MapPin, Wallet, CheckCircle2, AlertCircle, XCircle, Shield } from "lucide-react";
import { SummaryStats } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { STATS, SKOR } from "@/lib/copy";

interface Props {
  stats: SummaryStats;
}

function skorLabel(skor: number): string {
  if (skor >= 80) return "Cukup Terbuka";
  if (skor >= 60) return "Perlu Ditingkatkan";
  return "Kurang Terbuka";
}

function skorColors(skor: number): { text: string; bg: string; ring: string } {
  if (skor >= 80) return { text: "text-emerald-600", bg: "bg-emerald-50", ring: "border-emerald-200" };
  if (skor >= 60) return { text: "text-amber-600",   bg: "bg-amber-50",   ring: "border-amber-200" };
  return           { text: "text-rose-600",    bg: "bg-rose-50",    ring: "border-rose-200" };
}

export default function StatsCards({ stats }: Props) {
  const pctBaik   = Math.round((stats.desaSerapanBaik   / stats.totalDesa) * 100);
  const pctSedang = Math.round((stats.desaSerapanSedang / stats.totalDesa) * 100);
  const pctRendah = Math.round((stats.desaSerapanRendah / stats.totalDesa) * 100);

  const cards = [
    {
      label: STATS.totalAnggaran.label,
      value: formatRupiah(stats.totalAnggaranNasional),
      sub:   STATS.totalAnggaran.sub(formatRupiah(stats.totalTerealisasi)),
      icon:  Wallet,
      color: "text-indigo-600",
      bg:    "bg-indigo-50",
    },
    {
      label: STATS.totalDesa.label,
      value: stats.totalDesa.toLocaleString("id-ID"),
      sub:   STATS.totalDesa.sub,
      icon:  MapPin,
      color: "text-sky-600",
      bg:    "bg-sky-50",
    },
    {
      label: STATS.rataRataSerapan.label,
      value: `${stats.rataRataSerapan}%`,
      sub:   STATS.rataRataSerapan.sub,
      icon:  TrendingUp,
      color: "text-emerald-600",
      bg:    "bg-emerald-50",
    },
    {
      label: STATS.desaBaik.label,
      value: stats.desaSerapanBaik,
      sub:   STATS.desaBaik.sub(pctBaik),
      icon:  CheckCircle2,
      color: "text-emerald-600",
      bg:    "bg-emerald-50",
    },
    {
      label: STATS.desaSedang.label,
      value: stats.desaSerapanSedang,
      sub:   STATS.desaSedang.sub(pctSedang),
      icon:  AlertCircle,
      color: "text-amber-600",
      bg:    "bg-amber-50",
    },
    {
      label: STATS.desaRendah.label,
      value: stats.desaSerapanRendah,
      sub:   STATS.desaRendah.sub(pctRendah),
      icon:  XCircle,
      color: "text-rose-600",
      bg:    "bg-rose-50",
    },
  ];

  const { text: skorText, bg: skorBg, ring: skorRing } = skorColors(stats.rataRataSkorTransparansi);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-2 rounded-xl ${card.bg} mb-3`}>
                <Icon size={18} className={card.color} />
              </div>
              <p className="text-xs text-slate-500 font-medium mb-1">{card.label}</p>
              <p className={`text-xl sm:text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Skor Transparansi Nasional */}
      <div className={`rounded-2xl border p-4 flex items-center justify-between gap-4 ${skorBg} ${skorRing}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm flex-shrink-0">
            <Shield size={20} className={skorText} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{SKOR.nationalLabel}</p>
            <p className="text-xs text-slate-500">{SKOR.nationalSub}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-3xl font-black ${skorText}`}>
            {stats.rataRataSkorTransparansi}
            <span className="text-sm font-normal text-slate-400">/100</span>
          </p>
          <p className={`text-xs font-semibold ${skorText}`}>{skorLabel(stats.rataRataSkorTransparansi)}</p>
        </div>
      </div>
    </div>
  );
}
