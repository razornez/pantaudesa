"use client";

import type { PipelineResult } from "./types";
import { IntakeSection } from "./IntakeSection";

interface IntakeAiStatusPanelProps {
  result: PipelineResult;
  embedded?: boolean;
}

export function IntakeAiStatusPanel({ result, embedded = false }: IntakeAiStatusPanelProps) {
  const { openai } = result;
  const hasAiFindings =
    Object.keys(openai.knownPublishableFields).length > 0 ||
    openai.detectedButNotPublishable.length > 0 ||
    openai.unknownUsefulFields.length > 0;

  const content = (
    <>
      {/* Status Message */}
      <p className="text-xs leading-relaxed text-slate-600">{openai.message}</p>

      {/* Quick Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat label="Mode input" value={openai.usedInputMode} />
        <MiniStat label="Confidence" value={openai.confidence} />
        <MiniStat label="Tipe dokumen" value={openai.documentType} />
      </div>

      {/* No Findings Notice */}
      {!hasAiFindings && openai.status !== "success" && (
        <p className="mt-3 text-[11px] text-slate-500">
          Tidak ada temuan AI yang dipakai di draft ini. Preview tetap dibangun dari parser lokal atau dari input manual yang tersedia.
        </p>
      )}

      {/* Warnings */}
      {openai.warnings.length > 0 && (
        <div className="mt-3 space-y-1">
          {openai.warnings.map((warning, index) => (
            <div
              key={`${warning}-${index}`}
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800"
            >
              {warning}
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div className="space-y-3">{content}</div>;
  }

  return (
    <IntakeSection title="Detail parser lokal & AI" defaultOpen={false}>
      <div className="space-y-3">
        {/* Header */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Pembacaan AI
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Jujur tentang kapan AI dipakai dan apa hasilnya
          </p>
        </div>
        {content}
      </div>
    </IntakeSection>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
}

function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-2 text-center">
      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-900">{value}</p>
    </div>
  );
}
