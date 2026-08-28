/**
 * Право управления лицензированием — чистая проверка без зависимостей
 * (node-тестируема). Имена прав живут в группе licensing PayManifest'а.
 */
export const LICENSING_VIEW_PERMISSION = "pay.licensing.view";
export const LICENSING_MANAGE_PERMISSION = "pay.licensing.manage";

/** `*` — полный доступ (owner/admin); иначе нужно явное право manage. */
export function canManageLicensing(
  permissions: readonly string[] | null | undefined,
): boolean {
  const list = permissions ?? [];
  return list.includes("*") || list.includes(LICENSING_MANAGE_PERMISSION);
}
