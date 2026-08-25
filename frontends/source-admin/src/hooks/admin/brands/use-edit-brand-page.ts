"use client";

import { useMemo } from "react";
import type { Brand } from "@/lib/admin/mocks/types";
import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import { getBrandFormDetails } from "@/lib/admin/services";
import { useBrandQuery } from "./use-brand-query";

type Options = {
  brandId: string;
  initialBrand?: Brand | null;
};

/**
 * Edit brand page data boundary.
 * Prefer SSR/local seed while Query revalidates; only show empty when truly missing.
 */
export function useEditBrandPage(options: Options) {
  const { brandId, initialBrand = null } = options;
  const {
    data: brand,
    isPending,
    isError,
    isFetched,
  } = useBrandQuery(brandId, {
    initialData: initialBrand ?? undefined,
  });

  const resolved = brand ?? initialBrand ?? null;
  const isResolving = !resolved && isPending && !isFetched;
  const notFound = !resolved && isFetched && (isError || brand == null);

  const resolvedId = resolved?.id ?? "";
  // Stable identity: only recompute when the resolved brand id changes.
  const brandDetails = useMemo<Partial<BrandFormValues>>(() => {
    if (!resolvedId) return {};
    return getBrandFormDetails(resolvedId);
  }, [resolvedId]);

  return {
    brand: resolved,
    brandDetails,
    isResolving,
    notFound,
  };
}
