"use client";

import { useCallback, useMemo } from "react";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { listStateMessage } from "@/lib/admin/data-source/list-state";
import { DataTableFooter } from "@/components/shared/data-table/DataTableFooter";
import type { DetailedCustomer } from "@/lib/admin/types/customers";
import type { PaginationState } from "@/hooks/admin/pagination";
import { getCustomerColumns } from "../customer-columns";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface CustomersTableProps {
  customers: DetailedCustomer[];
  /** Данные ещё идут: пустое состояние показывать рано. */
  isLoading?: boolean;
  onCustomerClick: (customer: DetailedCustomer) => void;
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  sortConfig: { field: string; order: "asc" | "desc" } | null;
  onSort: (field: string) => void;
  pagination: PaginationState<DetailedCustomer>;
  onToggleBlocked: (customer: DetailedCustomer) => void;
  onDeleteCustomer: (customer: DetailedCustomer) => void;
}

export function CustomersTable({
  customers,
  isLoading = false,
  onCustomerClick,
  onToggleBlocked,
  onDeleteCustomer,
  selectedIds,
  allSelected: _allSelected,
  onToggle,
  onToggleAll,
  sortConfig,
  onSort,
  pagination,
}: CustomersTableProps) {
  const t = useConsoleText();
  // Колонка лояльности показывается, только когда данные её несут: живой
  // режим уровней не имеет, демо-шаблон — имеет.
  const showTier = customers.some((customer) => customer.tier !== undefined);
  const columns = useMemo(
    () =>
      getCustomerColumns({
        onCustomerClick,
        onToggleBlocked,
        onDeleteCustomer,
        showTier,
      }),
    [onCustomerClick, onToggleBlocked, onDeleteCustomer, showTier],
  );

  const handleSelectionChange = useCallback(
    (nextSelected: Set<string>) => {
      const ids = customers.map((customer) => customer.id);
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
    [customers, selectedIds, onToggle, onToggleAll],
  );

  return (
    <div className="flex flex-col gap-6">
      <DataGrid
        rows={customers}
        columns={columns}
        checkboxSelection
        selectedRowIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        sortConfig={sortConfig}
        onSort={onSort}
        onRowClick={(row) => onCustomerClick(row)}
        emptyState={
          <div className="py-6 text-center text-xs text-muted-foreground-lighter">
            {listStateMessage(
              isLoading,
              t("console.common.loading"),
              t("console.customers.empty-filtered"),
            )}
          </div>
        }
      />

      <DataTableFooter
        pagination={pagination}
        itemLabel={t("console.customers.footer-unit")}
      />
    </div>
  );
}
