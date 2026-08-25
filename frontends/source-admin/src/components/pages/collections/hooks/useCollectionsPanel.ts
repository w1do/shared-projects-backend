"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Collection } from "@/lib/admin/mocks/types";
import {
  type CollectionSortConfig,
  type CollectionStatusFilter,
  filterCollections,
  getNextCollectionSortConfig,
  sortCollections,
} from "@/lib/admin/collections/table-state";

interface UseCollectionsPanelOptions {
  collections: Collection[];
  onDeleteClick: (id: string) => void;
}

export function useCollectionsPanel({ collections, onDeleteClick }: UseCollectionsPanelOptions) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CollectionStatusFilter>("all");
  const [sortConfig, setSortConfig] = useState<CollectionSortConfig>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [itemsPerPage, setItemsPerPageState] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCollections = useMemo(
    () => filterCollections(collections, searchTerm, statusFilter),
    [collections, searchTerm, statusFilter],
  );

  const sortedCollections = useMemo(
    () => sortCollections(filteredCollections, sortConfig),
    [filteredCollections, sortConfig],
  );

  const totalPages = Math.ceil(sortedCollections.length / itemsPerPage);
  const paginatedCollections = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCollections.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, sortedCollections]);
  const startItem = sortedCollections.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, sortedCollections.length);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);

  useEffect(() => {
    setSelectedRowIds((current) => {
      const visibleIds = new Set(sortedCollections.map((collection) => collection.id));
      const next = new Set([...current].filter((id) => visibleIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [sortedCollections]);

  const handleSort = (field: string) => {
    setSortConfig((current) => getNextCollectionSortConfig(current, field));
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: CollectionStatusFilter) => {
    setStatusFilter(value);
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
    const count = selectedRowIds.size;
    selectedRowIds.forEach((id) => {
      onDeleteClick(id);
    });

    toast.success(`Removed ${count} collection${count > 1 ? "s" : ""}.`);
    clearSelection();
  };

  return {
    searchTerm,
    setSearchTerm: handleSearchTermChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    sortConfig,
    selectedRowIds,
    setSelectedRowIds,
    sortedCollections,
    paginatedCollections,
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
