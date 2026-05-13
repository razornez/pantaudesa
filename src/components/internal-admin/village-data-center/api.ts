import type { AdminDesaFilter } from "@/components/internal-admin/AdminDesaFilterBar";
import type {
  DesaComponentData,
  DesaRow,
  FieldStandard,
  FieldStandardsData,
  AuditRow,
  VersionRow,
} from "./types";

interface DbComponentPayload {
  componentId: string;
  componentKey: string;
  label: string;
  displayOrder: number;
  fields?: unknown[];
}

interface SectionPayload {
  sectionKey: string;
  sectionLabel: string;
  fields?: unknown[];
}

interface FieldStandardsPayload {
  templateKey: string;
  templateName: string;
  source: "db" | "fallback";
  totalFields: number;
  publishableCount: number;
  holdCount?: number;
  visibleComponents?: DbComponentPayload[];
  hiddenComponents?: Omit<DbComponentPayload, "fields">[];
  sections?: SectionPayload[];
}

function toDbFieldArray(fields: unknown[] | undefined, component: DbComponentPayload): FieldStandard[] {
  return (fields ?? []).map(
    (field): FieldStandard => ({
      sectionKey: component.componentKey,
      sectionLabel: component.label,
      fieldKey:
        typeof field === "object" &&
        field !== null &&
        "fieldKey" in field &&
        typeof field.fieldKey === "string"
          ? field.fieldKey
          : "",
      fieldLabel:
        typeof field === "object" &&
        field !== null &&
        "label" in field &&
        typeof field.label === "string"
          ? field.label
          : "",
      publishableNow:
        typeof field === "object" &&
        field !== null &&
        "isPublishableNow" in field &&
        typeof field.isPublishableNow === "boolean"
          ? field.isPublishableNow
          : false,
      aiDetectable: true,
      currentModelSource: "DataDesa",
      sourceRequirement: undefined,
      validationRequirement: undefined,
      deferredReason:
        typeof field === "object" &&
        field !== null &&
        "isPublishableNow" in field &&
        field.isPublishableNow === true
          ? null
          : "Belum diaktifkan untuk template ini.",
    }),
  );
}

interface VersionsPayload {
  versions?: VersionRow[];
  auditEvents?: AuditRow[];
  total?: number;
}

interface DesaDataPayload {
  desa?: DesaRow[];
  total?: number;
}

function buildFilterParams(filter: AdminDesaFilter, page?: number) {
  const params = new URLSearchParams();
  if (filter.q) params.set("q", filter.q);
  if (filter.provinsi) params.set("provinsi", filter.provinsi);
  if (filter.kabupaten) params.set("kabupaten", filter.kabupaten);
  if (filter.kecamatan) params.set("kecamatan", filter.kecamatan);
  if (page) params.set("page", String(page));
  return params;
}

function normalizeFieldStandards(payload: FieldStandardsPayload): FieldStandardsData {
  if (payload.source === "db" && payload.visibleComponents) {
    const sections = payload.visibleComponents.map((component) => ({
      sectionKey: component.componentKey,
      sectionLabel: component.label,
      fields: toDbFieldArray(component.fields, component),
    }));

    return {
      templateKey: payload.templateKey,
      templateName: payload.templateName,
      source: "db",
      totalFields: payload.totalFields,
      publishableCount: payload.publishableCount,
      sections,
      holdCount: payload.holdCount ?? payload.totalFields - payload.publishableCount,
      visibleComponents: payload.visibleComponents.map((component) => ({
        componentId: component.componentId,
        componentKey: component.componentKey,
        label: component.label,
        displayOrder: component.displayOrder,
        fields: toDbFieldArray(component.fields, component).map((field) => ({
          fieldKey: field.fieldKey,
          label: field.fieldLabel,
          valueType: "unknown",
          isPublishableNow: field.publishableNow,
          componentKey: field.sectionKey,
          componentLabel: field.sectionLabel,
        })),
      })),
    };
  }

  return payload as FieldStandardsData;
}

function normalizeDesaComponentData(payload: FieldStandardsPayload): DesaComponentData {
  if (payload.source === "db" && payload.visibleComponents) {
    return {
      templateKey: payload.templateKey,
      templateName: payload.templateName,
      source: "db",
      visibleComponents: payload.visibleComponents.map((component) => ({
        componentId: component.componentId,
        componentKey: component.componentKey,
        label: component.label,
        displayOrder: component.displayOrder,
        fieldCount: Array.isArray(component.fields) ? component.fields.length : 0,
      })),
      hiddenComponents: (payload.hiddenComponents ?? []).map((component) => ({
        componentId: component.componentId,
        componentKey: component.componentKey,
        label: component.label,
        displayOrder: component.displayOrder,
      })),
      totalFields: payload.totalFields,
      publishableCount: payload.publishableCount,
    };
  }

  return {
    templateKey: payload.templateKey,
    templateName: payload.templateName,
    source: "fallback",
    visibleComponents: (payload.sections ?? []).map((section, index) => ({
      componentId: `fallback-${section.sectionKey}`,
      componentKey: section.sectionKey,
      label: section.sectionLabel,
      displayOrder: index + 1,
      fieldCount: Array.isArray(section.fields) ? section.fields.length : 0,
    })),
    hiddenComponents: [],
    totalFields: payload.totalFields,
    publishableCount: payload.publishableCount,
  };
}

export async function fetchFieldStandards(): Promise<FieldStandardsData> {
  const response = await fetch("/api/internal-admin/village-data/field-standards");
  if (!response.ok) {
    throw new Error("Gagal memuat standar field.");
  }

  return normalizeFieldStandards((await response.json()) as FieldStandardsPayload);
}

export async function fetchDesaComponentData(desaId: string): Promise<DesaComponentData> {
  const response = await fetch(
    `/api/internal-admin/village-data/field-standards?desaId=${encodeURIComponent(desaId)}`,
  );
  if (!response.ok) {
    throw new Error("Gagal memuat visibilitas komponen.");
  }

  return normalizeDesaComponentData((await response.json()) as FieldStandardsPayload);
}

export async function saveComponentVisibility(input: {
  desaId: string;
  componentId: string;
  isVisible: boolean;
}): Promise<void> {
  const response = await fetch("/api/internal-admin/village-data/component-visibility", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Gagal memperbarui visibilitas komponen.");
  }
}

export async function fetchDesaData(
  filter: AdminDesaFilter,
  page: number,
): Promise<Required<DesaDataPayload>> {
  const response = await fetch(
    `/api/internal-admin/village-data/desa-data?${buildFilterParams(filter, page).toString()}`,
  );
  if (!response.ok) {
    throw new Error("Gagal memuat data desa.");
  }

  const payload = (await response.json()) as DesaDataPayload;
  return {
    desa: payload.desa ?? [],
    total: payload.total ?? 0,
  };
}

export async function fetchVersionsData(
  filter: AdminDesaFilter,
  extra?: { pageSize?: number },
): Promise<Required<VersionsPayload>> {
  const params = buildFilterParams(filter);
  if (extra?.pageSize) params.set("pageSize", String(extra.pageSize));

  const response = await fetch(`/api/internal-admin/village-data/versions?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Gagal memuat riwayat versi.");
  }

  const payload = (await response.json()) as VersionsPayload;
  return {
    versions: payload.versions ?? [],
    auditEvents: payload.auditEvents ?? [],
    total: payload.total ?? 0,
  };
}
