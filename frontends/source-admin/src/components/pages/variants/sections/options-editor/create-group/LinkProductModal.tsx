"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { Input } from "@/components/ui/inputs/input";
import { Search } from "lucide-react";
import { useLinkProduct } from "@/components/pages/variants/hooks/use-link-product";
import type { ProductFull } from "@/lib/admin/mocks/types";
import { Pagination } from "@/components/shared/data-table/Pagination";
import { Avatar } from "@/components/ui/data-display/avatar";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/inputs/button";

interface LinkProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  combinationText: string;
  onSelectProduct: (product: ProductFull) => void;
}

export function LinkProductModal({
  isOpen,
  onClose,
  combinationText,
  onSelectProduct,
}: LinkProductModalProps) {
  const {
    searchQuery,
    currentPage,
    processedProducts,
    totalPages,
    paginatedProducts,
    handlePageChange,
    handleSearchChange,
  } = useLinkProduct();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" tone="card" radius="3xl" className="flex flex-col gap-6">
        <DialogHeader className="space-y-2 border-b border-border/40 pb-4">
          <DialogTitle className="font-openrunde text-2xl font-semibold text-foreground leading-tight text-left">
            Associate Variant Product
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground-lighter text-left leading-normal">
            Choose a catalog product to link with combination:{" "}
            <span className="font-semibold text-foreground">{combinationText}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Filter controls */}
        <Input
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name, brand, SKU..."
          startIcon={<Search />}
        />

        {/* Catalog Items list */}
        <div className="flex-1 min-h-20 flex flex-col gap-2">
          {paginatedProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center border border-dashed border-border/70 rounded-2xl p-8 text-center text-xs text-muted-foreground-lighter">
              No products match your search/filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {paginatedProducts.map((product) => {
                const initials = (product.name || "").substring(0, 2).toUpperCase() || "PR";
                return (
                  <div
                    key={product.id}
                    className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar
                        src={product.image || undefined}
                        alt={product.name}
                        size="xl"
                        shape="rounded"
                        className="border border-border/30"
                      >
                        {initials}
                      </Avatar>
                      <div className="min-w-0 flex flex-col gap-2">
                        <h4 className="text-base font-semibold text-foreground truncate max-w-xs">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground-lighter font-medium">
                          <span className="font-bold text-foreground">
                            {formatCurrency(product.price)}
                          </span>
                          <span>·</span>
                          <span>Stock: {product.stock}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      size="sm"
                      shape="circle"
                    >
                      Select
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-border/40 pt-4 flex items-center justify-between">
          <span className="text-caption text-muted-foreground-lighter font-medium">
            Page {currentPage} of {totalPages} ({processedProducts.length} items)
          </span>

          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            shape="circle"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
