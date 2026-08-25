"use client";

import { useMemo } from "react";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { DataTableFooter } from "@/components/shared/data-table/DataTableFooter";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";
import { getOrderColumns } from "../order-columns";

interface OrdersTableProps {
  orders: DetailedOrder[];
  onOrderClick: (order: DetailedOrder) => void;
  onUpdateStatus: (orderId: string, newStatus: DetailedOrder["status"]) => void;
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
}

export function OrdersTable({
  orders,
  onOrderClick,
  onUpdateStatus,
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
}: OrdersTableProps) {
  const columns = useMemo(
    () => getOrderColumns({ onOrderClick, onUpdateStatus }),
    [onOrderClick, onUpdateStatus],
  );

  return (
    <div className="flex flex-col gap-6">
      <DataGrid
        rows={orders}
        columns={columns}
        sortConfig={sortConfig}
        onSort={onSort}
        onRowClick={(row) => onOrderClick(row)}
        emptyState={
          <div className="text-center text-xs text-muted-foreground-lighter py-6">
            No orders found matching your search.
          </div>
        }
      />

      <DataTableFooter
        currentPage={currentPage}
        endItem={endItem}
        itemLabel="orders"
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
