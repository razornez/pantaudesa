import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  COMPONENT_CATALOG,
  DEFAULT_TEMPLATE_MANIFEST,
} from "../prisma/template-catalog.manifest.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function validateCatalogManifest() {
  const componentKeys = new Set();
  const fieldOwners = new Map();

  for (const component of COMPONENT_CATALOG) {
    assert(component.componentKey, "Catalog component missing componentKey.");
    assert(!componentKeys.has(component.componentKey), `Duplicate componentKey: ${component.componentKey}`);
    componentKeys.add(component.componentKey);

    for (const key of ["label", "componentType", "rendererType", "previewVariant", "detailSlot"]) {
      assert(
        typeof component[key] === "string" && component[key].trim().length > 0,
        `Component ${component.componentKey} missing ${key}.`,
      );
    }

    assert(
      typeof component.isDefaultVisible === "boolean",
      `Component ${component.componentKey} missing isDefaultVisible boolean.`,
    );
    assert(
      Number.isInteger(component.displayOrder),
      `Component ${component.componentKey} missing integer displayOrder.`,
    );

    for (const field of component.fields ?? []) {
      const existingOwner = fieldOwners.get(field.fieldKey);
      assert(
        !existingOwner,
        `Field ${field.fieldKey} is owned by both ${existingOwner} and ${component.componentKey}.`,
      );
      fieldOwners.set(field.fieldKey, component.componentKey);

      for (const key of ["label", "valueType"]) {
        assert(
          typeof field[key] === "string" && field[key].trim().length > 0,
          `Field ${component.componentKey}.${field.fieldKey} missing ${key}.`,
        );
      }
      assert(
        typeof field.isPublishableNow === "boolean",
        `Field ${component.componentKey}.${field.fieldKey} missing isPublishableNow boolean.`,
      );
      assert(
        Number.isInteger(field.displayOrder),
        `Field ${component.componentKey}.${field.fieldKey} missing integer displayOrder.`,
      );
    }
  }

  assert(componentKeys.size > 0, "Component catalog manifest is empty.");
}

function validateStaticRegistryCoverage() {
  const publicRegistry = read("src/components/desa/public-template-registry.tsx");
  const previewRegistry = read("src/components/desa/public-template-preview-registry.tsx");

  for (const component of COMPONENT_CATALOG) {
    assert(
      publicRegistry.includes(`componentKey: "${component.componentKey}"`),
      `Public registry missing componentKey ${component.componentKey}.`,
    );
    assert(
      previewRegistry.includes(`${component.componentKey}: (`),
      `Preview registry missing componentKey ${component.componentKey}.`,
    );
  }
}

function validateDefaultTemplateManifest() {
  const catalogKeys = new Set(COMPONENT_CATALOG.map((component) => component.componentKey));
  const templateKeys = DEFAULT_TEMPLATE_MANIFEST.componentKeys ?? [];
  const uniqueTemplateKeys = new Set(templateKeys);

  assert(
    templateKeys.length === uniqueTemplateKeys.size,
    "Default template manifest contains duplicate component keys.",
  );

  for (const componentKey of templateKeys) {
    assert(
      catalogKeys.has(componentKey),
      `Default template manifest references unknown component ${componentKey}.`,
    );
  }
}

function validateNoKnownHardcodedTemplateCounts() {
  const scanRoots = [
    "src/app",
    "src/components/internal-admin",
    "src/components/desa",
    "src/lib/village-data",
    "src/lib/intake",
  ];
  const forbiddenPatterns = [
    /0\s*\/\s*31/g,
    /0\s*\/\s*37/g,
    /\/\s*31\s*(?:field|fields|publik)/gi,
    /\/\s*37\s*(?:field|fields|publik)/gi,
    /totalFieldCount\s*[:=]\s*(31|37)/g,
    /totalFields\s*[:=]\s*(31|37)/g,
  ];

  const files = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(fullPath);
    }
  };

  for (const scanRoot of scanRoots) walk(path.join(root, scanRoot));

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    for (const pattern of forbiddenPatterns) {
      pattern.lastIndex = 0;
      if (!pattern.test(content)) continue;
      errors.push(`Hardcoded template field count detected in ${path.relative(root, file)}.`);
    }
  }
}

validateCatalogManifest();
validateDefaultTemplateManifest();
validateStaticRegistryCoverage();
validateNoKnownHardcodedTemplateCounts();

if (errors.length > 0) {
  console.error("Template validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Template validation passed for ${COMPONENT_CATALOG.length} components.`);
