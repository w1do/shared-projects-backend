"use client";

import * as React from "react";
import { toast } from "sonner";
import * as platformAccess from "@/lib/admin/data-source/platform/auth-access";
import {
  catalogWithRolePermissions,
  groupPermissions,
  type PermissionGroup,
} from "@/lib/admin/data-source/platform/team-access";
import { roleLabel } from "@/lib/admin/role-labels";
import { t, tf } from "@/lib/admin/console-texts";
import type { ProjectRole, RoleOption } from "@/lib/admin/types/team";

function toProjectRole(role: platformAccess.PlatformRole): ProjectRole {
  return {
    id: String(role.id),
    name: role.name,
    system: role.system === true,
    permissions: role.permissions ?? [],
  };
}

/**
 * Вкладка «Роли»: роли проекта и каталог доступных прав из платформы.
 * Без права `auth.roles.view` вкладки нет и данные не запрашиваются.
 */
export function useRolesTab(enabled: boolean) {
  const [roles, setRoles] = React.useState<ProjectRole[]>([]);
  const [groups, setGroups] = React.useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<ProjectRole | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [readOnly, setReadOnly] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<ProjectRole | null>(
    null,
  );

  const reload = React.useCallback(async () => {
    const [list, catalog] = await Promise.all([
      platformAccess.listRoles(),
      platformAccess.listPermissions(),
    ]);

    setRoles(list.map(toProjectRole));
    setGroups(groupPermissions(catalog));
  }, []);

  React.useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    reload()
      .catch(() => toast.error(t("console.team.roles.load-failed")))
      .finally(() => setIsLoading(false));
  }, [enabled, reload]);

  const openCreate = () => {
    setEditing(null);
    setReadOnly(false);
    setIsDialogOpen(true);
  };

  const openEdit = (role: ProjectRole) => {
    setEditing(role);
    setReadOnly(false);
    setIsDialogOpen(true);
  };

  /** Системная роль и просмотр без права управления: тот же диалог, только чтение. */
  const openView = (role: ProjectRole) => {
    setEditing(role);
    setReadOnly(true);
    setIsDialogOpen(true);
  };

  /**
   * Сохранение роли. Ошибка платформы не гасится тостом, а уходит диалогу:
   * занятое название показывается прямо в поле.
   */
  const saveRole = async (name: string, permissions: string[]) => {
    const target = editing;

    if (target) {
      await platformAccess.updateRolePermissions(target.id, permissions);
    } else {
      await platformAccess.createRole({ name, permissions });
    }

    await reload();
    setIsDialogOpen(false);
    toast.success(
      target
        ? tf("console.team.roles.updated", { name: roleLabel(target.name) })
        : tf("console.team.roles.created", { name }),
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    platformAccess
      .deleteRole(target.id)
      .then(reload)
      .then(() =>
        toast.success(
          tf("console.team.roles.deleted", { name: roleLabel(target.name) }),
        ),
      )
      .catch((error: Error) => toast.error(error.message));
    setDeleteTarget(null);
  };

  const options: RoleOption[] = roles.map((role) => ({
    value: role.name,
    label: roleLabel(role.name),
  }));

  return {
    roles,
    groups: catalogWithRolePermissions(groups, editing?.permissions ?? []),
    options,
    readOnly,
    openView,
    isLoading,
    editing,
    isDialogOpen,
    openCreate,
    openEdit,
    closeDialog: () => setIsDialogOpen(false),
    saveRole,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
  };
}
