"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface TeamHeaderProps {
  currentUserRole: string;
  onInviteClick: () => void;
}

/**
 * Team page header component. Shows page title, description, and "Invite teammate" button for authorized roles.
 */
export function TeamHeader({ currentUserRole, onInviteClick }: TeamHeaderProps) {
  const t = useConsoleText();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-openrunde text-3xl font-semibold tracking-tight text-foreground">
          {t("console.team.title")}
        </h1>
        <p className="text-body text-muted-foreground mt-1">{t("console.team.subtitle")}</p>
      </div>
      {currentUserRole !== "staff" && (
        <Button variant="contained" shape="circle" startIcon={<UserPlus />} onClick={onInviteClick}>
          {t("console.team.invite-action")}
        </Button>
      )}
    </div>
  );
}
