"use client";

import { X } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface CustomersBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export function CustomersBulkActions({
  selectedCount,
  onClearSelection,
}: CustomersBulkActionsProps) {
  const t = useConsoleText();

  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-primary p-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between animate-fade-in">
      <div className="flex items-center gap-4">
        <IconButton variant="ghost" shape="circle" onClick={onClearSelection} color="surface">
          <X />
        </IconButton>
        <span>
          {t("console.customers.bulk-selected").replace("{count}", String(selectedCount))}
        </span>
      </div>
    </div>
  );
}
