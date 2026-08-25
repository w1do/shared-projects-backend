"use client";

import { Edit, MoreHorizontal, Star, Trash } from "lucide-react";
import { toast } from "sonner";
import { IconButton } from "@/components/ui/inputs/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import type { Collection } from "@/lib/admin/mocks/types";

interface CollectionRowActionsProps {
  collection: Collection;
  onEditClick: (collection: Collection) => void;
  onDeleteClick: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

export function CollectionRowActions({
  collection,
  onEditClick,
  onDeleteClick,
  onToggleFeatured,
}: CollectionRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton variant="ghost" size="sm" shape="circle">
          <MoreHorizontal className="size-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" size="sm">
        <DropdownMenuItem onClick={() => onEditClick(collection)}>
          <Edit className="size-4" />
          <span>Edit details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleFeatured(collection.id)}>
          <Star className="size-4" />
          <span>{collection.featured ? "Remove featured" : "Mark featured"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onDeleteClick(collection.id);
            toast.success("Deleted.");
          }}
          variant="destructive"
        >
          <Trash className="size-4" />
          <span>Delete collection</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
