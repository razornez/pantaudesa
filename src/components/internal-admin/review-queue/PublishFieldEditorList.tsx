import {
  AI_MAPPABLE_DESA_FIELDS,
  type AiMappingDraft,
} from "@/lib/admin-claim/ai-mapping";
import type { VillageDataVersionCandidate } from "@/lib/versioning/desa-versioning";
import { FIELD_LABELS } from "./constants";
import {
  formatReviewValue,
  getFieldReviewContext,
  toInputValue,
} from "./utils";

interface PublishFieldEditorListProps {
  fields: Record<string, string>;
  note: string;
  normalizedDraft: AiMappingDraft | null;
  versionCandidate: VillageDataVersionCandidate | null;
  onFieldChange: (key: string, value: string) => void;
  onNoteChange: (value: string) => void;
}

export function PublishFieldEditorList({
  fields,
  note,
  normalizedDraft,
  versionCandidate,
  onFieldChange,
  onNoteChange,
}: PublishFieldEditorListProps) {
  return (
    <div className="max-h-[48vh] space-y-3 overflow-y-auto pr-1 text-sm">
      {AI_MAPPABLE_DESA_FIELDS.map((key) => {
        const fieldContext = getFieldReviewContext(key, normalizedDraft, versionCandidate);

        return (
          <div key={key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <label className="field-label text-xs">{FIELD_LABELS[key]}</label>
              {fieldContext.isChangedFromPublic ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Ada perubahan draft
                </span>
              ) : fieldContext.hasDraftValue ? (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  Sama dengan publik
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  Belum ada draft
                </span>
              )}
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Nilai publik saat ini
                </p>
                <p className="mt-1 text-[11px] text-slate-800">
                  {formatReviewValue(fieldContext.publicValue)}
                </p>
              </div>
              <div className="rounded-lg border border-sky-100 bg-sky-50/70 px-2.5 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                  Isian draft saat ini
                </p>
                <p className="mt-1 text-[11px] text-sky-900">
                  {formatReviewValue(fieldContext.draftValue)}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <label className="field-label text-xs">Keputusan final admin</label>
              <input
                type="text"
                value={fields[key]}
                onChange={(event) => onFieldChange(key, event.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah nilai publik"
                className="field-lux text-sm"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {fieldContext.hasDraftValue ? (
                  <button
                    type="button"
                    onClick={() => onFieldChange(key, toInputValue(fieldContext.draftValue))}
                    className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-800 transition hover:bg-sky-100"
                  >
                    Pakai isi draft
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onFieldChange(key, "")}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Jangan ubah field ini
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Field kosong tidak ikut diubah saat publish. Jadi nilai publik saat ini akan
                tetap dipakai.
              </p>
            </div>
          </div>
        );
      })}
      <div>
        <label className="field-label text-xs">Catatan</label>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          rows={2}
          maxLength={500}
          className="textarea-lux text-sm"
          placeholder="Catatan singkat (opsional)."
        />
      </div>
    </div>
  );
}
