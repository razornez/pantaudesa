/**
 * Types for Intake Workbench
 * Extracted from IntakeWorkbench.tsx for better maintainability
 */

import type { AiMappableDesaField } from "@/lib/admin-claim/ai-mapping";

// ============================================================================
// Parser / Extraction Types
// ============================================================================

export interface ExtractMeta {
  fileName?: string;
  mimeType?: string;
  size?: number;
  pages?: number;
  sheets?: string[];
  parser: string;
  durationMs: number;
  truncated?: boolean;
}

// ============================================================================
// Mapping Types
// ============================================================================

export interface MappingEvidence {
  field: AiMappableDesaField;
  matchedText: string;
  rule: string;
}

export interface MappingResult {
  fields: Partial<Record<AiMappableDesaField, string | number | null>>;
  evidence: MappingEvidence[];
  unmatched: AiMappableDesaField[];
  source: string;
  generatedAt: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationIssue {
  field: AiMappableDesaField;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
  checkedAt: string;
}

// ============================================================================
// Diff Types
// ============================================================================

export interface DiffEntry {
  field: AiMappableDesaField;
  deltaType: "added" | "removed" | "updated" | "unchanged";
  previous?: string | number | null;
  next?: string | number | null;
  changed?: string;
}

export interface DiffResult {
  entries: DiffEntry[];
  hasChanges: boolean;
  addedCount: number;
  updatedCount: number;
  removedCount: number;
  generatedAt: string;
}

// ============================================================================
// Version Candidate Types
// ============================================================================

export interface VersionCandidate {
  schemaVersion: 1;
  status: "REVIEW_READY" | "PUBLISHED";
  desaId: string;
  createdAt: string;
  changedFields: AiMappableDesaField[];
  baseSnapshot: Partial<Record<AiMappableDesaField, string | number | null>>;
  proposedSnapshot: Partial<Record<AiMappableDesaField, string | number | null>>;
}

// ============================================================================
// OpenAI / AI Types
// ============================================================================

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
  status:
    | "success"
    | "skipped"
    | "missing_key"
    | "rate_limited"
    | "quota_limited"
    | "error"
    | "invalid_json";
  usedInputMode: "text" | "image" | "file";
  reason: string;
  message: string;
  model: string | null;
  documentType:
    | "profil_desa"
    | "anggaran"
    | "perangkat_desa"
    | "fasilitas"
    | "potensi"
    | "kontak"
    | "dokumen_publik"
    | "unknown";
  confidence: "low" | "medium" | "high";
  knownPublishableFields: Partial<Record<AiMappableDesaField, string | number | null>>;
  knownFieldEvidence: KnownFieldEvidence[];
  detectedButNotPublishable: DetectedDetailField[];
  unknownUsefulFields: UnknownUsefulField[];
  warnings: string[];
}

// ============================================================================
// Field Coverage Types
// ============================================================================

export interface DetailFieldCoverageEntry {
  sectionKey: string;
  sectionLabel: string;
  fieldKey: string;
  fieldLabel: string;
  currentModelSource: string;
  currentValueStatus: "filled" | "empty";
  currentValuePreview: string;
  currentlyMappable: boolean;
  aiDetectable: boolean;
  publishableNow: boolean;
  shouldBeMappableInSprint05: boolean;
  deferredReason: string | null;
  sourceRequirement: string;
  validationRequirement: string;
  uploadedCoverageStatus: "covered" | "missing" | "detected_not_publishable";
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

// ============================================================================
// Pipeline Types
// ============================================================================

export interface PipelineResult {
  ok: boolean;
  inputSource: string;
  extract: ExtractMeta;
  mapping: MappingResult;
  validation: ValidationResult;
  diff: DiffResult | null;
  fieldCoverage: DetailFieldCoverageSummary | null;
  versionCandidate?: VersionCandidate | null;
  guardrailNote: string;
  openai: OpenAIResult;
}

export interface PipelineError {
  error: string;
  meta?: Record<string, unknown>;
}

// ============================================================================
// Submit Review Types
// ============================================================================

export interface SubmitReviewSuccess {
  ok: boolean;
  documentId: string;
  title: string;
  newStatus: string;
  queuedAt: string;
  queueUrl: string;
}

// ============================================================================
// Desa Options Types
// ============================================================================

export interface DesaOption {
  id: string;
  nama: string;
  slug: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
}

export interface DesaOptionsResponse {
  desa: DesaOption[];
}

// ============================================================================
// Intake History Types
// ============================================================================

export interface IntakeHistorySubmission {
  id: string;
  title: string;
  status: string;
  aiMappingStatus: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  failedReason: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  desa: { id: string; nama: string; kabupaten: string };
}

export interface IntakeHistoryActivity {
  id: string;
  documentId: string | null;
  title: string;
  desaName: string;
  eventType: string;
  label: string;
  nextStatus: string | null;
  reasonText: string | null;
  createdAt: string;
}

export interface StorageModeState {
  mode: "dedicated" | "audit_fallback";
  dedicatedTableActive: boolean;
  note: string;
}

export interface IntakeHistoryResponse {
  storage: StorageModeState;
  submissions: IntakeHistorySubmission[];
  activity: IntakeHistoryActivity[];
}

// ============================================================================
// Version History Types
// ============================================================================

export interface DesaVersionEntry {
  id: string;
  documentId: string | null;
  versionNumber: number;
  reasonText: string | null;
  createdAt: string;
  changedFields: AiMappableDesaField[];
  beforeSnapshot: Partial<Record<AiMappableDesaField, string | number | null>>;
  afterSnapshot: Partial<Record<AiMappableDesaField, string | number | null>>;
  title: string;
}

export interface DesaVersionHistoryResponse {
  storage: StorageModeState;
  desa: {
    id: string;
    nama: string;
    kabupaten: string;
    dataPublishedAt: string | null;
    dataSourceLabel: string | null;
  };
  versions: DesaVersionEntry[];
}

// ============================================================================
// UI State Types
// ============================================================================

export type IntakeStep = "input" | "result";
export type IntakeMode = "upload" | "paste";

// ============================================================================
// Status Helper Types
// ============================================================================

export interface StatusBadgeInfo {
  label: string;
  note: string;
  className: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface IntakeSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export interface IntakeStatusCardProps {
  label: string;
  badge: StatusBadgeInfo;
  children?: React.ReactNode;
}

export interface IntakeDiffCardProps {
  entry: DiffEntry;
}
