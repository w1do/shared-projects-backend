"use client";

import type { Category } from "@/lib/admin/mocks/types";
import { useCategoryQuery } from "./use-category-query";
import { useCategoriesQuery } from "./use-categories-query";

type Options = {
  categoryId: string;
  initialCategory?: Category | null;
  initialCategories?: Category[];
};

/**
 * Edit category page data boundary.
 * Prefer SSR/local seed while Query revalidates; only show empty when truly missing.
 */
export function useEditCategoryPage(options: Options) {
  const { categoryId, initialCategory = null, initialCategories = [] } = options;

  const {
    data: category,
    isPending,
    isError,
    isFetched,
  } = useCategoryQuery(categoryId, {
    initialData: initialCategory ?? undefined,
  });

  const { data: categories = initialCategories } = useCategoriesQuery({
    initialData: initialCategories,
  });

  const resolved = category ?? initialCategory ?? null;
  // Block only when we have no seed and the first client fetch has not finished.
  const isResolving = !resolved && isPending && !isFetched;
  const notFound = !resolved && isFetched && (isError || category == null);

  return {
    category: resolved,
    categories,
    isResolving,
    notFound,
  };
}
