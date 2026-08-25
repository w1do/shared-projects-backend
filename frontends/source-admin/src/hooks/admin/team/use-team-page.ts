"use client";

import * as React from "react";
import { toast } from "sonner";
import { mockUsers, type MockUser } from "@/lib/admin/mocks/auth";

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

    // 2. Initialize mock users database in local storage
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
    localStorage.setItem("mock_users", JSON.stringify(updatedUsers));
  };

  /**
   * Invites/adds a new teammate to the workspace.
   */
  const handleAddMember = (name: string, email: string, role: "admin" | "manager" | "staff") => {
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

  return {
    users,
    currentUser,
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
