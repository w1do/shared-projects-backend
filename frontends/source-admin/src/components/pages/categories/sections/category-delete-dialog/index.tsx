"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { useConsoleText } from "@/lib/admin/use-console-text";

type CategoryDeleteDialogProps = {
  open: boolean;
  categoryName?: string;
  count?: number;
  /** Сколько вложенных категорий уйдёт вместе с этой. */
  descendantCount?: number;
  isBusy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CategoryDeleteDialog({
  open,
  categoryName,
  count = 1,
  descendantCount = 0,
  isBusy = false,
  onClose,
  onConfirm,
}: CategoryDeleteDialogProps) {
  const t = useConsoleText();
  const isBulk = count > 1;
  const title = isBulk
    ? t("console.categories.delete.title-bulk").replace("{count}", String(count))
    : t("console.categories.delete.title");

  // Поведение платформы: удаляется всё поддерево, посты сохраняются и теряют
  // только привязку к удалённым категориям.
  const subtreeNote =
    descendantCount > 0
      ? ` ${t("console.categories.delete.subtree-note").replace("{count}", String(descendantCount))}`
      : "";
  const postsNote = ` ${t("console.categories.delete.posts-note")}`;

  const question = categoryName
    ? t("console.categories.delete.question").replace("{name}", categoryName)
    : t("console.categories.delete.question-plain");

  const description = isBulk
    ? `${t("console.categories.delete.question-bulk").replace("{count}", String(count))}${postsNote}`
    : `${question}${subtreeNote}${postsNote} ${t("console.categories.delete.irreversible")}`;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !isBusy && onClose()}>
      <DialogContent
        size="sm"
        radius="3xl"
        scroll
        className="flex flex-col items-center text-center"
      >
        <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="size-6" />
        </div>

        <DialogTitle className="text-heading-lg font-semibold">{title}</DialogTitle>

        <DialogDescription className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
          {description}
        </DialogDescription>

        <div className="mt-6 grid w-full grid-cols-2 gap-4">
          <Button
            variant="outlined"
            shape="circle"
            size="sm"
            fullWidth
            disabled={isBusy}
            onClick={onClose}
          >
            {t("console.common.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            shape="circle"
            size="sm"
            fullWidth
            isLoading={isBusy}
            onClick={onConfirm}
          >
            {t("console.categories.delete.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
