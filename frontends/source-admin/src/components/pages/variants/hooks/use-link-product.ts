"use client";

import { useState, useMemo } from "react";
import { useProductsQuery } from "@/hooks/admin/products";

interface UseLinkProductProps {
  itemsPerPage?: number;
}

export function useLinkProduct({ itemsPerPage = 5 }: UseLinkProductProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: products = [] } = useProductsQuery();

  // Filter and sort products
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q),
      );
    }

    // 2. Default sort by name (A-Z)
    result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(processedProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [processedProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return {
    searchQuery,
    currentPage,
    processedProducts,
    totalPages,
    paginatedProducts,
    handlePageChange,
    handleSearchChange,
  };
}
