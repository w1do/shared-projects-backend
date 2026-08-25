"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Brand } from "@/lib/admin/mocks/types";
import { useBrandsQuery } from "./use-brands-query";
import { useDeleteBrandMutation } from "./use-brand-mutations";

type UseBrandsPageOptions = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the products/dashboard pattern.
   */
  initialBrands?: Brand[];
};

/**
 * Brands list page data + delete confirmation flow.
 * Components only render the dialog and call request/confirm handlers.
 */
export function useBrandsPage(options: UseBrandsPageOptions = {}) {
  const { initialBrands } = options;
  const hasSeed = initialBrands !== undefined;

  const { data, isPending, isLoading, isError, isFetching, refetch } = useBrandsQuery({
    initialData: hasSeed ? initialBrands : undefined,
  });
  const brands = useMemo(() => data ?? initialBrands ?? [], [data, initialBrands]);
  const deleteMutation = useDeleteBrandMutation();
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const requestDelete = useCallback(
    (id: string) => {
      const brand = brands.find((item) => item.id === id) ?? null;
      setDeleteTarget(brand);
    },
    [brands],
  );

  const cancelDelete = useCallback(() => {
    if (deleteMutation.isPending) return;
    setDeleteTarget(null);
  }, [deleteMutation.isPending]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`Brand "${deleteTarget.name}" removed from portfolio.`);
        setDeleteTarget(null);
      },
      onError: () => toast.error("Could not delete brand."),
    });
  }, [deleteMutation, deleteTarget]);

  return {
    brands,
    /** No cached data yet — show full-page BrandsLoadingState. */
    isPending: hasSeed ? false : isPending,
    isLoading,
    isError,
    isFetching,
    retry: () => {
      void refetch();
    },
    deleteTarget,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
  };
}
