"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";
import type { ProductFull } from "@/lib/admin/mocks/types";
import {
  archiveProduct,
  archiveProducts,
  createProduct,
  deleteProduct,
  deleteProducts,
  updateProduct,
} from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

function setProductsCache(queryClient: ReturnType<typeof useQueryClient>, products: ProductFull[]) {
  queryClient.setQueryData<ProductFull[]>(adminQueryKeys.products.list(), products);
}

function patchProductInList(
  queryClient: ReturnType<typeof useQueryClient>,
  productId: string,
  patch: Partial<ProductFull>,
) {
  queryClient.setQueryData<ProductFull[]>(adminQueryKeys.products.list(), (current = []) =>
    current.map((product) => (product.id === productId ? { ...product, ...patch } : product)),
  );
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProductFormValues) => createProduct(values),
    onSuccess: (product) => {
      queryClient.setQueryData<ProductFull[]>(adminQueryKeys.products.list(), (current = []) => {
        const without = current.filter((item) => item.id !== product.id);
        return [product, ...without];
      });
      queryClient.setQueryData(adminQueryKeys.products.detail(product.id), product);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all });
    },
  });
}

export function useUpdateProductMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProductFormValues) => updateProduct(productId, values),
    onSuccess: (product) => {
      if (!product) return;
      patchProductInList(queryClient, product.id, product);
      queryClient.setQueryData(adminQueryKeys.products.detail(product.id), product);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.products.all });
      const previous = queryClient.getQueryData<ProductFull[]>(adminQueryKeys.products.list());
      queryClient.setQueryData<ProductFull[]>(adminQueryKeys.products.list(), (current = []) =>
        current.filter((product) => product.id !== id),
      );
      queryClient.removeQueries({ queryKey: adminQueryKeys.products.detail(id) });
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) setProductsCache(queryClient, context.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all });
    },
  });
}

export function useDeleteProductsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => deleteProducts(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.products.all });
      const previous = queryClient.getQueryData<ProductFull[]>(adminQueryKeys.products.list());
      const idSet = new Set(ids);
      queryClient.setQueryData<ProductFull[]>(adminQueryKeys.products.list(), (current = []) =>
        current.filter((product) => !idSet.has(product.id)),
      );
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: adminQueryKeys.products.detail(id) });
      });
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) setProductsCache(queryClient, context.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all });
    },
  });
}

export function useArchiveProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.products.all });
      const previous = queryClient.getQueryData<ProductFull[]>(adminQueryKeys.products.list());
      const now = new Date().toISOString();
      patchProductInList(queryClient, id, { status: "Archived", updatedAt: now });
      queryClient.setQueryData<ProductFull | null>(adminQueryKeys.products.detail(id), (current) =>
        current ? { ...current, status: "Archived", updatedAt: now } : current,
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) setProductsCache(queryClient, context.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all });
    },
  });
}

export function useArchiveProductsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => archiveProducts(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.products.all });
      const previous = queryClient.getQueryData<ProductFull[]>(adminQueryKeys.products.list());
      const idSet = new Set(ids);
      const now = new Date().toISOString();
      queryClient.setQueryData<ProductFull[]>(adminQueryKeys.products.list(), (current = []) =>
        current.map((product) =>
          idSet.has(product.id) ? { ...product, status: "Archived", updatedAt: now } : product,
        ),
      );
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) setProductsCache(queryClient, context.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all });
    },
  });
}
