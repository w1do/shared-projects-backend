"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/overlay/dialog";

type ProductDeleteDialogProps = {
  open: boolean;
  productName?: string;
  count?: number;
  isBusy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ProductDeleteDialog({
  open,
  productName,
  count = 1,
  isBusy = false,
  onClose,
  onConfirm,
}: ProductDeleteDialogProps) {
  const isBulk = count > 1;
  const title = isBulk ? `Delete ${count} products` : "Delete product";
  const description = isBulk
    ? `This permanently removes ${count} selected products from the catalog. Linked inventory and storefront listings may be affected.`
    : `Are you sure you want to delete${productName ? ` "${productName}"` : " this product"}? This action is permanent and cannot be undone.`;

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
            Cancel
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
            Confirm Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
