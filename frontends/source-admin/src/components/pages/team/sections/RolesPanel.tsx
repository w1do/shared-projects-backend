"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import type { ProjectRole } from "@/lib/admin/types/team";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { RoleCard } from "./RoleCard";

interface RolesPanelProps {
  roles: ProjectRole[];
  isLoading: boolean;
  canManage: boolean;
  onCreate: () => void;
  onOpen: (role: ProjectRole) => void;
  onEdit: (role: ProjectRole) => void;
  onDelete: (role: ProjectRole) => void;
}

/** Вкладка «Роли»: роли проекта и действия над кастомными ролями. */
export function RolesPanel({
  roles,
  isLoading,
  canManage,
  onCreate,
  onOpen,
  onEdit,
  onDelete,
}: RolesPanelProps) {
  const t = useConsoleText();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-heading-lg font-semibold text-foreground">
            {t("console.team.roles.title")}
          </h2>
          <p className="text-body text-muted-foreground mt-1">
            {t("console.team.roles.subtitle")}
          </p>
        </div>
        {canManage && (
          <Button variant="contained" shape="circle" startIcon={<Plus />} onClick={onCreate}>
            {t("console.team.roles.create-action")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-body text-muted-foreground">{t("console.common.loading")}</p>
      ) : roles.length === 0 ? (
        <p className="text-body text-muted-foreground">{t("console.team.roles.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              canManage={canManage}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
