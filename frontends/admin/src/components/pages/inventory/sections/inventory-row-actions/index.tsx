"use client";

import { MoreHorizontal, Edit, Plus } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import type { InventoryItem } from "@/lib/admin/mocks/types";

interface InventoryRowActionsProps {
  item: InventoryItem;
  onEditClick: (item: InventoryItem) => void;
  onQuickAdjust: (id: string, delta: number) => void;
}

export function InventoryRowActions({
  item,
  onEditClick,
  onQuickAdjust,
}: InventoryRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton variant="ghost" size="sm" shape="circle">
          <MoreHorizontal className="size-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" size="sm">
        <DropdownMenuItem onClick={() => onEditClick(item)}>
          <Edit className="size-4" />
          <span>Adjust inventory</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onQuickAdjust(item.id, 20)}>
          <Plus className="size-4" />
          <span>Receive 20 units</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
