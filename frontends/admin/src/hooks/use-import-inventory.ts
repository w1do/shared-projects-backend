"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type ParsedItem, parseExcelFiles } from "@/lib/admin/inventory-import-helpers";
import { createProduct } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import type { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

export function useImportInventory(open: boolean, onOpenChange: (open: boolean) => void) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [parsedItems, setParsedItems] = React.useState<ParsedItem[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setParsedItems([]);
      setSelectedIds([]);
      setErrorMsg(null);
      setIsLoading(false);
    }
  }, [open]);

  const handleDrop = React.useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const items = await parseExcelFiles(acceptedFiles);
      setParsedItems(items);
      setSelectedIds(items.filter((p) => p.isValid).map((p) => p.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to read Excel files.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleSelectAll = () => {
    const valid = parsedItems.filter((i) => i.isValid);
    setSelectedIds(selectedIds.length === valid.length ? [] : valid.map((i) => i.id));
  };

  const handleToggleItem = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const handleRemoveItem = (id: string) => {
    setParsedItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleAddProducts = async () => {
    const itemsToAdd = parsedItems.filter((item) => selectedIds.includes(item.id));
    if (itemsToAdd.length === 0) {
      toast.warning("No items selected to import.");
      return;
    }
    setIsLoading(true);
    try {
      await Promise.all(
        itemsToAdd.map((item) => {
          const payload: ProductFormValues = {
            name: item.name,
            shortDescription: "",
            description: "",
            brand: item.brand || "br_aetheria",
            category: item.category || "cat_skincare",
            status: "Active",
            price: item.price,
            sku: item.sku || `IMP-${Date.now()}`,
            trackQuantity: true,
            stock: item.stock,
            images: ["/products/images/placeholder.webp"],
            thumbnail: "",
            collections: [],
            contentBlocks: [],
          };
          return createProduct(payload);
        }),
      );

      // Batch create intentionally bypasses per-item mutation hooks; invalidate once.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.inventory.all }),
      ]);

      toast.success(`Successfully imported ${itemsToAdd.length} products to inventory!`);
      onOpenChange(false);
    } catch {
      toast.error("An error occurred while importing products.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    parsedItems,
    selectedIds,
    errorMsg,
    setParsedItems,
    handleDrop,
    handleToggleSelectAll,
    handleToggleItem,
    handleRemoveItem,
    handleAddProducts,
  };
}
