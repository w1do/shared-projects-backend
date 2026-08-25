"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Category } from "@/lib/admin/mocks/types";
import { useCategoriesQuery } from "./use-categories-query";
import { useDeleteCategoryMutation } from "./use-category-mutations";

type UseCategoriesPageOptions = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the products/dashboard pattern.
   */
  initialCategories?: Category[];
};

type DeleteIntent =
  | { type: "single"; category: Category }
  | { type: "bulk"; ids: string[]; names: string[] };

/**
 * Categories list page data + delete confirmation (single / bulk).
 * Exposes isPending so the page can render CategoriesLoadingState.
 */
export function useCategoriesPage(options: UseCategoriesPageOptions = {}) {
  const { initialCategories } = options;
  const hasSeed = initialCategories !== undefined;
  const router = useRouter();

  const { data, isPending } = useCategoriesQuery({
    initialData: hasSeed ? initialCategories : undefined,
  });
  const categories = useMemo(() => data ?? initialCategories ?? [], [data, initialCategories]);

  const deleteMutation = useDeleteCategoryMutation();
  const [deleteIntent, setDeleteIntent] = useState<DeleteIntent | null>(null);

  const openEdit = useCallback(
    (category: Category) => {
      router.push(`/admin/categories/${category.id}/edit`);
    },
    [router],
  );

  const requestDelete = useCallback(
    (id: string) => {
      const category = categories.find((item) => item.id === id);
      if (!category) return;
      setDeleteIntent({ type: "single", category });
    },
    [categories],
  );

  const requestBulkDelete = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      const selected = categories.filter((item) => ids.includes(item.id));
      if (selected.length === 0) return;
      setDeleteIntent({
        type: "bulk",
        ids: selected.map((item) => item.id),
        names: selected.map((item) => item.name),
      });
    },
    [categories],
  );

  const cancelDelete = useCallback(() => {
    if (deleteMutation.isPending) return;
    setDeleteIntent(null);
  }, [deleteMutation.isPending]);

  const confirmDelete = useCallback(() => {
    if (!deleteIntent) return;

    if (deleteIntent.type === "single") {
      const { category } = deleteIntent;
      deleteMutation.mutate(category.id, {
        onSuccess: () => {
          toast.success(`Category "${category.name}" deleted.`);
          setDeleteIntent(null);
        },
        onError: () => toast.error("Could not delete category."),
      });
      return;
    }

    const { ids } = deleteIntent;
    let remaining = ids.length;
    let failed = 0;

    ids.forEach((id) => {
      deleteMutation.mutate(id, {
        onSettled: () => {
          remaining -= 1;
          if (remaining > 0) return;
          if (failed > 0) {
            toast.error("Some categories could not be deleted.");
          } else {
            toast.success(`${ids.length} categor${ids.length > 1 ? "ies" : "y"} deleted.`);
          }
          setDeleteIntent(null);
        },
        onError: () => {
          failed += 1;
        },
      });
    });
  }, [deleteIntent, deleteMutation]);

  return {
    categories,
    /** No cached data yet — show full-page CategoriesLoadingState. */
    isPending: hasSeed ? false : isPending,
    openEdit,
    requestDelete,
    requestBulkDelete,
    deleteIntent,
    cancelDelete,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
  };
}
