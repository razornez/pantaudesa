import {
  Search,
  FileSearch,
  BadgeCheck,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

type Step = {
  title: string;
  body: string;
  icon: LucideIcon;
};

const steps: Step[] = [
  {
    title: "Cari desa",
    body: "Mulai dari nama desa, kecamatan, atau kabupaten yang ingin kamu pahami.",
    icon: Search,
  },
  {
    title: "Lihat sumber",
    body: "Cek apakah dokumen atau tautan publiknya sudah ditemukan.",
    icon: FileSearch,
  },
  {
    title: "Baca status",
    body: "Bedakan data demo, impor, perlu review, dan data yang kelak terverifikasi.",
    icon: BadgeCheck,
  },
  {
    title: "Tanya tepat",
    body: "Gunakan temuan awal untuk bertanya dengan tenang ke pihak yang sesuai.",
    icon: MessageSquare,
  },
];

export default function CitizenJourneySection() {
  return (
    <section>
      <div className="mb-4 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Alur warga</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-800">
          Dari penasaran jadi tahu harus cek apa
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          PantauDesa membantu warga membaca informasi publik desa langkah demi langkah.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-full hidden h-3 w-px bg-slate-200 md:left-auto md:right-[-7px] md:top-8 md:block md:h-px md:w-3" />
              )}
              <div className="flex items-start gap-3 md:block">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon size={18} />
                </div>
                <div className="md:mt-4">
                  <p className="text-sm font-bold text-slate-900">{step.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{step.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
