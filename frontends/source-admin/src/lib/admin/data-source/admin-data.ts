/**
 * Admin data facade: dual-mode reads (mock | API) via query modules.
 * Catalog write paths (brands/categories/collections/products/inventory)
 * live in `@/lib/admin/services/*` so UI no longer branches on shouldUseAdminApi.
 */
export * from "./queries/catalog";
export * from "./queries/commerce";
export * from "./queries/content";
export * from "./queries/dashboard";
export * from "./queries/settings";
export { adminMutations } from "./mutations";
