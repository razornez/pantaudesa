import { TrendingUp, MapPin, Wallet, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { SummaryStats } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

interface Props {
  stats: SummaryStats;
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: "Total Anggaran Nasional",
      value: formatRupiah(stats.totalAnggaranNasional),
      sub: `Terealisasi ${formatRupiah(stats.totalTerealisasi)}`,
      icon: Wallet,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Desa Terpantau",
      value: stats.totalDesa.toLocaleString("id-ID"),
      sub: "Desa aktif dilaporkan",
      icon: MapPin,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "Rata-rata Serapan",
      value: `${stats.rataRataSerapan}%`,
      sub: "Dari seluruh desa",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Serapan Baik (≥85%)",
      value: stats.desaSerapanBaik,
      sub: `${Math.round((stats.desaSerapanBaik / stats.totalDesa) * 100)}% dari total desa`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Serapan Sedang (60–84%)",
      value: stats.desaSerapanSedang,
      sub: `${Math.round((stats.desaSerapanSedang / stats.totalDesa) * 100)}% dari total desa`,
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Serapan Rendah (<60%)",
      value: stats.desaSerapanRendah,
      sub: `${Math.round((stats.desaSerapanRendah / stats.totalDesa) * 100)}% dari total desa`,
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
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
  );
}
