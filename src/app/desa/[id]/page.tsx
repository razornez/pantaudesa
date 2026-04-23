import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Users, Tag, Calendar, TrendingUp, Wallet, CheckCircle2, Clock } from "lucide-react";
import { mockDesa } from "@/lib/mock-data";
import { formatRupiah, formatRupiahFull, getStatusColor, getStatusLabel, getSerapanColor } from "@/lib/utils";
import BudgetBarChart from "@/components/desa/BudgetBarChart";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return mockDesa.map((d) => ({ id: d.id }));
}

export default async function DesaDetailPage({ params }: Props) {
  const { id } = await params;
  const desa = mockDesa.find((d) => d.id === id);

  if (!desa) return notFound();

  const selisih = desa.totalAnggaran - desa.terealisasi;

  const infoItems = [
    { icon: MapPin, label: "Kecamatan", value: desa.kecamatan },
    { icon: MapPin, label: "Kabupaten/Kota", value: desa.kabupaten },
    { icon: MapPin, label: "Provinsi", value: desa.provinsi },
    { icon: Users, label: "Jumlah Penduduk", value: `${desa.penduduk.toLocaleString("id-ID")} jiwa` },
    { icon: Tag, label: "Kategori Fokus", value: desa.kategori },
    { icon: Calendar, label: "Tahun Anggaran", value: desa.tahun.toString() },
  ];

  const budgetItems = [
    { icon: Wallet, label: "Total Anggaran", value: formatRupiahFull(desa.totalAnggaran), color: "text-indigo-600", bg: "bg-indigo-50" },
    { icon: CheckCircle2, label: "Terealisasi", value: formatRupiahFull(desa.terealisasi), color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Clock, label: "Belum Terserap", value: formatRupiahFull(selisih), color: "text-rose-600", bg: "bg-rose-50" },
    { icon: TrendingUp, label: "Persentase Serapan", value: `${desa.persentaseSerapan}%`, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back */}
      <Link
        href="/desa"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={15} />
        Kembali ke Daftar Desa
      </Link>

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
            Serapan {getStatusLabel(desa.status)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Penyerapan Anggaran {desa.tahun}</span>
            <span className="font-semibold text-slate-700">{desa.persentaseSerapan}%</span>
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
      </div>

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

      {/* Chart + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <BudgetBarChart desa={desa} />
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

      {/* Note */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-700">
        <strong>Catatan:</strong> Data yang ditampilkan bersifat ilustrasi. Integrasi dengan API resmi (SIPD, OMSPAN, OpenData DJPK) akan tersedia pada versi berikutnya.
      </div>
    </div>
  );
}
