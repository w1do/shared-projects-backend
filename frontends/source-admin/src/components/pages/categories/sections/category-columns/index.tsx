"use client";

import { formatCurrency } from "@/lib/utils";
import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";
import type { Category } from "@/lib/admin/mocks/types";
import { CategoryRowActions } from "../category-row-actions";
import { getCategoryIcon } from "@/components/pages/categories/config/icons";
import { CategoryStatusBadge } from "../category-status-badge";

export interface CategoryColumnsOptions {
  onEditClick: (category: Category) => void;
  onDeleteClick: (id: string) => void;
  onMoveClick?: (category: Category) => void;
  /** Без собственного отступа по уровню — его рисует TreeTable. */
  flat?: boolean;
}

export const getCategoryColumns = ({
  onEditClick,
  onDeleteClick,
  onMoveClick,
  flat = false,
}: CategoryColumnsOptions): ColumnDef<Category>[] => [
  {
    field: "name",
    headerName: "Category Name",
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
    headerName: "URL Slug",
    width: "176px",
    renderCell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">/{row.slug}</span>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: "112px",
    renderCell: ({ row }) => <CategoryStatusBadge status={row.status} />,
  },
  {
    field: "productCount",
    headerName: "Product Count",
    width: "144px",
    sortable: true,
    cellClassName: "text-body-lg font-medium text-foreground",
    renderCell: ({ row }) =>
      `${row.productCount} ${row.productCount === 1 ? "product" : "products"}`,
  },
  {
    field: "revenue",
    headerName: "Revenue",
    width: "144px",
    sortable: true,
    cellClassName: "text-body-lg text-foreground",
    renderCell: ({ value }) => formatCurrency(value as number),
  },
  {
    field: "growthYoY",
    headerName: "Growth YoY",
    width: "128px",
    sortable: true,
    renderCell: ({ row }) =>
      row.status === "Active" ? (
        <span className="text-xs font-semibold text-success">+{row.growthYoY}% YoY</span>
      ) : (
        <span className="text-xs text-muted-foreground-lighter">&mdash;</span>
      ),
  },
  {
    field: "actions",
    headerName: "Actions",
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
