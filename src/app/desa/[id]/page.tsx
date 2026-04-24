import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft, MapPin, Users, Tag, Calendar,
  TrendingUp, Wallet, CheckCircle2, Clock,
  FileText, ExternalLink, Megaphone, ArrowRight,
} from "lucide-react";
import { mockDesa } from "@/lib/mock-data";
import { formatRupiah, formatRupiahFull, getStatusColor, getStatusLabel, getSerapanColor } from "@/lib/utils";
import { SECTION, BUDGET_ITEMS, PENDAPATAN, DOKUMEN, PENGADUAN } from "@/lib/copy";
import { getAbsorptionVerdict } from "@/lib/verdicts";
import { ASSETS } from "@/lib/assets";
import SeharusnyaAdaSection from "@/components/desa/SeharusnyaAdaSection";
import BudgetBarChart from "@/components/desa/BudgetBarChart";
import APBDesBreakdown from "@/components/desa/APBDesBreakdown";
import SkorTransparansiCard from "@/components/desa/SkorTransparansiCard";
import OutputFisikCards from "@/components/desa/OutputFisikCards";
import PerangkatDesaSection from "@/components/desa/PerangkatDesaSection";
import RiwayatChart from "@/components/desa/RiwayatChart";
import DownloadButton from "@/components/desa/DownloadButton";
import TanggungJawabSection from "@/components/desa/TanggungJawabSection";
import VerdictBanner from "@/components/ui/VerdictBanner";
import { getVoicesForDesa } from "@/lib/citizen-voice";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return mockDesa.map((d) => ({ id: d.id }));
}

export default async function DesaDetailPage({ params }: Props) {
  const { id }  = await params;
  const desa    = mockDesa.find((d) => d.id === id);

  if (!desa) return notFound();

  const selisih           = desa.totalAnggaran - desa.terealisasi;
  const absorptionVerdict = getAbsorptionVerdict(desa.persentaseSerapan, selisih);
  const voicePreview      = getVoicesForDesa(desa.id).slice(0, 2);

  const infoItems = [
    { icon: MapPin,   label: "Kecamatan",      value: desa.kecamatan },
    { icon: MapPin,   label: "Kabupaten/Kota",  value: desa.kabupaten },
    { icon: MapPin,   label: "Provinsi",         value: desa.provinsi },
    { icon: Users,    label: "Jumlah Penduduk", value: `${desa.penduduk.toLocaleString("id-ID")} jiwa` },
    { icon: Tag,      label: "Fokus Program",   value: desa.kategori },
    { icon: Calendar, label: "Tahun Anggaran",  value: desa.tahun.toString() },
  ];

  const budgetItems = [
    { icon: Wallet,       label: BUDGET_ITEMS.totalAnggaran.label, value: formatRupiahFull(desa.totalAnggaran), color: "text-indigo-600",  bg: "bg-indigo-50" },
    { icon: CheckCircle2, label: BUDGET_ITEMS.terealisasi.label,   value: formatRupiahFull(desa.terealisasi),   color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Clock,        label: BUDGET_ITEMS.belumTerserap.label, value: formatRupiahFull(selisih),             color: "text-rose-600",    bg: "bg-rose-50" },
    { icon: TrendingUp,   label: BUDGET_ITEMS.persentase.label,    value: `${desa.persentaseSerapan}%`,          color: "text-amber-600",   bg: "bg-amber-50" },
  ];

  const pendapatan = desa.pendapatan;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Back + Download */}
      <div className="flex items-center justify-between">
        <Link href="/desa" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={15} />
          Kembali ke Daftar Desa
        </Link>
        <DownloadButton desa={desa} />
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{desa.nama}</h1>
            <div className="flex items-center gap-1.5 mt-1.5 text-slate-500">
              <MapPin size={14} />
              <span className="text-sm">{desa.kecamatan}, {desa.kabupaten}, {desa.provinsi}</span>
            </div>
          </div>
          <span className={`self-start text-sm font-semibold px-3 py-1 rounded-full border ${getStatusColor(desa.status)}`}>
            {getStatusLabel(desa.status)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Anggaran yang sudah dipakai tahun {desa.tahun}</span>
            <span className="font-bold text-slate-700 text-sm">{desa.persentaseSerapan}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getSerapanColor(desa.persentaseSerapan)}`}
              style={{ width: `${desa.persentaseSerapan}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1.5">
            <span>Rp 0</span>
            <span>{formatRupiah(desa.totalAnggaran)}</span>
          </div>
        </div>

        {/* Verdict manusiawi langsung di bawah progress bar */}
        <div className="mt-3">
          <VerdictBanner verdict={absorptionVerdict} />
        </div>
      </div>

      {/* Seharusnya Ada Apa — hak warga berdasarkan anggaran */}
      <SeharusnyaAdaSection desa={desa} />

      {/* Budget Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {budgetItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className={`inline-flex p-2 rounded-xl ${item.bg} mb-2`}>
                <Icon size={16} className={item.color} />
              </div>
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              <p className={`text-base font-bold ${item.color} leading-tight`}>{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Sumber Pendapatan */}
      {pendapatan && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-1">{SECTION.pendapatan}</h2>
          <p className="text-xs text-slate-500 mb-4">{SECTION.pendapatanSub}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(
              [
                { key: "danaDesa",        amount: pendapatan.danaDesa,        color: "bg-indigo-500" },
                { key: "add",             amount: pendapatan.add,             color: "bg-sky-500" },
                { key: "pades",           amount: pendapatan.pades,           color: "bg-emerald-500" },
                { key: "bantuanKeuangan", amount: pendapatan.bantuanKeuangan, color: "bg-violet-500" },
              ] as const
            ).map((s) => {
              const info = PENDAPATAN[s.key];
              return (
                <div key={s.key} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <div className={`w-2 h-2 rounded-full ${s.color} mb-2`} />
                  <p className="text-xs text-slate-500 mb-1 leading-tight">{info.label}</p>
                  <p className="text-xs text-slate-400 mb-2 italic">{info.hint}</p>
                  <p className="text-sm font-bold text-slate-800">{formatRupiah(s.amount)}</p>
                  <p className="text-xs text-slate-400">
                    {Math.round((s.amount / desa.totalAnggaran) * 100)}% dari total
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skor Transparansi + Info Desa */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          {desa.skorTransparansi && <SkorTransparansiCard skor={desa.skorTransparansi} />}
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Informasi Desa</h2>
          <div className="space-y-3">
            {infoItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={13} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="text-sm font-medium text-slate-700">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Output Fisik */}
      {desa.outputFisik && <OutputFisikCards items={desa.outputFisik} />}

      {/* Chart + APBDes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BudgetBarChart desa={desa} />
        {desa.apbdes && <APBDesBreakdown items={desa.apbdes} />}
      </div>

      {/* Riwayat */}
      {desa.riwayat && <RiwayatChart riwayat={desa.riwayat} />}

      {/* Perangkat Desa */}
      {desa.perangkat && <PerangkatDesaSection perangkat={desa.perangkat} />}

      {/* Dokumen Publik */}
      {desa.dokumen && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header dengan ilustrasi */}
          <div className="flex flex-col sm:flex-row items-center gap-0">
            {/* Ilustrasi dokumen */}
            <div className="relative w-full sm:w-56 h-44 flex-shrink-0">
              <Image
                src={ASSETS.illustrationDocs}
                alt="Ilustrasi dokumen publik desa"
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, 224px"
              />
            </div>

            {/* Teks header */}
            <div className="flex-1 p-5">
              <h2 className="text-base font-semibold text-slate-800 mb-1">{SECTION.dokumen}</h2>
              <p className="text-xs text-slate-500">{SECTION.dokumenSub}</p>
            </div>
          </div>

          {/* Daftar dokumen */}
          <div className="px-5 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {desa.dokumen.map((dok, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    dok.tersedia
                      ? "border-emerald-100 bg-emerald-50"
                      : "border-slate-100 bg-slate-50 opacity-70"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${dok.tersedia ? "bg-emerald-100" : "bg-slate-200"}`}>
                    <FileText size={14} className={dok.tersedia ? "text-emerald-600" : "text-slate-400"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">{dok.nama}</p>
                    <p className="text-xs text-slate-400">{dok.jenis} · {dok.tahun}</p>
                  </div>
                  {dok.tersedia ? (
                    <button className="flex-shrink-0 text-emerald-600 hover:text-emerald-700" title={DOKUMEN.tersedia}>
                      <ExternalLink size={13} />
                    </button>
                  ) : (
                    <span className="flex-shrink-0 text-xs text-rose-500 font-medium text-right leading-tight max-w-[70px]">
                      {DOKUMEN.belum}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Siapa yang Bertanggung Jawab */}
      <TanggungJawabSection desa={desa} />

      {/* Suara Warga — preview card → link ke halaman terpisah */}
      <Link
        href={`/desa/${desa.id}/suara`}
        className="group block rounded-2xl overflow-hidden border border-indigo-100 shadow-sm hover:shadow-md transition-all"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Megaphone size={17} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Suara Warga</p>
              <p className="text-xs text-indigo-200">
                {voicePreview.length > 0
                  ? `${getVoicesForDesa(desa.id).length} warga sudah bersuara — lihat & tambahkan ceritamu`
                  : "Belum ada suara — jadilah yang pertama bercerita"}
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-indigo-200 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>

        {/* Preview voices */}
        {voicePreview.length > 0 && (
          <div className="bg-white divide-y divide-slate-50">
            {voicePreview.map((v) => (
              <div key={v.id} className="px-5 py-3 flex items-start gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">
                  {/* emoji from category */}
                  {["🛣️","💰","🏫","📋","🌿","💬"][["infrastruktur","bansos","fasilitas","anggaran","lingkungan","lainnya"].indexOf(v.category)] ?? "💬"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{v.text}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{v.author}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="bg-indigo-50 px-5 py-2.5 flex items-center justify-between">
          <span className="text-xs text-indigo-600 font-semibold">Lihat semua suara & tambahkan ceritamu</span>
          <ArrowRight size={13} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* Pak Waspada + tombol lapor ringkas */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
        <div className="flex items-end">
          <div className="flex-1 p-5">
            <h2 className="text-sm font-semibold text-amber-800 mb-1">{PENGADUAN.title}</h2>
            <p className="text-xs text-amber-700 mb-4">{PENGADUAN.subtitle}</p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://www.lapor.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
              >
                <ExternalLink size={11} />
                {PENGADUAN.lapor}
              </a>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg">
                {PENGADUAN.inspektorat(desa.kabupaten)}
              </span>
            </div>
          </div>
          <div className="hidden sm:block flex-shrink-0 w-32">
            <Image
              src={ASSETS.mascotStanding}
              alt="Pak Waspada siap mengawasi"
              width={128}
              height={170}
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
        <strong>Catatan:</strong> Data yang ditampilkan bersifat ilustrasi. Integrasi dengan data resmi SIPD, OMSPAN, dan OpenData DJPK Kemenkeu sedang disiapkan.
      </div>
    </div>
  );
}
