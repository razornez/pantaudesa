import { describe, expect, it } from "vitest";
import {
  analyzeTemplateCompositionInput,
  normalizeTemplateNameToKey,
  sanitizeTemplateComponentKeys,
} from "@/lib/internal-admin/template-management-helpers";

describe("template management service helpers", () => {
  it("normalizes template names into stable uppercase keys", () => {
    expect(normalizeTemplateNameToKey("Template Umum Desa")).toBe(
      "TEMPLATE_UMUM_DESA",
    );
    expect(normalizeTemplateNameToKey("  Template   Wisata  2 ")).toBe(
      "TEMPLATE_WISATA_2",
    );
  });

  it("removes unknown and duplicate component keys", () => {
    expect(
      sanitizeTemplateComponentKeys([
        "identitas",
        "demografi",
        "identitas",
        "komponen_liar",
        "profil_desa",
      ]),
    ).toEqual(["identitas", "demografi", "profil_desa"]);
  });

  it("flags duplicate and unknown component keys for composition saves", () => {
    expect(
      analyzeTemplateCompositionInput([
        "identitas",
        "demografi",
        "identitas",
        "komponen_liar",
      ]),
    ).toEqual({
      normalizedKeys: ["identitas", "demografi"],
      duplicateKeys: ["identitas"],
      unknownKeys: ["komponen_liar"],
    });
  });
});
