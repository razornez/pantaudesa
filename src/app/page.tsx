import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import StatsCards from "@/components/home/StatsCards";
import TrendChart from "@/components/home/TrendChart";
import SerapanDonut from "@/components/home/SerapanDonut";
import DesaLeaderboard from "@/components/home/DesaLeaderboard";
import AlertDiniSection from "@/components/home/AlertDiniSection";
import { mockSummaryStats, mockTrendData, mockDesa } from "@/lib/mock-data";
import type { Desa } from "@/lib/types";
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

  // Provinsi ranking — includes best desa name per province
  const byProvinsi = mockDesa.reduce<Record<string, { total: number; count: number; best: Desa }>>((acc, d) => {
    if (!acc[d.provinsi]) acc[d.provinsi] = { total: 0, count: 0, best: d };
    acc[d.provinsi].total += d.persentaseSerapan;
    acc[d.provinsi].count += 1;
    if (d.persentaseSerapan > acc[d.provinsi].best.persentaseSerapan) acc[d.provinsi].best = d;
    return acc;
  }, {});

  const provinsiRanking = Object.entries(byProvinsi)
    .map(([provinsi, { total, count, best }]) => ({
      provinsi,
      avg:   Math.round(total / count),
      count,
      best:  best.nama.replace(/^Desa\s+/, ""),
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 7);

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

      {/* ── Charts + Leaderboard ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Charts kiri (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <TrendChart data={mockTrendData} />
          <SerapanDonut stats={mockSummaryStats} />
        </div>
        {/* Leaderboard kanan (1/3) — unified ranking */}
        <div className="lg:col-span-1">
          <DesaLeaderboard
            topBaik={topBaik}
            topRendah={topRendah}
            provinsiRanking={provinsiRanking}
          />
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
