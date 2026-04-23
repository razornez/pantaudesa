import Link from "next/link";
import { ArrowRight, Search, BarChart3 } from "lucide-react";
import StatsCards from "@/components/home/StatsCards";
import TrendChart from "@/components/home/TrendChart";
import SerapanDonut from "@/components/home/SerapanDonut";
import TopDesaTable from "@/components/home/TopDesaTable";
import AlertDiniSection from "@/components/home/AlertDiniSection";
import { mockSummaryStats, mockTrendData, mockDesa } from "@/lib/mock-data";
import { HERO, SECTION } from "@/lib/copy";

export default function HomePage() {
  const topBaik = [...mockDesa]
    .filter((d) => d.status === "baik")
    .sort((a, b) => b.persentaseSerapan - a.persentaseSerapan)
    .slice(0, 5);

  const topRendah = [...mockDesa]
    .filter((d) => d.status === "rendah")
    .sort((a, b) => a.persentaseSerapan - b.persentaseSerapan)
    .slice(0, 5);

  // Agregasi rata-rata per provinsi
  const byProvinsi = mockDesa.reduce<Record<string, { total: number; count: number }>>((acc, d) => {
    if (!acc[d.provinsi]) acc[d.provinsi] = { total: 0, count: 0 };
    acc[d.provinsi].total += d.persentaseSerapan;
    acc[d.provinsi].count += 1;
    return acc;
  }, {});

  const provinsiRanking = Object.entries(byProvinsi)
    .map(([provinsi, { total, count }]) => ({ provinsi, avg: Math.round(total / count) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700/80 via-indigo-600/75 to-violet-700/80 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            {HERO.badge(2024, mockDesa.length)}
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 leading-tight">
            {HERO.title}
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mb-6">
            {HERO.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/desa"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-sm shadow-md"
            >
              <Search size={16} />
              {HERO.ctaSearch}
            </Link>
            <Link
              href="/desa"
              className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/25 transition-colors text-sm border border-white/20"
            >
              {HERO.ctaAll}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-14 -right-6 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/5 rounded-full" />
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">{SECTION.ringkasanNasional}</h2>
        <p className="text-sm text-slate-500 mb-4">{SECTION.ringkasanNasionalSub}</p>
        <StatsCards stats={mockSummaryStats} />
      </div>

      {/* Peringatan Dini */}
      <AlertDiniSection desa={mockDesa} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TrendChart data={mockTrendData} />
        </div>
        <div>
          <SerapanDonut stats={mockSummaryStats} />
        </div>
      </div>

      {/* Top Desa Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopDesaTable
          desa={topBaik}
          title={SECTION.topBaik}
          subtitle={SECTION.topBaikSub}
        />
        <TopDesaTable
          desa={topRendah}
          title={SECTION.topRendah}
          subtitle={SECTION.topRendahSub}
        />
      </div>

      {/* Peringkat Provinsi */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={16} className="text-indigo-500" />
          <h2 className="text-base font-semibold text-slate-800">{SECTION.peringkat}</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4 ml-6">{SECTION.peringkatSub}</p>
        <div className="space-y-2.5">
          {provinsiRanking.map((p, i) => {
            const barColor  = p.avg >= 85 ? "bg-emerald-500" : p.avg >= 60 ? "bg-amber-500" : "bg-rose-500";
            const textColor = p.avg >= 85 ? "text-emerald-600" : p.avg >= 60 ? "text-amber-600" : "text-rose-600";
            return (
              <div key={p.provinsi} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-slate-400 text-right flex-shrink-0">{i + 1}</span>
                <span className="text-sm text-slate-700 w-44 flex-shrink-0 truncate">{p.provinsi}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${p.avg}%` }} />
                </div>
                <span className={`text-sm font-bold ${textColor} w-10 text-right flex-shrink-0`}>{p.avg}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
        <p className="text-slate-600 text-sm mb-3">
          Masih penasaran? Cari desamu dan temukan jawabannya langsung.
        </p>
        <Link
          href="/desa"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-md"
        >
          Cari Desamu Sekarang <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
