/**
 * API credentials must come from env only — never hard-code defaults.
 * baseUrl keeps a localhost fallback for local development.
 */
export const adminApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ?? "http://localhost:8080",
  username: process.env.NEXT_PUBLIC_ADMIN_API_USERNAME ?? "",
  password: process.env.NEXT_PUBLIC_ADMIN_API_PASSWORD ?? "",
};
