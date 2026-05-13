export type VillageDataCenterTab = "standards" | "desa-data" | "versions" | "activity";

export interface FieldStandard {
  sectionKey: string;
  sectionLabel: string;
  fieldKey: string;
  fieldLabel: string;
  publishableNow: boolean;
  aiDetectable: boolean;
  currentModelSource: string;
  sourceRequirement?: string;
  validationRequirement?: string;
  deferredReason?: string | null;
}

export interface DbField {
  fieldKey: string;
  label: string;
  valueType: string;
  isPublishableNow: boolean;
  componentKey: string;
  componentLabel: string;
}

export interface FieldStandardsData {
  templateKey: string;
  templateName: string;
  source: "db" | "fallback";
  totalFields: number;
  publishableCount: number;
  holdCount: number;
  visibleComponents?: Array<{
    componentId: string;
    componentKey: string;
    label: string;
    displayOrder: number;
    fields: DbField[];
  }>;
  sections?: Array<{
    sectionKey: string;
    sectionLabel: string;
    fields: FieldStandard[];
  }>;
}

export interface DesaComponent {
  componentId: string;
  componentKey: string;
  label: string;
  displayOrder: number;
  fieldCount: number;
}

export interface DesaComponentData {
  templateKey: string;
  templateName: string;
  source: "db" | "fallback";
  visibleComponents: DesaComponent[];
  hiddenComponents: Array<{
    componentId: string;
    componentKey: string;
    label: string;
    displayOrder: number;
  }>;
  totalFields: number;
  publishableCount: number;
}

export interface DesaRow {
  id: string;
  nama: string;
  slug: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  websiteUrl: string | null;
  kategori: string | null;
  tahunData: number | null;
  jumlahPenduduk: number | null;
  dataStatus: string;
  dataSourceLabel: string | null;
  dataPublishedAt: string | null;
  _count: { villageDataVersions: number };
  detailTemplateAssignment?: {
    template: { key: string; name: string };
  } | null;
}

export interface VersionRow {
  id: string;
  desaId: string;
  versionNumber: number;
  status: string;
  title: string;
  sourceLabel: string | null;
  changedFields: string[];
  reviewNote: string | null;
  publishedAt: string | null;
  createdAt: string;
  desa: { nama: string; kecamatan: string; kabupaten: string };
}

export interface AuditRow {
  id: string;
  desaId: string;
  eventType: string;
  eventLabel: string | null;
  actorRole: string | null;
  note: string | null;
  createdAt: string;
  desa: { nama: string };
}
