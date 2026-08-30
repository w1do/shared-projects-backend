"use client";

import * as React from "react";
import { toast } from "sonner";
import type { TeamUser } from "@/lib/admin/types/team";
import * as platformAuth from "@/lib/admin/data-source/platform/auth";
import {
  canManageMembers,
  canViewRoles,
  canManageRoles,
} from "@/lib/admin/data-source/platform/team-access";
import { getProjectKey } from "@/lib/admin/data-source/session";
import { roleLabel } from "@/lib/admin/role-labels";
import { t, tf } from "@/lib/admin/console-texts";

function memberToUser(member: platformAuth.PlatformMember): TeamUser {
  return {
    id: String(member.id),
    email: member.email,
    name: member.name,
    role: member.roles[0] ?? "",
    position: member.roles[0] ?? "Operator",
    phone: "",
    status: "active",
  };
}

/**
 * Состояние раздела «Команда»: участники проекта из auth-service,
 * приглашение, назначение роли и удаление участника.
 *
 * Роль участника — имя роли проекта: и системной, и кастомной. Что оператору
 * позволено, решают права из `bootstrap`, а не название его собственной роли.
 */
export function useTeamPage() {
  const [users, setUsers] = React.useState<TeamUser[]>([]);
  const [currentUser, setCurrentUser] = React.useState<TeamUser | null>(null);
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deleteTarget, setDeleteTarget] = React.useState<TeamUser | null>(null);

  React.useEffect(() => {
    const curUserStr = localStorage.getItem("current_user");
    if (curUserStr) {
      try {
        setCurrentUser(JSON.parse(curUserStr));
      } catch {
        setCurrentUser(null);
      }
    }

    Promise.all([
      platformAuth.listMembers(),
      platformAuth.getBootstrap(getProjectKey()),
    ])
      .then(([members, bootstrap]) => {
        setUsers(members.map(memberToUser));
        setPermissions(bootstrap.permissions ?? []);
      })
      .catch(() => toast.error(t("console.team.toast.load-failed")))
      .finally(() => setIsLoading(false));
  }, []);

  /** Перечитать участников проекта после операции на бекенде. */
  const reloadMembers = async () => {
    const members = await platformAuth.listMembers();
    setUsers(members.map(memberToUser));
  };

  const handleAddMember = (name: string, email: string, role: string) => {
    platformAuth
      .inviteMember({ email, name, role })
      .then(reloadMembers)
      .then(() =>
        toast.success(
          tf("console.team.toast.invited", { name, role: roleLabel(role) }),
        ),
      )
      .catch((error: Error) => toast.error(error.message));
  };

  const handleDeleteMember = (target: TeamUser) => {
    setDeleteTarget(target);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    platformAuth
      .removeMember(target.id)
      .then(reloadMembers)
      .then(() => toast.success(tf("console.team.toast.deleted", { name: target.name })))
      .catch((error: Error) => toast.error(error.message));
    setDeleteTarget(null);
  };

  /** Может ли текущий оператор управлять участником: право проекта, но не собой. */
  const canManage = (target: TeamUser) =>
    canManageMembers(permissions) && currentUser?.id !== target.id;

  /** Назначение роли участнику проекта (auth-service). */
  const handleAssignRole = (target: TeamUser, role: string) => {
    platformAuth
      .assignMemberRole(target.id, role)
      .then(reloadMembers)
      .then(() =>
        toast.success(
          tf("console.team.toast.role-updated", {
            name: target.name,
            role: roleLabel(role),
          }),
        ),
      )
      .catch((error: Error) => toast.error(error.message));
  };

  return {
    users,
    currentUser,
    handleAssignRole,
    isLoading,
    isInviteOpen,
    setIsInviteOpen,
    deleteTarget,
    setDeleteTarget,
    handleAddMember,
    handleDeleteMember,
    handleConfirmDelete,
    canManage,
    canInvite: canManageMembers(permissions),
    canViewRoles: canViewRoles(permissions),
    canManageRoles: canManageRoles(permissions),
  };
}
