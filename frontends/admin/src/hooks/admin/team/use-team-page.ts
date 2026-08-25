"use client";

import * as React from "react";
import { toast } from "sonner";
import { mockUsers, type MockUser } from "@/lib/admin/mocks/auth";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import * as platformAuth from "@/lib/admin/data-source/platform/auth";

/** Роль платформы → роль, которой оперирует раздел team. */
function toTeamRole(roles: string[]): MockUser["role"] {
  return platformAuth.toConsoleRole(roles);
}

function memberToUser(member: platformAuth.PlatformMember): MockUser {
  return {
    id: String(member.id),
    email: member.email,
    name: member.name,
    role: toTeamRole(member.roles),
    position: member.roles[0] ?? "Operator",
    phone: "",
    status: "active",
  };
}

/**
 * Custom hook to manage the state and actions of the team management page.
 * Handles loading mock users from local storage, simulation of network delay,
 * and standard CRUD operations (invite, deactivate, delete, and management permissions).
 */
export function useTeamPage() {
  const [users, setUsers] = React.useState<MockUser[]>([]);
  const [currentUser, setCurrentUser] = React.useState<MockUser | null>(null);
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deactivateTarget, setDeactivateTarget] = React.useState<MockUser | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<MockUser | null>(null);

  React.useEffect(() => {
    // 1. Get logged-in user info from local storage
    const curUserStr = localStorage.getItem("current_user");
    if (curUserStr) {
      try {
        setCurrentUser(JSON.parse(curUserStr));
      } catch (e) {
        console.error("Failed to parse current user", e);
      }
    }

    // 2. Участники проекта: платформа (auth-service) или демо-данные вёрстки
    if (shouldUseAdminApi()) {
      platformAuth
        .listMembers()
        .then((members) => setUsers(members.map(memberToUser)))
        .catch(() => toast.error("Failed to load project members."))
        .finally(() => setIsLoading(false));
      return;
    }

    const dbUsersStr = localStorage.getItem("mock_users");
    if (dbUsersStr) {
      try {
        setUsers(JSON.parse(dbUsersStr));
      } catch {
        setUsers(mockUsers);
        localStorage.setItem("mock_users", JSON.stringify(mockUsers));
      }
    } else {
      setUsers(mockUsers);
      localStorage.setItem("mock_users", JSON.stringify(mockUsers));
    }

    // 3. Mock network delay of 2 seconds to match skeleton loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const saveToStorage = (updatedUsers: MockUser[]) => {
    setUsers(updatedUsers);
    if (!shouldUseAdminApi()) {
      localStorage.setItem("mock_users", JSON.stringify(updatedUsers));
    }
  };

  /** Перечитать участников проекта после операции на бекенде. */
  const reloadMembers = async () => {
    const members = await platformAuth.listMembers();
    setUsers(members.map(memberToUser));
  };

  /**
   * Invites/adds a new teammate to the workspace.
   */
  const handleAddMember = (name: string, email: string, role: "admin" | "manager" | "staff") => {
    if (shouldUseAdminApi()) {
      platformAuth
        .inviteMember({ email, name, role })
        .then(reloadMembers)
        .then(() => toast.success(`Teammate ${name} invited successfully as ${role}`))
        .catch((error: Error) => toast.error(error.message));
      return;
    }

    const newUser: MockUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      password: "password",
      role,
      position: role.charAt(0).toUpperCase() + role.slice(1),
      phone: "",
      avatar: `/avatars/user-0${Math.floor(Math.random() * 9) + 1}.webp`,
      status: "active",
      lastLogin: new Date().toISOString(),
    };

    const nextUsers = [newUser, ...users];
    saveToStorage(nextUsers);
    toast.success(`Teammate ${name} invited successfully as ${role}`);
  };

  const executeToggleStatus = (target: MockUser) => {
    const updated = users.map((u) => {
      if (u.id === target.id) {
        const nextStatus: MockUser["status"] = u.status === "active" ? "inactive" : "active";
        toast.success(`Account status updated to ${nextStatus} for ${u.name}`);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveToStorage(updated);
  };

  /**
   * Toggles teammate activation status. Shows deactivate dialog if active, otherwise reactivates directly.
   */
  const handleToggleStatus = (target: MockUser) => {
    if (target.status === "active") {
      setDeactivateTarget(target);
    } else {
      executeToggleStatus(target);
    }
  };

  const handleConfirmDeactivate = () => {
    if (deactivateTarget) {
      executeToggleStatus(deactivateTarget);
      setDeactivateTarget(null);
    }
  };

  const handleDeleteMember = (target: MockUser) => {
    setDeleteTarget(target);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget && shouldUseAdminApi()) {
      const target = deleteTarget;
      platformAuth
        .removeMember(target.id)
        .then(reloadMembers)
        .then(() => toast.success(`Teammate ${target.name} deleted successfully`))
        .catch((error: Error) => toast.error(error.message));
      setDeleteTarget(null);
      return;
    }

    if (deleteTarget) {
      const updated = users.filter((u) => u.id !== deleteTarget.id);
      saveToStorage(updated);
      toast.success(`Teammate ${deleteTarget.name} deleted successfully`);
      setDeleteTarget(null);
    }
  };

  /**
   * Determines if the logged-in user is permitted to manage the target user.
   */
  const canManage = (target: MockUser) => {
    if (!currentUser) return false;
    if (currentUser.id === target.id) return false; // cannot edit self
    if (currentUser.role === "admin") return true; // admin can edit anyone else
    if (currentUser.role === "manager") {
      return target.role === "staff"; // manager can only edit staff
    }
    return false;
  };

  /** Назначение роли участнику проекта (auth-service). */
  const handleAssignRole = (target: MockUser, role: MockUser["role"]) => {
    if (!shouldUseAdminApi()) {
      saveToStorage(users.map((u) => (u.id === target.id ? { ...u, role } : u)));
      toast.success(`Role updated to ${role} for ${target.name}`);
      return;
    }

    platformAuth
      .assignMemberRole(target.id, role)
      .then(reloadMembers)
      .then(() => toast.success(`Role updated to ${role} for ${target.name}`))
      .catch((error: Error) => toast.error(error.message));
  };

  return {
    users,
    currentUser,
    handleAssignRole,
    isLoading,
    isInviteOpen,
    setIsInviteOpen,
    deactivateTarget,
    setDeactivateTarget,
    deleteTarget,
    setDeleteTarget,
    handleAddMember,
    handleToggleStatus,
    handleConfirmDeactivate,
    handleDeleteMember,
    handleConfirmDelete,
    canManage,
  };
}
