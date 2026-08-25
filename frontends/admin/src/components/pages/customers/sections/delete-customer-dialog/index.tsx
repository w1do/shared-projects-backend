"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";

interface DeleteCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customer: DetailedCustomer | null;
}

export function DeleteCustomerDialog({
  isOpen,
  onClose,
  onConfirm,
  customer,
}: DeleteCustomerDialogProps) {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        size="sm"
        radius="3xl"
        scroll
        className="flex flex-col items-center text-center"
      >
        <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="size-6" />
        </div>

        <DialogTitle className="text-heading-lg font-semibold">Delete Customer</DialogTitle>

        <DialogDescription className="mt-2 max-w-xs text-xs text-muted-foreground leading-relaxed">
          Are you sure you want to delete <strong>{customer.name}</strong>? This action is permanent
          and cannot be undone. The account and its access to this project will be removed.
        </DialogDescription>

        <div className="mt-6 grid w-full grid-cols-2 gap-4">
          <Button variant="outlined" shape="circle" size="sm" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            shape="circle"
            size="sm"
            fullWidth
            onClick={onConfirm}
          >
            Confirm Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
