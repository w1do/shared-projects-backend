"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InventoryItem } from "@/lib/admin/mocks/types";
import type { InventoryFormValues } from "@/lib/admin/schemas/catalog/inventory-form-schema";
import { adjustInventoryItem, updateInventoryItem } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type QueryClient = ReturnType<typeof useQueryClient>;

/** Stock mutations write through to products; refresh both catalogs. */
async function invalidateInventoryCaches(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.inventory.all }),
  ]);
}

function setInventoryCache(queryClient: QueryClient, items: InventoryItem[]) {
  queryClient.setQueryData<InventoryItem[]>(adminQueryKeys.inventory.list(), items);
}

export function useAdjustInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, delta }: { id: string; delta: number }) => {
      const current =
        queryClient.getQueryData<InventoryItem[]>(adminQueryKeys.inventory.list()) ?? [];
      return adjustInventoryItem(id, delta, current);
    },
    onSuccess: (next) => {
      setInventoryCache(queryClient, next);
    },
    onSettled: async () => {
      await invalidateInventoryCaches(queryClient);
    },
  });
}

export function useUpdateInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ item, values }: { item: InventoryItem; values: InventoryFormValues }) => {
      const current =
        queryClient.getQueryData<InventoryItem[]>(adminQueryKeys.inventory.list()) ?? [];
      return updateInventoryItem(item, values, current);
    },
    onSuccess: (next) => {
      setInventoryCache(queryClient, next);
    },
    onSettled: async () => {
      await invalidateInventoryCaches(queryClient);
    },
  });
}
