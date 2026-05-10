/**
 * Village data template constants.
 *
 * MVP: all desa use CURRENT_PUBLIC_DETAIL_TEMPLATE.
 * Future: each desa can be assigned a different template via
 * DesaDetailTemplateAssignment (schema proposal in prisma/schema.prisma).
 */

export const DEFAULT_TEMPLATE_KEY = "CURRENT_PUBLIC_DETAIL_TEMPLATE";

export const DEFAULT_TEMPLATE_NAME = "Template Detail Desa Publik (Saat Ini)";

/**
 * Resolve which template key applies to a given desa.
 * For MVP, always returns the default. When DesaDetailTemplateAssignment
 * is activated, read desa.detailTemplateAssignment?.template.key instead.
 */
export function resolveTemplateKey(): string {
  // TODO: when schema is migrated, fetch from DesaDetailTemplateAssignment
  return DEFAULT_TEMPLATE_KEY;
}

// Re-export the live field registry — single source of truth.
// Do NOT duplicate this array anywhere else.
export { DETAIL_FIELD_STANDARDS, buildDetailFieldRegistryPrompt, type DetailFieldStandard } from "@/lib/intake/detail-field-coverage";
