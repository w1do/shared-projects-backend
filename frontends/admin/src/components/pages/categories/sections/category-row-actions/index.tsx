"use client";

import { MoreHorizontal, Edit2, Trash2, FolderTree } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import type { Category } from "@/lib/admin/mocks/types";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface CategoryRowActionsProps {
  category: Category;
  onEditClick: (category: Category) => void;
  onDeleteClick: (id: string) => void;
  onMoveClick?: (category: Category) => void;
}

export function CategoryRowActions({
  category,
  onEditClick,
  onDeleteClick,
  onMoveClick,
}: CategoryRowActionsProps) {
  const t = useConsoleText();
  // Об успехе сообщает страница после ответа платформы: здесь только открывается
  // диалог подтверждения, и прежний тост рапортовал об удалении заранее.
  const handleDelete = () => onDeleteClick(category.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton variant="ghost" size="sm" shape="circle">
          <MoreHorizontal className="size-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" size="sm">
        <DropdownMenuItem onClick={() => onEditClick(category)}>
          <Edit2 className="size-4" />
          <span>{t("console.common.edit")}</span>
        </DropdownMenuItem>
        {onMoveClick && (
          <DropdownMenuItem onClick={() => onMoveClick(category)}>
            <FolderTree className="size-4" />
            <span>{t("console.categories.move.menu")}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDelete} variant="destructive">
          <Trash2 className="size-4" />
          <span>{t("console.categories.delete")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
