import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";

export default function ResponsibilityGuideCard() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
          <Scale size={18} />
        </div>
        <div className="flex-1">
          <p className="text-base font-black text-amber-950">Tanyakan ke pihak yang tepat</p>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            Tidak semua masalah di wilayah desa menjadi kewenangan pemerintah desa. Lihat dulu apakah hal ini terkait APBDes, program desa, kewenangan kabupaten, provinsi, atau pusat agar pertanyaanmu lebih tepat sasaran.
          </p>
          <Link
            href="/panduan/kewenangan"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-700"
          >
            Lihat panduan kewenangan
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
