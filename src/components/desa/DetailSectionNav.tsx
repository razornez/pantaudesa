import { BadgeCheck, FileText, HelpCircle, Landmark, Wallet } from "lucide-react";

const sections = [
  { href: "#ringkasan", label: "Ringkasan", icon: BadgeCheck },
  { href: "#anggaran", label: "Anggaran", icon: Wallet },
  { href: "#dokumen-transparansi", label: "Dokumen & Transparansi", icon: FileText },
  { href: "#panduan-warga", label: "Panduan Warga", icon: HelpCircle },
];

const metricGroups = [
  {
    title: "Utama",
    items: "Status data, total anggaran, serapan, dokumen tersedia",
  },
  {
    title: "Pendukung",
    items: "Aset desa, skor keterbukaan, rincian sumber dana",
  },
  {
    title: "Lanjutan",
    items: "Daftar aset, panduan kewenangan, jalur pelaporan",
  },
];

export default function DetailSectionNav() {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 sm:flex">
          <Landmark size={16} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">Baca halaman ini dari ringkasan dulu.</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Angka utama ditempatkan lebih awal. Angka pendukung dan panduan warga ada setelah sumber, dokumen, dan konteks data.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <a
              key={section.href}
              href={section.href}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Icon size={14} aria-hidden />
              {section.label}
            </a>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {metricGroups.map((group) => (
          <div key={group.title} className="rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {group.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{group.items}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
