"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CategoryFormValues } from "@/lib/admin/schemas/catalog/category-form-schema";
import type { Category } from "@/lib/admin/mocks/types";
import { createCategory, deleteCategory, moveCategory, updateCategory } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type QueryClient = ReturnType<typeof useQueryClient>;

function setCategoriesCache(queryClient: QueryClient, categories: Category[]) {
  queryClient.setQueryData<Category[]>(adminQueryKeys.categories.list(), categories);
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CategoryFormValues) => createCategory(values),
    onSuccess: (category) => {
      queryClient.setQueryData<Category[]>(adminQueryKeys.categories.list(), (current = []) => {
        const without = current.filter((item) => item.id !== category.id);
        return [category, ...without];
      });
      queryClient.setQueryData(adminQueryKeys.categories.detail(category.id), category);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories.all });
    },
  });
}

export function useUpdateCategoryMutation(categoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CategoryFormValues) => updateCategory(categoryId, values),
    onSuccess: (category) => {
      if (!category) return;
      queryClient.setQueryData<Category[]>(adminQueryKeys.categories.list(), (current = []) =>
        current.map((item) => (item.id === category.id ? category : item)),
      );
      queryClient.setQueryData(adminQueryKeys.categories.detail(category.id), category);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories.all });
    },
  });
}

/**
 * Перемещение категории к другому родителю.
 *
 * Оптимистично не обновляем: поддерево переезжает вместе с узлом, и пересчитать
 * плоский список локально означало бы повторить логику nested set на клиенте.
 * Дешевле и честнее перечитать дерево у платформы.
 */
export function useMoveCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      parentId,
      position,
    }: {
      id: string;
      parentId: string | null;
      position?: number;
    }) => moveCategory(id, parentId, position),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories.all });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.categories.all });
      const previous = queryClient.getQueryData<Category[]>(adminQueryKeys.categories.list());
      queryClient.setQueryData<Category[]>(adminQueryKeys.categories.list(), (current = []) =>
        current.filter((category) => category.id !== id),
      );
      queryClient.removeQueries({ queryKey: adminQueryKeys.categories.detail(id) });
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) setCategoriesCache(queryClient, context.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories.all });
    },
  });
}
