"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import type {
  IntakeMode,
} from "./intake/types";
import {
  useDesaOptions,
  useIntakeHistory,
  useIntakePipeline,
  useVersionHistory,
} from "./intake/hooks";
import {
  classifyPipelineError,
  type ErrorState,
} from "./intake/error-state";
import { getReviewableContentCount } from "./intake/IntakeStatusHelpers";
import { buildSuggestedReviewTitle } from "./intake/constants";
import { IntakeInputStep } from "./intake/IntakeInputStep";
import { IntakeHistoryPanels } from "./intake/IntakeHistoryPanels";

export default function IntakeWorkbench() {
  const router = useRouter();

  const [mode, setMode] = useState<IntakeMode>("upload");
  const [textValue, setTextValue] = useState("");
  const [useAiMapping, setUseAiMapping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [desaFocused, setDesaFocused] = useState(false);

  const {
    desaSearch,
    setDesaSearch,
    desaOptions,
    selectedDesa,
    isPickerOpen,
    loading: desaLoading,
    selectDesa,
    clearSelectedDesa,
    openPicker,
  } = useDesaOptions();

  const {
    loading,
    error: pipelineError,
    runPipeline,
    submitToReview,
    reset: resetPipeline,
  } = useIntakePipeline();

  const intakeHistory = useIntakeHistory();
  const versionHistory = useVersionHistory(selectedDesa?.id ?? null);

  const handleRunPipeline = useCallback(async () => {
    setError(null);
    const data = await runPipeline({
      mode,
      selectedFile,
      textValue,
      desaIdValue: selectedDesa?.id ?? "",
      useAiMapping,
    });

    if (!data) return;

    if (!selectedDesa) {
      setError({ message: "Pilih desa target sebelum melanjutkan review.", tone: "warn" });
      return;
    }

    if (!data.validation.ok) {
      setError({
        message: "Validasi belum lolos. Perbaiki isi dokumen atau gunakan paste manual.",
        tone: "danger",
      });
      return;
    }

    if (getReviewableContentCount(data) === 0) {
      setError({
        message: "Belum ada konten yang cukup untuk dibawa ke review.",
        tone: "warn",
      });
      return;
    }

    const submitted = await submitToReview({
      mode,
      selectedFile,
      textValue,
      desaIdValue: selectedDesa.id,
      useAiMapping,
      reviewTitle: buildSuggestedReviewTitle({ mode, selectedFile, selectedDesa }),
    });

    if (submitted) {
      void intakeHistory.refetch();
      resetPipeline();
      router.push(`/internal-admin/intake/${encodeURIComponent(submitted.documentId)}`);
    }
  }, [
    intakeHistory,
    mode,
    runPipeline,
    router,
    selectedDesa,
    selectedFile,
    submitToReview,
    textValue,
    useAiMapping,
    resetPipeline,
  ]);
  const displayError = error ?? (pipelineError ? classifyPipelineError(pipelineError) : null);

  return (
    <div className="space-y-4">
      <IntakeInputStep
        mode={mode}
        loading={loading}
        useAiMapping={useAiMapping}
        textValue={textValue}
        selectedFile={selectedFile}
        desaSearch={desaSearch}
        desaOptions={desaOptions}
        selectedDesa={selectedDesa}
        isPickerOpen={isPickerOpen}
        desaLoading={desaLoading}
        desaFocused={desaFocused}
        displayError={displayError}
        onModeChange={setMode}
        onAiToggle={setUseAiMapping}
        onTextChange={setTextValue}
        onFileChange={setSelectedFile}
        onDesaSearchChange={(value) => {
          setDesaSearch(value);
          openPicker();
        }}
        onDesaFocus={() => {
          setDesaFocused(true);
          openPicker();
        }}
        onDesaBlur={() => setTimeout(() => setDesaFocused(false), 150)}
        onSelectDesa={(desa) => {
          selectDesa(desa);
          setDesaFocused(false);
        }}
        onClearSelectedDesa={clearSelectedDesa}
        onRunPipeline={handleRunPipeline}
      />

      <IntakeHistoryPanels
        desaName={selectedDesa?.nama ?? null}
        intakeHistory={intakeHistory.history}
        intakeHistoryError={intakeHistory.error}
        intakeHistoryLoading={intakeHistory.loading}
        versionHistory={versionHistory.versionHistory}
        versionHistoryError={versionHistory.error}
        versionHistoryLoading={versionHistory.loading}
      />
    </div>
  );
}
