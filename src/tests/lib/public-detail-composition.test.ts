import { describe, expect, it } from "vitest";
import {
  buildPublicDetailRenderPlan,
  getOrderedVisibleSlots,
} from "@/lib/village-data/public-detail-composition";
import { PUBLIC_TEMPLATE_COMPONENT_REGISTRY } from "@/components/desa/public-template-registry";
import type { PublicDetailSlotKey } from "@/lib/village-data/public-detail-composition";

function getDetailSlot(componentKey: string) {
  return PUBLIC_TEMPLATE_COMPONENT_REGISTRY[componentKey]
    ?.detailSlot as PublicDetailSlotKey | undefined;
}

describe("public detail composition", () => {
  it("renders catalog-only components according to component order, not first slot position", () => {
    const componentKeys = ["panduan_warga", "suara_warga", "agenda_desa"];

    expect(getOrderedVisibleSlots(componentKeys, getDetailSlot)).toEqual([
      "panduan_warga",
      "suara_warga",
    ]);
    expect(buildPublicDetailRenderPlan(componentKeys, getDetailSlot)).toEqual([
      { kind: "legacy_slot", slot: "panduan_warga" },
      { kind: "legacy_slot", slot: "suara_warga" },
      {
        kind: "registry_component",
        componentKey: "agenda_desa",
        slot: "panduan_warga",
      },
    ]);
  });

  it("keeps registry-only components renderable even when the legacy slot owner is hidden", () => {
    const componentKeys = ["agenda_desa", "suara_warga"];

    expect(getOrderedVisibleSlots(componentKeys, getDetailSlot)).toEqual([
      "panduan_warga",
      "suara_warga",
    ]);
    expect(buildPublicDetailRenderPlan(componentKeys, getDetailSlot)).toEqual([
      {
        kind: "registry_component",
        componentKey: "agenda_desa",
        slot: "panduan_warga",
      },
      { kind: "legacy_slot", slot: "suara_warga" },
    ]);
  });
});
