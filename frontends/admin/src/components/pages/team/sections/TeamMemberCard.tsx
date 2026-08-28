"use client";

import * as React from "react";
import { MoreVertical, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { Card } from "@/components/ui/data-display/card";
import { IconButton } from "@/components/ui/inputs/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import type { MockUser } from "@/lib/admin/mocks/auth";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface TeamMemberCardProps {
  user: MockUser;
  isSelf: boolean;
  allowed: boolean;
  currentUserRole: string;
  onToggleStatus: (user: MockUser) => void;
  onDelete: (user: MockUser) => void;
}

export function TeamMemberCard({
  user,
  isSelf,
  allowed,
  currentUserRole,
  onToggleStatus,
  onDelete,
}: TeamMemberCardProps) {
  const t = useConsoleText();
  const isActive = user.status === "active";

  return (
    <Card className="flex items-center gap-4 p-4 bg-card border border-border/40 rounded-3xl relative shadow-subtle hover:shadow-subtle-2 transition-shadow">
      <Avatar
        src={user.avatar}
        fallback={user.name.slice(0, 2).toUpperCase()}
        className="shrink-0 rounded-2xl size-20"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">{user.name}</span>
          {isSelf && (
            <Badge variant="soft" color="accent" size="sm" className="scale-90">
              {t("console.team.card.you")}
            </Badge>
          )}
        </div>
        <span className="text-caption text-muted-foreground-lighter block truncate mt-1">
          {user.email}
        </span>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant="soft"
            color={
              user.role === "admin" ? "primary" : user.role === "manager" ? "warning" : "neutral"
            }
            size="sm"
          >
            {t(`console.team.role.${user.role}`)}
          </Badge>
          <Badge variant="soft" color={isActive ? "success" : "error"} size="sm">
            {t(`console.team.status.${user.status}`)}
          </Badge>
        </div>
      </div>

      {allowed && (
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                shape="circle"
                aria-label={t("console.team.card.actions")}
              >
                <MoreVertical className="size-4" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                {isActive ? (
                  <ToggleRight className="text-destructive size-4" />
                ) : (
                  <ToggleLeft className="text-success size-4" />
                )}
                {isActive ? t("console.team.card.deactivate") : t("console.team.card.activate")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(user)}>
                <Trash2 className="size-4" /> {t("console.team.card.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
}
