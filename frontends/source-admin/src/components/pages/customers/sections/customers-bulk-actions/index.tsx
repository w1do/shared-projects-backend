"use client";

import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";

interface CustomersBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onEngage: () => void;
}

export function CustomersBulkActions({
  selectedCount,
  onClearSelection,
  onEngage,
}: CustomersBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-primary p-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between animate-fade-in">
      <div className="flex items-center gap-4">
        <IconButton variant="ghost" shape="circle" onClick={onClearSelection} color="surface">
          <X />
        </IconButton>
        <span>
          {selectedCount} customer{selectedCount > 1 ? "s" : ""} selected
        </span>
      </div>
      <Button variant="ghost" color="surface" startIcon={<Megaphone />} onClick={onEngage}>
        Engage audience
      </Button>
    </div>
  );
}
