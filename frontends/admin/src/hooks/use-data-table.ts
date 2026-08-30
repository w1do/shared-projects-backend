import * as React from "react";

import { usePagination } from "@/hooks/admin/pagination";

export interface UseDataTableProps<T, S = string, F extends keyof T = keyof T> {
  data: T[];
  pageSize?: number;
  initialSort: { field: F; order: "asc" | "desc" };
  initialStatus?: S;
  filterFn: (item: T, query: string, status: S) => boolean;
  sortFn: (items: T[], config: { field: F; order: "asc" | "desc" }) => T[];
}

export function useDataTable<T extends { id: string }, S = string, F extends keyof T = keyof T>({
  data,
  pageSize = 8,
  initialSort,
  initialStatus = "All" as unknown as S,
  filterFn,
  sortFn,
}: UseDataTableProps<T, S, F>) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<S>(initialStatus);
  const [sortConfig, setSortConfig] = React.useState<{ field: F; order: "asc" | "desc" }>(
    initialSort,
  );
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const visible = React.useMemo(() => {
    const filtered = data.filter((item) => filterFn(item, query, status));
    return sortFn(filtered, sortConfig);
  }, [data, status, query, sortConfig, filterFn, sortFn]);

  const pagination = usePagination(visible, pageSize);

  const handleSort = (field: F) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        return {
          field,
          order: prev.order === "asc" ? "desc" : "asc",
        };
      }
      // Default logic: desc for price/createdAt/revenue, asc for other fields
      const defaultOrder: "asc" | "desc" =
        (field as string) === "price" ||
        (field as string) === "createdAt" ||
        (field as string) === "revenue"
          ? "desc"
          : "asc";
      return { field, order: defaultOrder };
    });
  };

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleIds = pagination.items.map((item) => item.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      if (allSelected) {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      }
      return new Set([...prev, ...visibleIds]);
    });
  };

  const resetFilters = () => {
    setQuery("");
    setStatus(initialStatus);
  };

  const clearSelection = () => setSelectedIds(new Set());

  return {
    query,
    setQuery,
    status,
    onStatusChange: setStatus, // Rename for synchronization (or keep setStatus)
    setStatus,
    sortConfig,
    handleSort,
    selectedIds,
    toggle,
    toggleAll,
    allSelected,
    clearSelection,
    pagination,
    visibleData: visible,
    resetFilters,
  };
}
