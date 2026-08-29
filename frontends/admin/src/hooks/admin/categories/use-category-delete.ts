"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Category } from "@/lib/admin/mocks/types";
import { t, tf } from "@/lib/admin/console-texts";
import {
  useBulkDeleteCategoriesMutation,
  useDeleteCategoryMutation,
  usePurgeCategoriesMutation,
} from "./use-category-mutations";

export type DeleteIntent =
  | { type: "single"; category: Category }
  | { type: "bulk"; ids: string[]; names: string[] }
  /** Очистка каталога — отдельное намерение с усиленным подтверждением. */
  | { type: "purge"; count: number };

/**
 * Подтверждение удаления категорий: одиночное, массовое и очистка каталога.
 *
 * Массовое удаление и очистка уходят платформе одним запросом каждая —
 * частично применённого состояния не бывает, и дерево пересчитывается один раз.
 */
export function useCategoryDelete(categories: Category[]) {
  const deleteMutation = useDeleteCategoryMutation();
  const bulkDeleteMutation = useBulkDeleteCategoriesMutation();
  const purgeMutation = usePurgeCategoriesMutation();
  const [deleteIntent, setDeleteIntent] = useState<DeleteIntent | null>(null);

  const isDeleting =
    deleteMutation.isPending || bulkDeleteMutation.isPending || purgeMutation.isPending;

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

  /** Каталог пуст — очищать нечего, действие не предлагается. */
  const requestPurge = useCallback(() => {
    if (categories.length === 0) return;
    setDeleteIntent({ type: "purge", count: categories.length });
  }, [categories]);

  const cancelDelete = useCallback(() => {
    if (isDeleting) return;
    setDeleteIntent(null);
  }, [isDeleting]);

  const confirmDelete = useCallback(() => {
    if (!deleteIntent) return;

    const done = (message: string) => () => {
      toast.success(message);
      setDeleteIntent(null);
    };
    // Текст платформы понятнее общего: там причина отказа (права, валидация).
    const onError = (error: Error) =>
      toast.error(error.message || t("console.categories.delete.failed"));

    if (deleteIntent.type === "single") {
      const { category } = deleteIntent;
      deleteMutation.mutate(category.id, {
        onSuccess: done(tf("console.categories.delete.done", { name: category.name })),
        onError,
      });
      return;
    }

    if (deleteIntent.type === "purge") {
      purgeMutation.mutate(undefined, {
        onSuccess: done(t("console.categories.purge.done")),
        onError,
      });
      return;
    }

    const { ids } = deleteIntent;
    bulkDeleteMutation.mutate(ids, {
      onSuccess: done(tf("console.categories.delete.done-bulk", { count: ids.length })),
      onError,
    });
  }, [deleteIntent, deleteMutation, bulkDeleteMutation, purgeMutation]);

  return {
    deleteIntent,
    requestDelete,
    requestBulkDelete,
    requestPurge,
    cancelDelete,
    confirmDelete,
    isDeleting,
  };
}
