"use client";

import { useCallback, useMemo } from "react";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { DataTableFooter } from "@/components/shared/data-table/DataTableFooter";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { getCustomerColumns } from "../customer-columns";

interface CustomersTableProps {
  customers: DetailedCustomer[];
  onCustomerClick: (customer: DetailedCustomer) => void;
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  sortConfig: { field: string; order: "asc" | "desc" } | null;
  onSort: (field: string) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
  onToggleBlocked: (customer: DetailedCustomer) => void;
  onDeleteCustomer: (customer: DetailedCustomer) => void;
}

export function CustomersTable({
  customers,
  onCustomerClick,
  onToggleBlocked,
  onDeleteCustomer,
  selectedIds,
  allSelected: _allSelected,
  onToggle,
  onToggleAll,
  sortConfig,
  onSort,
  currentPage,
  totalPages,
  itemsPerPage,
  startItem,
  endItem,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: CustomersTableProps) {
  const columns = useMemo(
    () => getCustomerColumns({ onCustomerClick, onToggleBlocked, onDeleteCustomer }),
    [onCustomerClick, onToggleBlocked, onDeleteCustomer],
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
            No customers found matching your search.
          </div>
        }
      />

      <DataTableFooter
        currentPage={currentPage}
        endItem={endItem}
        itemLabel="customers"
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        onPageChange={onPageChange}
        startItem={startItem}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  );
}
