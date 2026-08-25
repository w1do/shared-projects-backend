"use client";

import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import { useVariantsQuery } from "./use-variants-query";

type UseVariantsPageOptions = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the products/dashboard pattern.
   */
  initialConfigs?: ProductVariantConfig[];
};

/**
 * Variants list page data boundary: Query list + status flags for the shell.
 * Keeps TanStack Query wiring out of components/pages for the loading gate.
 */
export function useVariantsPage(options: UseVariantsPageOptions = {}) {
  const { initialConfigs } = options;
  const hasSeed = initialConfigs !== undefined;

  const { data, isPending, isLoading, isError, isFetching, refetch } = useVariantsQuery({
    initialData: hasSeed ? initialConfigs : undefined,
  });

  return {
    configs: data ?? initialConfigs ?? [],
    /** No cached data yet — show full-page VariantsLoadingState. */
    isPending: hasSeed ? false : isPending,
    isLoading,
    isError,
    isFetching,
    retry: () => {
      void refetch();
    },
  };
}
