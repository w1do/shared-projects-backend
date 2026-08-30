/**
 * Права раздела «Команда»: вкладка ролей, управление ролями и участниками.
 * Чистые проверки и группировка каталога прав — без зависимостей (node-тестируемы).
 */

export const ROLES_VIEW_PERMISSION = "auth.roles.view";
export const ROLES_MANAGE_PERMISSION = "auth.roles.manage";
export const MEMBERS_MANAGE_PERMISSION = "auth.members.manage";

/** `*` — полный доступ (owner/admin); иначе нужно явное право. */
function hasPermission(
  permissions: readonly string[] | null | undefined,
  permission: string,
): boolean {
  const list = permissions ?? [];
  return list.includes("*") || list.includes(permission);
}

export function canViewRoles(
  permissions: readonly string[] | null | undefined,
): boolean {
  return hasPermission(permissions, ROLES_VIEW_PERMISSION);
}

export function canManageRoles(
  permissions: readonly string[] | null | undefined,
): boolean {
  return hasPermission(permissions, ROLES_MANAGE_PERMISSION);
}

export function canManageMembers(
  permissions: readonly string[] | null | undefined,
): boolean {
  return hasPermission(permissions, MEMBERS_MANAGE_PERMISSION);
}

/** Право каталога проекта в том виде, в каком его отдаёт платформа. */
export type CatalogPermission = {
  key: string;
  label: string;
  group: string | null;
  service: string;
};

/** Группа каталога прав: сервис, группа и её чекбоксы. */
export type PermissionGroup = {
  key: string;
  service: string;
  group: string;
  permissions: { key: string; label: string }[];
};

/**
 * Каталог прав по группам в порядке прихода от платформы.
 *
 * Группа считается парой «сервис + группа»: слаг `settings` объявляют auth,
 * analytics и pay, и без сервиса их права слиплись бы в один список.
 * Право без группы попадает в группу своего сервиса — заголовок нужен всегда.
 */
export function groupPermissions(
  permissions: readonly CatalogPermission[],
): PermissionGroup[] {
  const groups: PermissionGroup[] = [];

  for (const permission of permissions) {
    const group = permission.group ?? permission.service;
    const key = `${permission.service}.${group}`;
    let bucket = groups.find((candidate) => candidate.key === key);

    if (!bucket) {
      bucket = { key, service: permission.service, group, permissions: [] };
      groups.push(bucket);
    }

    bucket.permissions.push({ key: permission.key, label: permission.label });
  }

  return groups;
}

/**
 * Группы диалога роли: каталог проекта плюс права самой роли, которых в нём
 * нет. Право выключенного сервиса каталог не отдаёт, но состав роли не режется —
 * иначе правка состава молча снимала бы такие права.
 */
export function catalogWithRolePermissions(
  groups: readonly PermissionGroup[],
  permissions: readonly string[],
): PermissionGroup[] {
  const known = new Set(
    groups.flatMap((group) =>
      group.permissions.map((permission) => permission.key),
    ),
  );
  const merged: PermissionGroup[] = groups.map((group) => ({
    ...group,
    permissions: [...group.permissions],
  }));

  for (const key of permissions) {
    if (known.has(key)) continue;

    const [service, group] = key.split(".");
    const bucketKey = `${service}.${group ?? service}`;
    let bucket = merged.find((candidate) => candidate.key === bucketKey);

    if (!bucket) {
      bucket = {
        key: bucketKey,
        service,
        group: group ?? service,
        permissions: [],
      };
      merged.push(bucket);
    }

    bucket.permissions.push({ key, label: key });
  }

  return merged;
}
