"use client";

import * as React from "react";
import type { ProductFull } from "@/lib/admin/mock";
import { ProductsToolbar } from "./list-controls";
import { ProductsTable } from "./product-table";
import { ProductsGrid } from "./product-grid";
import { ProductsEmptyState } from "./list-controls/components/ProductsEmptyState";
import { BulkActionBar } from "./list-controls/components/BulkActionBar";
import { ProductDeleteDialog } from "./list-controls/components/ProductDeleteDialog";
import {
  ProductsErrorBanner,
  ProductsRefetchHint,
} from "./list-controls/components/ProductsQueryState";
import { ProductsFooterSkeleton, ProductsGridSkeleton } from "../loading";
import { DataTableFooter } from "@/components/shared/data-table/DataTableFooter";
import { ProductPreviewModal } from "./product-preview";
import { useProductsActions } from "@/hooks/admin/products";

type ProductsPanelProps = {
  products: ProductFull[];
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  onRetry?: () => void;
};

export function ProductsPanel({
  products,
  isLoading = false,
  isError = false,
  isFetching = false,
  onRetry,
}: ProductsPanelProps) {
  const [userRole, setUserRole] = React.useState<string>("");

  React.useEffect(() => {
    const userStr = localStorage.getItem("current_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || "");
      } catch (e) {
        console.error("Failed to parse user role in ProductsPanel", e);
      }
    }
  }, []);

  const {
    viewMode,
    setViewMode,
    previewProduct,
    isPreviewOpen,
    handlePreview,
    handleEdit,
    handleClosePreview,
    handleArchive,
    handleDelete,
    handleBulkArchive,
    handleBulkDelete,
    deleteIntent,
    cancelDelete,
    confirmDelete,
    isBusy,
    dataTable,
  } = useProductsActions(products);

  const {
    query,
    setQuery,
    status,
    setStatus,
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
    paginatedData: paginatedProducts,
    visibleData: visible,
    startItem,
    endItem,
    resetFilters,
    itemsPerPage,
    setItemsPerPage,
  } = dataTable;

  const showInitialLoading = isLoading && products.length === 0;
  const showSoftRefetch = isFetching && !isLoading && products.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <ProductsToolbar
        products={products}
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isError && onRetry ? (
        <ProductsErrorBanner onRetry={onRetry} isRetrying={isFetching} />
      ) : null}

      {showSoftRefetch ? <ProductsRefetchHint /> : null}

      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          onClear={clearSelection}
          onArchive={handleBulkArchive}
          onDelete={handleBulkDelete}
          isBusy={isBusy}
          userRole={userRole}
        />
      )}

      {showInitialLoading ? (
        <>
          {/* Toolbar already rendered above; only mirror catalog body + footer. */}
          <ProductsGridSkeleton />
          <ProductsFooterSkeleton />
        </>
      ) : paginatedProducts.length > 0 ? (
        viewMode === "list" ? (
          <ProductsTable
            products={paginatedProducts}
            selectedIds={selectedIds}
            allSelected={allSelected}
            onToggle={toggle}
            onToggleAll={toggleAll}
            sortConfig={sortConfig}
            onSort={handleSort}
            onPreview={handlePreview}
            onEdit={handleEdit}
            onArchive={handleArchive}
            onDelete={handleDelete}
            userRole={userRole}
          />
        ) : (
          <ProductsGrid
            products={paginatedProducts}
            selectedIds={selectedIds}
            onToggle={toggle}
            onPreview={handlePreview}
            onArchive={handleArchive}
            onDelete={handleDelete}
            userRole={userRole}
          />
        )
      ) : (
        <ProductsEmptyState onReset={resetFilters} />
      )}

      <DataTableFooter
        currentPage={currentPage}
        endItem={endItem}
        itemLabel="products"
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        onPageChange={setCurrentPage}
        startItem={startItem}
        totalItems={visible.length}
        totalPages={totalPages}
      />

      <ProductPreviewModal
        product={previewProduct}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onEdit={handleEdit}
      />

      <ProductDeleteDialog
        open={!!deleteIntent}
        productName={deleteIntent?.type === "single" ? deleteIntent.product.name : undefined}
        count={deleteIntent?.type === "bulk" ? deleteIntent.ids.length : 1}
        isBusy={isBusy}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
