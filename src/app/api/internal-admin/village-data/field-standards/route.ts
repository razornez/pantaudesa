import { NextRequest, NextResponse } from "next/server";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { handleApiError } from "@/lib/api-error";
import { DETAIL_FIELD_STANDARDS, type DetailFieldStandard } from "@/lib/intake/detail-field-coverage";
import { DEFAULT_TEMPLATE_KEY, DEFAULT_TEMPLATE_NAME } from "@/lib/village-data/template-constants";
import { resolveDesaTemplate } from "@/lib/village-data/template-resolver";

export async function GET(req: NextRequest) {
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;

    const desaId = req.nextUrl.searchParams.get("desaId")?.trim() ?? "";

    // If desaId provided and migration is active → use template-resolver
    if (desaId) {
      try {
        const resolved = await resolveDesaTemplate(desaId);
        if (resolved.templateId !== "fallback") {
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
            totalFields:      resolved.visibleComponents.flatMap(c => c.fields).length,
            publishableCount: resolved.visibleComponents.flatMap(c => c.fields).filter(f => f.isPublishableNow).length,
          });
        }
      } catch {
        // Fall through to default
      }
    }

    // Fallback: group DETAIL_FIELD_STANDARDS by section (pre-migration)
    const sectionMap = new Map<string, { sectionKey: string; sectionLabel: string; fields: DetailFieldStandard[] }>();
    for (const field of DETAIL_FIELD_STANDARDS) {
      if (!sectionMap.has(field.sectionKey)) {
        sectionMap.set(field.sectionKey, { sectionKey: field.sectionKey, sectionLabel: field.sectionLabel, fields: [] });
      }
      sectionMap.get(field.sectionKey)!.fields.push(field);
    }

    const publishableCount = DETAIL_FIELD_STANDARDS.filter((f: DetailFieldStandard) => f.publishableNow).length;
    const holdCount = DETAIL_FIELD_STANDARDS.filter((f: DetailFieldStandard) => !f.publishableNow).length;

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
