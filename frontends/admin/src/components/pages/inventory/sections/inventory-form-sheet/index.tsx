"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/overlay/sheet";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Avatar } from "@/components/ui/data-display/avatar";
import type { InventoryItem } from "@/lib/admin/mocks/types";
import {
  inventoryFormSchema,
  type InventoryFormValues,
} from "@/lib/admin/schemas/catalog/inventory-form-schema";
import { toast } from "sonner";

interface InventoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onSubmit: (values: InventoryFormValues) => void;
}

export function InventoryFormSheet({
  open,
  onOpenChange,
  item,
  onSubmit,
}: InventoryFormSheetProps) {
  const isEdit = !!item;
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: { stock: 0, incoming: 0, threshold: 10, location: "", reason: "" },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (item) {
      reset({
        stock: item.stock,
        incoming: item.incoming,
        threshold: item.threshold,
        location: item.location,
        reason: "",
      });
    } else {
      reset({ stock: 0, incoming: 0, threshold: 10, location: "", reason: "" });
    }
  }, [item, open, reset]);

  const onFormSubmit = (values: InventoryFormValues) => {
    onSubmit(values);
    onOpenChange(false);
    toast.success(`Inventory for "${item?.name || "SKU"}" has been successfully updated.`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="md" tone="card" className="flex h-full flex-col gap-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Adjust Inventory" : "Receive New Stock"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? `Modify stock counts, locations, and thresholds for ${item.name}.`
              : "Register stock arrivals."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-1 flex flex-col justify-between gap-8"
        >
          <div className="flex flex-col gap-6">
            {item && (
              <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border/60">
                <Avatar
                  src={item.image}
                  alt={item.name}
                  fallback={item.brand.substring(0, 2).toUpperCase()}
                  size="lg"
                  shape="rounded"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">SKU: {item.sku}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register("stock", { valueAsNumber: true })}
                label="Units in Stock"
                placeholder="e.g., 120"
                type="number"
                error={errors.stock?.message}
              />
              <Input
                {...register("incoming", { valueAsNumber: true })}
                label="Incoming Supply"
                placeholder="e.g., 50"
                type="number"
                error={errors.incoming?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register("threshold", { valueAsNumber: true })}
                label="Alert Threshold"
                placeholder="e.g., 20"
                type="number"
                error={errors.threshold?.message}
              />
              <Input
                {...register("location")}
                label="Shelf Location"
                placeholder="e.g., Aisle C, Shelf 2-4"
                error={errors.location?.message}
              />
            </div>

            <Textarea
              {...register("reason")}
              label="Adjustment Reason"
              placeholder="Explain adjustment cause..."
              className="min-h-28"
              error={errors.reason?.message}
            />
          </div>

          <SheetFooter className="flex-row items-center justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              size="lg"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" shape="circle" size="lg">
              Save Changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
