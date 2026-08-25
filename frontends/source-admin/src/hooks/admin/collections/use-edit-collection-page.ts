"use client";

import type { Collection, ProductFull } from "@/lib/admin/mocks/types";
import { useProductsQuery } from "@/hooks/admin/products";
import { useCollectionQuery } from "./use-collection-query";

type Options = {
  collectionId: string;
  initialCollection?: Collection | null;
  initialProducts?: ProductFull[];
};

/**
 * Edit collection page data boundary.
 * Prefer SSR/local seed while Query revalidates; only show empty when truly missing.
 */
export function useEditCollectionPage(options: Options) {
  const { collectionId, initialCollection = null, initialProducts = [] } = options;

  const {
    data: collection,
    isPending,
    isError,
    isFetched,
  } = useCollectionQuery(collectionId, {
    initialData: initialCollection ?? undefined,
  });

  const { data: products = initialProducts } = useProductsQuery({
    initialData: initialProducts,
  });

  const resolved = collection ?? initialCollection ?? null;
  const isResolving = !resolved && isPending && !isFetched;
  const notFound = !resolved && isFetched && (isError || collection == null);

  return {
    collection: resolved,
    products,
    isResolving,
    notFound,
  };
}
