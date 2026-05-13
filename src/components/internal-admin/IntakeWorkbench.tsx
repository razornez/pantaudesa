"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import type {
  IntakeMode,
  IntakeStep,
  SubmitReviewSuccess,
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
import { buildQueueFocusHref } from "./intake/constants";
import { IntakeInputStep } from "./intake/IntakeInputStep";
import { IntakeResultHeader } from "./intake/IntakeResultHeader";
import { IntakeInspectorDrawer } from "./intake/IntakeInspectorDrawer";
import { IntakeResultStep } from "./intake/IntakeResultStep";
import { IntakeHistoryPanels } from "./intake/IntakeHistoryPanels";

export default function IntakeWorkbench() {
  const router = useRouter();
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<IntakeStep>("input");
  const [mode, setMode] = useState<IntakeMode>("upload");
  const [textValue, setTextValue] = useState("");
  const [useAiMapping, setUseAiMapping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reviewTitle, setReviewTitle] = useState("");
  const [submittedReview, setSubmittedReview] = useState<SubmitReviewSuccess | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [desaFocused, setDesaFocused] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

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
    result,
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

    if (data) {
      setStep("result");
      void intakeHistory.refetch();
    }
  }, [
    intakeHistory,
    mode,
    runPipeline,
    selectedDesa?.id,
    selectedFile,
    textValue,
    useAiMapping,
  ]);

  const handleSubmitReview = useCallback(async () => {
    if (!selectedDesa || !result) return;

    if (!result.validation.ok) {
      setError({ message: "Validasi belum lolos", tone: "danger" });
      return;
    }

    setError(null);
    const data = await submitToReview({
      mode,
      selectedFile,
      textValue,
      desaIdValue: selectedDesa.id,
      useAiMapping,
      reviewTitle,
    });

    if (data) {
      setSubmittedReview(data);
      void intakeHistory.refetch();
      router.push(buildQueueFocusHref({ status: "PROCESSING", documentId: data.documentId }));
    }
  }, [
    intakeHistory,
    mode,
    result,
    reviewTitle,
    router,
    selectedDesa,
    selectedFile,
    submitToReview,
    textValue,
    useAiMapping,
  ]);

  const handleContinueReview = useCallback(() => {
    reviewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleBackToInput = useCallback(() => {
    setStep("input");
    setError(null);
    setSubmittedReview(null);
    setInspectorOpen(false);
    resetPipeline();
  }, [resetPipeline]);

  const canSubmit = Boolean(
    selectedDesa &&
      result?.validation.ok &&
      !submittedReview &&
      result &&
      getReviewableContentCount(result) > 0,
  );
  const displayError = error ?? (pipelineError ? classifyPipelineError(pipelineError) : null);

  return (
    <>
      {step === "result" && result ? (
        <IntakeResultHeader
          loading={loading}
          canSubmit={canSubmit}
          onBackToInput={handleBackToInput}
          onRunPipeline={handleRunPipeline}
          onContinueReview={handleContinueReview}
        />
      ) : null}

      <div className="space-y-4">
        {step === "input" ? (
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
        ) : null}

        {step === "result" && result ? (
          <IntakeResultStep
            mode={mode}
            loading={loading}
            result={result}
            selectedDesa={selectedDesa}
            selectedFile={selectedFile}
            reviewTitle={reviewTitle}
            submittedReview={submittedReview}
            error={error}
            reviewSectionRef={reviewSectionRef}
            onChangeDesa={clearSelectedDesa}
            onReviewTitleChange={setReviewTitle}
            onSubmitReview={handleSubmitReview}
            onToggleInspector={() => setInspectorOpen((value) => !value)}
          />
        ) : null}

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

      {step === "result" && result ? (
        <IntakeInspectorDrawer
          result={result}
          open={inspectorOpen}
          onToggle={() => setInspectorOpen((value) => !value)}
        />
      ) : null}
    </>
  );
}
