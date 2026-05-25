import type {
  ResolvedComponent,
  ResolvedField,
  ResolvedTemplate,
} from "@/lib/village-data/template-resolver";
import {
  DEFAULT_COMPONENT_CATALOG_BY_KEY,
  type RegisteredVillageComponentKey,
} from "@/lib/village-data/component-catalog-manifest";

export interface RuntimeTemplateManifestComponent extends ResolvedComponent {
  isVisible: boolean;
  fieldCount: number;
}

export interface RuntimeTemplateManifest {
  templateId: string;
  templateKey: string;
  templateName: string;
  componentOrder: string[];
  components: RuntimeTemplateManifestComponent[];
  visibleComponents: RuntimeTemplateManifestComponent[];
  hiddenComponents: RuntimeTemplateManifestComponent[];
  fieldMap: Map<string, ResolvedField>;
  visibleFieldCount: number;
  totalFieldCount: number;
  publishableCount: number;
}

export function mergeResolvedFieldsWithCatalogManifest(input: {
  componentId: string;
  componentKey: RegisteredVillageComponentKey | string;
  componentLabel: string;
  fields: ResolvedField[];
}): ResolvedField[] {
  const fallbackComponent = DEFAULT_COMPONENT_CATALOG_BY_KEY.get(
    input.componentKey as RegisteredVillageComponentKey,
  );
  if (!fallbackComponent) return input.fields;

  const existingByFieldKey = new Map(
    input.fields.map((field) => [field.fieldKey, field]),
  );

  return fallbackComponent.fields.map((fieldDef) => {
    const existing = existingByFieldKey.get(fieldDef.fieldKey);
    if (existing) return existing;

    return {
      componentId: input.componentId,
      fieldStandardId: undefined,
      fieldKey: fieldDef.fieldKey,
      label: fieldDef.label,
      valueType: fieldDef.valueType,
      validationRules: null,
      sourcePolicy: null,
      isRequired: false,
      isPublicVisible: true,
      isPublishableNow: fieldDef.isPublishableNow,
      componentKey: input.componentKey,
      componentLabel: input.componentLabel,
    } satisfies ResolvedField;
  });
}

function sortComponents(
  components: RuntimeTemplateManifestComponent[],
): RuntimeTemplateManifestComponent[] {
  return [...components].sort((left, right) => left.displayOrder - right.displayOrder);
}

export function buildRuntimeTemplateManifest(
  resolvedTemplate: ResolvedTemplate,
): RuntimeTemplateManifest {
  const visibleComponents = sortComponents(
    resolvedTemplate.visibleComponents.map((component) => ({
      ...component,
      isVisible: true,
      fieldCount: component.fields.length,
    })),
  );
  const hiddenComponents = sortComponents(
    resolvedTemplate.hiddenComponents.map((component) => ({
      ...component,
      isVisible: false,
      fieldCount: component.fields.length,
    })),
  );
  const components = [...visibleComponents, ...hiddenComponents];
  const fieldMap = new Map<string, ResolvedField>();

  for (const component of components) {
    for (const field of component.fields) {
      fieldMap.set(field.fieldKey, field);
    }
  }

  return {
    templateId: resolvedTemplate.templateId,
    templateKey: resolvedTemplate.templateKey,
    templateName: resolvedTemplate.templateName,
    componentOrder: components.map((component) => component.componentKey),
    components,
    visibleComponents,
    hiddenComponents,
    fieldMap,
    visibleFieldCount: visibleComponents.reduce(
      (sum, component) => sum + component.fieldCount,
      0,
    ),
    totalFieldCount: components.reduce(
      (sum, component) => sum + component.fieldCount,
      0,
    ),
    publishableCount: [...fieldMap.values()].filter(
      (field) => field.isPublishableNow,
    ).length,
  };
}

export function toRuntimeProgressSources(manifest: RuntimeTemplateManifest) {
  return manifest.components.map((component) => ({
    componentId: component.componentId,
    componentKey: component.componentKey,
    label: component.label,
    displayOrder: component.displayOrder,
    isVisible: component.isVisible,
    fields: component.fields.map((field) => ({
      fieldKey: field.fieldKey,
      label: field.label,
    })),
  }));
}
