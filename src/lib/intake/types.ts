import type { AiMappableDesaField, AiMappingFields } from "@/lib/admin-claim/ai-mapping";

export type IntakeDocumentType =
  | "profil_desa"
  | "anggaran"
  | "perangkat_desa"
  | "fasilitas"
  | "potensi"
  | "kontak"
  | "dokumen_publik"
  | "unknown";

export type IntakeConfidence = "low" | "medium" | "high";

export type OpenAIStatus =
  | "success"
  | "skipped"
  | "missing_key"
  | "rate_limited"
  | "quota_limited"
  | "error"
  | "invalid_json";

export interface KnownFieldEvidence {
  field: AiMappableDesaField;
  evidenceSnippet?: string;
  sourceReference?: string;
}

export interface DetectedDetailField {
  sectionKey: string;
  sectionLabel: string;
  fieldKey: string;
  fieldLabel: string;
  value: string;
  reason: string;
  sourceRequirement: string;
  validationRequirement: string;
  evidenceSnippet?: string;
  sourceReference?: string;
}

export interface UnknownUsefulField {
  label: string;
  value: string;
  possibleCategory: string;
  evidenceSnippet?: string;
}

export interface OpenAIResult {
  attempted: boolean;
  status: OpenAIStatus;
  usedInputMode: "text" | "image" | "file";
  reason: string;
  message: string;
  model: string | null;
  documentType: IntakeDocumentType;
  confidence: IntakeConfidence;
  knownPublishableFields: AiMappingFields;
  knownFieldEvidence: KnownFieldEvidence[];
  detectedButNotPublishable: DetectedDetailField[];
  unknownUsefulFields: UnknownUsefulField[];
  warnings: string[];
}

export type CurrentValueStatus = "filled" | "empty";
export type UploadedCoverageStatus = "covered" | "missing" | "detected_not_publishable";

export interface DetailFieldCoverageEntry {
  sectionKey: string;
  sectionLabel: string;
  fieldKey: string;
  fieldLabel: string;
  currentModelSource: string;
  currentValueStatus: CurrentValueStatus;
  currentValuePreview: string;
  currentlyMappable: boolean;
  aiDetectable: boolean;
  publishableNow: boolean;
  shouldBeMappableInSprint05: boolean;
  deferredReason: string | null;
  sourceRequirement: string;
  validationRequirement: string;
  uploadedCoverageStatus: UploadedCoverageStatus;
  uploadedValuePreview: string | null;
}

export interface DetailFieldCoverageSummary {
  entries: DetailFieldCoverageEntry[];
  filledCount: number;
  emptyCount: number;
  coveredCount: number;
  detectedNotPublishableCount: number;
  publishableNowCount: number;
  detectedButNotPublishable: DetectedDetailField[];
  unknownUsefulFields: UnknownUsefulField[];
}
