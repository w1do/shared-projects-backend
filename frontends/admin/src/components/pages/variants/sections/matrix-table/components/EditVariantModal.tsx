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
import type { ProductVariantItem } from "@/lib/admin/mocks/variants";

interface EditVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  variantItem: ProductVariantItem;
  maxTotalStock: number;
  currentTotalStockUsed: number; // Tổng stock của các variants khác (không tính variant này)
  onSave: (updated: {
    price: number;
    stock: number;
    status: "Active" | "Draft" | "Out of Stock" | "Disabled";
  }) => void;
}

export function EditVariantModal({
  isOpen,
  onClose,
  variantItem,
  maxTotalStock,
  currentTotalStockUsed,
  onSave,
}: EditVariantModalProps) {
  const combinationText = Object.values(variantItem.options).join(" · ");

  const [price, setPrice] = React.useState(variantItem.price.toString());
  const [stock, setStock] = React.useState(variantItem.stock.toString());
  const [status, setStatus] = React.useState<"Active" | "Draft" | "Out of Stock" | "Disabled">(
    variantItem.status || "Out of Stock",
  );

  const [priceError, setPriceError] = React.useState("");
  const [stockError, setStockError] = React.useState("");

  const maxAllowedStockForThisVariant = Math.max(0, maxTotalStock - currentTotalStockUsed);

  // Sync state when open
  React.useEffect(() => {
    if (isOpen) {
      setPrice(variantItem.price.toString());
      setStock(variantItem.stock.toString());
      setStatus(variantItem.status || "Out of Stock");
      setPriceError("");
      setStockError("");
    }
  }, [isOpen, variantItem]);

  // Auto update status if stock is 0 or > 0 (as a helper, user can still override)
  const handleStockChange = (val: string) => {
    setStock(val);
    const parsedStock = parseInt(val, 10);
    if (!isNaN(parsedStock)) {
      if (parsedStock === 0) {
        setStatus("Out of Stock");
      } else if (parsedStock > 0 && status === "Out of Stock") {
        setStatus("Active");
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setPriceError("Price must be a valid positive number.");
      hasError = true;
    } else {
      setPriceError("");
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setStockError("Stock must be a non-negative integer.");
      hasError = true;
    } else if (parsedStock > maxAllowedStockForThisVariant) {
      setStockError(
        `Stock cannot exceed remaining warehouse capacity of ${maxAllowedStockForThisVariant} items.`,
      );
      hasError = true;
    } else {
      setStockError("");
    }

    if (hasError) return;

    onSave({
      price: parsedPrice,
      stock: parsedStock,
      status,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md" tone="card" radius="3xl" className="flex flex-col gap-6">
        <DialogHeader className="space-y-2 border-b border-border/40 pb-4">
          <DialogTitle className="font-openrunde text-2xl font-semibold text-foreground leading-tight text-left">
            Edit Variant Details
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground-lighter text-left leading-normal">
            Update pricing, stock levels, and publication status for variant:{" "}
            <span className="font-semibold text-foreground">{combinationText}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6 flex-1">
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
            />
          </div>

          {/* Stock input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground block">
                Quantity (Stock)
              </label>
              <span className="text-caption text-muted-foreground-lighter font-medium">
                Remaining Capacity: {maxAllowedStockForThisVariant} / {maxTotalStock}
              </span>
            </div>
            <Input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => handleStockChange(e.target.value)}
              placeholder="e.g. 10"
              error={stockError || undefined}
            />
            <p className="text-caption text-muted-foreground-lighter leading-normal">
              Total stock of all variant combinations combined cannot exceed the product's total
              inventory stock of {maxTotalStock}.
            </p>
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
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/40">
            <Button type="button" variant="outlined" colors="surface" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" colors="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
