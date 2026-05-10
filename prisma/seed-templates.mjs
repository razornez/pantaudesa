/**
 * seed-templates.mjs
 *
 * Seeds VillageDetailTemplate, VillageDetailComponent, DetailFieldStandard,
 * DesaDetailTemplateAssignment, and DesaDetailComponentVisibility.
 *
 * REQUIRES: prisma migrate dev --name flexible-village-template-components
 *           (schema must be activated first — see PROPOSAL block in schema.prisma)
 *
 * Run: node prisma/seed-templates.mjs
 * Idempotent: uses upsert throughout — safe to run multiple times.
 */

import { PrismaClient } from "../src/generated/prisma/index.js";

const db = new PrismaClient();

// ─── Template definitions ─────────────────────────────────────────────────────

const TEMPLATES = [
  {
    key: "CURRENT_PUBLIC_DETAIL_TEMPLATE",
    name: "Template Umum Desa",
    description: "Template default untuk semua desa. Mencakup 11 komponen halaman detail desa publik.",
    isDefault: true,
    components: [
      {
        componentKey: "identitas",
        label: "Identitas & Wilayah",
        description: "Informasi dasar identitas dan lokasi desa",
        componentType: "section",
        isDefaultVisible: true,
        displayOrder: 1,
        fields: [
          { fieldKey: "websiteUrl",      label: "Website resmi",   valueType: "url",    isPublishableNow: true,  displayOrder: 1 },
          { fieldKey: "kategori",        label: "Kategori desa",   valueType: "string", isPublishableNow: true,  displayOrder: 2 },
          { fieldKey: "tahunData",       label: "Tahun data",      valueType: "number", isPublishableNow: true,  displayOrder: 3 },
          { fieldKey: "kecamatan",       label: "Kecamatan",       valueType: "string", isPublishableNow: true,  displayOrder: 4 },
          { fieldKey: "kabupaten",       label: "Kabupaten/Kota",  valueType: "string", isPublishableNow: true,  displayOrder: 5 },
          { fieldKey: "provinsi",        label: "Provinsi",        valueType: "string", isPublishableNow: true,  displayOrder: 6 },
        ],
      },
      {
        componentKey: "demografi",
        label: "Demografi",
        description: "Data kependudukan desa",
        componentType: "section",
        isDefaultVisible: true,
        displayOrder: 2,
        fields: [
          { fieldKey: "jumlahPenduduk", label: "Jumlah penduduk", valueType: "number", isPublishableNow: true,  displayOrder: 1 },
          { fieldKey: "jumlahKK",       label: "Jumlah KK",       valueType: "number", isPublishableNow: false, displayOrder: 2 },
          { fieldKey: "jumlahDusun",    label: "Jumlah dusun",    valueType: "number", isPublishableNow: false, displayOrder: 3 },
          { fieldKey: "jumlahRt",       label: "Jumlah RT",       valueType: "number", isPublishableNow: false, displayOrder: 4 },
          { fieldKey: "jumlahRw",       label: "Jumlah RW",       valueType: "number", isPublishableNow: false, displayOrder: 5 },
        ],
      },
      {
        componentKey: "sumber_dokumen",
        label: "Sumber & Dokumen",
        description: "Sumber publik dan dokumen pendukung desa (baca dari DataSource[], DokumenPublik[])",
        componentType: "section",
        isDefaultVisible: true,
        displayOrder: 3,
        fields: [], // no DataDesa-stored fields — reads existing models
      },
      {
        componentKey: "transparansi",
        label: "Transparansi & Skor",
        description: "Skor transparansi dan rincian dokumen (computed dari dokumen yang tersedia)",
        componentType: "section",
        isDefaultVisible: true,
        displayOrder: 4,
        fields: [
          { fieldKey: "skorTransparansiTotal",    label: "Skor transparansi total",     valueType: "number", isPublishableNow: false, displayOrder: 1 },
          { fieldKey: "skorKetepatan",            label: "Ketepatan pelaporan",          valueType: "number", isPublishableNow: false, displayOrder: 2 },
          { fieldKey: "skorKelengkapan",          label: "Kelengkapan dokumen",          valueType: "number", isPublishableNow: false, displayOrder: 3 },
        ],
      },
      {
        componentKey: "perangkat",
        label: "Perangkat Desa",
        description: "Struktur kepemimpinan dan staf desa (baca dari PerangkatDesa[])",
        componentType: "list",
        isDefaultVisible: true,
        displayOrder: 5,
        fields: [
          { fieldKey: "kepalaDesa", label: "Nama kepala desa", valueType: "string", isPublishableNow: false, displayOrder: 1 },
        ],
      },
      {
        componentKey: "anggaran",
        label: "Anggaran & Realisasi",
        description: "Ringkasan anggaran dan realisasi belanja desa",
        componentType: "section",
        isDefaultVisible: true,
        displayOrder: 6,
        fields: [
          { fieldKey: "totalAnggaran",       label: "Total anggaran",     valueType: "number", isPublishableNow: false, displayOrder: 1 },
          { fieldKey: "terealisasi",         label: "Realisasi anggaran", valueType: "number", isPublishableNow: false, displayOrder: 2 },
          { fieldKey: "persentaseSerapan",   label: "Persentase serapan", valueType: "number", isPublishableNow: false, displayOrder: 3 },
        ],
      },
      {
        componentKey: "pendapatan",
        label: "Sumber Pendapatan",
        description: "Rincian sumber pendapatan APBDes",
        componentType: "section",
        isDefaultVisible: true,
        displayOrder: 7,
        fields: [
          { fieldKey: "danaDesa",          label: "Dana desa",           valueType: "number", isPublishableNow: false, displayOrder: 1 },
          { fieldKey: "add",               label: "ADD",                 valueType: "number", isPublishableNow: false, displayOrder: 2 },
          { fieldKey: "pades",             label: "PADes",               valueType: "number", isPublishableNow: false, displayOrder: 3 },
          { fieldKey: "bantuanKeuangan",   label: "Bantuan keuangan",    valueType: "number", isPublishableNow: false, displayOrder: 4 },
        ],
      },
      {
        componentKey: "kinerja",
        label: "Kinerja & Rincian APBDes",
        description: "Output fisik, rincian per bidang, dan riwayat anggaran (baca dari APBDesItem[], AnggaranDesaSummary[])",
        componentType: "section",
        isDefaultVisible: true,
        displayOrder: 8,
        fields: [
          { fieldKey: "outputFisik",   label: "Output fisik",      valueType: "json",   isPublishableNow: false, displayOrder: 1 },
          { fieldKey: "riwayatAPBDes", label: "Riwayat anggaran",  valueType: "json",   isPublishableNow: false, displayOrder: 2 },
        ],
      },
      {
        componentKey: "profil_desa",
        label: "Profil & Kelengkapan Desa",
        description: "Aset, fasilitas, lembaga, BUMDes, kontak, dan potensi desa",
        componentType: "section",
        isDefaultVisible: true,
        displayOrder: 9,
        fields: [
          { fieldKey: "teleponDesa",    label: "Telepon desa",     valueType: "string", isPublishableNow: false, displayOrder: 1 },
          { fieldKey: "emailDesa",      label: "Email desa",       valueType: "string", isPublishableNow: false, displayOrder: 2 },
          { fieldKey: "potensiUnggulan",label: "Potensi unggulan", valueType: "text",   isPublishableNow: false, displayOrder: 3 },
          { fieldKey: "fasilitasUmum",  label: "Fasilitas umum",   valueType: "text",   isPublishableNow: false, displayOrder: 4 },
          { fieldKey: "asetDesa",       label: "Aset desa",        valueType: "json",   isPublishableNow: false, displayOrder: 5 },
          { fieldKey: "lembagaDesa",    label: "Lembaga desa",     valueType: "json",   isPublishableNow: false, displayOrder: 6 },
          { fieldKey: "bumdes",         label: "BUMDes",           valueType: "json",   isPublishableNow: false, displayOrder: 7 },
        ],
      },
      {
        componentKey: "panduan_warga",
        label: "Panduan Warga",
        description: "Panduan hak warga, tanggung jawab, dan langkah pelaporan (static + computed)",
        componentType: "section",
        isDefaultVisible: true,
        displayOrder: 10,
        fields: [], // static content, no DataDesa
      },
      {
        componentKey: "suara_warga",
        label: "Suara Warga",
        description: "Cerita dan suara warga tentang kondisi desa (citizen voices, model terpisah)",
        componentType: "section",
        isDefaultVisible: true,
        displayOrder: 11,
        fields: [], // separate model (SuaraWarga), not DataDesa
      },
    ],
  },
  {
    key: "DESA_WISATA_TEMPLATE",
    name: "Template Desa Wisata",
    description: "Template untuk desa dengan potensi wisata. Profil & potensi desa menjadi publishable.",
    isDefault: false,
    components: null, // populated below — same as default but profil_desa fields publishable
  },
  {
    key: "DESA_TRANSPARAN_TEMPLATE",
    name: "Template Desa Transparan",
    description: "Template untuk desa yang memprioritaskan transparansi anggaran. Field anggaran menjadi publishable.",
    isDefault: false,
    components: null, // populated below — same as default but anggaran fields publishable
  },
];

// Assignments: desaId → templateKey
const ASSIGNMENTS = [
  { desaId: "demo-desa-arjasari",   templateKey: "DESA_WISATA_TEMPLATE" },
  { desaId: "demo-desa-baros",      templateKey: "DESA_WISATA_TEMPLATE" },
  { desaId: "demo-desa-batukarut",  templateKey: "DESA_TRANSPARAN_TEMPLATE" },
  { desaId: "demo-desa-lebakwangi", templateKey: "DESA_TRANSPARAN_TEMPLATE" },
];

// Component visibility overrides: baros hides anggaran
const VISIBILITY_OVERRIDES = [
  {
    desaId:       "demo-desa-baros",
    templateKey:  "DESA_WISATA_TEMPLATE",
    componentKey: "anggaran",
    isVisible:    false,
    reason:       "Desa Baros memilih tidak menampilkan komponen anggaran saat ini.",
  },
];

// ─── Seed logic ───────────────────────────────────────────────────────────────

async function seedTemplates() {
  console.log("🌱 Seeding village detail templates...");

  const defaultComponents = TEMPLATES[0].components;

  for (const templateDef of TEMPLATES) {
    // Determine components for this template
    let components = templateDef.components ?? JSON.parse(JSON.stringify(defaultComponents));

    // For DESA_WISATA_TEMPLATE: make profil_desa fields publishable
    if (templateDef.key === "DESA_WISATA_TEMPLATE") {
      for (const comp of components) {
        if (comp.componentKey === "profil_desa") {
          for (const field of comp.fields) {
            if (["potensiUnggulan", "fasilitasUmum"].includes(field.fieldKey)) {
              field.isPublishableNow = true;
            }
          }
        }
      }
    }

    // For DESA_TRANSPARAN_TEMPLATE: make anggaran + kinerja fields publishable
    if (templateDef.key === "DESA_TRANSPARAN_TEMPLATE") {
      for (const comp of components) {
        if (["anggaran", "pendapatan", "kinerja"].includes(comp.componentKey)) {
          for (const field of comp.fields) {
            field.isPublishableNow = true;
          }
        }
      }
    }

    const template = await db.villageDetailTemplate.upsert({
      where: { key: templateDef.key },
      create: {
        key: templateDef.key,
        name: templateDef.name,
        description: templateDef.description,
        isDefault: templateDef.isDefault,
        status: "ACTIVE",
      },
      update: {
        name: templateDef.name,
        description: templateDef.description,
        isDefault: templateDef.isDefault,
      },
    });
    console.log(`  ✓ Template: ${templateDef.key}`);

    for (const compDef of components) {
      const component = await db.villageDetailComponent.upsert({
        where: { templateId_componentKey: { templateId: template.id, componentKey: compDef.componentKey } },
        create: {
          templateId: template.id,
          componentKey: compDef.componentKey,
          label: compDef.label,
          description: compDef.description,
          componentType: compDef.componentType,
          isDefaultVisible: compDef.isDefaultVisible,
          displayOrder: compDef.displayOrder,
          status: "ACTIVE",
        },
        update: {
          label: compDef.label,
          description: compDef.description,
          isDefaultVisible: compDef.isDefaultVisible,
          displayOrder: compDef.displayOrder,
        },
      });

      for (const fieldDef of compDef.fields) {
        await db.detailFieldStandard.upsert({
          where: {
            templateId_componentId_fieldKey: {
              templateId: template.id,
              componentId: component.id,
              fieldKey: fieldDef.fieldKey,
            },
          },
          create: {
            templateId: template.id,
            componentId: component.id,
            fieldKey: fieldDef.fieldKey,
            label: fieldDef.label,
            valueType: fieldDef.valueType,
            isPublishableNow: fieldDef.isPublishableNow,
            displayOrder: fieldDef.displayOrder,
            status: "ACTIVE",
          },
          update: {
            label: fieldDef.label,
            isPublishableNow: fieldDef.isPublishableNow,
            displayOrder: fieldDef.displayOrder,
          },
        });
      }
    }
  }

  // Seed assignments
  console.log("\n🌱 Seeding template assignments...");
  for (const assignment of ASSIGNMENTS) {
    const desa = await db.desa.findUnique({ where: { id: assignment.desaId }, select: { id: true, nama: true } });
    if (!desa) {
      console.log(`  ⚠ Skipped: desa ${assignment.desaId} not found in DB`);
      continue;
    }
    const template = await db.villageDetailTemplate.findUnique({ where: { key: assignment.templateKey }, select: { id: true } });
    if (!template) {
      console.log(`  ⚠ Skipped: template ${assignment.templateKey} not found`);
      continue;
    }
    await db.desaDetailTemplateAssignment.upsert({
      where: { desaId: assignment.desaId },
      create: { desaId: desa.id, templateId: template.id, isActive: true, reason: "Initial seeding" },
      update: { templateId: template.id, isActive: true },
    });
    console.log(`  ✓ ${desa.nama} → ${assignment.templateKey}`);
  }

  // Seed visibility overrides
  console.log("\n🌱 Seeding component visibility overrides...");
  for (const override of VISIBILITY_OVERRIDES) {
    const desa = await db.desa.findUnique({ where: { id: override.desaId }, select: { id: true, nama: true } });
    if (!desa) { console.log(`  ⚠ Skipped: ${override.desaId} not found`); continue; }
    const template = await db.villageDetailTemplate.findUnique({ where: { key: override.templateKey }, select: { id: true } });
    if (!template) { console.log(`  ⚠ Skipped: template ${override.templateKey} not found`); continue; }
    const component = await db.villageDetailComponent.findUnique({
      where: { templateId_componentKey: { templateId: template.id, componentKey: override.componentKey } },
      select: { id: true },
    });
    if (!component) { console.log(`  ⚠ Skipped: component ${override.componentKey} not found`); continue; }

    await db.desaDetailComponentVisibility.upsert({
      where: { desaId_componentId: { desaId: desa.id, componentId: component.id } },
      create: {
        desaId: desa.id,
        templateId: template.id,
        componentId: component.id,
        isVisible: override.isVisible,
        reason: override.reason,
      },
      update: { isVisible: override.isVisible, reason: override.reason },
    });
    console.log(`  ✓ ${desa.nama} · ${override.componentKey} → visible: ${override.isVisible}`);
  }

  console.log("\n✅ Template seeding complete.");
}

seedTemplates()
  .catch(e => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => db.$disconnect());
