/**
 * Dev-only / opt-in performance logger for back office route audit.
 *
 * Sprint 04-008F — Phase 1 instrumentation only.
 *
 * Activation rules (any one is enough):
 *  - `NODE_ENV !== "production"` (always on in dev/test)
 *  - `process.env.PERF_DEBUG_BACK_OFFICE === "true"` (opt-in for staging)
 *
 * Output formats (single line, easy to grep):
 *   [perf][back-office] route=<route> step=<step> durationMs=<number>
 *   [perf][back-office] route=<route> query=<model.method> shape=<static-shape>
 *
 * Privacy guardrails:
 *  - Caller is responsible for NOT passing emails, user ids, tokens, sessions,
 *    or document content into `route` / `step`. Helper does not echo any extra
 *    metadata to keep this surface boring on purpose.
 *  - Query shape logging must describe predicates/order/selects without values
 *    (e.g. `where:userId,statusIn`, never the actual userId/desaId/email).
 *  - No persistence. Goes only to `console.info`.
 *
 * Usage:
 *   const t = perfStart();
 *   // ... await something ...
 *   perfLog("admin-desa.layout", "getAdminDesaContext", t);
 *
 * Or single-shot wrap:
 *   const ctx = await perfTime("admin-desa.layout", "getAdminDesaContext",
 *     () => getAdminDesaContext(userId));
 */

export function perfEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.PERF_DEBUG_BACK_OFFICE === "true";
}

export function perfStart(): number {
  return Date.now();
}

export function perfLog(route: string, step: string, startedAt: number): void {
  if (!perfEnabled()) return;
  const durationMs = Date.now() - startedAt;
  // Single-line, machine-grep friendly. No PII.
  console.info(`[perf][back-office] route=${route} step=${step} durationMs=${durationMs}`);
}

export function perfQueryShape(route: string, query: string, shape: string): void {
  if (!perfEnabled()) return;
  // Static query metadata only. Do not pass userId/desaId/email or document content here.
  console.info(`[perf][back-office] route=${route} query=${query} shape=${shape}`);
}

export async function perfTime<T>(
  route: string,
  step: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (!perfEnabled()) return fn();
  const t = perfStart();
  try {
    return await fn();
  } finally {
    perfLog(route, step, t);
  }
}
