import { describe, expect, it } from "vitest";
import {
  DEFAULT_COMPONENT_CATALOG_MANIFEST,
  DEFAULT_PUBLISHED_TEMPLATE_FIELD_COUNT,
} from "@/lib/village-data/component-catalog-manifest";

describe("component catalog manifest", () => {
  it("keeps perangkat fields inside profil_desa without changing total field count", () => {
    const componentKeys = DEFAULT_COMPONENT_CATALOG_MANIFEST.map(
      (component) => component.componentKey,
    );
    const profilComponent = DEFAULT_COMPONENT_CATALOG_MANIFEST.find(
      (component) => component.componentKey === "profil_desa",
    );

    expect(componentKeys).not.toContain("perangkat");
    expect(DEFAULT_PUBLISHED_TEMPLATE_FIELD_COUNT).toBe(37);
    expect(profilComponent?.fields.map((field) => field.fieldKey)).toEqual(
      expect.arrayContaining(["kepalaDesa", "perangkatDesa"]),
    );
  });

  it("gives every component a stable slot and preview contract", () => {
    for (const component of DEFAULT_COMPONENT_CATALOG_MANIFEST) {
      expect(component.rendererType.length).toBeGreaterThan(0);
      expect(component.previewVariant.length).toBeGreaterThan(0);
      expect(component.detailSlot.length).toBeGreaterThan(0);
    }
  });
});
