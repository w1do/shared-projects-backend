"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import type { Brand } from "@/lib/admin/mocks/types";
import { createBrand, deleteBrand, updateBrand } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type QueryClient = ReturnType<typeof useQueryClient>;

function setBrandsCache(queryClient: QueryClient, brands: Brand[]) {
  queryClient.setQueryData<Brand[]>(adminQueryKeys.brands.list(), brands);
}

export function useCreateBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: BrandFormValues) => createBrand(values),
    onSuccess: (brand) => {
      queryClient.setQueryData<Brand[]>(adminQueryKeys.brands.list(), (current = []) => {
        const without = current.filter((item) => item.id !== brand.id);
        return [brand, ...without];
      });
      queryClient.setQueryData(adminQueryKeys.brands.detail(brand.id), brand);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.brands.all });
    },
  });
}

export function useUpdateBrandMutation(brandId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: BrandFormValues) => updateBrand(brandId, values),
    onSuccess: (brand) => {
      if (!brand) return;
      queryClient.setQueryData<Brand[]>(adminQueryKeys.brands.list(), (current = []) =>
        current.map((item) => (item.id === brand.id ? brand : item)),
      );
      queryClient.setQueryData(adminQueryKeys.brands.detail(brand.id), brand);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.brands.all });
    },
  });
}

export function useDeleteBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.brands.all });
      const previous = queryClient.getQueryData<Brand[]>(adminQueryKeys.brands.list());
      queryClient.setQueryData<Brand[]>(adminQueryKeys.brands.list(), (current = []) =>
        current.filter((brand) => brand.id !== id),
      );
      queryClient.removeQueries({ queryKey: adminQueryKeys.brands.detail(id) });
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) setBrandsCache(queryClient, context.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.brands.all });
    },
  });
}
