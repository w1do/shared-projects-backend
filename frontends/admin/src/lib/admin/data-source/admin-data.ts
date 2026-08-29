/**
 * Фасад чтений консоли: запросы к API платформы по модулям.
 * Запись живёт в `@/lib/admin/services/*`.
 */
export * from "./queries/catalog";
export * from "./queries/commerce";
export * from "./queries/content";
export * from "./queries/dashboard";
export * from "./queries/settings";
export { adminMutations } from "./mutations";
