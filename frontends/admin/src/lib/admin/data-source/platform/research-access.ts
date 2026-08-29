/**
 * Права разделов ресёрча, инструкций и управления проектом — чистые проверки
 * без зависимостей (node-тестируемы). Имена прав живут в манифестах сервисов.
 */
export const PROJECT_MANAGE_PERMISSION = "auth.projects.manage";
export const RESEARCH_RUN_PERMISSION = "content.research.run";
export const TOPICS_MANAGE_PERMISSION = "content.topics.manage";
export const INSTRUCTS_MANAGE_PERMISSION = "content.instructs.manage";
export const POSTS_MANAGE_PERMISSION = "content.posts.manage";

/** `*` — полный доступ (owner/admin); иначе нужно явное право. */
export function hasPermission(
  permissions: readonly string[] | null | undefined,
  permission: string,
): boolean {
  const list = permissions ?? [];
  return list.includes("*") || list.includes(permission);
}

export function canManageProject(
  permissions: readonly string[] | null | undefined,
): boolean {
  return hasPermission(permissions, PROJECT_MANAGE_PERMISSION);
}

export function canRunResearch(
  permissions: readonly string[] | null | undefined,
): boolean {
  return hasPermission(permissions, RESEARCH_RUN_PERMISSION);
}

export function canManageTopics(
  permissions: readonly string[] | null | undefined,
): boolean {
  return hasPermission(permissions, TOPICS_MANAGE_PERMISSION);
}

export function canManageInstructs(
  permissions: readonly string[] | null | undefined,
): boolean {
  return hasPermission(permissions, INSTRUCTS_MANAGE_PERMISSION);
}

export function canGeneratePosts(
  permissions: readonly string[] | null | undefined,
): boolean {
  return hasPermission(permissions, POSTS_MANAGE_PERMISSION);
}
