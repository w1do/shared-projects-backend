"use client";

import type { MockUser } from "@/lib/admin/mocks/auth";
import { TeamMemberCard } from "./TeamMemberCard";

interface TeamPanelProps {
  users: MockUser[];
  currentUser: MockUser | null;
  canManage: (target: MockUser) => boolean;
  onToggleStatus: (target: MockUser) => void;
  onDelete: (target: MockUser) => void;
}

/**
 * TeamPanel component representing the layout containing the teammate list.
 */
export function TeamPanel({
  users,
  currentUser,
  canManage,
  onToggleStatus,
  onDelete,
}: TeamPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <TeamMemberCard
          key={user.id}
          user={user}
          isSelf={currentUser?.id === user.id}
          allowed={canManage(user)}
          currentUserRole={currentUser?.role || "staff"}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
