"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/overlay/dialog";

type BrandDeleteDialogProps = {
  open: boolean;
  brandName?: string;
  isBusy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function BrandDeleteDialog({
  open,
  brandName,
  isBusy = false,
  onClose,
  onConfirm,
}: BrandDeleteDialogProps) {
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

        <DialogTitle className="text-heading-lg font-semibold">Delete brand</DialogTitle>

        <DialogDescription className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
          Are you sure you want to remove
          {brandName ? ` “${brandName}”` : " this brand"} from the portfolio? Linked products and
          storefront merchandising may be affected. This action cannot be undone.
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
