"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";

interface TeamHeaderProps {
  currentUserRole: string;
  onInviteClick: () => void;
}

/**
 * Team page header component. Shows page title, description, and "Invite teammate" button for authorized roles.
 */
export function TeamHeader({ currentUserRole, onInviteClick }: TeamHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-openrunde text-3xl font-semibold tracking-tight text-foreground">
          Team Management
        </h1>
        <p className="text-body text-muted-foreground mt-1">
          Manage workspace users, edit statuses, and assign roles.
        </p>
      </div>
      {currentUserRole !== "staff" && (
        <Button variant="contained" shape="circle" startIcon={<UserPlus />} onClick={onInviteClick}>
          Invite teammate
        </Button>
      )}
    </div>
  );
}
