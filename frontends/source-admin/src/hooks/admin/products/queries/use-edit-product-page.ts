"use client";

import type { ProductFull } from "@/lib/admin/mocks/types";
import { useProductQuery } from "./use-product-query";

type UseEditProductPageOptions = {
  productId: string;
  /** SSR seed when available. Null for localStorage-only products. */
  initialProduct?: ProductFull | null;
};

/**
 * Edit product page data boundary.
 * Prefer SSR/local seed while Query revalidates; only show empty when truly missing.
 */
export function useEditProductPage(options: UseEditProductPageOptions) {
  const { productId, initialProduct = null } = options;

  const {
    data: product,
    isPending,
    isError,
    isFetched,
  } = useProductQuery(productId, {
    initialData: initialProduct ?? undefined,
  });

  const resolved = product ?? initialProduct ?? null;
  const isResolving = !resolved && isPending && !isFetched;
  const notFound = !resolved && isFetched && (isError || product == null);

  return {
    product: resolved,
    isResolving,
    notFound,
  };
}
