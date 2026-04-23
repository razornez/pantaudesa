import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import StatsCards from "@/components/home/StatsCards";
import TrendChart from "@/components/home/TrendChart";
import SerapanDonut from "@/components/home/SerapanDonut";
import TopDesaTable from "@/components/home/TopDesaTable";
import { mockSummaryStats, mockTrendData, mockDesa } from "@/lib/mock-data";

export default function HomePage() {
  const topBaik = [...mockDesa]
    .filter((d) => d.status === "baik")
    .sort((a, b) => b.persentaseSerapan - a.persentaseSerapan)
    .slice(0, 5);

  const topRendah = [...mockDesa]
    .filter((d) => d.status === "rendah")
    .sort((a, b) => a.persentaseSerapan - b.persentaseSerapan)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Data Anggaran Tahun 2024
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 leading-tight">
            Transparansi Penyerapan<br className="hidden sm:block" /> Anggaran Dana Desa
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mb-6">
            Pantau realisasi dan penyerapan anggaran dari seluruh desa di Indonesia secara real-time dan transparan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/desa"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-sm shadow-md"
            >
              <Search size={16} />
              Cari Data Desa
            </Link>
            <Link
              href="/desa"
              className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/25 transition-colors text-sm border border-white/20"
            >
              Lihat Semua Desa
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-14 -right-6 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/5 rounded-full" />
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Ringkasan Nasional</h2>
        <StatsCards stats={mockSummaryStats} />
      </div>

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
          title="Desa Serapan Terbaik"
          subtitle="5 desa dengan persentase serapan tertinggi"
        />
        <TopDesaTable
          desa={topRendah}
          title="Perlu Perhatian"
          subtitle="5 desa dengan serapan terendah yang perlu monitoring"
        />
      </div>

      {/* CTA */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
        <p className="text-slate-600 text-sm mb-3">
          Temukan data lengkap dari seluruh desa yang terpantau
        </p>
        <Link
          href="/desa"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-md"
        >
          Lihat Semua Data Desa <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
