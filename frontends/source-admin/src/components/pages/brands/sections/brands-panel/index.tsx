"use client";

import { useMemo, useState } from "react";
import type { Brand } from "@/lib/admin/mocks/types";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { getBrandColumns } from "./components/BrandColumns";
import { formatCurrency } from "@/lib/utils";
import { useBrandsPanel } from "@/components/pages/brands/hooks/useBrandsPanel";
import { BrandPreviewModal } from "../brand-preview";
import { getBrandFormDetails } from "@/lib/admin/services";
import { DataTableFooter } from "@/components/shared/data-table/DataTableFooter";
import { BrandsToolbar } from "../brands-toolbar";
import { BrandsBulkActions } from "../brands-bulk-actions";
import { BrandsGrid } from "../brands-grid";
import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";

interface BrandsPanelProps {
  brands: Brand[];
  onDeleteClick: (id: string) => void;
}

export function BrandsPanel({ brands, onDeleteClick }: BrandsPanelProps) {
  const panel = useBrandsPanel({ brands, onDeleteClick });
  const [previewBrand, setPreviewBrand] = useState<Brand | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const brandDetailsMap = useMemo(() => {
    const detailsMap: Record<string, Partial<BrandFormValues>> = {};
    brands.forEach((brand) => {
      detailsMap[brand.id] = getBrandFormDetails(brand.id);
    });
    return detailsMap;
  }, [brands]);

  const columns = useMemo(
    () =>
      getBrandColumns({
        onDelete: onDeleteClick,
        formatCurrency: (val) => formatCurrency(val),
        onPreview: (brand) => setPreviewBrand(brand),
        brandDetails: brandDetailsMap,
      }),
    [onDeleteClick, brandDetailsMap],
  );

  const previewData = useMemo(() => {
    if (!previewBrand) return null;
    const details = getBrandFormDetails(previewBrand.id);
    return { ...previewBrand, ...details };
  }, [previewBrand]);

  return (
    <div className="flex flex-col gap-6">
      <BrandsToolbar
        searchTerm={panel.searchTerm}
        onSearchChange={panel.setSearchTerm}
        filterDelta={panel.filterDelta}
        onFilterDeltaChange={panel.setFilterDelta}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <BrandsBulkActions
        selectedCount={panel.selectedRowIds.size}
        onClearSelection={panel.clearSelection}
        onBulkDelete={panel.handleBulkDelete}
      />

      {viewMode === "table" ? (
        <DataGrid
          rows={panel.paginatedBrands}
          columns={columns}
          sortConfig={panel.sortConfig}
          onSort={panel.handleSort}
          checkbox={true}
          selectedRowIds={panel.selectedRowIds}
          onSelectionChange={panel.setSelectedRowIds}
          emptyState={
            <div className="text-center text-xs text-muted-foreground-lighter py-6">
              No cosmetic brands found matching your criteria.
            </div>
          }
        />
      ) : (
        <BrandsGrid
          brands={panel.paginatedBrands}
          brandDetailsMap={brandDetailsMap}
          onDeleteClick={onDeleteClick}
          onPreview={(b) => setPreviewBrand(b)}
        />
      )}

      <DataTableFooter
        currentPage={panel.currentPage}
        endItem={panel.endItem}
        itemLabel="brands"
        itemsPerPage={panel.itemsPerPage}
        onItemsPerPageChange={panel.setItemsPerPage}
        onPageChange={panel.setCurrentPage}
        startItem={panel.startItem}
        totalItems={panel.sortedBrands.length}
        totalPages={panel.totalPages}
      />

      <BrandPreviewModal
        open={!!previewBrand}
        onOpenChange={(open) => !open && setPreviewBrand(null)}
        brandData={previewData || {}}
      />
    </div>
  );
}
