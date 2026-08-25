"use client";

import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";

interface BrandsBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
}

export function BrandsBulkActions({
  selectedCount,
  onClearSelection,
  onBulkDelete,
}: BrandsBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-primary p-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between animate-fade-in">
      <div className="flex items-center gap-4">
        <IconButton variant="ghost" shape="circle" onClick={onClearSelection} color="surface">
          <X />
        </IconButton>
        <span>
          {selectedCount} brand{selectedCount > 1 ? "s" : ""} selected
        </span>
      </div>
      <Button variant="ghost" color="error" startIcon={<Trash2 />} onClick={onBulkDelete}>
        Delete
      </Button>
    </div>
  );
}
