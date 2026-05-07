"use client";

import type { PipelineResult } from "./types";
import type { StatusBadgeInfo } from "./types";
import { INTAKE_COPY } from "./constants";

interface IntakeStatusCardsProps {
  mappingStatus: StatusBadgeInfo;
  validationStatus: StatusBadgeInfo;
  reviewStatus: StatusBadgeInfo;
  aiStatus: StatusBadgeInfo;
}

export function IntakeStatusCards({
  mappingStatus,
  validationStatus,
  reviewStatus,
  aiStatus,
}: IntakeStatusCardsProps) {
  const cards = [
    { label: INTAKE_COPY.result.mapping, status: mappingStatus },
    { label: INTAKE_COPY.result.validation, status: validationStatus },
    { label: INTAKE_COPY.result.reviewStatus, status: reviewStatus },
    { label: INTAKE_COPY.result.aiHelp, status: aiStatus },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-100 bg-white p-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {card.label}
          </p>
          <span
            className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${card.status.className}`}
          >
            {card.status.label}
          </span>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 line-clamp-2">
            {card.status.note}
          </p>
          {card.label === INTAKE_COPY.result.reviewStatus && (
            <p className="mt-1 text-[10px] font-medium text-slate-400">
              {INTAKE_COPY.result.notPublishNote}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Compact Status Badge for inline use
// ============================================================================

interface StatusBadgeInlineProps {
  label: string;
  status: StatusBadgeInfo;
}

export function StatusBadgeInline({ label, status }: StatusBadgeInlineProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${status.className}`}
      >
        {status.label}
      </span>
    </div>
  );
}

// ============================================================================
// Mini Status Indicator (for result summary)
// ============================================================================

interface StatusMiniProps {
  label: string;
  value: string;
  variant?: "success" | "warning" | "error" | "neutral";
}

export function StatusMini({ label, value, variant = "neutral" }: StatusMiniProps) {
  const variantClasses = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
    neutral: "border-slate-200 bg-white text-slate-900",
  };

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-xs ${variantClasses[variant]}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-current/70">
        {label}
      </p>
      <p className="mt-1 font-semibold text-current">{value}</p>
    </div>
  );
}
