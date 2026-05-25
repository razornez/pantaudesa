import { describe, expect, it } from "vitest";
import { buildRuntimeTemplateManifest } from "@/lib/village-data/runtime-template-manifest";

describe("runtime template manifest", () => {
  it("counts only visible template-backed fields in visibleFieldCount", () => {
    const manifest = buildRuntimeTemplateManifest({
      templateId: "tpl_runtime",
      templateKey: "CURRENT_PUBLIC_DETAIL_TEMPLATE",
      templateName: "Template Umum Desa",
      visibleComponents: [
        {
          componentId: "cmp_identitas",
          componentKey: "identitas",
          label: "Identitas",
          displayOrder: 1,
          fields: [
            {
              fieldKey: "websiteUrl",
              label: "Website resmi",
              valueType: "url",
              isPublishableNow: true,
              componentKey: "identitas",
              componentLabel: "Identitas",
            },
            {
              fieldKey: "kategori",
              label: "Kategori desa",
              valueType: "string",
              isPublishableNow: true,
              componentKey: "identitas",
              componentLabel: "Identitas",
            },
          ],
        },
      ],
      hiddenComponents: [
        {
          componentId: "cmp_hidden",
          componentKey: "demografi",
          label: "Demografi",
          displayOrder: 2,
          fields: [
            {
              fieldKey: "jumlahPenduduk",
              label: "Jumlah penduduk",
              valueType: "number",
              isPublishableNow: true,
              componentKey: "demografi",
              componentLabel: "Demografi",
            },
          ],
        },
      ],
    });

    expect(manifest.visibleFieldCount).toBe(2);
    expect(manifest.totalFieldCount).toBe(3);
    expect(manifest.componentOrder).toEqual(["identitas", "demografi"]);
  });

  it("keeps publishable count in sync with the same manifest field map", () => {
    const manifest = buildRuntimeTemplateManifest({
      templateId: "tpl_publishable",
      templateKey: "CURRENT_PUBLIC_DETAIL_TEMPLATE",
      templateName: "Template Umum Desa",
      visibleComponents: [
        {
          componentId: "cmp_kinerja",
          componentKey: "kinerja",
          label: "Kinerja",
          displayOrder: 1,
          fields: [
            {
              fieldKey: "outputFisik",
              label: "Output fisik",
              valueType: "json",
              isPublishableNow: true,
              componentKey: "kinerja",
              componentLabel: "Kinerja",
            },
            {
              fieldKey: "apbdesItems",
              label: "Rincian APBDes",
              valueType: "json",
              isPublishableNow: true,
              componentKey: "kinerja",
              componentLabel: "Kinerja",
            },
          ],
        },
      ],
      hiddenComponents: [],
    });

    expect(manifest.publishableCount).toBe(2);
    expect(manifest.fieldMap.has("outputFisik")).toBe(true);
    expect(manifest.fieldMap.has("apbdesItems")).toBe(true);
  });
});
