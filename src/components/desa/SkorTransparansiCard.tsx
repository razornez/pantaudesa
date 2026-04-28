import { SkorTransparansi } from "@/lib/types";
import { Shield, Info, FlaskConical } from "lucide-react";
import { SECTION, SKOR } from "@/lib/copy";
import { getTransparencyVerdict } from "@/lib/verdicts";
import { getVerdictColors } from "@/lib/utils";
import VerdictBanner from "@/components/ui/VerdictBanner";

interface Props {
  skor: SkorTransparansi;
}

type MetricKey = "ketepatan" | "kelengkapan" | "konsistensi" | "responsif";

const METRICS: Array<{ key: MetricKey }> = [
  { key: "ketepatan" },
  { key: "kelengkapan" },
  { key: "konsistensi" },
  { key: "responsif" },
];

function barColor(v: number): string {
  if (v >= 80) return "bg-emerald-500";
  if (v >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

export default function SkorTransparansiCard({ skor }: Props) {
  const verdict = getTransparencyVerdict(skor);
  const colors  = getVerdictColors(verdict.tone);

  return (
    <div className={`rounded-2xl border p-5 ${colors.bg} ${colors.border}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
            <Shield size={16} className={colors.icon} aria-hidden />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">{SECTION.skor}</h2>
            <p className="text-xs text-slate-500">{SECTION.skorSub}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-3xl font-black ${colors.text}`}>{skor.total}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>

      <VerdictBanner verdict={verdict} className="mb-4 bg-white/60" />

      <div className="space-y-2.5 mb-4">
        {METRICS.map(({ key }) => {
          const val   = skor[key] as number;
          const label = SKOR.metricLabels[key];
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold text-slate-700">{val}/100</span>
              </div>
              <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor(val)}`} style={{ width: `${val}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology disclosure — SCORE-01, METRIC-06 */}
      <div className="rounded-xl border border-white/70 bg-white/50 px-4 py-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <Info size={13} className="text-slate-500 flex-shrink-0" aria-hidden />
          <p className="text-xs font-bold text-slate-700">{SKOR.methodologyTitle}</p>
        </div>
        <ul className="space-y-1 ml-5">
          {SKOR.methodologyItems.map((item, i) => (
            <li key={i} className="text-[11px] text-slate-600 leading-relaxed list-disc">{item}</li>
          ))}
        </ul>
        <div className="flex items-start gap-1.5 pt-1 border-t border-white/50">
          <FlaskConical size={12} className="text-amber-600 flex-shrink-0 mt-0.5" aria-hidden />
          <p className="text-[10px] text-amber-800 leading-relaxed font-medium">{SKOR.methodologyNote}</p>
        </div>
      </div>
    </div>
  );
}
