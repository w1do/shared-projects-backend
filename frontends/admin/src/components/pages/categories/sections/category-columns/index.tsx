"use client";

import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";
import type { Category } from "@/lib/admin/types/catalog";
import { countChildren } from "@/lib/admin/data-source/category-tree";
import { CategoryRowActions } from "../category-row-actions";
import { getCategoryIcon } from "@/components/pages/categories/config/icons";
import { CategoryStatusBadge } from "../category-status-badge";
import { t } from "@/lib/admin/console-texts";

export interface CategoryColumnsOptions {
  onEditClick: (category: Category) => void;
  onDeleteClick: (id: string) => void;
  onMoveClick?: (category: Category) => void;
  /** Без собственного отступа по уровню — его рисует TreeTable. */
  flat?: boolean;
  /** Полный список — для счётчика вложенных категорий строки. */
  categories?: Category[];
}

export const getCategoryColumns = ({
  onEditClick,
  onDeleteClick,
  onMoveClick,
  flat = false,
  categories = [],
}: CategoryColumnsOptions): ColumnDef<Category>[] => {
  const childCounts = countChildren(
    categories.map((category) => ({ id: category.id, parentId: category.parentId ?? null })),
  );

  return [
  {
    field: "name",
    headerName: t("console.categories.column.name"),
    width: "288px",
    sortable: true,
    renderCell: ({ row }) => {
      const Icon = getCategoryIcon(row.iconName);
      // Отступ по уровню вложенности: дерево приходит плоским списком в
      // префиксном порядке, глубина — только оформление строки.
      const depth = flat ? 0 : (row.depth ?? 0);
      return (
        <div
          className="flex items-center gap-4"
          style={depth > 0 ? { paddingInlineStart: `${depth * 20}px` } : undefined}
          data-category-depth={row.depth ?? 0}
        >
          {depth > 0 && (
            <span aria-hidden className="-me-2 text-muted-foreground-lighter">
              &#9492;
            </span>
          )}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/20 text-primary">
            <Icon className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-body-lg font-semibold text-foreground">{row.name}</span>
          </div>
        </div>
      );
    },
  },
  {
    field: "slug",
    headerName: t("console.categories.column.slug"),
    width: "176px",
    renderCell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">/{row.slug}</span>
    ),
  },
  {
    field: "status",
    headerName: t("console.categories.column.status"),
    width: "112px",
    renderCell: ({ row }) => <CategoryStatusBadge status={row.status} />,
  },
  {
    // Торговых метрик (выручка, рост) у платформы нет — вместо них показатель
    // из реальных данных дерева: число вложенных категорий.
    field: "children",
    headerName: t("console.categories.column.children"),
    width: "144px",
    cellClassName: "text-body-lg font-medium text-foreground",
    renderCell: ({ row }) => `${childCounts.get(row.id) ?? 0}`,
  },
  {
    field: "actions",
    headerName: t("console.common.actions"),
    width: "80px",
    align: "right",
    headerClassName: "pr-16 md:pr-6",
    cellClassName: "pr-16 md:pr-6 text-right",
    renderCell: ({ row }) => (
      <CategoryRowActions
        category={row}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onMoveClick={onMoveClick}
      />
    ),
  },
  ];
};
