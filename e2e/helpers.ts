import { type Page, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

// QA accounts — seeded via npm run seed:qa (PIN: 246810)
export const QA = {
  PIN: "246810",
  INTERNAL_ADMIN:         "internal.admin.qa@pantaudesa.local",
  WARGA_BIASA:            "warga.biasa.qa@pantaudesa.local",
  PENGAJU_PENDING:        "pengaju.pending.qa@pantaudesa.local",
  PENGAJU_IN_REVIEW_WEB:  "pengaju.in-review.website.qa@pantaudesa.local",
  PENGAJU_IN_REVIEW_EMAIL:"pengaju.in-review.email.qa@pantaudesa.local",
  PENGAJU_REJECTED:       "pengaju.rejected.qa@pantaudesa.local",
  PENGAJU_COOLDOWN:       "pengaju.cooldown.qa@pantaudesa.local",
  ADMIN_VERIFIED_A:       "admin.verified.desa-a.qa@pantaudesa.local",
  ADMIN_LIMITED_1_A:      "admin.limited-1.desa-a.qa@pantaudesa.local",
  ADMIN_LIMITED_2_A:      "admin.limited-2.desa-a.qa@pantaudesa.local",
  ADMIN_VERIFIED_B:       "admin.verified.desa-b.qa@pantaudesa.local",
  ADMIN_LIMITED_1_B:      "admin.limited-1.desa-b.qa@pantaudesa.local",
};

const BASE_URL = "http://127.0.0.1:3000";

/**
 * API-based login — uses page.context().request so cookies set during the
 * NextAuth callback are saved into the SAME browser context that subsequent
 * page.goto() calls use. (APIRequestContext from `request` fixture is separate.)
 *
 *  1) POST /api/auth/login {email, pin} → loginToken
 *  2) GET /api/auth/csrf → CSRF token
 *  3) POST /api/auth/callback/pin → sets next-auth.session-token cookie
 */
export async function login(page: Page, email: string, pin = QA.PIN): Promise<boolean> {
  const ctx = page.context().request;

  const pinRes = await ctx.post(`${BASE_URL}/api/auth/login`, {
    data: { email, pin },
    headers: { "Content-Type": "application/json" },
  });
  if (!pinRes.ok()) {
    const body = await pinRes.text();
    throw new Error(`PIN check failed for ${email}: ${pinRes.status()} ${body}`);
  }
  const pinJson = await pinRes.json();
  const loginToken = pinJson.loginToken;
  if (!loginToken) throw new Error(`No loginToken returned for ${email}: ${JSON.stringify(pinJson)}`);

  const csrfRes = await ctx.get(`${BASE_URL}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();

  const callbackRes = await ctx.post(`${BASE_URL}/api/auth/callback/pin`, {
    form: { email, loginToken, csrfToken, callbackUrl: BASE_URL, json: "true" },
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    maxRedirects: 0,
  });
  // NextAuth returns 200 with JSON on success when json=true; 302 redirect otherwise.
  if (callbackRes.status() !== 200 && callbackRes.status() !== 302) {
    const body = await callbackRes.text();
    throw new Error(`NextAuth callback failed: ${callbackRes.status()} ${body}`);
  }

  // Sanity check: assert the session cookie is now present in the browser context.
  const cookies = await page.context().cookies(BASE_URL);
  const sessionCookie = cookies.find((c) => c.name.includes("session-token"));
  if (!sessionCookie) {
    throw new Error(`Session cookie not set after login for ${email}. Got cookies: ${cookies.map((c) => c.name).join(", ")}`);
  }
  return true;
}

export async function logout(page: Page) {
  await page.context().clearCookies();
}

const SCREENSHOT_DIR = path.join(process.cwd(), "docs/bmad/screenshots/sprint-04-008-regression");

/**
 * Wait until the page has finished loading real content before screenshots.
 * Owner explicitly rejected screenshots showing shimmer/skeleton states.
 *
 * Steps:
 *  1) wait for network to idle (server components done streaming)
 *  2) assert no element has aria-busy="true" (kills our loading.tsx shimmers)
 *  3) optional: wait for a specific content selector
 *  4) small settle delay so layout stabilises
 */
export async function waitForContentReady(page: Page, opts?: { contentSelector?: string; timeoutMs?: number }) {
  const timeout = opts?.timeoutMs ?? 15_000;
  await page.waitForLoadState("networkidle", { timeout }).catch(() => {});
  // Shimmer/skeleton wrappers in this app set aria-busy="true". Wait until none remain.
  await expect.poll(
    async () => page.locator('[aria-busy="true"]').count(),
    { timeout, message: "loading skeleton still present" },
  ).toBe(0);
  if (opts?.contentSelector) {
    await page.locator(opts.contentSelector).first().waitFor({ state: "visible", timeout });
  }
  // Tiny settle so any layout shift from late images/fonts settles before we capture.
  await page.waitForTimeout(250);
}

/**
 * Screenshot AFTER content is fully loaded. Owner feedback: never capture shimmers.
 */
export async function screenshot(
  page: Page,
  name: string,
  viewport: "desktop" | "mobile" = "desktop",
  opts?: { contentSelector?: string },
) {
  await waitForContentReady(page, opts);
  const dir = path.join(SCREENSHOT_DIR, viewport);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}
