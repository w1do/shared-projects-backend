"use client";

import * as React from "react";
import { toast } from "sonner";
import type { TeamUser } from "@/lib/admin/types/team";
import * as platformAuth from "@/lib/admin/data-source/platform/auth";
import { t } from "@/lib/admin/console-texts";

/** Человекочитаемое название роли участника для уведомлений. */
function roleLabel(role: TeamUser["role"]): string {
  return t(`console.team.role.${role}`);
}

function memberToUser(member: platformAuth.PlatformMember): TeamUser {
  return {
    id: String(member.id),
    email: member.email,
    name: member.name,
    role: platformAuth.toConsoleRole(member.roles),
    position: member.roles[0] ?? "Operator",
    phone: "",
    status: "active",
  };
}

/**
 * Состояние раздела «Команда»: участники проекта из auth-service,
 * приглашение, назначение роли и удаление участника.
 */
export function useTeamPage() {
  const [users, setUsers] = React.useState<TeamUser[]>([]);
  const [currentUser, setCurrentUser] = React.useState<TeamUser | null>(null);
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

    platformAuth
      .listMembers()
      .then((members) => setUsers(members.map(memberToUser)))
      .catch(() => toast.error(t("console.team.toast.load-failed")))
      .finally(() => setIsLoading(false));
  }, []);

  /** Перечитать участников проекта после операции на бекенде. */
  const reloadMembers = async () => {
    const members = await platformAuth.listMembers();
    setUsers(members.map(memberToUser));
  };

  const handleAddMember = (name: string, email: string, role: TeamUser["role"]) => {
    platformAuth
      .inviteMember({ email, name, role })
      .then(reloadMembers)
      .then(() =>
        toast.success(
          t("console.team.toast.invited")
            .replace("{name}", name)
            .replace("{role}", roleLabel(role)),
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
      .then(() => toast.success(t("console.team.toast.deleted").replace("{name}", target.name)))
      .catch((error: Error) => toast.error(error.message));
    setDeleteTarget(null);
  };

  /** Может ли текущий оператор управлять участником. */
  const canManage = (target: TeamUser) => {
    if (!currentUser) return false;
    if (currentUser.id === target.id) return false;
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "manager") return target.role === "staff";
    return false;
  };

  /** Назначение роли участнику проекта (auth-service). */
  const handleAssignRole = (target: TeamUser, role: TeamUser["role"]) => {
    platformAuth
      .assignMemberRole(target.id, role)
      .then(reloadMembers)
      .then(() =>
        toast.success(
          t("console.team.toast.role-updated")
            .replace("{name}", target.name)
            .replace("{role}", roleLabel(role)),
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
  };
}
