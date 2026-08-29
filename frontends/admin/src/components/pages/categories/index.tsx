"use client";

import { CategoriesHeader } from "./sections/categories-header";
import { CategoriesPanel } from "./sections/categories-panel";
import { CategoryDeleteDialog } from "./sections/category-delete-dialog";
import { CategoryMoveDialog } from "./sections/category-move-dialog";
import { categoryPath, descendantIds } from "@/lib/admin/data-source/category-tree";
import type { Category } from "@/lib/admin/types/catalog";
import { useCategoriesPage } from "@/hooks/admin/categories";

interface CategoriesPageProps {
  /** Optional seed for tests; omit in production so skeleton can show. */
  categories?: Category[];
}

/**
 * Categories list UI shell. Catalog data/CRUD lives in `@/hooks/admin/categories`.
 * Full-page skeleton mirrors layout while the list query is pending.
 */
export default function CategoriesPage({
  categories: initialCategories,
}: CategoriesPageProps = {}) {
  const {
    categories,
    isPending,
    openEdit,
    requestDelete,
    requestMove,
    moveNode,
    movingIds,
    moveTarget,
    cancelMove,
    confirmMove,
    isMoving,
    requestBulkDelete,
    requestPurge,
    deleteIntent,
    cancelDelete,
    confirmDelete,
    isDeleting,
  } = useCategoriesPage(initialCategories !== undefined ? { initialCategories } : {});

  const deleteCount =
    deleteIntent?.type === "bulk"
      ? deleteIntent.ids.length
      : deleteIntent?.type === "purge"
        ? deleteIntent.count
        : deleteIntent
          ? 1
          : 0;
  const deleteName = deleteIntent?.type === "single" ? deleteIntent.category.name : undefined;
  // Платформа удаляет всё поддерево — оператор должен видеть это до подтверждения.
  const deleteDescendants =
    deleteIntent?.type === "single" ? descendantIds(categories, deleteIntent.category.id).size : 0;

  // Полный путь различает одноимённые категории из разных веток.
  const deletePaths =
    deleteIntent?.type === "single"
      ? [categoryPath(categories, deleteIntent.category.id)]
      : deleteIntent?.type === "bulk"
        ? deleteIntent.ids.map((id) => categoryPath(categories, id))
        : [];

  return (
    <div className="flex flex-col gap-8">
      <CategoriesHeader categories={categories} />
      {/* Карточки аналитики (CategoriesStats) скрыты: платформа не имеет торговых метрик. */}
      <CategoriesPanel
        categories={categories}
        isLoading={isPending}
        onEditClick={openEdit}
        onDeleteClick={requestDelete}
        onMoveClick={requestMove}
        onMoveNode={moveNode}
        movingIds={movingIds}
        onBulkDeleteClick={requestBulkDelete}
        onPurgeClick={requestPurge}
      />

      <CategoryMoveDialog
        open={moveTarget !== null}
        category={moveTarget}
        categories={categories}
        isBusy={isMoving}
        onClose={cancelMove}
        onConfirm={confirmMove}
      />

      <CategoryDeleteDialog
        open={!!deleteIntent}
        categoryName={deleteName}
        count={deleteCount}
        descendantCount={deleteDescendants}
        paths={deletePaths}
        variant={deleteIntent?.type === "purge" ? "purge" : "delete"}
        isBusy={isDeleting}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
