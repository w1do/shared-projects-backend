import { X, Tag, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";

type BulkActionBarProps = {
  count: number;
  onClear: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  /** Disables bulk actions while a mutation is in flight. */
  isBusy?: boolean;
  userRole?: string;
};

export function BulkActionBar({
  count,
  onClear,
  onArchive,
  onDelete,
  isBusy = false,
  userRole,
}: BulkActionBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-primary p-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <IconButton
          variant="ghost"
          shape="circle"
          onClick={onClear}
          color="surface"
          disabled={isBusy}
          aria-label="Clear selection"
        >
          <X />
        </IconButton>
        <span>
          {count} product{count > 1 ? "s" : ""} selected
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" color="surface" startIcon={<Tag />} disabled={isBusy}>
          Edit pricing
        </Button>
        <Button
          variant="ghost"
          color="surface"
          startIcon={<Archive />}
          onClick={onArchive}
          disabled={isBusy}
        >
          Archive
        </Button>
        {userRole !== "staff" && (
          <Button
            variant="ghost"
            color="error"
            startIcon={<Trash2 />}
            onClick={onDelete}
            disabled={isBusy}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
