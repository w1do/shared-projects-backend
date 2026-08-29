"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Checkbox } from "@/components/ui/inputs/checkbox";
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
  /** Полные пути удаляемых узлов: по имени одноимённые ветки неразличимы. */
  paths?: string[];
  /** Очистка каталога — отдельное действие с усиленным подтверждением. */
  variant?: "delete" | "purge";
  isBusy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CategoryDeleteDialog({
  open,
  categoryName,
  count = 1,
  descendantCount = 0,
  paths = [],
  variant = "delete",
  isBusy = false,
  onClose,
  onConfirm,
}: CategoryDeleteDialogProps) {
  const t = useConsoleText();
  const isPurge = variant === "purge";
  const isBulk = count > 1;

  // Очистка каталога необратима: обычного «Удалить» для неё мало.
  const [acknowledged, setAcknowledged] = useState(false);
  useEffect(() => {
    if (!open) setAcknowledged(false);
  }, [open]);

  const title = isPurge
    ? t("console.categories.purge.title")
    : isBulk
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

  const description = isPurge
    ? `${t("console.categories.purge.question").replace("{count}", String(count))}${postsNote} ${t("console.categories.delete.irreversible")}`
    : isBulk
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

        {paths.length > 0 && (
          <div className="mt-4 w-full text-left" data-testid="category-delete-paths">
            <p className="text-xs text-muted-foreground-lighter">
              {t("console.categories.delete.paths-label")}
            </p>
            <ul className="mt-2 flex max-h-40 flex-col gap-1 overflow-y-auto">
              {paths.map((path) => (
                <li
                  key={path}
                  className="truncate rounded-xl bg-muted/40 px-4 py-2 font-mono text-xs text-foreground"
                >
                  {path}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isPurge && (
          <label className="mt-4 flex w-full items-center gap-4 rounded-2xl bg-destructive/5 px-4 py-2 text-left text-xs text-foreground">
            <Checkbox
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
              size="small"
              data-testid="category-purge-acknowledge"
            />
            <span>{t("console.categories.purge.acknowledge")}</span>
          </label>
        )}

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
            disabled={isPurge && !acknowledged}
            onClick={onConfirm}
            data-testid="category-delete-confirm"
          >
            {isPurge
              ? t("console.categories.purge.confirm")
              : t("console.categories.delete.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
