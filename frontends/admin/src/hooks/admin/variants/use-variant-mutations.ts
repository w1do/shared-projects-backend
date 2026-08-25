"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import { saveVariantConfigs, upsertVariantConfig } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

export function useSaveVariantConfigsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (configs: ProductVariantConfig[]) => saveVariantConfigs(configs),
    onSuccess: (configs) => {
      queryClient.setQueryData(adminQueryKeys.variants.list(), configs);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.variants.all });
    },
  });
}

export function useUpsertVariantConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: ProductVariantConfig) => upsertVariantConfig(config),
    onSuccess: (config) => {
      queryClient.setQueryData<ProductVariantConfig[]>(
        adminQueryKeys.variants.list(),
        (current = []) => {
          const exists = current.some((item) => item.productId === config.productId);
          return exists
            ? current.map((item) => (item.productId === config.productId ? config : item))
            : [config, ...current];
        },
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.variants.all });
    },
  });
}
