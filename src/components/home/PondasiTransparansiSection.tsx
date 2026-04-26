import Link from "next/link";
import {
  ArrowRight,
  Landmark,
  Scale,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { AUTHORITY_HIGHLIGHTS, PHILOSOPHY } from "@/lib/copy";

export default function PondasiTransparansiSection() {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
          <Landmark size={13} />
          Inti PantauDesa
        </div>
        <h2 className="mt-4 text-xl font-black text-slate-900">
          {PHILOSOPHY.homeTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {PHILOSOPHY.homeIntro}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {PHILOSOPHY.homeBody}
        </p>
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Workflow size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Benahi dari bawah, supaya pengawasan ke atas lebih kuat
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {PHILOSOPHY.homeClosing}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/tentang/kenapa-desa-dipantau"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Pelajari Cara Memantau
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/desa"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Lihat Data Desa
          </Link>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-100">
          <Scale size={13} />
          Wewenang Pemerintahan
        </div>
        <h2 className="mt-4 text-xl font-black text-white">
          {PHILOSOPHY.authorityTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {PHILOSOPHY.authorityIntro}
        </p>

        <div className="mt-5 space-y-3">
          {AUTHORITY_HIGHLIGHTS.map((item) => (
            <div
              key={item.level}
              className={`rounded-2xl border p-4 ${item.tone}`}
            >
              <p className="text-sm font-black">{item.level}</p>
              <p className="mt-1.5 text-xs leading-relaxed opacity-90">
                {item.scope}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-900">
              <ShieldCheck size={16} />
            </div>
            <p className="text-sm leading-relaxed text-slate-200">
              {PHILOSOPHY.authorityNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
