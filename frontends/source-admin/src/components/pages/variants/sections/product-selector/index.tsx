"use client";

import { useState, useMemo } from "react";
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import { Input } from "@/components/ui/inputs/input";
import { Card } from "@/components/ui/data-display/card";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Search, Sparkles, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";

interface VariantsProductSelectorProps {
  configs: ProductVariantConfig[];
  selectedProductId: string;
  onSelectProduct: (id: string) => void;
  onDeleteConfig?: (id: string) => void;
}

export function VariantsProductSelector({
  configs,
  selectedProductId,
  onSelectProduct,
  onDeleteConfig,
}: VariantsProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState<ProductVariantConfig | null>(null);

  const filteredConfigs = useMemo(() => {
    return configs.filter((c) => c.productName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [configs, searchQuery]);

  const handleDeleteClick = (e: React.MouseEvent, config: ProductVariantConfig) => {
    e.stopPropagation();
    setProductToDelete(config);
  };

  const handleConfirmDelete = () => {
    if (productToDelete && onDeleteConfig) {
      onDeleteConfig(productToDelete.productId);
    }
    setProductToDelete(null);
  };

  return (
    <Card className="flex flex-col h-full border-border bg-card rounded-3xl shadow-subtle-3 overflow-hidden">
      {/* Search Header */}
      <div className="px-4 pt-4 pb-4 border-b border-border/40 bg-muted/20 flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Sparkles size={12} className="text-brand-accent" />
          Catalog Products
        </span>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          startIcon={<Search />}
        />
      </div>

      {/* Products list */}
      <div className="flex-1 overflow-y-auto p-2 pt-4 space-y-2 max-h-64">
        {filteredConfigs.length === 0 ? (
          <p className="text-xs text-muted-foreground-lighter text-center py-6">
            No products found
          </p>
        ) : (
          filteredConfigs.map((config) => {
            const active = config.productId === selectedProductId;
            const totalVariants = config.items.length;
            const totalOptions = config.options.length;

            return (
              <Button
                key={config.productId}
                type="button"
                onClick={() => onSelectProduct(config.productId)}
                variant={active ? "soft" : "ghost"}
                color={active ? "secondary" : "surface"}
                size="auto"
                fullWidth
                className={`group justify-start text-left font-normal border border-border/30 transition-all duration-200 ${
                  !active ? "text-muted-foreground hover:text-foreground" : ""
                }`}
              >
                <Avatar
                  src={config.productImage}
                  alt={config.productName}
                  fallback={config.productName.charAt(0) || "V"}
                  size="lg"
                  shape="rounded"
                  className="border border-border/30 shrink-0"
                  fallbackClassName="bg-accent/60 text-brand-accent font-openrunde text-lg font-medium uppercase select-none"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold truncate ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {config.productName}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground-lighter">
                    <span>{totalOptions} dimensions</span>
                    <span>•</span>
                    <span className="font-medium text-brand-accent/90">
                      {totalVariants} variants
                    </span>
                  </div>
                </div>

                {onDeleteConfig && (
                  <IconButton
                    type="button"
                    variant="ghost"
                    color="error"
                    size="sm"
                    onClick={(e) => handleDeleteClick(e, config)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    title="Delete Variant Configuration"
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
              </Button>
            );
          })
        )}
      </div>

      {/* Premium Confirm Delete Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent size="md" className="flex flex-col gap-6">
          <DialogHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-2 text-error">
              <div className="size-8 rounded-full bg-error/10 flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
              <DialogTitle>Delete Variant Configurations</DialogTitle>
            </div>
            <DialogDescription className="mt-2 text-xs">
              This action cannot be undone. Please review the details below before proceeding.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <p className="text-caption text-muted-foreground leading-relaxed">
              Are you sure you want to delete all variant configurations for{" "}
              <strong className="text-foreground">{productToDelete?.productName}</strong>?
            </p>
            <div className="p-4 rounded-2xl bg-error/5 border border-error/10 text-caption text-error-darker leading-normal">
              The product will revert to a standalone item. All pricing matrices, SKUs, and
              inventory levels associated with its {productToDelete?.items.length} current variants
              will be permanently removed.
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-2 border-t border-border/20">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              onClick={() => setProductToDelete(null)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="contained"
              colors="error"
              shape="circle"
              onClick={handleConfirmDelete}
              size="sm"
              className="font-semibold"
            >
              Delete Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
