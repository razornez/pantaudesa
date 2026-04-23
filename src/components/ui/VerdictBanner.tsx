import { CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Verdict } from "@/lib/verdicts";
import { getVerdictColors } from "@/lib/utils";

interface Props {
  verdict: Verdict;
  className?: string;
}

const ICONS = {
  positive: CheckCircle2,
  warning:  AlertTriangle,
  danger:   AlertCircle,
  neutral:  Info,
};

/**
 * Menampilkan pesan verdict dengan warna dan ikon sesuai tone-nya.
 * Reusable di mana saja — detail desa, card, dll.
 */
export default function VerdictBanner({ verdict, className = "" }: Props) {
  const colors = getVerdictColors(verdict.tone);
  const Icon   = ICONS[verdict.tone];

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 ${colors.bg} ${colors.border} ${className}`}>
      <Icon size={15} className={`flex-shrink-0 mt-0.5 ${colors.icon}`} />
      <p className={`text-sm leading-relaxed ${colors.text}`}>{verdict.message}</p>
    </div>
  );
}
