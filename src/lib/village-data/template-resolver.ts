/**
 * Template Resolver — resolves which template a desa uses and which
 * components are visible (accounting for per-desa visibility overrides).
 *
 * Pre-migration fallback: when DesaDetailTemplateAssignment / VillageDetailComponent
 * tables don't exist yet, falls back to DETAIL_FIELD_STANDARDS (hardcoded constants).
 * After migration + seed-templates.mjs, reads from DB.
 */

import { db } from "@/lib/db";
import { DEFAULT_TEMPLATE_KEY, DEFAULT_TEMPLATE_NAME, DETAIL_FIELD_STANDARDS } from "@/lib/village-data/template-constants";

// ─── Module-level cache + deduplication (60s TTL) ────────────────────────────
// Cache survives across requests in the same Node.js process.
// Deduplication map ensures concurrent requests for the same desaId share one
// DB round trip instead of each firing their own (e.g. React StrictMode in dev).
const _templateCache = new Map<string, { data: ResolvedTemplate; ts: number }>();
const _inflight = new Map<string, Promise<ResolvedTemplate>>();
const TEMPLATE_CACHE_TTL_MS = 60_000;

function fromTemplateCache(key: string): ResolvedTemplate | null {
  const hit = _templateCache.get(key);
  return hit && Date.now() - hit.ts < TEMPLATE_CACHE_TTL_MS ? hit.data : null;
}
function toTemplateCache(key: string, data: ResolvedTemplate) {
  _templateCache.set(key, { data, ts: Date.now() });
}
/** Call after toggling component visibility so the cache reflects the change immediately. */
export function invalidateTemplateCache(desaId: string) {
  _templateCache.delete(desaId);
  _inflight.delete(desaId);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResolvedComponent {
  componentId: string;
  componentKey: string;
  label: string;
  displayOrder: number;
  fields: ResolvedField[];
}

export interface ResolvedField {
  fieldKey: string;
  label: string;
  valueType: string;
  isPublishableNow: boolean;
  componentKey: string;
  componentLabel: string;
}

export interface ResolvedTemplate {
  templateId: string;
  templateKey: string;
  templateName: string;
  /** Components visible for this desa (accounting for visibility overrides) */
  visibleComponents: ResolvedComponent[];
  /** Components that exist in template but are hidden for this desa */
  hiddenComponents: Array<{ componentId: string; componentKey: string; label: string; displayOrder: number }>;
}

// ─── Fallback (pre-migration) ─────────────────────────────────────────────────

function buildFallbackTemplate(): ResolvedTemplate {
  // Group DETAIL_FIELD_STANDARDS by sectionKey into pseudo-components
  const sectionMap = new Map<string, { key: string; label: string; fields: ResolvedField[] }>();
  for (const field of DETAIL_FIELD_STANDARDS) {
    if (!sectionMap.has(field.sectionKey)) {
      sectionMap.set(field.sectionKey, { key: field.sectionKey, label: field.sectionLabel, fields: [] });
    }
    sectionMap.get(field.sectionKey)!.fields.push({
      fieldKey:        field.fieldKey,
      label:           field.fieldLabel,
      valueType:       "string",
      isPublishableNow: field.publishableNow,
      componentKey:    field.sectionKey,
      componentLabel:  field.sectionLabel,
    });
  }

  const visibleComponents: ResolvedComponent[] = [...sectionMap.entries()].map(([key, sec], i) => ({
    componentId:  `fallback-${key}`,
    componentKey: key,
    label:        sec.label,
    displayOrder: i + 1,
    fields:       sec.fields,
  }));

  return {
    templateId:        "fallback",
    templateKey:       DEFAULT_TEMPLATE_KEY,
    templateName:      DEFAULT_TEMPLATE_NAME,
    visibleComponents,
    hiddenComponents:  [],
  };
}

// ─── Main resolver ────────────────────────────────────────────────────────────

/**
 * Resolve the full template for a desa, including component visibility overrides.
 * Falls back to DETAIL_FIELD_STANDARDS constants if DB tables don't exist yet.
 */
export function resolveDesaTemplate(desaId: string): Promise<ResolvedTemplate> {
  const cached = fromTemplateCache(desaId);
  if (cached) return Promise.resolve(cached);

  // Deduplicate: if a request is already in-flight for this desaId, reuse it.
  const inflight = _inflight.get(desaId);
  if (inflight) return inflight;

  const promise = _resolveDesaTemplateFromDB(desaId).then(result => {
    toTemplateCache(desaId, result);
    _inflight.delete(desaId);
    return result;
  }).catch(e => {
    _inflight.delete(desaId);
    throw e;
  });
  _inflight.set(desaId, promise);
  return promise;
}

async function _resolveDesaTemplateFromDB(desaId: string): Promise<ResolvedTemplate> {
  if (!db) return buildFallbackTemplate();

  try {
    // Run both queries in parallel — visibility overrides don't depend on assignment
    const [assignment, overrides] = await Promise.all([
      db.desaDetailTemplateAssignment.findUnique({
        where: { desaId },
        select: {
          templateId: true,
          template: {
            select: {
              id: true,
              key: true,
              name: true,
              components: {
                where: { status: "ACTIVE" },
                orderBy: { displayOrder: "asc" },
                select: {
                  id: true,
                  componentKey: true,
                  label: true,
                  isDefaultVisible: true,
                  displayOrder: true,
                  fieldStandards: {
                    where: { status: "ACTIVE" },
                    orderBy: { displayOrder: "asc" },
                    select: {
                      fieldKey: true,
                      label: true,
                      valueType: true,
                      isPublishableNow: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      db.desaDetailComponentVisibility.findMany({
        where: { desaId },
        select: { componentId: true, isVisible: true },
      }),
    ]);

    // If no assignment found, use fallback
    if (!assignment?.template) return buildFallbackTemplate();

    const template = assignment.template;

    const overrideMap = new Map<string, boolean>(
      overrides.map(o => [o.componentId, o.isVisible])
    );

    // 3. Separate visible and hidden components
    const visibleComponents: ResolvedComponent[] = [];
    const hiddenComponents: ResolvedTemplate["hiddenComponents"] = [];

    for (const comp of template.components) {
      const isVisible = overrideMap.has(comp.id)
        ? overrideMap.get(comp.id)!
        : comp.isDefaultVisible;

      const resolvedFields: ResolvedField[] = comp.fieldStandards.map(
        (f: { fieldKey: string; label: string; valueType: string; isPublishableNow: boolean }) => ({
          fieldKey:        f.fieldKey,
          label:           f.label,
          valueType:       f.valueType,
          isPublishableNow: f.isPublishableNow,
          componentKey:    comp.componentKey,
          componentLabel:  comp.label,
        })
      );

      if (isVisible) {
        visibleComponents.push({
          componentId:  comp.id,
          componentKey: comp.componentKey,
          label:        comp.label,
          displayOrder: comp.displayOrder,
          fields:       resolvedFields,
        });
      } else {
        hiddenComponents.push({
          componentId:  comp.id,
          componentKey: comp.componentKey,
          label:        comp.label,
          displayOrder: comp.displayOrder,
        });
      }
    }

    return {
      templateId:       template.id,
      templateKey:      template.key,
      templateName:     template.name,
      visibleComponents,
      hiddenComponents,
    };
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[template-resolver] error for", desaId, e);
    }
    return buildFallbackTemplate();
  }
}

/**
 * Get all publishable fields for a desa (visible components only).
 * Used by intake pipeline to determine field coverage.
 */
export async function resolvePublishableFields(desaId: string): Promise<ResolvedField[]> {
  const resolved = await resolveDesaTemplate(desaId);
  return resolved.visibleComponents
    .flatMap(c => c.fields)
    .filter(f => f.isPublishableNow);
}

/**
 * Check if a component is visible for a desa.
 * Used by intake to label "detected but component hidden".
 */
export async function isComponentVisibleForDesa(desaId: string, componentKey: string): Promise<boolean> {
  const resolved = await resolveDesaTemplate(desaId);
  return resolved.visibleComponents.some(c => c.componentKey === componentKey);
}

export interface ComponentSource {
  documentTitle: string | null;
  publishedAt: string | null;
}

/**
 * Get published DataDesa values for a desa given an already-resolved template.
 * Also returns per-component source info for public attribution.
 * Only PUBLISHED + isActive=true rows from VISIBLE components are returned.
 */
export async function getPublishedDataDesa(
  desaId: string,
  resolved: ResolvedTemplate,
): Promise<{ publishedValues: Record<string, unknown>; componentSources: Record<string, ComponentSource> }> {
  if (!db) return { publishedValues: {}, componentSources: {} };

  try {
    const componentIdToKey = new Map(
      resolved.visibleComponents
        .filter(c => !c.componentId.startsWith("fallback-"))
        .map(c => [c.componentId, c.componentKey])
    );

    const visibleComponentIds = [...componentIdToKey.keys()];
    if (visibleComponentIds.length === 0) return { publishedValues: {}, componentSources: {} };

    const rows = await db.dataDesa.findMany({
      where: {
        desaId,
        status: "PUBLISHED",
        isActive: true,
        componentId: { in: visibleComponentIds },
      },
      select: { fieldKey: true, valueJson: true, valueText: true, componentId: true, sourceId: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    // Collect unique source document IDs for title lookup
    const sourceIds = [...new Set(
      rows.map(r => r.sourceId).filter((id): id is string => typeof id === "string" && id.startsWith("intake_"))
    )];

    const docTitleMap = new Map<string, string>();
    if (sourceIds.length > 0) {
      const docs = await db.adminDesaDocument.findMany({
        where: { id: { in: sourceIds } },
        select: { id: true, title: true },
      });
      for (const doc of docs) docTitleMap.set(doc.id, doc.title);
    }

    const publishedValues: Record<string, unknown> = {};
    // componentSources: one source per componentKey (most recently published)
    const componentSources: Record<string, ComponentSource> = {};

    for (const row of rows) {
      publishedValues[row.fieldKey] = row.valueJson ?? row.valueText;

      const componentKey = componentIdToKey.get(row.componentId);
      if (componentKey && !componentSources[componentKey]) {
        componentSources[componentKey] = {
          documentTitle: row.sourceId ? (docTitleMap.get(row.sourceId) ?? null) : null,
          publishedAt: row.publishedAt?.toISOString() ?? null,
        };
      }
    }

    return { publishedValues, componentSources };
  } catch {
    return { publishedValues: {}, componentSources: {} };
  }
}
