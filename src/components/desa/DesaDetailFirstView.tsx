import {
  ArrowRight,
  FileText,
  Globe2,
  Info,
  Layers3,
  MapPin,
  ShieldCheck,
  Users2,
} from "lucide-react";
import type { Desa } from "@/lib/types";
import { DataStatusBadge, type DataStatusKind } from "@/components/ui/DataStatusBadge";

interface Props {
  desa: Desa;
}

export default function DesaDetailFirstView({ desa }: Props) {
  const profil = desa.profil;
  const availableDocs = desa.dokumen?.filter((doc) => doc.tersedia).length ?? 0;
  const totalDocs = desa.dokumen?.length ?? 0;
  const hasSource = (desa.jumlahSumber ?? 0) > 0 || Boolean(profil?.website);
  const primarySource = desa.sumber?.[0]?.nama ?? profil?.website;
  const overviewItems = [
    { label: "Penduduk", value: desa.penduduk > 0 ? `${desa.penduduk.toLocaleString("id-ID")} jiwa` : "Belum tercatat", icon: Users2 },
    { label: "Sumber", value: `${desa.jumlahSumber ?? 0} sumber`, icon: Globe2 },
    { label: "Dokumen", value: `${desa.jumlahDokumenPendukung ?? totalDocs} dokumen`, icon: FileText },
    { label: "Kategori", value: desa.kategori, icon: Layers3 },
  ];

  const quickFacts = [
    {
      label: "Status data",
      value: "Panduan baca",
      body: "Angka yang bertanda (mock) adalah contoh, bukan kesimpulan resmi.",
      icon: ShieldCheck,
    },
    {
      label: "Sumber publik",
      value: hasSource ? "Sumber ditemukan" : "Belum tercatat",
      body: hasSource ? `Rujukan awal: ${primarySource}.` : "Sumber publik belum tercatat.",
      icon: Globe2,
      statusKind: hasSource ? "source-found" as DataStatusKind : undefined,
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
      <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/35 to-sky-50 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                <MapPin size={13} />
                Kartu Identitas Desa
              </span>
              {desa.identityStatus === "needs-review"
                ? <DataStatusBadge status="needs-review" size="md" />
                : hasSource && <DataStatusBadge status="source-found" size="md" />}
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
            {desa.terakhirDiperbaruiLabel && (
              <p className="mt-3 text-xs font-semibold text-slate-500">
                {desa.terakhirDiperbaruiLabel}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {overviewItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-white bg-white/75 px-3 py-2.5 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      <Icon size={11} aria-hidden />
                      {item.label}
                    </div>
                    <p className="mt-1 truncate text-xs font-black text-slate-800">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href="#dokumen-desa"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Lihat Dokumen
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <p className="text-sm font-black text-slate-900">Yang perlu kamu tahu dulu</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Baca sumbernya dulu. Nilai contoh ditandai (mock), dan dokumen asli tetap jadi rujukan utama.
            </p>
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
            <p className="text-sm font-bold text-slate-800">Baca angka dengan konteks sumber.</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Nilai yang bertanda (mock) dipakai sebagai contoh tampilan. Gunakan sumber dan dokumen di bawah ini sebelum menjadikan angka sebagai rujukan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
