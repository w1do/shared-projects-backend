"use client";

import { useMemo } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { TreeTable } from "@/components/ui/data-display/tree-table";
import { DataTableFooter } from "@/components/shared/data-table/DataTableFooter";
import { countChildren, descendantIds } from "@/lib/admin/data-source/category-tree";
import { listStateMessage } from "@/lib/admin/data-source/list-state";
import type { Category } from "@/lib/admin/mocks/types";
import { CategoryCard } from "../category-card";
import { CategoriesToolbar } from "../categories-toolbar";
import { getCategoryColumns } from "../category-columns";
import { useCategoriesPanel } from "@/components/pages/categories/hooks/useCategoriesPanel";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface CategoriesPanelProps {
  categories: Category[];
  /** Данные ещё идут: пустое состояние показывать рано. */
  isLoading?: boolean;
  onEditClick: (category: Category) => void;
  onDeleteClick: (id: string) => void;
  onMoveClick?: (category: Category) => void;
  onBulkDeleteClick?: (ids: string[]) => void;
  /** Очистка каталога; отсутствует — действие не показывается. */
  onPurgeClick?: () => void;
  /** Перемещение перетаскиванием (режим api); отсутствует — DnD выключен. */
  onMoveNode?: (nodeId: string, parentId: string | null, position: number) => void;
  movingIds?: Set<string>;
}

export function CategoriesPanel({
  categories,
  isLoading = false,
  onEditClick,
  onDeleteClick,
  onMoveClick,
  onBulkDeleteClick,
  onPurgeClick,
  onMoveNode,
  movingIds,
}: CategoriesPanelProps) {
  const t = useConsoleText();
  const panel = useCategoriesPanel({ categories, onDeleteClick });

  // Пока данные идут, «нет категорий» было бы неправдой
  const emptyMessage = listStateMessage(
    isLoading,
    t("console.common.loading"),
    t("console.categories.empty-filtered"),
  );

  // Дерево (режим api): данные несут depth. Плоский каталог mock-режима
  // остаётся на прежней таблице с пагинацией.
  const isTree = categories.some((category) => category.depth !== undefined);
  const treeMode = isTree && panel.viewMode === "table" && Boolean(onMoveNode);

  const columns = useMemo(
    () => getCategoryColumns({ onEditClick, onDeleteClick, onMoveClick, flat: treeMode, categories }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onEditClick, onDeleteClick, onMoveClick, categories, treeMode],
  );

  // Счётчик вложенных категорий для карточек — из того же плоского списка.
  const childCounts = useMemo(
    () =>
      countChildren(
        categories.map((category) => ({ id: category.id, parentId: category.parentId ?? null })),
      ),
    [categories],
  );

  const treeRows = useMemo(
    () =>
      panel.displayedCategories.map((category) => ({
        ...category,
        depth: category.depth ?? 0,
        parentId: category.parentId ?? null,
      })),
    [panel.displayedCategories],
  );

  const isFiltering = panel.searchTerm !== "" || panel.filterStatus !== "all";

  const isInvalidTarget = useMemo(() => {
    return (draggedId: string, targetId: string) => {
      const invalid = descendantIds(
        categories.map((category) => ({ id: category.id, parentId: category.parentId ?? null })),
        draggedId,
      );
      invalid.add(draggedId);
      return invalid.has(targetId);
    };
  }, [categories]);

  const selectedCount = panel.selectedRowIds.size;

  return (
    <div className="flex flex-col gap-6">
      <CategoriesToolbar
        searchTerm={panel.searchTerm}
        setSearchTerm={panel.setSearchTerm}
        filterStatus={panel.filterStatus}
        setFilterStatus={panel.setFilterStatus}
        viewMode={panel.viewMode}
        setViewMode={panel.setViewMode}
        onPurgeClick={onPurgeClick}
        purgeDisabled={categories.length === 0}
      />

      {selectedCount > 0 && (
        <div className="flex flex-col gap-4 rounded-3xl bg-primary p-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <IconButton
              variant="ghost"
              shape="circle"
              onClick={panel.clearSelection}
              color="surface"
            >
              <X />
            </IconButton>
            <span className="font-medium">{`${t("console.categories.bulk-selected")} ${selectedCount}`}</span>
          </div>
          <Button
            variant="ghost"
            shape="circle"
            color="error"
            startIcon={<Trash2 />}
            onClick={() => {
              const ids = Array.from(panel.selectedRowIds);
              if (onBulkDeleteClick) {
                onBulkDeleteClick(ids);
                return;
              }
              panel.handleBulkDelete();
            }}
          >
            {t("console.common.delete")}
          </Button>
        </div>
      )}

      {treeMode ? (
        <TreeTable
          rows={treeRows}
          columns={columns}
          onMove={onMoveNode}
          isInvalidTarget={isInvalidTarget}
          busyIds={movingIds}
          // Отфильтрованный список не отражает соседства — DnD в нём обманчив.
          dragDisabled={isFiltering}
          checkbox
          selectedRowIds={panel.selectedRowIds}
          onSelectionChange={panel.setSelectedRowIds}
          emptyMessage={emptyMessage}
        />
      ) : panel.viewMode === "table" ? (
        <DataGrid
          rows={panel.paginatedCategories}
          columns={columns}
          sortConfig={panel.sortConfig}
          onSort={panel.handleSort}
          checkbox={true}
          selectedRowIds={panel.selectedRowIds}
          onSelectionChange={panel.setSelectedRowIds}
          emptyState={
            <div className="py-6 text-center text-xs text-muted-foreground-lighter">
              {emptyMessage}
            </div>
          }
        />
      ) : panel.paginatedCategories.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {panel.paginatedCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              childrenCount={childCounts.get(category.id) ?? 0}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-full rounded-3xl border border-dashed border-border/60 bg-card p-6 py-12 text-center text-xs text-muted-foreground-lighter">
          {emptyMessage}
        </div>
      )}

      {/* Дерево показывается целиком: пагинация разрезала бы родителя и потомков. */}
      {!treeMode && (
        <DataTableFooter
          currentPage={panel.currentPage}
          endItem={panel.endItem}
          itemLabel={t("console.categories.footer-unit")}
          itemsPerPage={panel.itemsPerPage}
          onItemsPerPageChange={panel.setItemsPerPage}
          onPageChange={panel.setCurrentPage}
          startItem={panel.startItem}
          totalItems={panel.totalItems}
          totalPages={panel.totalPages}
        />
      )}
    </div>
  );
}
