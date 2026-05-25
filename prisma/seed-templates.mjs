import { PrismaClient } from "../src/generated/prisma/index.js";
import {
  COMPONENT_CATALOG,
  DEFAULT_TEMPLATE_MANIFEST,
  LEGACY_TEMPLATE_MANIFESTS,
} from "./template-catalog.manifest.mjs";

const db = new PrismaClient();

async function supportsCatalogRelations() {
  try {
    await db.$queryRawUnsafe("SELECT 1 FROM village_component_catalog LIMIT 1");
    return true;
  } catch {
    return false;
  }
}

async function migrateLegacyPerangkatIntoProfilComponent({
  templateId,
  legacyComponentId,
  profilComponentId,
  profilFieldIdMap,
}) {
  if (!legacyComponentId || !profilComponentId) return;

  const migratedFieldKeys = ["kepalaDesa", "perangkatDesa"];
  const [legacyRows, legacyOverrides] = await Promise.all([
    db.dataDesa.findMany({
      where: {
        templateId,
        componentId: legacyComponentId,
        fieldKey: { in: migratedFieldKeys },
      },
      select: {
        id: true,
        desaId: true,
        fieldKey: true,
      },
    }),
    db.desaDetailComponentVisibility.findMany({
      where: {
        templateId,
        componentId: legacyComponentId,
      },
      select: {
        id: true,
        desaId: true,
        isVisible: true,
        reason: true,
        updatedById: true,
      },
    }),
  ]);

  for (const row of legacyRows) {
    const targetFieldStandardId = profilFieldIdMap.get(row.fieldKey) ?? null;
    const existingTargetRow = await db.dataDesa.findFirst({
      where: {
        templateId,
        componentId: profilComponentId,
        desaId: row.desaId,
        fieldKey: row.fieldKey,
        isActive: true,
        NOT: { id: row.id },
      },
      select: { id: true },
    });

    if (existingTargetRow) {
      await db.dataDesa.updateMany({
        where: { id: row.id },
        data: {
          status: "ARCHIVED",
          isActive: false,
          reviewNote:
            "Archived during template seed sync after perangkat fields moved into profil_desa.",
        },
      });
      continue;
    }

    await db.dataDesa.updateMany({
      where: { id: row.id },
      data: {
        componentId: profilComponentId,
        fieldStandardId: targetFieldStandardId,
      },
    });
  }

  for (const override of legacyOverrides) {
    await db.desaDetailComponentVisibility.upsert({
      where: {
        desaId_componentId: {
          desaId: override.desaId,
          componentId: profilComponentId,
        },
      },
      create: {
        desaId: override.desaId,
        templateId,
        componentId: profilComponentId,
        isVisible: override.isVisible,
        reason: override.reason,
        updatedById: override.updatedById,
      },
      update: {
        isVisible: override.isVisible,
        reason: override.reason,
        updatedById: override.updatedById,
      },
    });
  }

  if (legacyOverrides.length > 0) {
    await db.desaDetailComponentVisibility.deleteMany({
      where: {
        templateId,
        componentId: legacyComponentId,
      },
    });
  }
}

async function seedComponentCatalog(withCatalogTables) {
  const catalogByKey = new Map();

  if (!withCatalogTables) {
    for (const componentDef of COMPONENT_CATALOG) {
      catalogByKey.set(componentDef.componentKey, {
        id: null,
        componentKey: componentDef.componentKey,
      });
    }
    return catalogByKey;
  }

  for (const componentDef of COMPONENT_CATALOG) {
    const component = await db.villageComponentCatalog.upsert({
      where: { componentKey: componentDef.componentKey },
      create: {
        componentKey: componentDef.componentKey,
        label: componentDef.label,
        description: componentDef.description,
        componentType: componentDef.componentType,
        status: "ACTIVE",
      },
      update: {
        label: componentDef.label,
        description: componentDef.description,
        componentType: componentDef.componentType,
        status: "ACTIVE",
      },
    });

    catalogByKey.set(componentDef.componentKey, component);

    for (const fieldDef of componentDef.fields) {
      await db.villageComponentCatalogField.upsert({
        where: {
          catalogComponentId_fieldKey: {
            catalogComponentId: component.id,
            fieldKey: fieldDef.fieldKey,
          },
        },
        create: {
          catalogComponentId: component.id,
          fieldKey: fieldDef.fieldKey,
          label: fieldDef.label,
          valueType: fieldDef.valueType,
          isPublishableNow: fieldDef.isPublishableNow,
          isPublicVisible: true,
          displayOrder: fieldDef.displayOrder,
          status: "ACTIVE",
        },
        update: {
          label: fieldDef.label,
          valueType: fieldDef.valueType,
          isPublishableNow: fieldDef.isPublishableNow,
          isPublicVisible: true,
          displayOrder: fieldDef.displayOrder,
          status: "ACTIVE",
        },
      });
    }
  }

  return catalogByKey;
}

async function syncTemplatePlacements(templateId, orderedComponentDefs, catalogByKey) {
  const withCatalogTables = await supportsCatalogRelations();
  const existingPlacements = await db.villageDetailComponent.findMany({
    where: { templateId },
    select: {
      id: true,
      componentKey: true,
      fieldStandards: {
        select: { id: true, fieldKey: true },
      },
      _count: {
        select: {
          dataDesa: true,
          desaVisibility: true,
        },
      },
    },
  });

  const existingByKey = new Map(
    existingPlacements.map((placement) => [placement.componentKey, placement]),
  );
  const nextKeys = new Set(orderedComponentDefs.map((component) => component.componentKey));
  const placementIdByKey = new Map();
  const fieldStandardIdByComponentKey = new Map();

  for (const [index, componentDef] of orderedComponentDefs.entries()) {
    const catalogComponent = catalogByKey.get(componentDef.componentKey);
    if (!catalogComponent) {
      throw new Error(`Catalog component not found: ${componentDef.componentKey}`);
    }

    const placement = await db.villageDetailComponent.upsert({
      where: {
        templateId_componentKey: {
          templateId,
          componentKey: componentDef.componentKey,
        },
      },
      create: {
        templateId,
        ...(catalogComponent.id ? { catalogComponentId: catalogComponent.id } : {}),
        componentKey: componentDef.componentKey,
        label: componentDef.label,
        description: componentDef.description,
        componentType: componentDef.componentType,
        isDefaultVisible: componentDef.isDefaultVisible,
        displayOrder: index + 1,
        status: "ACTIVE",
      },
      update: {
        ...(catalogComponent.id ? { catalogComponentId: catalogComponent.id } : {}),
        label: componentDef.label,
        description: componentDef.description,
        componentType: componentDef.componentType,
        isDefaultVisible: componentDef.isDefaultVisible,
        displayOrder: index + 1,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });
    placementIdByKey.set(componentDef.componentKey, placement.id);

    const catalogFields =
      withCatalogTables && catalogComponent.id
        ? await db.villageComponentCatalogField.findMany({
            where: { catalogComponentId: catalogComponent.id, status: "ACTIVE" },
            orderBy: { displayOrder: "asc" },
          })
        : componentDef.fields.map((field) => ({
            id: null,
            fieldKey: field.fieldKey,
            label: field.label,
            valueType: field.valueType,
            sourcePolicyJson: null,
            validationRules: null,
            isRequired: false,
            isPublicVisible: true,
            isPublishableNow: field.isPublishableNow,
            displayOrder: field.displayOrder,
          }));

    const nextFieldKeys = new Set(catalogFields.map((field) => field.fieldKey));
    const existingPlacement = existingByKey.get(componentDef.componentKey);
    const staleFieldRows = (existingPlacement?.fieldStandards ?? []).filter(
      (field) => !nextFieldKeys.has(field.fieldKey),
    );

    if (staleFieldRows.length > 0) {
      await db.detailFieldStandard.updateMany({
        where: { id: { in: staleFieldRows.map((field) => field.id) } },
        data: { status: "ARCHIVED" },
      });
    }

    for (const field of catalogFields) {
      const fieldStandard = await db.detailFieldStandard.upsert({
        where: {
          templateId_componentId_fieldKey: {
            templateId,
            componentId: placement.id,
            fieldKey: field.fieldKey,
          },
        },
        create: {
          templateId,
          componentId: placement.id,
          ...(field.id ? { catalogFieldId: field.id } : {}),
          fieldKey: field.fieldKey,
          label: field.label,
          valueType: field.valueType,
          sourcePolicyJson: field.sourcePolicyJson,
          validationRules: field.validationRules,
          isRequired: field.isRequired,
          isPublicVisible: field.isPublicVisible,
          isPublishableNow: field.isPublishableNow,
          displayOrder: field.displayOrder,
          status: "ACTIVE",
        },
        update: {
          ...(field.id ? { catalogFieldId: field.id } : {}),
          label: field.label,
          valueType: field.valueType,
          sourcePolicyJson: field.sourcePolicyJson,
          validationRules: field.validationRules,
          isRequired: field.isRequired,
          isPublicVisible: field.isPublicVisible,
          isPublishableNow: field.isPublishableNow,
          displayOrder: field.displayOrder,
          status: "ACTIVE",
        },
        select: {
          id: true,
        },
      });

      const fieldMap = fieldStandardIdByComponentKey.get(componentDef.componentKey) ?? new Map();
      fieldMap.set(field.fieldKey, fieldStandard.id);
      fieldStandardIdByComponentKey.set(componentDef.componentKey, fieldMap);
    }
  }

  await migrateLegacyPerangkatIntoProfilComponent({
    templateId,
    legacyComponentId: existingByKey.get("perangkat")?.id ?? null,
    profilComponentId: placementIdByKey.get("profil_desa") ?? null,
    profilFieldIdMap: fieldStandardIdByComponentKey.get("profil_desa") ?? new Map(),
  });

  for (const placement of existingPlacements) {
    if (nextKeys.has(placement.componentKey)) continue;
    if (placement._count.dataDesa > 0 || placement._count.desaVisibility > 0) {
      await db.villageDetailComponent.updateMany({
        where: { id: placement.id },
        data: { status: "ARCHIVED" },
      });
      await db.detailFieldStandard.updateMany({
        where: { componentId: placement.id },
        data: { status: "ARCHIVED" },
      });
      continue;
    }

    await db.detailFieldStandard.deleteMany({ where: { componentId: placement.id } });
    await db.villageDetailComponent.deleteMany({ where: { id: placement.id } });
  }
}

async function seedTemplates(catalogByKey) {
  const defaultTemplate = await db.villageDetailTemplate.upsert({
    where: { key: DEFAULT_TEMPLATE_MANIFEST.key },
    create: {
      key: DEFAULT_TEMPLATE_MANIFEST.key,
      name: DEFAULT_TEMPLATE_MANIFEST.name,
      description: DEFAULT_TEMPLATE_MANIFEST.description,
      isDefault: true,
      status: "ACTIVE",
    },
    update: {
      name: DEFAULT_TEMPLATE_MANIFEST.name,
      description: DEFAULT_TEMPLATE_MANIFEST.description,
      isDefault: true,
      status: "ACTIVE",
    },
  });

  await syncTemplatePlacements(
    defaultTemplate.id,
    COMPONENT_CATALOG.filter((component) =>
      DEFAULT_TEMPLATE_MANIFEST.componentKeys.includes(component.componentKey),
    ),
    catalogByKey,
  );

  for (const legacy of LEGACY_TEMPLATE_MANIFESTS) {
    await db.villageDetailTemplate.upsert({
      where: { key: legacy.key },
      create: {
        key: legacy.key,
        name: legacy.name,
        description: legacy.description,
        isDefault: false,
        status: legacy.status,
      },
      update: {
        name: legacy.name,
        description: legacy.description,
        isDefault: false,
        status: legacy.status,
      },
    });
  }

  return defaultTemplate;
}

async function seedAssignments(templateId) {
  const desaRows = await db.desa.findMany({
    select: { id: true, nama: true },
    orderBy: { nama: "asc" },
  });

  for (const desa of desaRows) {
    await db.desaDetailTemplateAssignment.upsert({
      where: { desaId: desa.id },
      create: {
        desaId: desa.id,
        templateId,
        isActive: true,
        reason: "Unified active template",
      },
      update: {
        templateId,
        isActive: true,
        reason: "Unified active template",
      },
    });
  }

  await db.desaDetailComponentVisibility.deleteMany({});
}

function isMeaningfulFieldValue(row) {
  if (typeof row?.valueText === "string" && row.valueText.trim().length > 0) return true;
  if (Array.isArray(row?.valueJson)) return row.valueJson.length > 0;
  return row?.valueJson !== null && row?.valueJson !== undefined;
}

function normalizePerangkatPayload(perangkat, kepalaDesa) {
  if (!Array.isArray(perangkat)) return [];

  const normalized = perangkat
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      ...item,
      jabatan: typeof item.jabatan === "string" ? item.jabatan.trim() : "",
      nama: typeof item.nama === "string" ? item.nama.trim() : "",
    }))
    .filter((item) => item.jabatan && item.nama);

  if (!kepalaDesa || typeof kepalaDesa !== "string" || kepalaDesa.trim().length === 0) {
    return normalized;
  }

  const kepalaDesaName = kepalaDesa.trim();
  const kepalaDesaIndex = normalized.findIndex((item) => /kepala desa/i.test(item.jabatan));

  if (kepalaDesaIndex >= 0) {
    const next = [...normalized];
    next[kepalaDesaIndex] = {
      ...next[kepalaDesaIndex],
      nama: kepalaDesaName,
    };
    return next;
  }

  return [{ jabatan: "Kepala Desa", nama: kepalaDesaName }, ...normalized];
}

async function upsertPublishedTemplateField({
  desaId,
  templateId,
  componentId,
  fieldStandardId,
  fieldKey,
  valueText = null,
  valueJson = null,
  reviewNote,
  overwriteMeaningful = false,
}) {
  const existingRow = await db.dataDesa.findFirst({
    where: {
      desaId,
      templateId,
      componentId,
      fieldKey,
      isActive: true,
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      valueText: true,
      valueJson: true,
    },
  });

  if (existingRow && isMeaningfulFieldValue(existingRow) && !overwriteMeaningful) {
    return false;
  }

  const payload = {
    templateId,
    componentId,
    fieldStandardId,
    fieldKey,
    valueText,
    valueJson,
    sourceLabel: "Legacy perangkat_desa backfill",
    reviewNote,
    status: "PUBLISHED",
    isActive: true,
    publishedAt: new Date(),
  };

  if (existingRow) {
    await db.dataDesa.updateMany({
      where: { id: existingRow.id },
      data: payload,
    });
    return true;
  }

  await db.dataDesa.create({
    data: {
      desaId,
      ...payload,
    },
  });
  return true;
}

async function backfillLegacyPerangkatFields(templateId) {
  const profilComponent = await db.villageDetailComponent.findFirst({
    where: {
      templateId,
      componentKey: "profil_desa",
      status: "ACTIVE",
    },
    select: {
      id: true,
      fieldStandards: {
        where: {
          status: "ACTIVE",
          fieldKey: { in: ["kepalaDesa", "perangkatDesa"] },
        },
        select: {
          id: true,
          fieldKey: true,
        },
      },
    },
  });

  if (!profilComponent) return;

  const fieldIdMap = new Map(
    profilComponent.fieldStandards.map((field) => [field.fieldKey, field.id]),
  );
  const perangkatFieldId = fieldIdMap.get("perangkatDesa") ?? null;
  const kepalaDesaFieldId = fieldIdMap.get("kepalaDesa") ?? null;
  if (!perangkatFieldId && !kepalaDesaFieldId) return;

  const legacyRows = await db.perangkatDesa.findMany({
    where: {
      desa: {
        detailTemplateAssignment: {
          templateId,
          isActive: true,
        },
      },
    },
    orderBy: [{ jabatan: "asc" }, { nama: "asc" }],
    select: {
      desaId: true,
      jabatan: true,
      nama: true,
      periode: true,
      kontakLabel: true,
    },
  });

  const existingKepalaDesaRows = await db.dataDesa.findMany({
    where: {
      templateId,
      fieldKey: "kepalaDesa",
      status: "PUBLISHED",
      isActive: true,
    },
    select: {
      desaId: true,
      valueText: true,
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  });
  const kepalaDesaByDesaId = new Map();
  for (const row of existingKepalaDesaRows) {
    if (kepalaDesaByDesaId.has(row.desaId)) continue;
    if (typeof row.valueText !== "string" || row.valueText.trim().length === 0) continue;
    kepalaDesaByDesaId.set(row.desaId, row.valueText.trim());
  }

  const perangkatByDesaId = new Map();
  for (const row of legacyRows) {
    const list = perangkatByDesaId.get(row.desaId) ?? [];
    list.push({
      jabatan: row.jabatan,
      nama: row.nama,
      ...(row.periode ? { periode: row.periode } : {}),
      ...(row.kontakLabel ? { kontak: row.kontakLabel } : {}),
    });
    perangkatByDesaId.set(row.desaId, list);
  }

  for (const [desaId, perangkat] of perangkatByDesaId.entries()) {
    const legacyKepalaDesa =
      perangkat.find((item) => /kepala desa/i.test(item.jabatan))?.nama ?? null;
    const preferredKepalaDesa = kepalaDesaByDesaId.get(desaId) ?? legacyKepalaDesa;
    const normalizedPerangkat = normalizePerangkatPayload(perangkat, preferredKepalaDesa);

    if (perangkatFieldId) {
      await upsertPublishedTemplateField({
        desaId,
        templateId,
        componentId: profilComponent.id,
        fieldStandardId: perangkatFieldId,
        fieldKey: "perangkatDesa",
        valueJson: normalizedPerangkat,
        reviewNote:
          "Backfilled from legacy perangkat_desa rows after perangkat ownership moved into profil_desa.",
        overwriteMeaningful: true,
      });
    }

    if (kepalaDesaFieldId) {
      const kepalaDesa = preferredKepalaDesa;
      if (!kepalaDesa) continue;

      await upsertPublishedTemplateField({
        desaId,
        templateId,
        componentId: profilComponent.id,
        fieldStandardId: kepalaDesaFieldId,
        fieldKey: "kepalaDesa",
        valueText: kepalaDesa,
        reviewNote:
          "Backfilled kepalaDesa from legacy perangkat_desa rows after perangkat ownership moved into profil_desa.",
      });
    }
  }
}

async function main() {
  const withCatalogTables = await supportsCatalogRelations();
  console.log("Seeding template catalog...");
  const catalogByKey = await seedComponentCatalog(withCatalogTables);

  console.log("Seeding templates...");
  const defaultTemplate = await seedTemplates(catalogByKey);

  console.log("Seeding desa assignments...");
  await seedAssignments(defaultTemplate.id);

  console.log("Backfilling perangkat template fields...");
  await backfillLegacyPerangkatFields(defaultTemplate.id);

  console.log("Template seeding complete.");
}

main()
  .catch((error) => {
    console.error("Seed templates failed:", error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
