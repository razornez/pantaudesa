import { NextRequest, NextResponse } from "next/server";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { handleApiError } from "@/lib/api-error";
import { DETAIL_FIELD_STANDARDS, type DetailFieldStandard } from "@/lib/intake/detail-field-coverage";
import { DEFAULT_TEMPLATE_KEY, DEFAULT_TEMPLATE_NAME } from "@/lib/village-data/template-constants";
import { resolveDesaTemplate } from "@/lib/village-data/template-resolver";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;

    const desaId = req.nextUrl.searchParams.get("desaId")?.trim() ?? "";

    // ── Per-desa view: resolve via template-resolver ──────────────────────────
    if (desaId) {
      try {
        const resolved = await resolveDesaTemplate(desaId);
        if (resolved.templateId !== "fallback") {
          const allFields = resolved.visibleComponents.flatMap(c => c.fields);
          return NextResponse.json({
            templateKey:  resolved.templateKey,
            templateName: resolved.templateName,
            source: "db",
            visibleComponents: resolved.visibleComponents.map(c => ({
              componentId:  c.componentId,
              componentKey: c.componentKey,
              label:        c.label,
              displayOrder: c.displayOrder,
              fields:       c.fields,
            })),
            hiddenComponents: resolved.hiddenComponents.map(c => ({
              componentId:  c.componentId,
              componentKey: c.componentKey,
              label:        c.label,
              displayOrder: c.displayOrder,
            })),
            totalFields:      allFields.length,
            publishableCount: allFields.filter(f => f.isPublishableNow).length,
          });
        }
      } catch {
        // Fall through to default template
      }
    }

    // ── Default template view: load from DB (no desaId, or desaId fallback) ──
    if (db) {
      try {
        const defaultTemplate = await db.villageDetailTemplate.findFirst({
          where: { isDefault: true, status: "ACTIVE" },
          select: {
            key: true, name: true,
            components: {
              where: { status: "ACTIVE" },
              orderBy: { displayOrder: "asc" },
              select: {
                id: true, componentKey: true, label: true, displayOrder: true,
                fieldStandards: {
                  where: { status: "ACTIVE" },
                  orderBy: { displayOrder: "asc" },
                  select: {
                    fieldKey: true, label: true, valueType: true,
                    isPublishableNow: true,
                  },
                },
              },
            },
          },
        });

        if (defaultTemplate) {
          const allFields = defaultTemplate.components.flatMap(c => c.fieldStandards);
          return NextResponse.json({
            templateKey:  defaultTemplate.key,
            templateName: defaultTemplate.name,
            source: "db",
            visibleComponents: defaultTemplate.components.map(c => ({
              componentId:  c.id,
              componentKey: c.componentKey,
              label:        c.label,
              displayOrder: c.displayOrder,
              fields: c.fieldStandards.map(f => ({
                fieldKey:        f.fieldKey,
                label:           f.label,
                valueType:       f.valueType,
                isPublishableNow: f.isPublishableNow,
                componentKey:    c.componentKey,
                componentLabel:  c.label,
              })),
            })),
            hiddenComponents: [],
            totalFields:      allFields.length,
            publishableCount: allFields.filter(f => f.isPublishableNow).length,
            holdCount:        allFields.filter(f => !f.isPublishableNow).length,
          });
        }
      } catch {
        // DB not available — fall through to hardcoded fallback
      }
    }

    // ── Last resort: hardcoded pre-migration constants ────────────────────────
    const sectionMap = new Map<string, { sectionKey: string; sectionLabel: string; fields: DetailFieldStandard[] }>();
    for (const field of DETAIL_FIELD_STANDARDS) {
      if (!sectionMap.has(field.sectionKey)) {
        sectionMap.set(field.sectionKey, { sectionKey: field.sectionKey, sectionLabel: field.sectionLabel, fields: [] });
      }
      sectionMap.get(field.sectionKey)!.fields.push(field);
    }
    const publishableCount = DETAIL_FIELD_STANDARDS.filter((f: DetailFieldStandard) => f.publishableNow).length;
    const holdCount        = DETAIL_FIELD_STANDARDS.filter((f: DetailFieldStandard) => !f.publishableNow).length;

    return NextResponse.json({
      templateKey:  DEFAULT_TEMPLATE_KEY,
      templateName: DEFAULT_TEMPLATE_NAME,
      source: "fallback",
      totalFields:  DETAIL_FIELD_STANDARDS.length,
      publishableCount,
      holdCount,
      sections: [...sectionMap.values()],
    });
  } catch (error) {
    return handleApiError(error, "GET /api/internal-admin/village-data/field-standards");
  }
}
