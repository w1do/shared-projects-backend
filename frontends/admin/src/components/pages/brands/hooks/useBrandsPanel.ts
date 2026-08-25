"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Brand } from "@/lib/admin/mocks/types";
import {
  type BrandPerformanceFilter,
  type BrandSortConfig,
  filterBrands,
  getNextBrandSortConfig,
  sortBrands,
} from "@/lib/admin/brands/table-state";

interface UseBrandsPanelOptions {
  brands: Brand[];
  onDeleteClick: (id: string) => void;
}

export function useBrandsPanel({ brands, onDeleteClick }: UseBrandsPanelOptions) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDelta, setFilterDelta] = useState<BrandPerformanceFilter>("all");
  const [sortConfig, setSortConfig] = useState<BrandSortConfig>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [itemsPerPage, setItemsPerPageState] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBrands = useMemo(
    () => filterBrands(brands, searchTerm, filterDelta),
    [brands, filterDelta, searchTerm],
  );

  const sortedBrands = useMemo(
    () => sortBrands(filteredBrands, sortConfig),
    [filteredBrands, sortConfig],
  );

  const totalPages = Math.ceil(sortedBrands.length / itemsPerPage);
  const paginatedBrands = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedBrands.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, sortedBrands]);
  const startItem = sortedBrands.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, sortedBrands.length);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);

  useEffect(() => {
    setSelectedRowIds((current) => {
      const visibleIds = new Set(sortedBrands.map((brand) => brand.id));
      const next = new Set([...current].filter((id) => visibleIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [sortedBrands]);

  const handleSort = (field: string) => {
    setSortConfig((current) => getNextBrandSortConfig(current, field));
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterDeltaChange = (value: BrandPerformanceFilter) => {
    setFilterDelta(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPageState(value);
    setCurrentPage(1);
  };

  const clearSelection = () => {
    setSelectedRowIds(new Set());
  };

  const handleBulkDelete = () => {
    selectedRowIds.forEach((id) => {
      onDeleteClick(id);
    });

    toast.success(
      `Removed ${selectedRowIds.size} brand${selectedRowIds.size > 1 ? "s" : ""} from portfolio.`,
    );
    clearSelection();
  };

  return {
    searchTerm,
    setSearchTerm: handleSearchTermChange,
    filterDelta,
    setFilterDelta: handleFilterDeltaChange,
    sortConfig,
    selectedRowIds,
    setSelectedRowIds,
    sortedBrands,
    paginatedBrands,
    currentPage,
    setCurrentPage,
    totalPages,
    startItem,
    endItem,
    itemsPerPage,
    setItemsPerPage: handleItemsPerPageChange,
    handleSort,
    handleBulkDelete,
    clearSelection,
  };
}
