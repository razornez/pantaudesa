import { test, expect } from "@playwright/test";
import { login, logout, QA, screenshot } from "./helpers";

const viewport = () => {
  const name = test.info().project.name;
  if (name === "mobile-390") return "mobile";
  if (name === "iphone-12-mini") return "iphone-12-mini";
  return "desktop";
};

test.describe("DataDesa End-to-End Flow", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, QA.INTERNAL_ADMIN);
  });
  test.afterEach(async ({ page }) => { await logout(page); });

  test("1. Review Data tab loads and shows empty or pending rows", async ({ page }) => {
    await page.goto("/internal-admin/village-data?tab=review");
    await screenshot(page, "data-desa-review-tab", viewport());

    await expect(page.getByText("Review Data")).toBeVisible({ timeout: 8_000 });
    // Either shows pending rows or empty state
    const hasEmpty = page.getByText("Tidak ada data pending review");
    const hasPending = page.getByText("menunggu review");
    await expect(hasEmpty.or(hasPending)).toBeVisible({ timeout: 6_000 });
  });

  test("2. Data per Desa expanded row shows manual input form", async ({ page }) => {
    await page.goto("/internal-admin/village-data?tab=desa-data");
    await screenshot(page, "data-desa-tab-before-expand", viewport());

    // Click first desa row to expand
    const firstRow = page.locator("button.w-full.text-left").first();
    await firstRow.click();
    await screenshot(page, "data-desa-tab-expanded", viewport());

    // Manual input section should appear
    await expect(page.getByText("Input Data Manual")).toBeVisible({ timeout: 6_000 });
    await expect(page.getByText("Pilih komponen...")).toBeVisible();
  });

  test("3. Desa without custom assignment uses default template on public page", async ({ page }) => {
    // Use a desa known NOT to have custom template assignment
    await page.goto("/desa/arjasari");
    await screenshot(page, "public-desa-arjasari", viewport());

    // Page should load without error
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10_000 });
    // Should not show broken/empty layout
    await expect(page.getByText("404")).not.toBeVisible();
    await expect(page.getByText("Error")).not.toBeVisible();
  });

  test("4. Hidden component does not appear on public page", async ({ page }) => {
    // Baros has anggaran hidden by seed — verify it's not on public page
    await page.goto("/desa/baros");
    await screenshot(page, "public-desa-baros-hidden-anggaran", viewport());

    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10_000 });
    // Section anggaran should not be visible
    const anggaranSection = page.locator("#anggaran");
    await expect(anggaranSection).not.toBeVisible();
  });

  test("5. All desa detail pages load without crash (spot check)", async ({ page }) => {
    const slugs = ["arjasari", "baros", "batukarut", "lebakwangi"];
    for (const slug of slugs) {
      await page.goto(`/desa/${slug}`);
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText("404")).not.toBeVisible();
      await screenshot(page, `public-desa-${slug}`, viewport());
    }
  });

  test("6. suara-warga page loads without getTime error", async ({ page }) => {
    await page.goto("/suara-warga");
    await screenshot(page, "suara-warga-page", viewport());

    // Page should render without JS error
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await expect(page.locator("main, [role='main'], body > div").first()).toBeVisible({ timeout: 8_000 });
    // No TypeError about getTime
    const getTimeError = consoleErrors.find(e => e.includes("getTime"));
    expect(getTimeError).toBeUndefined();
  });

  test("7. Versi & Audit tab still works", async ({ page }) => {
    await page.goto("/internal-admin/village-data?tab=versions");
    await screenshot(page, "data-desa-versions-tab", viewport());

    await expect(page.getByText("Versi & Audit")).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText("Riwayat versi")).toBeVisible();
    await expect(page.getByText("Audit trail")).toBeVisible();
  });

  test("8. Mobile view has no horizontal scroll on village-data", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/internal-admin/village-data");
    await screenshot(page, "data-desa-mobile-375", viewport());

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 2); // 2px tolerance
  });
});
