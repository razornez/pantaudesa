import { describe, expect, it } from "vitest";
import { DEFAULT_COMPONENT_CATALOG_MANIFEST } from "@/lib/village-data/component-catalog-manifest";
import { PUBLIC_TEMPLATE_COMPONENT_REGISTRY } from "@/components/desa/public-template-registry";

describe("public template component registry", () => {
  it("covers every registered component key from the manifest", () => {
    const manifestKeys = DEFAULT_COMPONENT_CATALOG_MANIFEST.map(
      (component) => component.componentKey,
    ).sort();
    const registryKeys = Object.keys(PUBLIC_TEMPLATE_COMPONENT_REGISTRY).sort();

    expect(registryKeys).toEqual(manifestKeys);
  });

  it("provides a renderer and anchor metadata for every component", () => {
    for (const component of DEFAULT_COMPONENT_CATALOG_MANIFEST) {
      const entry = PUBLIC_TEMPLATE_COMPONENT_REGISTRY[component.componentKey];

      expect(entry).toBeDefined();
      expect(entry.componentKey).toBe(component.componentKey);
      expect(entry.anchorId.length).toBeGreaterThan(0);
      expect(entry.detailSlot).toBe(component.detailSlot);
      expect(entry.navLabel.length).toBeGreaterThan(0);
      expect(typeof entry.render).toBe("function");
      expect(typeof entry.preview).toBe("function");
    }
  });
});
