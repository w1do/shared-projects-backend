"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { InventoryItem } from "@/lib/admin/mocks/types";
import type { InventoryFormValues } from "@/lib/admin/schemas/catalog/inventory-form-schema";
import { useInventoryQuery } from "./use-inventory-query";
import { useAdjustInventoryMutation, useUpdateInventoryMutation } from "./use-inventory-mutations";

type UseInventoryPageOptions = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the products/dashboard pattern.
   */
  initialItems?: InventoryItem[];
};

/** Inventory list page: Query list + adjust/update mutations + sheet UI state. */
export function useInventoryPage(options: UseInventoryPageOptions = {}) {
  const { initialItems } = options;
  const hasSeed = initialItems !== undefined;

  const { data, isPending } = useInventoryQuery({
    initialData: hasSeed ? initialItems : undefined,
  });
  const adjustMutation = useAdjustInventoryMutation();
  const updateMutation = useUpdateInventoryMutation();

  const items = data ?? initialItems ?? [];

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsSheetOpen(true);
  };

  const quickAdjust = (id: string, delta: number) => {
    const target = items.find((item) => item.id === id);
    if (target) {
      toast.success(
        `Adjusted stock of "${target.name}" by ${delta > 0 ? `+${delta}` : delta} units.`,
      );
    }

    adjustMutation.mutate(
      { id, delta },
      {
        onError: () => toast.error("Could not adjust inventory."),
      },
    );
  };

  const submitEdit = (values: InventoryFormValues) => {
    if (!selectedItem) return;

    updateMutation.mutate(
      { item: selectedItem, values },
      {
        onSuccess: () => {
          setIsSheetOpen(false);
          toast.success("Inventory updated.");
        },
        onError: () => toast.error("Could not update inventory."),
      },
    );
  };

  return {
    items,
    /** No cached data yet — show full-page InventoryLoadingState. */
    isPending: hasSeed ? false : isPending,
    selectedItem,
    isSheetOpen,
    setIsSheetOpen,
    openEdit,
    quickAdjust,
    submitEdit,
    isBusy: adjustMutation.isPending || updateMutation.isPending,
  };
}
