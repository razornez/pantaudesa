export type PublicDetailSlotKey =
  | "first_view"
  | "sumber_dokumen"
  | "transparansi"
  | "ringkasan_anggaran"
  | "kinerja_anggaran"
  | "kelengkapan_desa"
  | "panduan_warga"
  | "suara_warga";

const LEGACY_PUBLIC_DETAIL_COMPONENT_KEYS = new Set([
  "identitas",
  "demografi",
  "perangkat",
  "sumber_dokumen",
  "transparansi",
  "anggaran",
  "pendapatan",
  "kinerja",
  "profil_desa",
  "panduan_warga",
  "suara_warga",
]);

export function isLegacyPublicDetailComponent(componentKey: string) {
  return LEGACY_PUBLIC_DETAIL_COMPONENT_KEYS.has(componentKey);
}

export type PublicDetailRenderItem =
  | {
      kind: "legacy_slot";
      slot: PublicDetailSlotKey;
    }
  | {
      kind: "registry_component";
      componentKey: string;
      slot: PublicDetailSlotKey;
    };

export function getOrderedVisibleSlots(
  componentKeys: string[],
  getDetailSlot: (componentKey: string) => PublicDetailSlotKey | undefined,
): PublicDetailSlotKey[] {
  const slots: PublicDetailSlotKey[] = [];
  const seen = new Set<PublicDetailSlotKey>();

  for (const componentKey of componentKeys) {
    const slot = getDetailSlot(componentKey);
    if (!slot || seen.has(slot)) continue;
    seen.add(slot);
    slots.push(slot);
  }

  return slots;
}

export function buildPublicDetailRenderPlan(
  componentKeys: string[],
  getDetailSlot: (componentKey: string) => PublicDetailSlotKey | undefined,
): PublicDetailRenderItem[] {
  const plan: PublicDetailRenderItem[] = [];
  const emittedLegacySlots = new Set<PublicDetailSlotKey>();

  for (const componentKey of componentKeys) {
    const slot = getDetailSlot(componentKey);
    if (!slot) continue;

    if (isLegacyPublicDetailComponent(componentKey)) {
      if (emittedLegacySlots.has(slot)) continue;
      emittedLegacySlots.add(slot);
      plan.push({ kind: "legacy_slot", slot });
      continue;
    }

    plan.push({ kind: "registry_component", componentKey, slot });
  }

  return plan;
}

export function groupRegistryOnlyComponentKeysBySlot(
  componentKeys: string[],
  getDetailSlot: (componentKey: string) => PublicDetailSlotKey | undefined,
) {
  const grouped = new Map<PublicDetailSlotKey, string[]>();

  for (const componentKey of componentKeys) {
    if (isLegacyPublicDetailComponent(componentKey)) continue;

    const slot = getDetailSlot(componentKey);
    if (!slot) continue;

    const slotComponents = grouped.get(slot) ?? [];
    slotComponents.push(componentKey);
    grouped.set(slot, slotComponents);
  }

  return grouped;
}
