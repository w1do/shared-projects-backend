"use client";

import * as React from "react";
import { useTeamPage } from "@/hooks/admin/team";
import { TeamHeader } from "./sections/TeamHeader";
import { TeamPanel } from "./sections/TeamPanel";
import { TeamLoadingState } from "./loading";
import { InviteMemberDialog } from "./sections/InviteMemberDialog";
import { DeleteMemberDialog } from "./sections/DeleteMemberDialog";

/**
 * Team Page Component.
 * Integrates teammate state and CRUD actions from useTeamPage hook
 * and delegates UI rendering to smaller subcomponents under sections/.
 */
export default function TeamPage() {
  const {
    users,
    currentUser,
    isLoading,
    isInviteOpen,
    setIsInviteOpen,
    deleteTarget,
    setDeleteTarget,
    handleAddMember,
    handleDeleteMember,
    handleConfirmDelete,
    canManage,
  } = useTeamPage();

  if (isLoading) {
    return <TeamLoadingState />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <TeamHeader
        currentUserRole={currentUser?.role || "staff"}
        onInviteClick={() => setIsInviteOpen(true)}
      />
      <TeamPanel
        users={users}
        currentUser={currentUser}
        canManage={canManage}
        onDelete={handleDeleteMember}
      />

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onAdd={handleAddMember}
        currentUserRole={currentUser?.role || "staff"}
      />

      <DeleteMemberDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        user={deleteTarget}
      />
    </div>
  );
}
