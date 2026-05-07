export function getErrorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }

  return "";
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function isDatabaseConnectivityError(error: unknown): boolean {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  return (
    code === "P1001" ||
    code === "P1002" ||
    /Can't reach database server/i.test(message) ||
    /Timed out fetching a new connection/i.test(message) ||
    /Connection terminated unexpectedly/i.test(message) ||
    /connection refused/i.test(message)
  );
}

export function getDatabaseUnavailableMessage(): string {
  return "Koneksi database Supabase dari runtime lokal sedang tidak tersedia. Coba lagi setelah jalur koneksi Postgres pulih.";
}
