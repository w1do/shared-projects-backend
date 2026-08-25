import * as React from "react";

export interface UseDataTableProps<T, S = string, F extends keyof T = keyof T> {
  data: T[];
  itemsPerPage?: number;
  initialSort: { field: F; order: "asc" | "desc" };
  initialStatus?: S;
  filterFn: (item: T, query: string, status: S) => boolean;
  sortFn: (items: T[], config: { field: F; order: "asc" | "desc" }) => T[];
}

export function useDataTable<T extends { id: string }, S = string, F extends keyof T = keyof T>({
  data,
  itemsPerPage = 8,
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
  const [itemsPerPageState, setItemsPerPageState] = React.useState(itemsPerPage);
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: S) => {
    setStatus(val);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val: number) => {
    setItemsPerPageState(val);
    setCurrentPage(1);
  };

  const visible = React.useMemo(() => {
    const filtered = data.filter((item) => filterFn(item, query, status));
    return sortFn(filtered, sortConfig);
  }, [data, status, query, sortConfig, filterFn, sortFn]);

  // Paginated Data
  const totalPages = Math.ceil(visible.length / itemsPerPageState);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPageState;
    return visible.slice(start, start + itemsPerPageState);
  }, [visible, currentPage, itemsPerPageState]);

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

  const visibleIds = paginatedData.map((item) => item.id);
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
    setCurrentPage(1);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const startItem = visible.length > 0 ? (currentPage - 1) * itemsPerPageState + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPageState, visible.length);

  return {
    query,
    setQuery: handleQueryChange,
    status,
    onStatusChange: handleStatusChange, // Rename for synchronization (or keep setStatus)
    setStatus: handleStatusChange,
    sortConfig,
    handleSort,
    selectedIds,
    toggle,
    toggleAll,
    allSelected,
    clearSelection,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    visibleData: visible,
    startItem,
    endItem,
    resetFilters,
    itemsPerPage: itemsPerPageState,
    setItemsPerPage: handleItemsPerPageChange,
  };
}
