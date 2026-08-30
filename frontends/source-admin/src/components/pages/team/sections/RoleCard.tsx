"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import { Card } from "@/components/ui/data-display/card";
import { IconButton } from "@/components/ui/inputs/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import type { ProjectRole } from "@/lib/admin/types/team";
import { roleLabel } from "@/lib/admin/role-labels";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface RoleCardProps {
  role: ProjectRole;
  canManage: boolean;
  onOpen: (role: ProjectRole) => void;
  onEdit: (role: ProjectRole) => void;
  onDelete: (role: ProjectRole) => void;
}

/** Карточка роли: название, признак системной и число прав. Состав — в диалоге. */
export function RoleCard({ role, canManage, onOpen, onEdit, onDelete }: RoleCardProps) {
  const t = useConsoleText();
  const editable = canManage && !role.system;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(role)}
      onKeyDown={(event) => event.key === "Enter" && onOpen(role)}
      className="flex flex-col gap-3 p-4 bg-card border border-border/40 rounded-3xl relative shadow-subtle hover:shadow-subtle-2 transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-2 pr-8">
        <span className="font-medium text-foreground truncate">{roleLabel(role.name)}</span>
        {role.system && (
          <Badge variant="soft" color="neutral" size="sm">
            {t("console.team.roles.system-badge")}
          </Badge>
        )}
      </div>

      <span className="text-caption text-muted-foreground-lighter">
        {role.permissions.length === 0
          ? t("console.team.roles.no-permissions")
          : t("console.team.roles.permissions-count").replace(
              "{count}",
              String(role.permissions.length),
            )}
      </span>

      {editable && (
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                shape="circle"
                aria-label={t("console.team.roles.card.actions")}
                onClick={(event) => event.stopPropagation()}
              >
                <MoreVertical className="size-4" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(role);
                }}
              >
                <Pencil className="size-4" /> {t("console.team.roles.card.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(role);
                }}
              >
                <Trash2 className="size-4" /> {t("console.team.roles.card.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
}
