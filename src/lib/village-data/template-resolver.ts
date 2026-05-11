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
export async function resolveDesaTemplate(desaId: string): Promise<ResolvedTemplate> {
  if (!db) return buildFallbackTemplate();

  try {
    // 1. Find template assignment for this desa
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignment = await (db as any).desaDetailTemplateAssignment?.findUnique({
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
    });

    // If table doesn't exist or no assignment found, use fallback
    if (!assignment?.template) return buildFallbackTemplate();

    const template = assignment.template;

    // 2. Get visibility overrides for this desa
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const overrides = await (db as any).desaDetailComponentVisibility?.findMany({
      where: { desaId },
      select: { componentId: true, isVisible: true },
    }) ?? [];

    const overrideMap = new Map<string, boolean>(
      overrides.map((o: { componentId: string; isVisible: boolean }) => [o.componentId, o.isVisible])
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
  } catch {
    // Tables don't exist yet (pre-migration) — use fallback
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

/**
 * Get published DataDesa values for a desa (PUBLISHED + visible components only).
 * Used by public detail page for hybrid data merge.
 */
export async function getPublishedDataDesa(desaId: string): Promise<Record<string, unknown>> {
  if (!db) return {};

  try {
    const resolved = await resolveDesaTemplate(desaId);
    const visibleComponentIds = resolved.visibleComponents.map(c => c.componentId)
      .filter(id => !id.startsWith("fallback-"));

    if (visibleComponentIds.length === 0) return {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (db as any).dataDesa?.findMany({
      where: {
        desaId,
        status: "PUBLISHED",
        isActive: true,
        componentId: { in: visibleComponentIds },
      },
      select: { fieldKey: true, valueJson: true, valueText: true },
    }) ?? [];

    const result: Record<string, unknown> = {};
    for (const row of rows) {
      result[row.fieldKey] = row.valueJson ?? row.valueText;
    }
    return result;
  } catch {
    return {};
  }
}
