-- Sprint 05 DataDesa Review Seed Sample
-- Purpose: create source-backed IN_REVIEW DataDesa rows for testing /internal-admin/village-data?tab=review
--
-- Governance: this simulates data extracted from a trusted uploaded document.
-- It does NOT create public data directly. Rows are IN_REVIEW only.
--
-- Usage:
-- 1. Change params.target_slug to the desa you want to test.
-- 2. Run this in Supabase SQL Editor or a safe dev DB.
-- 3. Open /internal-admin/village-data?tab=review.
-- 4. Publish/reject rows from Review Data.
-- 5. Confirm only PUBLISHED + isActive rows appear on public desa detail.
--
-- Safe to rerun: removes only rows linked to seed_source_document_id.

BEGIN;

WITH params AS (
  SELECT
    'arjasari'::text AS target_slug,
    'qa_s05_data_desa_review_seed_document'::text AS seed_source_document_id,
    'QA Sprint 05 — Sample Dokumen Sumber Data Desa'::text AS seed_document_title
),
target_desa AS (
  SELECT d.id, d.nama, d.slug
  FROM desa d
  JOIN params p ON d.slug = p.target_slug
  LIMIT 1
),
effective_template AS (
  SELECT
    td.id AS desa_id,
    COALESCE(assigned.id, default_template.id) AS template_id
  FROM target_desa td
  LEFT JOIN desa_detail_template_assignments assign
    ON assign."desaId" = td.id
   AND assign."isActive" = true
  LEFT JOIN village_detail_templates assigned
    ON assigned.id = assign."templateId"
   AND assigned.status = 'ACTIVE'
  LEFT JOIN village_detail_templates default_template
    ON default_template."isDefault" = true
   AND default_template.status = 'ACTIVE'
  LIMIT 1
),
cleanup_seed_rows AS (
  DELETE FROM data_desa dd
  USING params p
  WHERE dd."sourceId" = p.seed_source_document_id
  RETURNING dd.id
),
upsert_source_document AS (
  INSERT INTO admin_desa_documents (
    id,
    "desaId",
    "uploadedById",
    title,
    category,
    "storageKey",
    "fileName",
    "fileType",
    "fileSize",
    status,
    "aiMappingStatus",
    "aiMappingResult",
    "createdAt",
    "updatedAt"
  )
  SELECT
    p.seed_source_document_id,
    td.id,
    NULL,
    p.seed_document_title,
    'qa_seed_data_desa_review',
    CONCAT('qa/sprint-05/', td.slug, '/sample-data-desa-source.txt'),
    'sample-data-desa-source.txt',
    'text/plain',
    4096,
    'PROCESSING',
    'DRAFT_READY_REVIEW',
    jsonb_build_object(
      'qaSeed', true,
      'sourceBacked', true,
      'note', 'Sample QA only. Simulates trusted document extraction for DataDesa review.'
    ),
    NOW(),
    NOW()
  FROM params p
  JOIN target_desa td ON true
  ON CONFLICT (id) DO UPDATE SET
    "desaId" = EXCLUDED."desaId",
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    "storageKey" = EXCLUDED."storageKey",
    "fileName" = EXCLUDED."fileName",
    "fileType" = EXCLUDED."fileType",
    "fileSize" = EXCLUDED."fileSize",
    status = EXCLUDED.status,
    "aiMappingStatus" = EXCLUDED."aiMappingStatus",
    "aiMappingResult" = EXCLUDED."aiMappingResult",
    "updatedAt" = NOW()
  RETURNING id
),
seed_values AS (
  SELECT * FROM (VALUES
    ('teleponDesa', '+62 22 5550 0101'),
    ('emailDesa', 'sekretariat.qa@example.desa.id'),
    ('potensiUnggulan', 'Pertanian hortikultura, wisata alam, dan UMKM olahan pangan.'),
    ('fasilitasUmum', 'Balai desa, posyandu, PAUD, lapangan olahraga, dan pasar desa.'),
    ('asetDesa', 'Tanah kas desa, gedung serbaguna, kendaraan operasional, dan peralatan pelayanan.'),
    ('bumdesNama', 'BUMDes Maju Bersama QA'),
    ('kepalaDesa', 'Bapak/Ibu Kepala Desa QA'),
    ('perangkatDesa', 'Sekretaris desa, kasi pemerintahan, kasi pelayanan, kaur keuangan, dan kepala dusun.'),
    ('dokumenPublik', 'APBDes 2024, RKPDes 2024, dan Laporan Realisasi Semester I.'),
    ('totalAnggaran', '2750000000'),
    ('terealisasi', '1980000000'),
    ('persentaseSerapan', '72'),
    ('danaDesa', '1250000000'),
    ('add', '650000000'),
    ('pades', '175000000'),
    ('bantuanKeuangan', '425000000'),
    ('outputFisik', 'Pembangunan drainase, perbaikan jalan lingkungan, dan renovasi posyandu.'),
    ('riwayatAPBDes', 'APBDes 2024 ditetapkan melalui musyawarah desa dan dipublikasikan pada papan informasi desa.'),
    ('websiteUrl', 'https://contoh-desa-qa.example.id'),
    ('kategori', 'Desa berkembang'),
    ('tahunData', '2024'),
    ('jumlahPenduduk', '8420')
  ) AS v(field_key, value_text)
),
field_targets AS (
  SELECT
    et.desa_id,
    et.template_id,
    comp.id AS component_id,
    field.id AS field_standard_id,
    field."fieldKey" AS field_key,
    sv.value_text
  FROM effective_template et
  JOIN village_detail_components comp
    ON comp."templateId" = et.template_id
   AND comp.status = 'ACTIVE'
  JOIN detail_field_standards field
    ON field."templateId" = et.template_id
   AND field."componentId" = comp.id
   AND field.status = 'ACTIVE'
  JOIN seed_values sv
    ON sv.field_key = field."fieldKey"
  LEFT JOIN desa_detail_component_visibility vis
    ON vis."desaId" = et.desa_id
   AND vis."componentId" = comp.id
  WHERE COALESCE(vis."isVisible", comp."isDefaultVisible") = true
),
inserted_data_desa AS (
  INSERT INTO data_desa (
    id,
    "desaId",
    "templateId",
    "componentId",
    "fieldStandardId",
    "fieldKey",
    "valueText",
    "sourceId",
    status,
    "isActive",
    "createdAt",
    "updatedAt"
  )
  SELECT
    CONCAT('qa_dd_', md5(ft.desa_id || ':' || ft.field_key || ':' || p.seed_source_document_id)) AS id,
    ft.desa_id,
    ft.template_id,
    ft.component_id,
    ft.field_standard_id,
    ft.field_key,
    ft.value_text,
    p.seed_source_document_id,
    'IN_REVIEW',
    true,
    NOW(),
    NOW()
  FROM field_targets ft
  JOIN params p ON true
  ON CONFLICT (id) DO UPDATE SET
    "valueText" = EXCLUDED."valueText",
    "sourceId" = EXCLUDED."sourceId",
    status = 'IN_REVIEW',
    "isActive" = true,
    "updatedAt" = NOW()
  RETURNING id, "desaId", "fieldKey"
),
audit_insert AS (
  INSERT INTO desa_data_audit_events (
    id,
    "desaId",
    "sourceDocumentId",
    "villageDataVersionId",
    "actorUserId",
    "actorRole",
    "eventType",
    "eventLabel",
    "previousStatus",
    "nextStatus",
    note,
    metadata,
    "createdAt",
    "updatedAt"
  )
  SELECT
    CONCAT('qa_dda_', md5(id || ':' || "fieldKey")) AS id,
    "desaId",
    (SELECT seed_source_document_id FROM params),
    NULL,
    NULL,
    'QA_SEED',
    'QA_DATA_DESA_REVIEW_SEEDED',
    'QA seed DataDesa untuk review owner',
    NULL,
    'IN_REVIEW',
    'Sample QA source-backed DataDesa. Do not treat as production data.',
    jsonb_build_object('qaSeed', true, 'dataDesaId', id, 'fieldKey', "fieldKey"),
    NOW(),
    NOW()
  FROM inserted_data_desa
  ON CONFLICT (id) DO NOTHING
  RETURNING id
)
SELECT
  (SELECT COUNT(*) FROM inserted_data_desa) AS inserted_data_desa_rows,
  (SELECT COUNT(*) FROM audit_insert) AS inserted_audit_rows,
  (SELECT target_slug FROM params) AS desa_slug,
  (SELECT seed_source_document_id FROM params) AS source_document_id;

COMMIT;
