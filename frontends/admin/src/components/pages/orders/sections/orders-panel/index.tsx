"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/data-display/tabs";
import { Badge } from "@/components/ui/data-display/badge";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";
import { OrdersTable } from "@/components/pages/orders/sections/orders-table";
import { useDataTable } from "@/hooks/use-data-table";
import {
  STATUS_TABS,
  PAYMENT_OPTIONS,
  VALUE_OPTIONS,
} from "@/components/pages/orders/config/filters";
import type {
  PaymentFilter,
  ValueFilter,
  SortField,
} from "@/components/pages/orders/config/filters";
import { ordersFilterFn, ordersSortFn } from "@/components/pages/orders/utils";
import { Select } from "@/components/ui/inputs/select";

interface OrdersPanelProps {
  orders: DetailedOrder[];
  onOrderClick: (order: DetailedOrder) => void;
  onUpdateStatus: (orderId: string, newStatus: DetailedOrder["status"]) => void;
}

export function OrdersPanel({ orders, onOrderClick, onUpdateStatus }: OrdersPanelProps) {
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [valueFilter, setValueFilter] = useState<ValueFilter>("all");

  const preFiltered = useMemo(() => {
    return orders.filter((o) => {
      const matchesPayment = paymentFilter === "all" || o.paymentMethod === paymentFilter;

      const matchesValue =
        valueFilter === "all" ||
        (valueFilter === "under-100" && o.total < 100) ||
        (valueFilter === "100-300" && o.total >= 100 && o.total <= 300) ||
        (valueFilter === "over-300" && o.total > 300);

      return matchesPayment && matchesValue;
    });
  }, [orders, paymentFilter, valueFilter]);

  const {
    query,
    setQuery,
    status: statusFilter,
    setStatus: setStatusFilter,
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedOrders,
    visibleData: visible,
    startItem,
    endItem,
    itemsPerPage,
    setItemsPerPage,
  } = useDataTable<DetailedOrder, DetailedOrder["status"] | "all", SortField>({
    data: preFiltered,
    itemsPerPage: 8,
    initialSort: { field: "placedAt", order: "desc" },
    initialStatus: "all",
    filterFn: ordersFilterFn,
    sortFn: ordersSortFn,
  });

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        value={statusFilter}
        onValueChange={(val) => setStatusFilter(val as DetailedOrder["status"] | "all")}
        variant="underline"
        color="primary"
        size="sm"
        shape="rectangle"
      >
        <TabsList>
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "all"
                ? preFiltered.length
                : preFiltered.filter((o) => o.status === tab).length;
            return (
              <TabsTrigger key={tab} value={tab} className="gap-2">
                {tab === "all" ? "All Orders" : tab}
                <Badge
                  variant="soft"
                  color={statusFilter === tab ? "primary" : "neutral"}
                  shape="circle"
                >
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search orders, customers, or items..."
          startIcon={<Search />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm w-full"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
            options={PAYMENT_OPTIONS}
            placeholder="All Payments"
            className="w-40"
          />
          <Select
            value={valueFilter}
            onChange={(e) => setValueFilter(e.target.value as ValueFilter)}
            options={VALUE_OPTIONS}
            placeholder="Any Amount"
            className="w-40"
          />
        </div>
      </div>

      <OrdersTable
        orders={paginatedOrders}
        onOrderClick={onOrderClick}
        onUpdateStatus={onUpdateStatus}
        sortConfig={sortConfig}
        onSort={(field) => handleSort(field as SortField)}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        startItem={startItem}
        endItem={endItem}
        totalItems={visible.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}
