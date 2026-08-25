"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/inputs/button";
import { Select } from "@/components/ui/inputs/select";
import type { ProductVariantItem, ProductVariantOption } from "@/lib/admin/mocks/variants";
import { useAddVariant } from "../hooks/useAddVariant";

interface AddVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ProductVariantOption[];
  existingItems: ProductVariantItem[];
  maxTotalStock: number;
  currentTotalStockUsed: number;
  baseImage: string;
  productId: string;
  onAdd: (newItem: ProductVariantItem) => void;
}

export function AddVariantModal({
  isOpen,
  onClose,
  options,
  existingItems,
  maxTotalStock,
  currentTotalStockUsed,
  baseImage,
  productId,
  onAdd,
}: AddVariantModalProps) {
  const {
    selectedValues,
    setSelectedValues,
    price,
    setPrice,
    stock,
    handleStockChange,
    status,
    setStatus,
    priceError,
    stockError,
    maxAllowedStock,
    isAlreadyAdded,
    handleFormSubmit,
  } = useAddVariant({
    isOpen,
    options,
    existingItems,
    maxTotalStock,
    currentTotalStockUsed,
    productId,
    baseImage,
    onAdd,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md" tone="card" radius="3xl" className="flex flex-col gap-6">
        <DialogHeader className="space-y-2 border-b border-border/40 pb-4">
          <DialogTitle className="font-openrunde text-2xl font-semibold text-foreground leading-tight text-left">
            Add Variant Combination
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground-lighter text-left leading-normal">
            Select attribute values for each option to build a new variant combination.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6 flex-1">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Configure Attributes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((opt) => {
                const selectOpts = opt.values.map((v) => ({ value: v, label: v }));
                return (
                  <Select
                    key={opt.name}
                    label={opt.name}
                    value={selectedValues[opt.name] || ""}
                    onChange={(e) => {
                      setSelectedValues((prev) => ({
                        ...prev,
                        [opt.name]: e.target.value,
                      }));
                    }}
                    options={selectOpts}
                  />
                );
              })}
            </div>

            {isAlreadyAdded && (
              <p className="text-xs font-semibold text-destructive mt-2">
                This variant combination already exists in the catalog table.
              </p>
            )}
          </div>

          {/* Price input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground block">Price ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 45.00"
              error={priceError || undefined}
              disabled={isAlreadyAdded}
            />
          </div>

          {/* Stock input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground block">
                Quantity (Stock)
              </label>
              <span className="text-caption text-muted-foreground-lighter font-medium">
                Remaining Capacity: {maxAllowedStock} / {maxTotalStock}
              </span>
            </div>
            <Input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => handleStockChange(e.target.value)}
              placeholder="e.g. 10"
              error={stockError || undefined}
              disabled={isAlreadyAdded}
            />
          </div>

          {/* Status select */}
          <div className="space-y-2">
            <Select
              label="Status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "Active" | "Draft" | "Out of Stock" | "Disabled")
              }
              options={[
                { value: "Active", label: "Active" },
                { value: "Draft", label: "Draft" },
                { value: "Out of Stock", label: "Out of Stock" },
                { value: "Disabled", label: "Disabled" },
              ]}
              disabled={isAlreadyAdded}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/40">
            <Button type="button" variant="outlined" colors="surface" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" colors="primary" disabled={isAlreadyAdded}>
              Add Variant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
