"use client";

import { useRef } from "react";
import {
  Upload,
  FileText,
  Search,
  Sparkles,
  MapPin,
} from "lucide-react";
import type { IntakeMode, DesaOption } from "./types";
import {
  INTAKE_COPY,
  ACCEPTED_FILE_TYPES,
  SAMPLE_VALID_TEXT,
  SAMPLE_COMPLEX_TEXT,
  buildSampleDiffText,
} from "./constants";
import { formatBytes, formatDesaSearchValue } from "./constants";

interface IntakeInputPanelProps {
  mode: IntakeMode;
  onModeChange: (mode: IntakeMode) => void;
  textValue: string;
  onTextChange: (value: string) => void;
  useAiMapping: boolean;
  onAiMappingChange: (value: boolean) => void;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  selectedDesa: DesaOption | null;
  isPickerOpen: boolean;
  desaSearch: string;
  desaOptions: DesaOption[];
  desaLoading: boolean;
  desaError: string | null;
  onDesaSearchChange: (value: string) => void;
  onSelectDesa: (option: DesaOption) => void;
  onOpenPicker: () => void;
  onClearDesa: () => void;
  onRemoveDesa: () => void;
  onRunPipeline: () => void;
  onRetry: () => void;
  pipelineLoading: boolean;
  pipelineError: string | null;
}

export function IntakeInputPanel({
  mode,
  onModeChange,
  textValue,
  onTextChange,
  useAiMapping,
  onAiMappingChange,
  selectedFile,
  onFileChange,
  selectedDesa,
  isPickerOpen,
  desaSearch,
  desaOptions,
  desaLoading,
  desaError,
  onDesaSearchChange,
  onSelectDesa,
  onOpenPicker,
  onClearDesa,
  onRemoveDesa,
  onRunPipeline,
  pipelineLoading,
  pipelineError,
}: IntakeInputPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <p className="eyebrow text-[10px]">Langkah 1 · Siapkan bahan</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Input dokumen / teks
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Unggah file atau tempel teks. Sistem akan menyiapkan preview otomatis.
        </p>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        {/* Mode Toggle */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => onModeChange("upload")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              mode === "upload"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Upload size={13} aria-hidden />
            Upload file
          </button>
          <button
            type="button"
            onClick={() => onModeChange("paste")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              mode === "paste"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText size={13} aria-hidden />
            Tempel teks
          </button>
        </div>

        {/* AI Option */}
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {INTAKE_COPY.aiOption.label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {INTAKE_COPY.aiOption.checkboxLabel}
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={useAiMapping}
              onChange={(e) => onAiMappingChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            Aktif
          </label>
        </div>

        {/* File Input */}
        {mode === "upload" && (
          <div className="space-y-2">
            <label className="field-label text-xs">
              File (DOCX, XLSX, PDF, TXT, CSV, JPG, PNG - maks 10 MB)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              className="field-lux text-sm"
            />
            {selectedFile && (
              <p className="text-xs text-slate-500">
                Dipilih:{" "}
                <span className="font-medium text-slate-700">{selectedFile.name}</span>{" "}
                ({formatBytes(selectedFile.size)})
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              Contoh file uji tersedia di `public/testing/intake/`.
            </p>
          </div>
        )}

        {/* Text Input */}
        {mode === "paste" && (
          <div className="space-y-2">
            <label className="field-label text-xs">Teks yang akan diproses</label>
            <textarea
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              rows={6}
              maxLength={50000}
              className="textarea-lux text-sm"
              placeholder="Salin teks dari dokumen di sini..."
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onTextChange(SAMPLE_VALID_TEXT)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Contoh valid
              </button>
              <button
                type="button"
                onClick={() => onTextChange(SAMPLE_COMPLEX_TEXT)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Contoh lengkap
              </button>
              <button
                type="button"
                onClick={() => onTextChange(buildSampleDiffText(selectedDesa))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Contoh diff
              </button>
            </div>
          </div>
        )}

        {/* Desa Picker */}
        <div className="space-y-2">
          <label className="field-label text-xs">{INTAKE_COPY.desaPicker.label}</label>
          {(!selectedDesa || isPickerOpen) && (
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={desaSearch}
                onFocus={onOpenPicker}
                onChange={(e) => {
                  onDesaSearchChange(e.target.value);
                  onOpenPicker();
                  if (selectedDesa && e.target.value !== formatDesaSearchValue(selectedDesa)) {
                    onClearDesa();
                  }
                }}
                className="field-lux pl-10 pr-4 text-sm"
                placeholder={INTAKE_COPY.desaPicker.placeholder}
              />
            </div>
          )}

          {selectedDesa && !isPickerOpen && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {INTAKE_COPY.desaPicker.selected}
                </p>
                <p className="font-semibold text-slate-900">{selectedDesa.nama}</p>
                <p className="text-[11px] text-slate-500">
                  {selectedDesa.kecamatan}, {selectedDesa.kabupaten}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenPicker}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                {INTAKE_COPY.desaPicker.changeButton}
              </button>
            </div>
          )}

          {isPickerOpen && (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-white">
              {desaLoading && (
                <p className="px-4 py-2 text-xs text-slate-500">Memuat...</p>
              )}
              {desaError && (
                <p className="px-4 py-2 text-xs text-rose-600">{desaError}</p>
              )}
              {!desaLoading && !desaError && desaOptions.length === 0 && (
                <p className="px-4 py-2 text-xs text-slate-500">
                  {INTAKE_COPY.desaPicker.noResults}
                </p>
              )}
              {!desaLoading && !desaError && desaOptions.length > 0 && (
                <div className="p-1">
                  {desaOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSelectDesa(option)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50"
                    >
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span>
                        <span className="font-semibold text-slate-900">{option.nama}</span>
                        <span className="ml-1 text-slate-500">
                          {option.kecamatan}, {option.kabupaten}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedDesa && !isPickerOpen && (
            <button
              type="button"
              onClick={onRemoveDesa}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {INTAKE_COPY.desaPicker.removeLink}
            </button>
          )}
        </div>

        {/* Error */}
        {pipelineError && (
          <div className="notice-card notice-danger flex items-start gap-2 text-sm">
            <span>{pipelineError}</span>
          </div>
        )}

        {/* Run Button */}
        <button
          type="button"
          onClick={onRunPipeline}
          disabled={pipelineLoading}
          className="btn-lux btn-lux-primary flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          {pipelineLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {INTAKE_COPY.pipeline.loading}
            </>
          ) : (
            <>
              <Sparkles size={14} aria-hidden />
              {INTAKE_COPY.pipeline.button}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
