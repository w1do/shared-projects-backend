"use client";

import { useMemo, useState } from "react";
import { Search, X, Trash2, LayoutGrid, LayoutList } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { ButtonGroup } from "@/components/ui/inputs/button-group";
import { Select } from "@/components/ui/inputs/select";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { DataTableFooter } from "@/components/shared/data-table/DataTableFooter";
import type { Collection } from "@/lib/admin/mocks/types";
import {
  collectionStatusFilterOptions,
  type CollectionStatusFilter,
} from "@/lib/admin/collections/table-state";
import { CollectionCard } from "../collection-card";
import { getCollectionColumns } from "../collection-columns";
import { useCollectionsPanel } from "@/components/pages/collections/hooks/useCollectionsPanel";
import { useProductsQuery } from "@/hooks/admin/products";

interface CollectionsPanelProps {
  collections: Collection[];
  onEditClick: (collection: Collection) => void;
  onDeleteClick: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

type ViewMode = "grid" | "table";

export function CollectionsPanel({
  collections,
  onEditClick,
  onDeleteClick,
  onToggleFeatured,
}: CollectionsPanelProps) {
  const { data: products = [] } = useProductsQuery();
  const panel = useCollectionsPanel({ collections, onDeleteClick });
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const columns = useMemo(
    () => getCollectionColumns({ onEditClick, onDeleteClick, onToggleFeatured, products }),
    [onEditClick, onDeleteClick, onToggleFeatured, products],
  );

  const selectedCount = panel.selectedRowIds.size;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search collections..."
          startIcon={<Search />}
          value={panel.searchTerm}
          onChange={(e) => panel.setSearchTerm(e.target.value)}
          className="max-w-sm w-full"
        />
        <div className="flex items-center gap-4">
          <Select
            value={panel.statusFilter}
            onChange={(e) => panel.setStatusFilter(e.target.value as CollectionStatusFilter)}
            options={collectionStatusFilterOptions}
            placeholder="Select status"
            className="w-40"
          />
          <ButtonGroup
            options={[
              { label: <LayoutGrid className="size-4" />, value: "grid" },
              { label: <LayoutList className="size-4" />, value: "table" },
            ]}
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            size="small"
            isIconButton
          />
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-col gap-4 rounded-3xl bg-primary p-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <IconButton
              variant="ghost"
              shape="circle"
              onClick={panel.clearSelection}
              color="surface"
            >
              <X />
            </IconButton>
            <span className="font-medium">
              {selectedCount} collection{selectedCount > 1 ? "s" : ""} selected
            </span>
          </div>
          <Button
            variant="ghost"
            shape="circle"
            color="error"
            startIcon={<Trash2 />}
            onClick={panel.handleBulkDelete}
          >
            Delete
          </Button>
        </div>
      )}

      {viewMode === "table" ? (
        <DataGrid
          rows={panel.paginatedCollections}
          columns={columns}
          sortConfig={panel.sortConfig}
          onSort={panel.handleSort}
          checkbox={true}
          selectedRowIds={panel.selectedRowIds}
          onSelectionChange={panel.setSelectedRowIds}
          emptyState={
            <div className="py-6 text-center text-xs text-muted-foreground-lighter">
              No collections found matching your criteria.
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {panel.paginatedCollections.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-border/60 bg-card p-6 py-12 text-center text-xs text-muted-foreground-lighter">
              No collections found matching your criteria.
            </div>
          ) : (
            panel.paginatedCollections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onToggleFeatured={onToggleFeatured}
              />
            ))
          )}
        </div>
      )}

      <DataTableFooter
        currentPage={panel.currentPage}
        endItem={panel.endItem}
        itemLabel="collections"
        itemsPerPage={panel.itemsPerPage}
        onItemsPerPageChange={panel.setItemsPerPage}
        onPageChange={panel.setCurrentPage}
        startItem={panel.startItem}
        totalItems={panel.sortedCollections.length}
        totalPages={panel.totalPages}
      />
    </div>
  );
}
