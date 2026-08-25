"use client";

import { MoreHorizontal, SlidersHorizontal, Pencil, Copy, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { IconButton } from "@/components/ui/inputs/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import type { Promotion } from "@/lib/admin/mocks/promotions";

interface PromotionRowActionsProps {
  promotion: Promotion;
  onViewDetails: (promotion: Promotion) => void;
  onEdit: (promotion: Promotion) => void;
  onToggleStatus: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
}

export function PromotionRowActions({
  promotion,
  onViewDetails,
  onEdit,
  onToggleStatus,
  onDelete,
}: PromotionRowActionsProps) {
  const isPaused = promotion.status === "Paused";
  const canToggle = promotion.status === "Active" || promotion.status === "Paused";

  const copyCode = () => {
    navigator.clipboard.writeText(promotion.code);
    toast.success(`Code ${promotion.code} copied to clipboard`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton variant="ghost" size="sm" shape="circle" aria-label="Promotion actions">
          <MoreHorizontal />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" size="sm">
        <DropdownMenuItem onClick={() => onViewDetails(promotion)}>
          <SlidersHorizontal className="size-4" />
          <span>Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(promotion)}>
          <Pencil className="size-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyCode}>
          <Copy className="size-4" />
          <span>Copy code</span>
        </DropdownMenuItem>
        {canToggle && (
          <DropdownMenuItem onClick={() => onToggleStatus(promotion)}>
            {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onDelete(promotion)} variant="destructive">
          <Trash2 className="size-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
