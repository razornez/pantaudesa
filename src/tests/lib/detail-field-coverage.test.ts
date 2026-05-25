import { describe, expect, it } from "vitest";
import { DETAIL_FIELD_STANDARDS } from "@/lib/intake/detail-field-coverage";

describe("detail field coverage metadata", () => {
  it("maps perangkat ownership into profil metadata", () => {
    const kepalaDesa = DETAIL_FIELD_STANDARDS.find(
      (field) => field.fieldKey === "kepalaDesa",
    );
    const perangkatDesa = DETAIL_FIELD_STANDARDS.find(
      (field) => field.fieldKey === "perangkatDesa",
    );

    expect(kepalaDesa).toMatchObject({
      sectionKey: "profil",
      sectionLabel: "Profil desa",
      publishableNow: true,
    });
    expect(perangkatDesa).toMatchObject({
      sectionKey: "profil",
      sectionLabel: "Profil desa",
      publishableNow: true,
      deferredReason: null,
    });
  });
});
