"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash, Eye, Pencil } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/overlay/dropdown-menu";
import type { Brand } from "@/lib/admin/mocks/types";

interface BrandRowActionsProps {
  brand: Brand;
  onDelete: (id: string) => void;
  onPreview?: (brand: Brand) => void;
}

export function BrandRowActions({ brand, onDelete, onPreview }: BrandRowActionsProps) {
  const router = useRouter();

  const handleDelete = () => {
    // Parent opens a confirm dialog before running the delete mutation.
    onDelete(brand.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton variant="ghost" size="sm" shape="circle">
          <MoreHorizontal className="size-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" size="sm">
        <DropdownMenuItem onClick={() => onPreview?.(brand)}>
          <Eye className="size-4" />
          <span>Preview</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push(`/admin/brands/${brand.id}/edit`)}>
          <Pencil className="size-4" />
          <span>Edit brand</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDelete} variant="destructive">
          <Trash className="size-4" />
          <span>Delete brand</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
