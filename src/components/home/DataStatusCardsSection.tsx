import {
  BadgeCheck,
  Database,
  FileSearch,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type StatusCard = {
  label: string;
  body: string;
  note: string;
  icon: LucideIcon;
  tone: string;
};

const statusCards: StatusCard[] = [
  {
    label: "Data Demo",
    body: "Contoh tampilan untuk menguji pengalaman warga.",
    note: "Bukan data resmi final.",
    icon: Database,
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    label: "Sumber Ditemukan",
    body: "Ada tautan atau dokumen publik yang bisa ditelusuri.",
    note: "Masih perlu dibaca konteksnya.",
    icon: FileSearch,
    tone: "border-sky-200 bg-sky-50 text-sky-800",
  },
  {
    label: "Perlu Review",
    body: "Isi atau sumbernya belum cukup untuk disimpulkan.",
    note: "Perlu dicek ulang.",
    icon: BadgeCheck,
    tone: "border-violet-200 bg-violet-50 text-violet-800",
  },
  {
    label: "Terverifikasi",
    body: "Status masa depan setelah ada alur review yang jelas.",
    note: "Belum dipakai untuk data demo.",
    icon: ShieldCheck,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
];

export default function DataStatusCardsSection() {
  return (
    <section>
      <div className="mb-4 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Status data</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-800">
          Jangan langsung percaya angka tanpa melihat statusnya
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Setiap informasi perlu dibaca bersama sumber, status, dan tahap reviewnya.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`rounded-2xl border p-4 ${card.tone}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/75">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-black">{card.label}</p>
                  <p className="mt-1.5 text-xs leading-relaxed opacity-90">{card.body}</p>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-wide opacity-75">
                    {card.note}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
