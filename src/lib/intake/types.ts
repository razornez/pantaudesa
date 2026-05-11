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

export interface OpenAIProof {
  httpStatus?: number;
  errorCode?: string | null;
  errorType?: string | null;
  requestId?: string | null;
  usageUrl?: string;
  limitsUrl?: string;
  docsUrl?: string;
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
  proof?: OpenAIProof;
}

export type CurrentValueStatus = "filled" | "empty";
export type UploadedCoverageStatus =
  | "covered"               // detected + maps to visible template field
  | "missing"               // not detected
  | "detected_not_publishable" // detected but field not ready to publish
  | "component_hidden"      // detected, field in template but component is hidden for this desa
  | "outside_template";     // detected but field does not exist in active template

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

export interface CoverageTemplateInfo {
  templateKey: string;
  templateName: string;
  source: "db" | "fallback";
  visibleComponentCount: number;
  hiddenComponentCount: number;
  totalFieldCount: number;
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
  /** Template used to generate this coverage — shown in UI as context for reviewer */
  templateInfo?: CoverageTemplateInfo;
}
