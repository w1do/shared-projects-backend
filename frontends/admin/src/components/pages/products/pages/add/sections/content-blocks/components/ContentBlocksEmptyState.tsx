"use client";

import { Layers } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";

interface ContentBlocksEmptyStateProps {
  onAddBlock: () => void;
}

export function ContentBlocksEmptyState({ onAddBlock }: ContentBlocksEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border/60 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-muted">
        <Layers size={20} className="text-muted-foreground-lighter" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">No content blocks yet</p>
        <p className="mt-2 text-xs text-muted-foreground-lighter">
          Add ingredients, usage instructions, FAQ, or other product details
        </p>
      </div>
      <Button
        type="button"
        variant="soft"
        color="surface"
        size="md"
        shape="circle"
        onClick={onAddBlock}
        startIcon={<Layers size={16} />}
      >
        Add content block
      </Button>
    </div>
  );
}
