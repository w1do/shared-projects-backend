"use client";

import type { ProductFull } from "@/lib/admin/mocks/types";
import { useProductsQuery } from "./use-products-query";

type UseProductsPageOptions = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the dashboard pattern.
   */
  initialProducts?: ProductFull[];
};

/**
 * Products list page data boundary: Query list + status flags for the panel.
 * Keeps TanStack Query wiring out of components/pages.
 */
export function useProductsPage(options: UseProductsPageOptions = {}) {
  const { initialProducts } = options;
  const hasSeed = initialProducts !== undefined;

  const { data, isPending, isLoading, isError, isFetching, refetch } = useProductsQuery({
    initialData: hasSeed ? initialProducts : undefined,
  });

  return {
    products: data ?? initialProducts ?? [],
    /** No cached data yet — show full-page ProductsLoadingState. */
    isPending: hasSeed ? false : isPending,
    isLoading,
    isError,
    isFetching,
    retry: () => {
      void refetch();
    },
  };
}
