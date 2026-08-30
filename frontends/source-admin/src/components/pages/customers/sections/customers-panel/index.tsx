"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import type { CustomerTier, DetailedCustomer } from "@/lib/admin/types/customers";
import { CustomersTable } from "@/components/pages/customers/sections/customers-table";
import { CustomersBulkActions } from "@/components/pages/customers/sections/customers-bulk-actions";
import { useDataTable } from "@/hooks/use-data-table";
import { useConsoleText } from "@/lib/admin/use-console-text";
import {
  TIER_OPTIONS,
  SKIN_TYPES,
  SKIN_CONCERNS,
} from "@/components/pages/customers/config/filters";

interface CustomersPanelProps {
  customers: DetailedCustomer[];
  /** Данные ещё идут: пустое состояние показывать рано. */
  isLoading?: boolean;
  onCustomerClick: (customer: DetailedCustomer) => void;
  onToggleBlocked: (customer: DetailedCustomer) => void;
  onDeleteCustomer: (customer: DetailedCustomer) => void;
}

type TierFilter = CustomerTier | "all";
type SkinTypeFilter = "all" | DetailedCustomer["skinProfile"]["skinType"];
type SkinConcernFilter = "all" | string;
type SortField = "joinedAt" | "totalSpent" | "totalOrders";

export function CustomersPanel({
  customers,
  isLoading = false,
  onCustomerClick,
  onToggleBlocked,
  onDeleteCustomer,
}: CustomersPanelProps) {
  const t = useConsoleText();
  const [skinTypeFilter, setSkinTypeFilter] = useState<SkinTypeFilter>("all");
  const [skinConcernFilter, setSkinConcernFilter] = useState<SkinConcernFilter>("all");

  const preFiltered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSkinType = skinTypeFilter === "all" || c.skinProfile.skinType === skinTypeFilter;
      const matchesConcern =
        skinConcernFilter === "all" || c.skinProfile.skinConcerns.includes(skinConcernFilter);
      return matchesSkinType && matchesConcern;
    });
  }, [customers, skinTypeFilter, skinConcernFilter]);

  const {
    query,
    setQuery,
    status: tierFilter,
    setStatus: setTierFilter,
    sortConfig,
    handleSort,
    selectedIds,
    toggle,
    toggleAll,
    allSelected,
    clearSelection,
    pagination,
  } = useDataTable<DetailedCustomer, TierFilter, SortField>({
    data: preFiltered,
    pageSize: 8,
    initialSort: { field: "joinedAt", order: "desc" },
    initialStatus: "all",
    filterFn: (c, q, s) => {
      const matchesSearch =
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.email.toLowerCase().includes(q.toLowerCase()) ||
        c.id.toLowerCase().includes(q.toLowerCase()) ||
        c.skinProfile.skinConcerns.some((concern) =>
          concern.toLowerCase().includes(q.toLowerCase()),
        );
      const matchesTier = s === "all" || c.tier === s;
      return matchesSearch && matchesTier;
    },
    sortFn: (items, config) => {
      return [...items].sort((a, b) => {
        const orderMultiplier = config.order === "asc" ? 1 : -1;
        const field = config.field;
        if (field === "joinedAt") {
          return (
            (new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()) * orderMultiplier
          );
        }
        if (field === "totalSpent") {
          return (a.totalSpent - b.totalSpent) * orderMultiplier;
        }
        if (field === "totalOrders") {
          return (a.totalOrders - b.totalOrders) * orderMultiplier;
        }
        return 0;
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-sm">
          <Input
            placeholder={t("console.customers.search-placeholder")}
            startIcon={<Search />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Фильтр лояльности — только когда данные несут уровни (демо-шаблон). */}
          {customers.some((customer) => customer.tier !== undefined) && (
            <Select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as TierFilter)}
              options={TIER_OPTIONS}
              placeholder={t("console.customers.filter.all-tiers")}
              className="w-40"
            />
          )}
          <Select
            value={skinTypeFilter}
            onChange={(e) => setSkinTypeFilter(e.target.value as SkinTypeFilter)}
            options={SKIN_TYPES}
            placeholder={t("console.customers.filter.skin-type")}
            className="w-40"
          />
          <Select
            value={skinConcernFilter}
            onChange={(e) => setSkinConcernFilter(e.target.value as SkinConcernFilter)}
            options={SKIN_CONCERNS}
            placeholder={t("console.customers.filter.skin-concern")}
            className="w-40"
          />
        </div>
      </div>

      <CustomersBulkActions
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
      />

      <CustomersTable
        customers={pagination.items}
        isLoading={isLoading}
        onCustomerClick={onCustomerClick}
        onToggleBlocked={onToggleBlocked}
        onDeleteCustomer={onDeleteCustomer}
        selectedIds={selectedIds}
        allSelected={allSelected}
        onToggle={toggle}
        onToggleAll={toggleAll}
        sortConfig={sortConfig}
        onSort={(field) => handleSort(field as SortField)}
        pagination={pagination}
      />
    </div>
  );
}
