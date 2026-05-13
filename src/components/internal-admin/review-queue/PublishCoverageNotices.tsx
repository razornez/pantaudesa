import type { AiMappingDraft } from "@/lib/admin-claim/ai-mapping";
import type { VillageDataVersionCandidate } from "@/lib/versioning/desa-versioning";
import type { TemplateRibbonInfo } from "./types";
import { readFieldCoverageSignals } from "./coverage-signals";

interface PublishCoverageNoticesProps {
  templateInfo: TemplateRibbonInfo | null;
  normalizedDraft: AiMappingDraft | null;
  versionCandidate: VillageDataVersionCandidate | null;
  aiMappingResult?: unknown;
}

export function PublishCoverageNotices({
  templateInfo,
  normalizedDraft,
  versionCandidate,
  aiMappingResult,
}: PublishCoverageNoticesProps) {
  const coverageSignals = readFieldCoverageSignals(aiMappingResult);

  return (
    <>
      {templateInfo ? (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
            Template aktif untuk desa ini
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[12px] font-semibold text-indigo-900">
              {templateInfo.templateName}
            </span>
            <span className="text-[10.5px] font-mono text-indigo-400">
              {templateInfo.templateKey}
            </span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                templateInfo.source === "db"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {templateInfo.source === "db" ? "DB" : "Fallback"}
            </span>
            {templateInfo.visibleCount > 0 ? (
              <span className="text-[10.5px] text-indigo-500">
                {templateInfo.visibleCount} komponen aktif
              </span>
            ) : null}
            {templateInfo.hiddenCount > 0 ? (
              <span className="text-[10.5px] text-rose-500">
                {templateInfo.hiddenCount} komponen hidden
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {normalizedDraft?.notes ? (
        <div className="notice-card notice-info text-xs">{normalizedDraft.notes}</div>
      ) : null}

      <div className="notice-card notice-warn text-xs">
        Data yang dipublikasikan di sini bersumber dari dokumen resmi yang diupload. Setiap
        perubahan yang di-publish akan membuat versi publik baru dan tercatat dalam audit trail.
      </div>

      {coverageSignals.componentHidden.length > 0 ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-xs">
          <p className="mb-1 font-semibold text-rose-700">
            Terdeteksi di dokumen - komponen sedang hidden (
            {coverageSignals.componentHidden.length} field)
          </p>
          <p className="mb-1.5 text-rose-600">
            Field berikut terbaca dari dokumen, tapi komponennya sedang disembunyikan untuk desa
            ini. Tidak akan diterbitkan.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {coverageSignals.componentHidden.map((item, index) => (
              <span
                key={`${item.fieldLabel}-${index}`}
                className="rounded-full bg-rose-100 px-2 py-0.5 text-[10.5px] text-rose-800"
              >
                {item.fieldLabel} - <span className="opacity-60">{item.componentLabel}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {coverageSignals.outsideTemplate.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs">
          <p className="mb-1 font-semibold text-slate-700">
            Terdeteksi di luar template ({coverageSignals.outsideTemplate.length} field)
          </p>
          <p className="mb-1.5 text-slate-500">
            Data ini terbaca dari dokumen, tetapi tidak dicatat sebagai perubahan karena field
            tersebut belum ada di template desa ini. Buat atau aktifkan field/template baru di
            Standar Detail agar data ini dapat ditampilkan.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {coverageSignals.outsideTemplate.map((item, index) => (
              <span
                key={`${item.fieldKey}-${index}`}
                className="rounded-full bg-slate-200 px-2 py-0.5 text-[10.5px] text-slate-700"
              >
                {item.fieldLabel}
                {item.uploadedValuePreview ? `: ${item.uploadedValuePreview.slice(0, 30)}` : ""}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {versionCandidate ? (
        <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2 text-xs text-sky-900">
          Calon versi ini membawa {versionCandidate.changedFields.length} field berubah. Publish
          final akan membuat versi publik baru hanya dari field yang Anda konfirmasi di form ini.
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">Cara pakai review ini</p>
        <p className="mt-1">1. Cek template aktif desa di atas - field yang di-publish harus sesuai template.</p>
        <p>2. Bandingkan nilai publik saat ini dengan hasil ekstraksi dokumen (isian draft).</p>
        <p>
          3. Isi <span className="font-medium">Keputusan final admin</span> hanya untuk field
          yang ingin diubah dari sumber ini.
        </p>
        <p>4. Kosongkan field jika tidak ingin mengubah nilai publik saat ini.</p>
        <p className="mt-1 text-slate-500">
          Hanya field dengan sumber dokumen yang dapat dipublikasikan. Internal admin adalah
          reviewer, bukan sumber data.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">Legenda isi modal</p>
        <p className="mt-1">`Nilai publik saat ini` = data yang sedang tayang.</p>
        <p>`Isian draft saat ini` = hasil intake otomatis atau draft review yang terakhir disimpan.</p>
        <p>`Keputusan final admin` = isi yang benar-benar akan dipakai saat publish.</p>
      </div>
    </>
  );
}
