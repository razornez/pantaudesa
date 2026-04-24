import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { mockDesa } from "@/lib/mock-data";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import SuaraWargaSection from "@/components/desa/SuaraWargaSection";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return mockDesa.map((d) => ({ id: d.id }));
}

export default async function SuaraWargaDesaPage({ params }: Props) {
  const { id } = await params;
  const desa   = mockDesa.find((d) => d.id === id);

  if (!desa) return notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Navigasi balik */}
      <Link
        href={`/desa/${id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={15} />
        Kembali ke profil {desa.nama}
      </Link>

      {/* Mini header desa */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900">{desa.nama}</h1>
          <div className="flex items-center gap-1 mt-0.5 text-slate-400">
            <MapPin size={12} />
            <span className="text-xs">{desa.kecamatan}, {desa.kabupaten}</span>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(desa.status)}`}>
          {getStatusLabel(desa.status)}
        </span>
      </div>

      {/* Suara Warga full */}
      <SuaraWargaSection desaId={desa.id} desaNama={desa.nama} />
    </div>
  );
}
