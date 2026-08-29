"use client";

import * as React from "react";
import { FolderTree } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { CategoryTreeSelect } from "@/components/ui/inputs/category-tree-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import type { Category } from "@/lib/admin/types/catalog";
import { descendantIds } from "@/lib/admin/data-source/category-tree";
import { useConsoleText } from "@/lib/admin/use-console-text";

type CategoryMoveDialogProps = {
  open: boolean;
  category: Category | null;
  categories: Category[];
  isBusy?: boolean;
  onClose: () => void;
  /** Пустая строка — перенос в корень. */
  onConfirm: (parentId: string) => void;
};

export function CategoryMoveDialog({
  open,
  category,
  categories,
  isBusy = false,
  onClose,
  onConfirm,
}: CategoryMoveDialogProps) {
  const t = useConsoleText();
  const [parent, setParent] = React.useState<string | null>(null);

  const options = React.useMemo(
    () =>
      categories.map((item) => ({
        id: item.id,
        name: item.name,
        depth: item.depth ?? 0,
        parentId: item.parentId ?? null,
      })),
    [categories],
  );

  // Сам узел и его поддерево родителями быть не могут — иначе дерево замкнётся.
  const disabledIds = React.useMemo(() => {
    if (!category) return new Set<string>();
    const invalid = descendantIds(
      categories.map((item) => ({ id: item.id, parentId: item.parentId ?? null })),
      category.id,
    );
    invalid.add(category.id);
    return invalid;
  }, [categories, category]);

  React.useEffect(() => {
    if (!open) return;
    setParent(category?.parentId ?? null);
  }, [open, category]);

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !isBusy && onClose()}>
      <DialogContent size="sm" radius="3xl" scroll className="flex flex-col text-left">
        <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FolderTree className="size-6" />
        </div>

        <DialogTitle className="text-heading-lg font-semibold">{t("console.categories.move.title")}</DialogTitle>

        <DialogDescription className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {t("console.categories.move.subtitle").replace("{name}", category.name)}
        </DialogDescription>

        <div className="mt-4">
          <CategoryTreeSelect
            mode="single"
            label={t("console.categories.move.parent-label")}
            allowRoot
            options={options}
            disabledIds={disabledIds}
            value={parent}
            onChange={setParent}
            data-testid="category-move-parent"
            rootLabel={t("console.categories.move.root")}
          />
        </div>

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
            color="primary"
            shape="circle"
            size="sm"
            fullWidth
            disabled={isBusy}
            onClick={() => onConfirm(parent ?? "")}
          >
            {isBusy ? t("console.categories.move.moving") : t("console.categories.move.submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
