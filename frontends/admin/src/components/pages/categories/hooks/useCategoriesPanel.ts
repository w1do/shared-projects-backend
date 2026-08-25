"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category } from "@/lib/admin/mocks/types";

type ViewMode = "grid" | "table";
type SortConfig = { field: string; order: "asc" | "desc" } | null;

interface UseCategoriesPanelOptions {
  categories: Category[];
  onDeleteClick: (id: string) => void;
}

const descendingFirstFields = new Set(["revenue", "productCount", "growthYoY"]);

function getNextSortConfig(current: SortConfig, field: string): SortConfig {
  if (current?.field !== field) {
    return { field, order: descendingFirstFields.has(field) ? "desc" : "asc" };
  }
  if (current.order === "asc") {
    return { field, order: "desc" };
  }
  return null;
}

function filterCategories(
  categories: Category[],
  searchTerm: string,
  filterStatus: string,
): Category[] {
  const query = searchTerm.toLowerCase();

  return categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query);
    const matchesStatus = filterStatus === "all" || category.status === filterStatus;

    return matchesSearch && matchesStatus;
  });
}

function sortByDefaultOrder(categories: Category[]): Category[] {
  // Дерево приходит плоским списком в префиксном порядке: родитель, затем его
  // поддерево. Пересортировка по displayOrder разорвала бы эту связь — у
  // потомков это индекс внутри своего родителя, а не сквозной порядок.
  const isTree = categories.some((category) => category.depth !== undefined);
  if (isTree) {
    return categories;
  }

  return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
}

function sortCategories(categories: Category[], sortConfig: SortConfig): Category[] {
  if (!sortConfig) {
    return categories;
  }

  const { field, order } = sortConfig;
  const factor = order === "asc" ? 1 : -1;

  return [...categories].sort((a, b) => {
    const valueA = a[field as keyof Category];
    const valueB = b[field as keyof Category];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return valueA.localeCompare(valueB) * factor;
    }
    if (typeof valueA === "number" && typeof valueB === "number") {
      return (valueA - valueB) * factor;
    }
    return 0;
  });
}

export function useCategoriesPanel({ categories, onDeleteClick }: UseCategoriesPanelOptions) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [itemsPerPage, setItemsPerPageState] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const isFiltering = searchTerm !== "" || filterStatus !== "all";

  const displayedCategories = useMemo(() => {
    const filtered = filterCategories(categories, searchTerm, filterStatus);
    if (sortConfig) {
      return sortCategories(filtered, sortConfig);
    }
    return isFiltering ? filtered : sortByDefaultOrder(filtered);
  }, [categories, searchTerm, filterStatus, sortConfig, isFiltering]);

  const totalItems = displayedCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayedCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [displayedCategories, currentPage, itemsPerPage]);

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);

  useEffect(() => {
    setSelectedRowIds((current) => {
      const visibleIds = new Set(displayedCategories.map((category) => category.id));
      const next = new Set([...current].filter((id) => visibleIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [displayedCategories]);

  const handleSort = (field: string) => {
    setSortConfig((current) => getNextSortConfig(current, field));
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterStatusChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPageState(value);
    setCurrentPage(1);
  };

  const clearSelection = () => setSelectedRowIds(new Set());

  const handleBulkDelete = () => {
    // Parent page owns confirmation + toast when wired via onBulkDeleteClick.
    // Fallback: request delete per id (parent may open confirm for the first id).
    selectedRowIds.forEach((id) => onDeleteClick(id));
    clearSelection();
  };

  return {
    searchTerm,
    setSearchTerm: handleSearchTermChange,
    filterStatus,
    setFilterStatus: handleFilterStatusChange,
    viewMode,
    setViewMode,
    sortConfig,
    handleSort,
    selectedRowIds,
    setSelectedRowIds,
    clearSelection,
    handleBulkDelete,
    paginatedCategories,
    displayedCategories,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage: handleItemsPerPageChange,
    startItem,
    endItem,
  };
}
