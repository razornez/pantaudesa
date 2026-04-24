import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart3 } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import StatsCards from "@/components/home/StatsCards";
import TrendChart from "@/components/home/TrendChart";
import SerapanDonut from "@/components/home/SerapanDonut";
import TopDesaTable from "@/components/home/TopDesaTable";
import AlertDiniSection from "@/components/home/AlertDiniSection";
import { mockSummaryStats, mockTrendData, mockDesa } from "@/lib/mock-data";
import { SECTION } from "@/lib/copy";
import { ASSETS } from "@/lib/assets";

export default function HomePage() {
  const topBaik = [...mockDesa]
    .filter((d) => d.status === "baik")
    .sort((a, b) => b.persentaseSerapan - a.persentaseSerapan)
    .slice(0, 5);

  const topRendah = [...mockDesa]
    .filter((d) => d.status === "rendah")
    .sort((a, b) => a.persentaseSerapan - b.persentaseSerapan)
    .slice(0, 5);

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

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection totalDesa={mockDesa.length} tahun={2024} />

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">{SECTION.ringkasanNasional}</h2>
        <p className="text-sm text-slate-500 mb-4">{SECTION.ringkasanNasionalSub}</p>
        <StatsCards stats={mockSummaryStats} />
      </div>

      {/* ── Peringatan Dini ───────────────────────────────────────────────── */}
      <AlertDiniSection desa={mockDesa} />

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TrendChart data={mockTrendData} />
        </div>
        <div>
          <SerapanDonut stats={mockSummaryStats} />
        </div>
      </div>

      {/* ── Top Desa Tables ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopDesaTable desa={topBaik}   title={SECTION.topBaik}   subtitle={SECTION.topBaikSub} />
        <TopDesaTable desa={topRendah} title={SECTION.topRendah} subtitle={SECTION.topRendahSub} />
      </div>

      {/* ── Peringkat Provinsi ────────────────────────────────────────────── */}
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

      {/* ── CTA + Citizen Illustration ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="relative w-full lg:w-80 h-56 lg:h-auto flex-shrink-0">
            <Image
              src={ASSETS.illustrationCitizen}
              alt="Warga desa mengakses data anggaran desanya"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 320px"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 text-center lg:text-left">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Ini hakmu sebagai warga.</h2>
            <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto lg:mx-0">
              Data anggaran desamu adalah milik publik — bukan milik kepala desa, bukan milik kabupaten.
              Temukan fakta di balik angka-angka itu dan jadilah bagian dari pengawasan.
            </p>
            <div>
              <Link
                href="/desa"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-md"
              >
                Cari Desamu Sekarang <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
