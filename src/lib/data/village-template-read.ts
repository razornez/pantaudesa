/**
 * village-template-read.ts
 *
 * Reads published template data for the public desa detail page.
 * Enforces: ONLY PUBLISHED DataDesa from VISIBLE components is returned.
 * Hidden components and non-published data are NEVER exposed here.
 */

import { resolveDesaTemplate, getPublishedDataDesa } from "@/lib/village-data/template-resolver";
import type { ResolvedTemplate, ComponentSource } from "@/lib/village-data/template-resolver";

export type { ResolvedTemplate, ComponentSource };

export interface PublishedTemplateData {
  resolvedTemplate: ResolvedTemplate;
  /** fieldKey → published value (PUBLISHED + isActive, visible components only) */
  publishedValues: Record<string, unknown>;
  /** componentKey → source document info, for public attribution */
  componentSources: Record<string, ComponentSource>;
}

/**
 * Get the resolved template, published DataDesa values, and source attribution for a desa.
 * Safe to call from public pages — never leaks draft/rejected/hidden data.
 */
export async function getPublishedTemplateData(desaId: string): Promise<PublishedTemplateData> {
  const resolvedTemplate = await resolveDesaTemplate(desaId);
  const { publishedValues, componentSources } = await getPublishedDataDesa(desaId, resolvedTemplate);
  return { resolvedTemplate, publishedValues, componentSources };
}
