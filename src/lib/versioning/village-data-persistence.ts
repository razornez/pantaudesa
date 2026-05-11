import { randomBytes } from "node:crypto";
import { Prisma, type DataDesaStatus } from "@/generated/prisma";
import { AI_MAPPABLE_DESA_FIELDS, type AiMappableDesaField } from "@/lib/admin-claim/ai-mapping";
import { db } from "@/lib/db";
import {
  getChangedVersionFields,
  normalizeVersionSnapshot,
  type DesaVersionSnapshot,
} from "@/lib/versioning/desa-versioning";

const AI_MAPPABLE_FIELD_SET = new Set<string>(AI_MAPPABLE_DESA_FIELDS);

type SqlExecutor = {
  $queryRaw<T = unknown>(query: Prisma.Sql): Promise<T>;
  $executeRaw(query: Prisma.Sql): Promise<number>;
};

type TableAvailabilityReason = "db_unavailable" | "table_missing" | "not_found" | "query_failed";

export type PersistedVillageDataVersionStatus =
  | "REVIEW_READY"
  | "PUBLISHED"
  | "REPLACED"
  | "REJECTED"
  | "FAILED";

export interface PersistedVillageDataVersion {
  id: string;
  desaId: string;
  sourceDocumentId: string | null;
  versionNumber: number;
  status: PersistedVillageDataVersionStatus;
  title: string;
  sourceLabel: string | null;
  reviewNote: string | null;
  changedFields: AiMappableDesaField[];
  proposedSnapshot: DesaVersionSnapshot;
  beforeSnapshot: DesaVersionSnapshot;
  publishedSnapshot: DesaVersionSnapshot;
  createdByUserId: string | null;
  publishedByUserId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DesaDataAuditEventRecord {
  id: string;
  desaId: string;
  sourceDocumentId: string | null;
  villageDataVersionId: string | null;
  actorUserId: string | null;
  actorRole: string | null;
  eventType: string;
  eventLabel: string | null;
  previousStatus: string | null;
  nextStatus: string | null;
  note: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface VersionRow {
  id: string;
  desaId: string;
  sourceDocumentId: string | null;
  versionNumber: number;
  status: string;
  title: string;
  sourceLabel: string | null;
  reviewNote: string | null;
  changedFields: string[] | null;
  proposedSnapshotJson: unknown;
  beforeSnapshotJson: unknown;
  publishedSnapshotJson: unknown;
  createdByUserId: string | null;
  publishedByUserId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuditRow {
  id: string;
  desaId: string;
  sourceDocumentId: string | null;
  villageDataVersionId: string | null;
  actorUserId: string | null;
  actorRole: string | null;
  eventType: string;
  eventLabel: string | null;
  previousStatus: string | null;
  nextStatus: string | null;
  note: string | null;
  metadata: unknown;
  createdAt: Date;
}

const VERSION_TABLE = "village_data_versions";
const AUDIT_TABLE = "desa_data_audit_events";

function getExecutor(executor?: SqlExecutor | null): SqlExecutor | null {
  return executor ?? db ?? null;
}

function createStoreId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

function toTextArraySql(values: readonly string[]): Prisma.Sql {
  return values.length
    ? Prisma.sql`ARRAY[${Prisma.join(values)}]::TEXT[]`
    : Prisma.sql`ARRAY[]::TEXT[]`;
}

function toJsonbSql(value: unknown): Prisma.Sql {
  return Prisma.sql`CAST(${JSON.stringify(value ?? null)} AS JSONB)`;
}

function toNullableJsonbSql(value: unknown): Prisma.Sql {
  return value === null || value === undefined ? Prisma.sql`NULL` : toJsonbSql(value);
}

function asAuditMetadata(input: unknown): Record<string, unknown> | null {
  return typeof input === "object" && input !== null && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : null;
}

function normalizeChangedFields(input: readonly string[] | null | undefined): AiMappableDesaField[] {
  return (input ?? []).filter(
    (field): field is AiMappableDesaField =>
      (AI_MAPPABLE_DESA_FIELDS as readonly string[]).includes(field),
  );
}

function mapVersionRow(row: VersionRow): PersistedVillageDataVersion {
  return {
    id: row.id,
    desaId: row.desaId,
    sourceDocumentId: row.sourceDocumentId,
    versionNumber: row.versionNumber,
    status:
      row.status === "FAILED" || row.status === "REPLACED" || row.status === "REJECTED"
        ? row.status
        : row.status === "PUBLISHED"
        ? "PUBLISHED"
        : "REVIEW_READY",
    title: row.title,
    sourceLabel: row.sourceLabel,
    reviewNote: row.reviewNote,
    changedFields: normalizeChangedFields(row.changedFields),
    proposedSnapshot: normalizeVersionSnapshot(row.proposedSnapshotJson),
    beforeSnapshot: normalizeVersionSnapshot(row.beforeSnapshotJson),
    publishedSnapshot: normalizeVersionSnapshot(row.publishedSnapshotJson),
    createdByUserId: row.createdByUserId,
    publishedByUserId: row.publishedByUserId,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapAuditRow(row: AuditRow): DesaDataAuditEventRecord {
  return {
    id: row.id,
    desaId: row.desaId,
    sourceDocumentId: row.sourceDocumentId,
    villageDataVersionId: row.villageDataVersionId,
    actorUserId: row.actorUserId,
    actorRole: row.actorRole,
    eventType: row.eventType,
    eventLabel: row.eventLabel,
    previousStatus: row.previousStatus,
    nextStatus: row.nextStatus,
    note: row.note,
    metadata: asAuditMetadata(row.metadata),
    createdAt: row.createdAt.toISOString(),
  };
}

async function doesTableExist(
  tableName: string,
  executor?: SqlExecutor | null,
): Promise<boolean> {
  const client = getExecutor(executor);
  if (!client) return false;

  try {
    const rows = await client.$queryRaw<Array<{ exists: boolean }>>(Prisma.sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = current_schema()
          AND table_name = ${tableName}
      ) AS "exists"
    `);

    return rows[0]?.exists ?? false;
  } catch {
    return false;
  }
}

async function findVersionBySourceDocumentId(
  sourceDocumentId: string,
  executor?: SqlExecutor | null,
): Promise<PersistedVillageDataVersion | null> {
  const client = getExecutor(executor);
  if (!client) return null;

  const rows = await client.$queryRaw<VersionRow[]>(Prisma.sql`
    SELECT
      "id",
      "desaId",
      "sourceDocumentId",
      "versionNumber",
      "status",
      "title",
      "sourceLabel",
      "reviewNote",
      "changedFields",
      "proposedSnapshotJson",
      "beforeSnapshotJson",
      "publishedSnapshotJson",
      "createdByUserId",
      "publishedByUserId",
      "publishedAt",
      "createdAt",
      "updatedAt"
    FROM "village_data_versions"
    WHERE "sourceDocumentId" = ${sourceDocumentId}
    ORDER BY "createdAt" DESC
    LIMIT 1
  `);

  return rows[0] ? mapVersionRow(rows[0]) : null;
}

async function getNextVersionNumberFromTable(
  desaId: string,
  executor?: SqlExecutor | null,
): Promise<number> {
  const client = getExecutor(executor);
  if (!client) return 1;

  const rows = await client.$queryRaw<Array<{ nextVersionNumber: number | bigint | null }>>(
    Prisma.sql`
      SELECT COALESCE(MAX("versionNumber"), 0) + 1 AS "nextVersionNumber"
      FROM "village_data_versions"
      WHERE "desaId" = ${desaId}
    `,
  );

  const value = rows[0]?.nextVersionNumber;
  if (typeof value === "bigint") return Number(value);
  return typeof value === "number" && Number.isFinite(value) ? value : 1;
}

export async function hasVillageVersionTable(executor?: SqlExecutor | null): Promise<boolean> {
  return doesTableExist(VERSION_TABLE, executor);
}

export async function hasDesaDataAuditTable(executor?: SqlExecutor | null): Promise<boolean> {
  return doesTableExist(AUDIT_TABLE, executor);
}

export async function syncReviewReadyVillageVersion(
  input: {
    desaId: string;
    sourceDocumentId: string;
    title: string;
    sourceLabel?: string | null;
    reviewNote?: string | null;
    changedFields: AiMappableDesaField[];
    proposedSnapshot: DesaVersionSnapshot;
    beforeSnapshot?: DesaVersionSnapshot | null;
    createdByUserId?: string | null;
  },
  executor?: SqlExecutor | null,
): Promise<{ persisted: boolean; id?: string; versionNumber?: number; reason?: TableAvailabilityReason }> {
  const client = getExecutor(executor);
  if (!client) return { persisted: false, reason: "db_unavailable" };
  if (!(await doesTableExist(VERSION_TABLE, client))) {
    return { persisted: false, reason: "table_missing" };
  }

  try {
    const existing = await findVersionBySourceDocumentId(input.sourceDocumentId, client);
    const id = existing?.id ?? createStoreId("vdv");
    const versionNumber =
      existing?.versionNumber ?? (await getNextVersionNumberFromTable(input.desaId, client));
    const beforeSnapshot = normalizeVersionSnapshot(input.beforeSnapshot);
    const proposedSnapshot = normalizeVersionSnapshot(input.proposedSnapshot);
    const changedFields =
      input.changedFields.length > 0
        ? input.changedFields
        : getChangedVersionFields({ before: beforeSnapshot, after: proposedSnapshot });

    if (existing) {
      await client.$executeRaw(Prisma.sql`
        UPDATE "village_data_versions"
        SET
          "status" = 'REVIEW_READY',
          "title" = ${input.title},
          "sourceLabel" = ${input.sourceLabel ?? null},
          "reviewNote" = ${input.reviewNote ?? null},
          "changedFields" = ${toTextArraySql(changedFields)},
          "proposedSnapshotJson" = ${toJsonbSql(proposedSnapshot)},
          "beforeSnapshotJson" = ${toNullableJsonbSql(beforeSnapshot)},
          "updatedAt" = NOW()
        WHERE "id" = ${id}
      `);
    } else {
      await client.$executeRaw(Prisma.sql`
        INSERT INTO "village_data_versions" (
          "id",
          "desaId",
          "sourceDocumentId",
          "versionNumber",
          "status",
          "title",
          "sourceLabel",
          "reviewNote",
          "changedFields",
          "proposedSnapshotJson",
          "beforeSnapshotJson",
          "createdByUserId",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${id},
          ${input.desaId},
          ${input.sourceDocumentId},
          ${versionNumber},
          'REVIEW_READY',
          ${input.title},
          ${input.sourceLabel ?? null},
          ${input.reviewNote ?? null},
          ${toTextArraySql(changedFields)},
          ${toJsonbSql(proposedSnapshot)},
          ${toNullableJsonbSql(beforeSnapshot)},
          ${input.createdByUserId ?? null},
          NOW(),
          NOW()
        )
      `);
    }

    return { persisted: true, id, versionNumber };
  } catch (error) {
    console.error("[village-version] sync review-ready failed", error);
    return { persisted: false, reason: "query_failed" };
  }
}

export async function publishVillageDataVersion(
  input: {
    desaId: string;
    sourceDocumentId?: string | null;
    title: string;
    sourceLabel?: string | null;
    reviewNote?: string | null;
    changedFields: AiMappableDesaField[];
    proposedSnapshot: DesaVersionSnapshot;
    beforeSnapshot?: DesaVersionSnapshot | null;
    publishedSnapshot: DesaVersionSnapshot;
    createdByUserId?: string | null;
    publishedByUserId?: string | null;
    publishedAt?: Date;
  },
  executor?: SqlExecutor | null,
): Promise<{ persisted: boolean; id?: string; versionNumber?: number; reason?: TableAvailabilityReason }> {
  const client = getExecutor(executor);
  if (!client) return { persisted: false, reason: "db_unavailable" };
  if (!(await doesTableExist(VERSION_TABLE, client))) {
    return { persisted: false, reason: "table_missing" };
  }

  try {
    const existing =
      input.sourceDocumentId ? await findVersionBySourceDocumentId(input.sourceDocumentId, client) : null;
    const id = existing?.id ?? createStoreId("vdv");
    const versionNumber =
      existing?.versionNumber ?? (await getNextVersionNumberFromTable(input.desaId, client));
    const beforeSnapshot =
      Object.keys(normalizeVersionSnapshot(input.beforeSnapshot)).length > 0
        ? normalizeVersionSnapshot(input.beforeSnapshot)
        : existing?.beforeSnapshot ?? {};
    const proposedSnapshot =
      Object.keys(normalizeVersionSnapshot(input.proposedSnapshot)).length > 0
        ? normalizeVersionSnapshot(input.proposedSnapshot)
        : existing?.proposedSnapshot ?? normalizeVersionSnapshot(input.publishedSnapshot);
    const publishedSnapshot = normalizeVersionSnapshot(input.publishedSnapshot);
    const changedFields =
      input.changedFields.length > 0
        ? input.changedFields
        : getChangedVersionFields({ before: beforeSnapshot, after: publishedSnapshot });

    if (existing) {
      await client.$executeRaw(Prisma.sql`
        UPDATE "village_data_versions"
        SET
          "status" = 'PUBLISHED',
          "title" = ${input.title},
          "sourceLabel" = ${input.sourceLabel ?? null},
          "reviewNote" = ${input.reviewNote ?? existing.reviewNote ?? null},
          "changedFields" = ${toTextArraySql(changedFields)},
          "proposedSnapshotJson" = ${toJsonbSql(proposedSnapshot)},
          "beforeSnapshotJson" = ${toNullableJsonbSql(beforeSnapshot)},
          "publishedSnapshotJson" = ${toJsonbSql(publishedSnapshot)},
          "publishedByUserId" = ${input.publishedByUserId ?? null},
          "publishedAt" = ${input.publishedAt ?? new Date()},
          "updatedAt" = NOW()
        WHERE "id" = ${id}
      `);
    } else {
      await client.$executeRaw(Prisma.sql`
        INSERT INTO "village_data_versions" (
          "id",
          "desaId",
          "sourceDocumentId",
          "versionNumber",
          "status",
          "title",
          "sourceLabel",
          "reviewNote",
          "changedFields",
          "proposedSnapshotJson",
          "beforeSnapshotJson",
          "publishedSnapshotJson",
          "createdByUserId",
          "publishedByUserId",
          "publishedAt",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${id},
          ${input.desaId},
          ${input.sourceDocumentId ?? null},
          ${versionNumber},
          'PUBLISHED',
          ${input.title},
          ${input.sourceLabel ?? null},
          ${input.reviewNote ?? null},
          ${toTextArraySql(changedFields)},
          ${toJsonbSql(proposedSnapshot)},
          ${toNullableJsonbSql(beforeSnapshot)},
          ${toJsonbSql(publishedSnapshot)},
          ${input.createdByUserId ?? null},
          ${input.publishedByUserId ?? null},
          ${input.publishedAt ?? new Date()},
          NOW(),
          NOW()
        )
      `);
    }

    return { persisted: true, id, versionNumber };
  } catch (error) {
    console.error("[village-version] publish failed", error);
    return { persisted: false, reason: "query_failed" };
  }
}

export async function failVillageDataVersionForDocument(
  input: {
    sourceDocumentId: string;
    reason?: string | null;
  },
  executor?: SqlExecutor | null,
): Promise<{ persisted: boolean; id?: string; versionNumber?: number; reason?: TableAvailabilityReason }> {
  const client = getExecutor(executor);
  if (!client) return { persisted: false, reason: "db_unavailable" };
  if (!(await doesTableExist(VERSION_TABLE, client))) {
    return { persisted: false, reason: "table_missing" };
  }

  try {
    const existing = await findVersionBySourceDocumentId(input.sourceDocumentId, client);
    if (!existing) return { persisted: false, reason: "not_found" };

    await client.$executeRaw(Prisma.sql`
      UPDATE "village_data_versions"
      SET
        "status" = 'FAILED',
        "reviewNote" = ${input.reason ?? existing.reviewNote ?? null},
        "updatedAt" = NOW()
      WHERE "id" = ${existing.id}
    `);

    return {
      persisted: true,
      id: existing.id,
      versionNumber: existing.versionNumber,
    };
  } catch (error) {
    console.error("[village-version] mark failed failed", error);
    return { persisted: false, reason: "query_failed" };
  }
}

export async function listPublishedVillageDataVersions(input: {
  desaId: string;
  limit?: number;
}): Promise<{ available: boolean; versions: PersistedVillageDataVersion[] }> {
  const client = getExecutor();
  if (!client || !(await doesTableExist(VERSION_TABLE, client))) {
    return { available: false, versions: [] };
  }

  try {
    const limit = Math.max(1, Math.min(input.limit ?? 10, 50));
    const rows = await client.$queryRaw<VersionRow[]>(Prisma.sql`
      SELECT
        "id",
        "desaId",
        "sourceDocumentId",
        "versionNumber",
        "status",
        "title",
        "sourceLabel",
        "reviewNote",
        "changedFields",
        "proposedSnapshotJson",
        "beforeSnapshotJson",
        "publishedSnapshotJson",
        "createdByUserId",
        "publishedByUserId",
        "publishedAt",
        "createdAt",
        "updatedAt"
      FROM "village_data_versions"
      WHERE "desaId" = ${input.desaId}
        AND "status" = 'PUBLISHED'
      ORDER BY "versionNumber" DESC, "createdAt" DESC
      LIMIT ${limit}
    `);

    return { available: true, versions: rows.map(mapVersionRow) };
  } catch (error) {
    console.error("[village-version] list published versions failed", error);
    return { available: false, versions: [] };
  }
}

export async function writeDesaDataAuditEvent(
  input: {
    desaId: string;
    sourceDocumentId?: string | null;
    villageDataVersionId?: string | null;
    actorUserId?: string | null;
    actorRole?: string | null;
    eventType: string;
    eventLabel?: string | null;
    previousStatus?: string | null;
    nextStatus?: string | null;
    note?: string | null;
    metadata?: Record<string, unknown> | null;
  },
  executor?: SqlExecutor | null,
): Promise<{ persisted: boolean; id?: string; reason?: TableAvailabilityReason }> {
  const client = getExecutor(executor);
  if (!client) return { persisted: false, reason: "db_unavailable" };
  if (!(await doesTableExist(AUDIT_TABLE, client))) {
    return { persisted: false, reason: "table_missing" };
  }

  const id = createStoreId("dda");

  try {
    await client.$executeRaw(Prisma.sql`
      INSERT INTO "desa_data_audit_events" (
        "id",
        "desaId",
        "sourceDocumentId",
        "villageDataVersionId",
        "actorUserId",
        "actorRole",
        "eventType",
        "eventLabel",
        "previousStatus",
        "nextStatus",
        "note",
        "metadata",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${id},
        ${input.desaId},
        ${input.sourceDocumentId ?? null},
        ${input.villageDataVersionId ?? null},
        ${input.actorUserId ?? null},
        ${input.actorRole ?? null},
        ${input.eventType},
        ${input.eventLabel ?? null},
        ${input.previousStatus ?? null},
        ${input.nextStatus ?? null},
        ${input.note ?? null},
        ${toNullableJsonbSql(input.metadata ?? null)},
        NOW(),
        NOW()
      )
    `);

    return { persisted: true, id };
  } catch (error) {
    console.error("[desa-data-audit] write failed", error);
    return { persisted: false, reason: "query_failed" };
  }
}

export async function listDesaDataAuditEventsForDocuments(input: {
  documentIds: string[];
  limit?: number;
}): Promise<{ available: boolean; events: DesaDataAuditEventRecord[] }> {
  const client = getExecutor();
  if (!client || input.documentIds.length === 0 || !(await doesTableExist(AUDIT_TABLE, client))) {
    return { available: false, events: [] };
  }

  try {
    const limit = Math.max(1, Math.min(input.limit ?? 12, 50));
    const rows = await client.$queryRaw<AuditRow[]>(Prisma.sql`
      SELECT
        "id",
        "desaId",
        "sourceDocumentId",
        "villageDataVersionId",
        "actorUserId",
        "actorRole",
        "eventType",
        "eventLabel",
        "previousStatus",
        "nextStatus",
        "note",
        "metadata",
        "createdAt"
      FROM "desa_data_audit_events"
      WHERE "sourceDocumentId" IN (${Prisma.join(input.documentIds)})
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `);

    return { available: true, events: rows.map(mapAuditRow) };
  } catch (error) {
    console.error("[desa-data-audit] list events failed", error);
    return { available: false, events: [] };
  }
}

// ─── DataDesa operations ──────────────────────────────────────────────────────

/** Minimal shape passed from intake result */
export interface IntakeDetectedField {
  fieldKey: string;
  value: string;
}

/** Minimal resolved template shape needed for DataDesa writes */
export interface ResolvedTemplateForWrite {
  templateId: string;
  visibleComponents: Array<{
    componentId: string;
    fields: Array<{ fieldKey: string }>;
  }>;
}

export interface DataDesaRowRecord {
  id: string;
  desaId: string;
  desaNama: string | null;
  templateId: string;
  componentId: string;
  componentKey: string | null;
  componentLabel: string | null;
  fieldKey: string;
  valueText: string | null;
  valueJson: unknown;
  sourceId: string | null;
  status: string;
  isActive: boolean;
  publishedAt: string | null;
  reviewedById: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Write DataDesa rows from an intake pipeline result.
 * - Skips AI_MAPPABLE fields (handled by VillageDataVersion).
 * - Skips fields not in visible components of the resolved template.
 * - Upserts INTO existing IN_REVIEW/DRAFT rows (value update only).
 * - Creates new IN_REVIEW rows when none exist.
 * - NEVER auto-publishes or downgrades PUBLISHED rows.
 */
export async function writeDataDesaFromIntake(input: {
  desaId: string;
  sourceDocumentId: string;
  detectedFields: IntakeDetectedField[];
  resolvedTemplate: ResolvedTemplateForWrite;
}): Promise<{ written: number; skipped: number }> {
  if (!db) return { written: 0, skipped: input.detectedFields.length };

  // Build fieldKey → componentId map from visible components only
  const fieldToComponent = new Map<string, { componentId: string; templateId: string }>();
  for (const component of input.resolvedTemplate.visibleComponents) {
    for (const field of component.fields) {
      fieldToComponent.set(field.fieldKey, {
        componentId: component.componentId,
        templateId: input.resolvedTemplate.templateId,
      });
    }
  }

  let written = 0;
  let skipped = 0;

  for (const detected of input.detectedFields) {
    if (AI_MAPPABLE_FIELD_SET.has(detected.fieldKey)) { skipped++; continue; }

    const componentInfo = fieldToComponent.get(detected.fieldKey);
    if (!componentInfo) { skipped++; continue; }

    const value = detected.value.trim();
    if (!value) { skipped++; continue; }

    try {
      const existing = await db.dataDesa.findFirst({
        where: {
          desaId: input.desaId,
          componentId: componentInfo.componentId,
          fieldKey: detected.fieldKey,
          status: { in: ["IN_REVIEW", "DRAFT"] },
        },
        select: { id: true },
      });

      if (existing) {
        await db.dataDesa.update({
          where: { id: existing.id },
          data: { valueText: value, sourceId: input.sourceDocumentId },
        });
      } else {
        await db.dataDesa.create({
          data: {
            desaId: input.desaId,
            templateId: componentInfo.templateId,
            componentId: componentInfo.componentId,
            fieldKey: detected.fieldKey,
            valueText: value,
            sourceId: input.sourceDocumentId,
            status: "IN_REVIEW",
            isActive: true,
          },
        });
      }
      written++;
    } catch (err) {
      console.error(`[data-desa-write] field ${detected.fieldKey}`, err);
      skipped++;
    }
  }

  return { written, skipped };
}

/**
 * Create or update a DataDesa row from manual admin input.
 * Always starts as IN_REVIEW — never auto-published.
 */
export async function createManualDataDesa(input: {
  desaId: string;
  templateId: string;
  componentId: string;
  fieldKey: string;
  valueText: string;
  sourceNote?: string | null;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!db) return { ok: false, error: "DB unavailable" };

  try {
    const existing = await db.dataDesa.findFirst({
      where: {
        desaId: input.desaId,
        componentId: input.componentId,
        fieldKey: input.fieldKey,
        status: { in: ["IN_REVIEW", "DRAFT"] },
      },
      select: { id: true },
    });

    if (existing) {
      await db.dataDesa.update({
        where: { id: existing.id },
        data: { valueText: input.valueText, sourceId: input.sourceNote ?? null, status: "IN_REVIEW" },
      });
      return { ok: true, id: existing.id };
    }

    const created = await db.dataDesa.create({
      data: {
        desaId: input.desaId,
        templateId: input.templateId,
        componentId: input.componentId,
        fieldKey: input.fieldKey,
        valueText: input.valueText,
        sourceId: input.sourceNote ?? null,
        status: "IN_REVIEW",
        isActive: true,
      },
    });
    return { ok: true, id: created.id };
  } catch (err) {
    console.error("[data-desa] create manual failed", err);
    return { ok: false, error: "Gagal menyimpan data" };
  }
}

/** Approve (publish) a DataDesa IN_REVIEW row. Archives any currently active PUBLISHED row for the same field. */
export async function publishDataDesaRow(input: {
  id: string;
  desaId: string;
  componentId: string;
  fieldKey: string;
  reviewedById: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!db) return { ok: false, error: "DB unavailable" };

  try {
    // Archive any previously PUBLISHED active row for the same field
    await db.dataDesa.updateMany({
      where: {
        desaId: input.desaId,
        componentId: input.componentId,
        fieldKey: input.fieldKey,
        status: "PUBLISHED",
        isActive: true,
        NOT: { id: input.id },
      },
      data: { isActive: false, status: "ARCHIVED" },
    });

    await db.dataDesa.update({
      where: { id: input.id },
      data: {
        status: "PUBLISHED",
        isActive: true,
        publishedAt: new Date(),
        reviewedById: input.reviewedById,
      },
    });

    return { ok: true };
  } catch (err) {
    console.error("[data-desa] publish failed", err);
    return { ok: false, error: "Gagal menerbitkan data" };
  }
}

/** Reject a DataDesa IN_REVIEW row. Public data is unchanged. */
export async function rejectDataDesaRow(input: {
  id: string;
  reviewedById: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!db) return { ok: false, error: "DB unavailable" };

  try {
    await db.dataDesa.update({
      where: { id: input.id },
      data: { status: "REJECTED", isActive: false, reviewedById: input.reviewedById },
    });
    return { ok: true };
  } catch (err) {
    console.error("[data-desa] reject failed", err);
    return { ok: false, error: "Gagal menolak data" };
  }
}

function mapDataDesaRow(row: {
  id: string; desaId: string; templateId: string; componentId: string; fieldKey: string;
  valueText: string | null; valueJson: unknown; sourceId: string | null; status: string;
  isActive: boolean; publishedAt: Date | null; reviewedById: string | null;
  createdAt: Date; updatedAt: Date;
  desa?: { nama: string } | null;
  component?: { componentKey: string; label: string } | null;
}): DataDesaRowRecord {
  return {
    id: row.id,
    desaId: row.desaId,
    desaNama: row.desa?.nama ?? null,
    templateId: row.templateId,
    componentId: row.componentId,
    componentKey: row.component?.componentKey ?? null,
    componentLabel: row.component?.label ?? null,
    fieldKey: row.fieldKey,
    valueText: row.valueText,
    valueJson: row.valueJson,
    sourceId: row.sourceId,
    status: row.status,
    isActive: row.isActive,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    reviewedById: row.reviewedById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** List DataDesa rows with optional filters. Returns rows joined with desa name and component label. */
export async function listDataDesaRows(input: {
  desaId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: DataDesaRowRecord[]; total: number }> {
  if (!db) return { rows: [], total: 0 };

  const page = Math.max(1, input.page ?? 1);
  const take = Math.min(50, input.pageSize ?? 20);
  const skip = (page - 1) * take;

  const where = {
    ...(input.desaId ? { desaId: input.desaId } : {}),
    ...(input.status ? { status: input.status as DataDesaStatus } : {}),
  };

  try {
    const [rows, total] = await Promise.all([
      db.dataDesa.findMany({
        where,
        include: {
          desa: { select: { nama: true } },
          component: { select: { componentKey: true, label: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      db.dataDesa.count({ where }),
    ]);

    return { rows: rows.map(mapDataDesaRow), total };
  } catch (err) {
    console.error("[data-desa] list failed", err);
    return { rows: [], total: 0 };
  }
}
