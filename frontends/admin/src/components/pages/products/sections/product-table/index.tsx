"use client";

import * as React from "react";
import type { ProductFull } from "@/lib/admin/mock";
import { type SortConfig, type SortField } from "@/lib/admin/products-helpers";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { getProductColumns } from "./components/ProductColumns";

type ProductsTableProps = {
  products: ProductFull[];
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  onPreview?: (product: ProductFull) => void;
  onEdit?: (product: ProductFull) => void;
  onArchive?: (product: ProductFull) => void;
  onDelete?: (product: ProductFull) => void;
  userRole?: string;
};

export function ProductsTable({
  products,
  selectedIds,
  allSelected,
  onToggle,
  onToggleAll,
  sortConfig,
  onSort,
  onPreview,
  onEdit,
  onArchive,
  onDelete,
  userRole,
}: ProductsTableProps) {
  const columns = React.useMemo(
    () => getProductColumns({ onPreview, onEdit, onArchive, onDelete, userRole }),
    [onPreview, onEdit, onArchive, onDelete, userRole],
  );

  const handleSelectionChange = React.useCallback(
    (nextSelected: Set<string>) => {
      const ids = products.map((p) => p.id);
      const curAll = ids.length > 0 && ids.every((id) => selectedIds.has(id));
      const nextAll = ids.length > 0 && ids.every((id) => nextSelected.has(id));
      const nextNone = ids.every((id) => !nextSelected.has(id));

      if ((nextAll && !curAll) || (nextNone && curAll)) {
        onToggleAll();
      } else {
        const diff = ids.find((id) => selectedIds.has(id) !== nextSelected.has(id));
        if (diff) onToggle(diff);
      }
    },
    [products, selectedIds, onToggle, onToggleAll],
  );

  return (
    <DataGrid
      rows={products}
      columns={columns}
      checkboxSelection
      selectedRowIds={selectedIds}
      onSelectionChange={handleSelectionChange}
      sortConfig={sortConfig}
      onSort={(field) => onSort(field as SortField)}
    />
  );
}
