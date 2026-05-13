type DocumentReviewStatus =
  | "WAITING_VERIFIED_APPROVAL"
  | "PROCESSING"
  | "PUBLISHED"
  | "FAILED";

interface PolicyError {
  status: number;
  error: string;
}

function requireProcessingStatus(
  status: DocumentReviewStatus,
  message: (status: DocumentReviewStatus) => string,
): PolicyError | null {
  if (status === "PROCESSING") return null;
  return {
    status: 422,
    error: message(status),
  };
}

export function validateDraftGenerationStatus(
  status: DocumentReviewStatus,
): PolicyError | null {
  return requireProcessingStatus(
    status,
    (current) =>
      `AI mapping hanya berlaku untuk dokumen PROCESSING. Status saat ini: ${current}.`,
  );
}

export function validateDraftSaveStatus(status: DocumentReviewStatus): PolicyError | null {
  return requireProcessingStatus(
    status,
    (current) =>
      `Draft review hanya berlaku untuk dokumen PROCESSING. Status saat ini: ${current}.`,
  );
}

export function validatePublishStatus(status: DocumentReviewStatus): PolicyError | null {
  return requireProcessingStatus(
    status,
    (current) =>
      `Hanya dokumen PROCESSING yang dapat dipublikasikan. Status saat ini: ${current}.`,
  );
}

export function validateFailStatus(status: DocumentReviewStatus): PolicyError | null {
  if (status === "PUBLISHED" || status === "FAILED") {
    return {
      status: 422,
      error: `Dokumen sudah dalam status final: ${status}.`,
    };
  }
  return null;
}
