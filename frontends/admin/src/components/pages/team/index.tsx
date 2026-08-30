"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/data-display/tabs";
import { useTeamPage, useRolesTab } from "@/hooks/admin/team";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { TeamHeader } from "./sections/TeamHeader";
import { TeamPanel } from "./sections/TeamPanel";
import { TeamLoadingState } from "./loading";
import { InviteMemberDialog } from "./sections/InviteMemberDialog";
import { DeleteMemberDialog } from "./sections/DeleteMemberDialog";
import { RolesPanel } from "./sections/RolesPanel";
import { RoleDialog } from "./sections/RoleDialog";
import { DeleteRoleDialog } from "./sections/DeleteRoleDialog";

/**
 * Team Page Component.
 * Integrates teammate state and CRUD actions from useTeamPage hook
 * and delegates UI rendering to smaller subcomponents under sections/.
 */
export default function TeamPage() {
  const t = useConsoleText();
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
    handleAssignRole,
    canManage,
    canInvite,
    canViewRoles,
    canManageRoles,
  } = useTeamPage();
  const roles = useRolesTab(canViewRoles);

  if (isLoading) {
    return <TeamLoadingState />;
  }

  const members = (
    <TeamPanel
      users={users}
      currentUser={currentUser}
      canManage={canManage}
      roleOptions={roles.options}
      onAssignRole={handleAssignRole}
      onDelete={handleDeleteMember}
    />
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <TeamHeader canInvite={canInvite} onInviteClick={() => setIsInviteOpen(true)} />

      {canViewRoles ? (
        <Tabs
          variant="underline"
          color="secondary"
          shape="rectangle"
          defaultValue="members"
          className="flex flex-col gap-6"
        >
          <TabsList>
            <TabsTrigger value="members">{t("console.team.tab.members")}</TabsTrigger>
            <TabsTrigger value="roles">{t("console.team.tab.roles")}</TabsTrigger>
          </TabsList>

          <TabsContent value="members">{members}</TabsContent>
          <TabsContent value="roles">
            <RolesPanel
              roles={roles.roles}
              isLoading={roles.isLoading}
              canManage={canManageRoles}
              onCreate={roles.openCreate}
              onOpen={(role) =>
                canManageRoles && !role.system ? roles.openEdit(role) : roles.openView(role)
              }
              onEdit={roles.openEdit}
              onDelete={roles.setDeleteTarget}
            />
          </TabsContent>
        </Tabs>
      ) : (
        members
      )}

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onAdd={handleAddMember}
        roleOptions={roles.options}
      />

      <DeleteMemberDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        user={deleteTarget}
      />

      <RoleDialog
        isOpen={roles.isDialogOpen}
        role={roles.editing}
        groups={roles.groups}
        readOnly={roles.readOnly}
        onClose={roles.closeDialog}
        onSave={roles.saveRole}
      />

      <DeleteRoleDialog
        isOpen={!!roles.deleteTarget}
        role={roles.deleteTarget}
        onClose={() => roles.setDeleteTarget(null)}
        onConfirm={roles.confirmDelete}
      />
    </div>
  );
}
