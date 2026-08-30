"use client";

import type { RoleOption, TeamUser } from "@/lib/admin/types/team";
import { TeamMemberCard } from "./TeamMemberCard";

interface TeamPanelProps {
  users: TeamUser[];
  currentUser: TeamUser | null;
  canManage: (target: TeamUser) => boolean;
  roleOptions: RoleOption[];
  onAssignRole: (target: TeamUser, role: string) => void;
  onDelete: (target: TeamUser) => void;
}

/**
 * TeamPanel component representing the layout containing the teammate list.
 */
export function TeamPanel({
  users,
  currentUser,
  canManage,
  roleOptions,
  onAssignRole,
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
          roleOptions={roleOptions}
          onAssignRole={onAssignRole}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
