"use client";

import { useState, useMemo, useCallback } from "react";
import { Pagination } from "@/components/shared";
import type { ProductVariantItem, ProductVariantOption } from "@/lib/admin/mocks/variants";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { toast } from "sonner";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { getVariantColumns } from "./components/VariantColumns";
import { EditVariantModal } from "./components/EditVariantModal";
import { AddVariantModal } from "./components/AddVariantModal";

interface VariantMatrixTableProps {
  items: ProductVariantItem[];
  onItemsChange: (items: ProductVariantItem[]) => void;
  baseProductName: string;
  onSave: () => void;
  maxTotalStock?: number;
  options: ProductVariantOption[];
  baseImage: string;
  productId: string;
}

export function VariantMatrixTable({
  items,
  onItemsChange,
  baseProductName,
  onSave,
  maxTotalStock = 207,
  options,
  baseImage,
  productId,
}: VariantMatrixTableProps) {
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedItems = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, activePage]);

  const activeItemToEdit = items.find((it) => it.id === selectedItemId);

  const currentTotalStockUsedForEdit = useMemo(() => {
    if (!selectedItemId) return 0;
    return items
      .filter((item) => item.id !== selectedItemId)
      .reduce((sum, item) => sum + (item.stock || 0), 0);
  }, [items, selectedItemId]);

  const totalStockUsedCurrently = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.stock || 0), 0);
  }, [items]);

  const handleEdit = useCallback((id: string) => {
    setSelectedItemId(id);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const updated = items.filter((item) => item.id !== id);
      onItemsChange(updated);
      toast.success("Variant combination removed from catalog", {
        position: "bottom-center",
      });
    },
    [items, onItemsChange],
  );

  const handleCloseModal = () => {
    setSelectedItemId(null);
  };

  const handleSaveVariant = (updated: {
    price: number;
    stock: number;
    status: "Active" | "Draft" | "Out of Stock" | "Disabled";
  }) => {
    if (!selectedItemId) return;
    const updatedItems = items.map((item) => {
      if (item.id === selectedItemId) {
        return {
          ...item,
          price: updated.price,
          stock: updated.stock,
          status: updated.status,
        };
      }
      return item;
    });
    onItemsChange(updatedItems);
    setSelectedItemId(null);
    toast.success("Updated variant details successfully.", {
      position: "bottom-center",
    });
  };

  const handleAddVariant = (newItem: ProductVariantItem) => {
    onItemsChange([...items, newItem]);
    setIsAddModalOpen(false);
    toast.success("Variant combination added to catalog", {
      position: "bottom-center",
    });
  };

  const columns = useMemo(
    () =>
      getVariantColumns({
        baseProductName,
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [baseProductName, handleEdit, handleDelete],
  );

  return (
    <Card variant="form-section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-heading font-medium text-foreground leading-tight">
            Variant Products Catalog
          </h2>
          <p className="text-xs text-muted-foreground-lighter">
            List of generated product items associated with this variant dimension combination.
          </p>
        </div>
        <Button type="button" onClick={() => setIsAddModalOpen(true)} size="sm" colors="primary">
          + Add Variant
        </Button>
      </div>

      {/* Variant combinations items list table */}
      <div className="overflow-x-auto min-w-0">
        {items.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground-lighter">
            No variants configured. Click "+ Add Variant" to build combinations.
          </div>
        ) : (
          <DataGrid
            rows={paginatedItems}
            columns={columns}
            checkboxSelection={false}
            variant="plain"
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border/40">
          <span className="text-xs text-muted-foreground-lighter font-medium">
            Showing {(activePage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(activePage * PAGE_SIZE, items.length)} of {items.length} entries
          </span>
          <Pagination
            count={totalPages}
            page={activePage}
            onChange={setCurrentPage}
            shape="circle"
          />
        </div>
      )}

      {selectedItemId && activeItemToEdit && (
        <EditVariantModal
          isOpen={selectedItemId !== null}
          onClose={handleCloseModal}
          variantItem={activeItemToEdit}
          maxTotalStock={maxTotalStock}
          currentTotalStockUsed={currentTotalStockUsedForEdit}
          onSave={handleSaveVariant}
        />
      )}

      {isAddModalOpen && (
        <AddVariantModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          options={options}
          existingItems={items}
          maxTotalStock={maxTotalStock}
          currentTotalStockUsed={totalStockUsedCurrently}
          baseImage={baseImage}
          productId={productId}
          onAdd={handleAddVariant}
        />
      )}
    </Card>
  );
}
