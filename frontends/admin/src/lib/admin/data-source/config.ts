export type AdminDataSource = "mock" | "api";

export function getAdminDataSource(): AdminDataSource {
  return process.env.NEXT_PUBLIC_ADMIN_DATA_SOURCE === "api" ? "api" : "mock";
}

export function shouldUseAdminApi() {
  return getAdminDataSource() === "api";
}

/**
 * Artificial mock-network latency in milliseconds.
 * Reads NEXT_PUBLIC_ADMIN_MOCK_DELAY_MS. Empty / 0 / invalid → no delay.
 * API mode ignores this entirely (applied only on mock data paths).
 */
export function getAdminMockDelayMs(): number {
  const raw = process.env.NEXT_PUBLIC_ADMIN_MOCK_DELAY_MS;
  if (raw == null || raw === "") return 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.floor(parsed);
}

/**
 * API credentials must come from env only — never hard-code defaults.
 * baseUrl keeps a localhost fallback for local development.
 */
export const adminApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ?? "http://localhost:8080",
  username: process.env.NEXT_PUBLIC_ADMIN_API_USERNAME ?? "",
  password: process.env.NEXT_PUBLIC_ADMIN_API_PASSWORD ?? "",
};
