/**
 * village-template-read.ts
 *
 * Reads published template data for the public desa detail page.
 * Enforces: ONLY PUBLISHED DataDesa from VISIBLE components is returned.
 * Hidden components and non-published data are NEVER exposed here.
 */

import { resolveDesaTemplate, getPublishedDataDesa } from "@/lib/village-data/template-resolver";
import type { ResolvedTemplate } from "@/lib/village-data/template-resolver";

export type { ResolvedTemplate };

export interface PublishedTemplateData {
  resolvedTemplate: ResolvedTemplate;
  /** field key → published value (from DataDesa PUBLISHED rows, visible components only) */
  publishedValues: Record<string, unknown>;
}

/**
 * Get the resolved template and all published DataDesa values for a desa.
 * Safe to call from public pages — never leaks draft/rejected/hidden data.
 *
 * Falls back gracefully before migration: returns empty publishedValues
 * and uses DETAIL_FIELD_STANDARDS as the template.
 */
export async function getPublishedTemplateData(desaId: string): Promise<PublishedTemplateData> {
  const [resolvedTemplate, publishedValues] = await Promise.all([
    resolveDesaTemplate(desaId),
    getPublishedDataDesa(desaId),
  ]);

  return { resolvedTemplate, publishedValues };
}
