import {
  ArrowRight,
  FileText,
  Globe2,
  Info,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { Desa } from "@/lib/types";
import { DATA_STATUS_COPY } from "@/lib/copy";
import { DataStatusBadge, type DataStatusKind } from "@/components/ui/DataStatusBadge";

interface Props {
  desa: Desa;
}

export default function DesaDetailFirstView({ desa }: Props) {
  const profil = desa.profil;
  const availableDocs = desa.dokumen?.filter((doc) => doc.tersedia).length ?? 0;
  const totalDocs = desa.dokumen?.length ?? 0;
  const hasWebsite = Boolean(profil?.website);

  const quickFacts = [
    {
      label: "Status data",
      value: DATA_STATUS_COPY.demo.label,
      body: "Contoh tampilan, bukan data resmi final.",
      icon: ShieldCheck,
      statusKind: "demo" as DataStatusKind,
    },
    {
      label: "Sumber publik",
      value: hasWebsite ? "Sumber ditemukan" : "Belum tercatat",
      body: hasWebsite ? "Website desa tersedia untuk mulai dicek." : "Sumber web belum tercatat di data demo.",
      icon: Globe2,
      statusKind: hasWebsite ? "source-found" as DataStatusKind : undefined,
    },
    {
      label: "Dokumen",
      value: totalDocs > 0 ? `${availableDocs}/${totalDocs} tersedia` : "Belum tercatat",
      body: "Dokumen dibaca sebagai referensi, bukan kesimpulan angka final.",
      icon: FileText,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                <MapPin size={13} />
                Kartu Identitas Desa
              </span>
              <DataStatusBadge status="demo" size="md" />
            </div>

            <h1 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              {desa.nama}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {desa.kecamatan}, {desa.kabupaten}, {desa.provinsi}
            </p>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600">
              Baca informasi publik {desa.nama} dengan status sumber yang jelas. PantauDesa membantu warga melihat sumber dan dokumen yang tersedia sebelum membuat kesimpulan.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href="#dokumen-desa"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Lihat Dokumen
                <ArrowRight size={14} />
              </a>
              <a
                href="#status-data"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cara Membaca Data
              </a>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <p className="text-sm font-black text-slate-900">Yang perlu kamu tahu dulu</p>
            <div className="mt-3 space-y-3">
              {quickFacts.map((fact) => {
                const Icon = fact.icon;
                return (
                  <div key={fact.label} className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{fact.label}</p>
                        <div className="mt-1">
                          {fact.statusKind
                            ? <DataStatusBadge status={fact.statusKind} />
                            : <p className="text-sm font-black text-slate-900">{fact.value}</p>
                          }
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{fact.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div id="status-data" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
            <Info size={15} />
          </div>
          <div className="min-w-0">
            <DataStatusBadge status="demo" />
            <p className="mt-2 text-sm font-bold text-slate-800">Data halaman ini masih untuk panduan baca.</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Ini data demo untuk membantu melihat alur PantauDesa. Belum mewakili data resmi final, dan angka APBDes tidak boleh dibaca sebagai kesimpulan sebelum sumbernya direview.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
