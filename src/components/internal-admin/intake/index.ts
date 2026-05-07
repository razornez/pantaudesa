/**
 * Intake Workbench Components
 * 
 * These are extracted components from the monolithic IntakeWorkbench.tsx
 * in the parent directory for better maintainability.
 * 
 * Components available:
 * - types: All TypeScript interfaces
 * - constants: UI copy, labels, sample texts
 * - utils: Formatters and helpers
 * - hooks: useIntakePipeline, useDesaOptions, useIntakeHistory, useVersionHistory
 * - IntakeSection: Reusable collapsible section
 * - IntakeStatusCards: Status summary cards
 * - IntakeCoveragePanel: Field coverage display
 * - IntakeDiffPanel: Diff display
 * - IntakeAiStatusPanel: AI/parser status details
 * - Status helpers: getMappingStatus, getValidationStatus, etc.
 */

// Types
export * from "./types";

// Constants
export * from "./constants";

// Utils
export * from "./utils";

// Hooks
export * from "./hooks";

// Components
export { IntakeSection, IntakeCompactSection } from "./IntakeSection";
export { IntakeStatusCards, StatusBadgeInline, StatusMini } from "./IntakeStatusCards";
export { IntakeCoveragePanel } from "./IntakeCoveragePanel";
export { IntakeDiffPanel } from "./IntakeDiffPanel";
export { IntakeAiStatusPanel } from "./IntakeAiStatusPanel";
export {
  getMappingStatus,
  getValidationStatus,
  getReviewStatus,
  getOpenAiStatus,
  getMappedFieldEntries,
  getChangedFieldList,
  getReviewableContentCount,
  canSubmitToReview,
} from "./IntakeStatusHelpers";
