"use client";

/**
 * IntakeResultHero (P0-2 v2 — decision hero with primary CTA)
 *
 * Single rounded card that owns the entire decision summary above the result.
 * Replaces the old "four flat status cards" row AND the duplicate stat-box row
 * that used to live at the top of IntakeCoveragePanel. Coverage panel below is
 * now drilldown-only.
 *
 * Visual structure (top → bottom, single rounded card):
 *   ZONE 1  Verdict bar — small label + one-sentence impact + file metadata
 *   ZONE 2  Coverage ring (SVG) on the left + 4 impact metric rows on the right
 *   ZONE 3  Status rail with 4 mini-tiles (Mapping / Validasi / Review / AI)
 *   ZONE 4  Action rail — secondary "Kembali ke Input" + primary "Lanjut ke Review"
 *
 * On mobile (sm: hidden), the same primary/secondary CTA pair is mirrored in
 * a sticky bottom action bar so the next step is never out of reach.
 *
 * Coverage formula (honest, derived only from result.fieldCoverage and result.diff):
 *   Y = totalDetailFields = result.fieldCoverage.entries.length
 *   X = coveredByUpload   = result.fieldCoverage.coveredCount
 *   pct                   = Y > 0 ? round(X/Y*100) : 0
 *   fillsEmpty            = entries where currentValueStatus="empty" AND
 *                                          uploadedCoverageStatus="covered"
 *   willChange            = (diff.addedCount ?? 0) + (diff.updatedCount ?? 0)
 *   notPublishable        = fieldCoverage.detectedNotPublishableCount
 *   usefulFindings        = fieldCoverage.unknownUsefulFields.length
 *
 * No API change. No business logic change. Status semantics come from the
 * existing get*Status helpers (unchanged).
 */

import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  Plus,
  RefreshCw,
  ShieldAlert,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import type { PipelineResult, StatusBadgeInfo } from "./types";
import { formatBytes } from "./utils";

// ============================================================================
// Props & types
// ============================================================================

interface IntakeResultHeroProps {
  result: PipelineResult;
  mappingStatus: StatusBadgeInfo;
  validationStatus: StatusBadgeInfo;
  reviewStatus: StatusBadgeInfo;
  aiStatus: StatusBadgeInfo;
  mappedFieldCount: number;
  /** Called when user wants to go back to input step. */
  onBackToInput: () => void;
  /** Called when user wants to scroll to / focus the review submission area. */
  onContinueReview: () => void;
  /**
   * Reason text shown next to the primary CTA when review cannot proceed yet.
   * `null` means review is reachable (CTA stays primary). Non-null disables it.
   */
  reviewBlockerReason: string | null;
  /** True if the review has already been submitted (CTA changes label). */
  reviewSubmitted: boolean;
}

interface CoverageNumbers {
  total: number;
  covered: number;
  pct: number;
  fillsEmpty: number;
  willChange: number;
  notPublishable: number;
  usefulFindings: number;
}

type StatusTone = "ok" | "warn" | "danger" | "neutral";

// ============================================================================
// Pure helpers
// ============================================================================

function computeCoverage(result: PipelineResult): CoverageNumbers {
  const coverage = result.fieldCoverage;
  if (!coverage) {
    return {
      total: 0,
      covered: 0,
      pct: 0,
      fillsEmpty: 0,
      willChange: 0,
      notPublishable: 0,
      usefulFindings: 0,
    };
  }

  const total = coverage.entries.length;
  const covered = coverage.coveredCount;
  const pct = total > 0 ? Math.round((covered / total) * 100) : 0;

  const fillsEmpty = coverage.entries.filter(
    (e) =>
      e.currentValueStatus === "empty" &&
      e.uploadedCoverageStatus === "covered",
  ).length;

  const willChange =
    (result.diff?.addedCount ?? 0) + (result.diff?.updatedCount ?? 0);

  const notPublishable = coverage.detectedNotPublishableCount;
  const usefulFindings = coverage.unknownUsefulFields.length;

  return { total, covered, pct, fillsEmpty, willChange, notPublishable, usefulFindings };
}

function buildVerdictHeadline(cov: CoverageNumbers, fileReadOk: boolean): string {
  if (!fileReadOk) {
    return "File belum sepenuhnya terbaca. Pertimbangkan ulang sumber atau aktifkan AI.";
  }
  if (cov.total === 0) {
    return "File terbaca, tapi cakupan field detail belum bisa dihitung di konteks ini.";
  }
  if (cov.fillsEmpty > 0 && cov.willChange > 0) {
    return `Upload bisa mengisi ${cov.fillsEmpty} field kosong dan memperbarui ${cov.willChange} field di halaman detail desa.`;
  }
  if (cov.fillsEmpty > 0) {
    return `Upload bisa mengisi ${cov.fillsEmpty} field kosong di halaman detail desa.`;
  }
  if (cov.willChange > 0) {
    return `Upload tidak menambah field baru, tapi memperbarui ${cov.willChange} field yang sudah ada.`;
  }
  if (cov.notPublishable > 0 || cov.usefulFindings > 0) {
    return "Tidak ada perubahan publishable. Beberapa temuan masih perlu review manual.";
  }
  return "File terbaca, tapi belum menambah informasi baru di halaman detail desa.";
}

function buildCoverageNote(cov: CoverageNumbers): string {
  if (cov.total === 0) {
    return "Cakupan field detail belum tersedia.";
  }
  const remaining = cov.total - cov.covered;
  if (remaining <= 0) {
    return "Semua field detail tersentuh upload ini.";
  }
  if (cov.willChange > 0 || cov.fillsEmpty > 0) {
    return `Sisa ${remaining} field belum tercakup. Cek diff sebelum lanjut review.`;
  }
  return `${remaining} field detail belum tercakup upload ini.`;
}

function statusTone(status: StatusBadgeInfo): StatusTone {
  // Derive a coarse tone from the existing className tokens used by helpers.
  // The helpers use BADGE_COLORS.* keys, e.g. mappingSuccess, validationError.
  // We avoid introducing a new helper — match by token substring.
  const c = status.className.toLowerCase();
  if (c.includes("rose") || c.includes("red") || c.includes("danger")) return "danger";
  if (c.includes("amber") || c.includes("yellow") || c.includes("orange")) return "warn";
  if (c.includes("emerald") || c.includes("green") || c.includes("teal")) return "ok";
  if (c.includes("sky") || c.includes("blue") || c.includes("indigo")) return "ok";
  return "neutral";
}

// ============================================================================
// Main component
// ============================================================================

export function IntakeResultHero({
  result,
  mappingStatus,
  validationStatus,
  reviewStatus,
  aiStatus,
  mappedFieldCount,
  onBackToInput,
  onContinueReview,
  reviewBlockerReason,
  reviewSubmitted,
}: IntakeResultHeroProps) {
  const cov = computeCoverage(result);
  const fileReadOk = result.ok;
  const fileName = result.extract.fileName ?? result.inputSource;
  const parserLabel = result.extract.parser;
  const sizeLabel = formatBytes(result.extract.size);
  const verdict = buildVerdictHeadline(cov, fileReadOk);
  const coverageNote = buildCoverageNote(cov);

  const reviewDisabled = reviewSubmitted || Boolean(reviewBlockerReason);
  const reviewCtaLabel = reviewSubmitted
    ? "Sudah dikirim"
    : "Lanjut ke Review";

  return (
    <>
      <section
        aria-label="Ringkasan keputusan intake"
        className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]"
      >
        {/* ===================================================================
            ZONE 1 — Verdict bar (very soft tint)
           =================================================================== */}
        <div className="relative isolate">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-50 via-white to-slate-50"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
          />

          <div className="flex flex-wrap items-start gap-3 px-5 py-4 sm:px-6 sm:py-5">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                fileReadOk
                  ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
                  : "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20"
              }`}
              aria-hidden
            >
              {fileReadOk ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Ringkasan keputusan
              </p>
              <p className="mt-1 text-[15px] font-semibold leading-snug text-slate-900 sm:text-base">
                {verdict}
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-slate-500">
                <FileText size={11} className="shrink-0" aria-hidden />
                <span className="truncate font-medium text-slate-700">{fileName}</span>
                <span className="text-slate-300">·</span>
                <span>{parserLabel}</span>
                {sizeLabel !== "-" && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>{sizeLabel}</span>
                  </>
                )}
                <span className="text-slate-300">·</span>
                <span>{mappedFieldCount} field utama dibaca</span>
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================================
            ZONE 2 — Coverage ring + impact metrics
           =================================================================== */}
        {cov.total > 0 && (
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-[auto,1fr] sm:gap-6 sm:px-6 sm:py-6">
            {/* Coverage ring + honest next-step note */}
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <CoverageRing pct={cov.pct} covered={cov.covered} total={cov.total} />
              <p className="max-w-[16rem] text-center text-[11px] leading-snug text-slate-500 sm:text-left">
                {coverageNote}
              </p>
            </div>

            {/* Impact metric rows */}
            <div className="space-y-2">
              <ImpactRow
                tone="info"
                icon={<Plus size={14} aria-hidden />}
                metric={cov.fillsEmpty}
                metricPrefix="+"
                label="Mengisi field kosong"
                hint="Field yang tadinya kosong di halaman detail dan sekarang bisa terisi dari upload ini."
              />
              <ImpactRow
                tone={cov.willChange > 0 ? "warning" : "neutral"}
                icon={<RefreshCw size={14} aria-hidden />}
                metric={cov.willChange}
                metricPrefix={cov.willChange > 0 ? "~" : ""}
                label={
                  cov.willChange > 0
                    ? "Akan berubah / bertambah"
                    : "Tidak ada perubahan publishable"
                }
                hint="Total field publishable yang ditambah atau diubah dibanding data desa saat ini."
              />
              <ImpactRow
                tone={cov.notPublishable > 0 ? "warning" : "neutral"}
                icon={<ShieldAlert size={14} aria-hidden />}
                metric={cov.notPublishable}
                label="Belum aman dipublish"
                hint="Terdeteksi jelas, tapi belum punya target tabel/relasi yang aman. Perlu review manual."
              />
              <ImpactRow
                tone={cov.usefulFindings > 0 ? "info" : "neutral"}
                icon={<Lightbulb size={14} aria-hidden />}
                metric={cov.usefulFindings}
                label="Temuan lain yang berguna"
                hint="Informasi tambahan yang menarik untuk owner, tapi belum punya kategori publishable."
              />
            </div>
          </div>
        )}

        {/* ===================================================================
            ZONE 3 — Status rail (4 mini-tiles)
           =================================================================== */}
        <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-3 sm:px-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatusTile label="Mapping" status={mappingStatus} />
            <StatusTile label="Validasi" status={validationStatus} />
            <StatusTile label="Review" status={reviewStatus} />
            <StatusTile
              label="AI"
              status={aiStatus}
              icon={<Sparkles size={11} aria-hidden />}
            />
          </div>
        </div>

        {/* ===================================================================
            ZONE 4 — Action rail (desktop)
           =================================================================== */}
        <div className="hidden border-t border-slate-100 px-5 py-4 sm:block sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500">
              {reviewBlockerReason ?? "Belum bisa dipublish dari layar ini. Lanjutkan ke antrean review setelah hasil terlihat masuk akal."}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onBackToInput}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft size={13} aria-hidden />
                Kembali ke Input
              </button>
              <button
                type="button"
                onClick={onContinueReview}
                disabled={reviewDisabled}
                aria-disabled={reviewDisabled}
                title={reviewBlockerReason ?? undefined}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {reviewCtaLabel}
                <ArrowRight size={13} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          Mobile sticky CTA bar — mirrors zone 4
         ===================================================================== */}
      <div
        className="sticky bottom-0 z-30 -mx-3 mt-2 border-t border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:hidden"
        role="region"
        aria-label="Aksi hasil intake"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToInput}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
          >
            <ArrowLeft size={13} aria-hidden />
            Input
          </button>
          <button
            type="button"
            onClick={onContinueReview}
            disabled={reviewDisabled}
            aria-disabled={reviewDisabled}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {reviewCtaLabel}
            <ArrowRight size={13} aria-hidden />
          </button>
        </div>
        {reviewBlockerReason && (
          <p className="mt-1.5 text-[10.5px] leading-snug text-amber-700">
            {reviewBlockerReason}
          </p>
        )}
      </div>
    </>
  );
}

// ============================================================================
// Coverage ring (SVG)
// ============================================================================

interface CoverageRingProps {
  pct: number;
  covered: number;
  total: number;
}

function CoverageRing({ pct, covered, total }: CoverageRingProps) {
  // 96px box, stroke 8, radius (96-8)/2 = 44 → r=44, circumference ≈ 276.46
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Cakupan upload terhadap field detail desa: ${covered} dari ${total} (${pct}%)`}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <defs>
            <linearGradient id="coverageRingGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="#e2e8f0"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#coverageRingGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 600ms ease" }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold leading-none text-slate-900">{pct}%</span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            tercakup
          </span>
        </div>
      </div>
      <p className="text-center text-[11px] text-slate-600">
        <span className="font-semibold text-slate-900">{covered}</span>
        <span className="text-slate-400"> / </span>
        <span>{total} field detail</span>
      </p>
    </div>
  );
}

// ============================================================================
// Impact row (one metric per row, dashboard-style)
// ============================================================================

interface ImpactRowProps {
  tone: "info" | "warning" | "neutral";
  icon: React.ReactNode;
  metric: number;
  metricPrefix?: string;
  label: string;
  hint: string;
}

function ImpactRow({ tone, icon, metric, metricPrefix = "", label, hint }: ImpactRowProps) {
  const toneClasses =
    tone === "info"
      ? {
          chip: "bg-sky-50 text-sky-700 ring-sky-100",
          metric: "text-sky-700",
        }
      : tone === "warning"
      ? {
          chip: "bg-amber-50 text-amber-700 ring-amber-100",
          metric: "text-amber-700",
        }
      : {
          chip: "bg-slate-100 text-slate-500 ring-slate-200",
          metric: "text-slate-400",
        };

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 transition hover:border-slate-200"
      title={hint}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${toneClasses.chip}`}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-slate-700">{label}</p>
        <p className="mt-0.5 text-[10.5px] leading-tight text-slate-400 line-clamp-1">
          {hint}
        </p>
      </div>
      <span
        className={`shrink-0 text-base font-bold tabular-nums ${toneClasses.metric}`}
      >
        {metricPrefix}
        {metric}
      </span>
    </div>
  );
}

// ============================================================================
// Status tile (compact KPI tile, replaces flat badge row)
// ============================================================================

interface StatusTileProps {
  label: string;
  status: StatusBadgeInfo;
  icon?: React.ReactNode;
}

function StatusTile({ label, status, icon }: StatusTileProps) {
  const tone = statusTone(status);
  const dotClass =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warn"
      ? "bg-amber-500"
      : tone === "danger"
      ? "bg-rose-500"
      : "bg-slate-400";

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
      title={status.note}
    >
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {icon}
          {label}
        </p>
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
          aria-hidden
        />
      </div>
      <p className="mt-1 truncate text-[12px] font-semibold text-slate-900">
        {status.label}
      </p>
      <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
        {status.note}
      </p>
    </div>
  );
}
