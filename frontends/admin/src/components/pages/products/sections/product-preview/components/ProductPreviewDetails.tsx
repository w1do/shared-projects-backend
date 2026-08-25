"use client";

import * as React from "react";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import { Pencil, DollarSign, Package, ShoppingBag } from "lucide-react";
import type { ProductFull } from "@/lib/admin/mock";
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import { formatCurrency, statusBadge, stockBadge } from "@/lib/admin/products-helpers";
import { ProductVariantSelector } from "./ProductVariantSelector";

interface ProductPreviewDetailsProps {
  product: ProductFull;
  onClose: () => void;
  onEdit?: (product: ProductFull) => void;
  /** Optional variant config from parent; empty when not provided. */
  variantConfig?: ProductVariantConfig;
}

export function ProductPreviewDetails({
  product,
  onClose,
  onEdit,
  variantConfig,
}: ProductPreviewDetailsProps) {
  const status = statusBadge[product.status] || { colors: "muted" as const, label: product.status };
  const stock = stockBadge[product.stockStatus] || { colors: "muted" as const, className: "" };

  // Initialize selectedOptions with first variant item options
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>(() => {
    if (variantConfig && variantConfig.items.length > 0) {
      return { ...variantConfig.items[0].options };
    }
    return {};
  });

  // Find active variant item matching selected options
  const activeVariant = React.useMemo(() => {
    if (!variantConfig) return undefined;
    return variantConfig.items.find((item) =>
      Object.entries(selectedOptions).every(([key, value]) => item.options[key] === value),
    );
  }, [variantConfig, selectedOptions]);

  const activeStock = activeVariant ? activeVariant.stock : product.stock;
  const activePrice = activeVariant ? activeVariant.price : product.price;

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => {
      const next = { ...prev, [optionName]: value };
      // Check if this combination exists
      const exists = variantConfig?.items.some((item) =>
        Object.entries(next).every(([k, v]) => item.options[k] === v),
      );

      if (exists) return next;

      // If combination doesn't exist, find first variant item that has this new value
      const fallbackItem = variantConfig?.items.find((item) => item.options[optionName] === value);
      if (fallbackItem) {
        return { ...fallbackItem.options };
      }
      return next;
    });
  };

  return (
    <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between gap-6 overflow-y-auto max-h-preview-scroll">
      {/* Product Header Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-caption font-semibold uppercase tracking-widest text-muted-foreground-lighter">
            {product.brand}
          </span>
          <div className="flex gap-2">
            <Badge variant="solid" colors={status.colors} shape="circle">
              {status.label}
            </Badge>
            <Badge
              variant="soft"
              colors={stock.colors}
              shape="circle"
              className={stock.className || ""}
            >
              {product.stockStatus}
            </Badge>
          </div>
        </div>

        <h2 className="text-3xl font-serif font-semibold text-foreground leading-tight">
          {product.name}
        </h2>

        <div className="h-1 bg-linear-to-r from-brand-accent/30 to-transparent w-60 rounded-full" />
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Sales Performance Card */}
        <div className="p-4 border border-border/60 rounded-2xl bg-muted/20 flex flex-col justify-between hover:border-brand-accent/30 transition-colors">
          <span className="text-caption text-muted-foreground-lighter block">Product Revenue</span>
          <div className="mt-2 flex items-baseline gap-2">
            <DollarSign size={16} className="text-brand-accent shrink-0" />
            <span className="text-xl font-bold font-openrunde text-foreground">
              {formatCurrency(product.revenue).replace("$", "")}
            </span>
          </div>
        </div>

        {/* Units Sold Card */}
        <div className="p-4 border border-border/60 rounded-2xl bg-muted/20 flex flex-col justify-between hover:border-brand-accent/30 transition-colors">
          <span className="text-caption text-muted-foreground-lighter block">Units Dispatched</span>
          <div className="mt-2 flex items-baseline gap-2">
            <ShoppingBag size={16} className="text-brand-accent shrink-0" />
            <span className="text-xl font-bold font-openrunde text-foreground">
              {product.unitsSold}
            </span>
            <span className="text-caption text-muted-foreground-lighter">sold</span>
          </div>
        </div>

        {/* Stock Card */}
        <div className="p-4 border border-border/60 rounded-2xl bg-muted/20 flex flex-col justify-between hover:border-brand-accent/30 transition-colors">
          <span className="text-caption text-muted-foreground-lighter block">Stock Balance</span>
          <div className="mt-2 flex items-baseline gap-2">
            <Package size={16} className="text-brand-accent shrink-0" />
            <span className="text-xl font-bold font-openrunde text-foreground">
              {product.stock}
            </span>
            <span className="text-caption text-muted-foreground-lighter">units</span>
          </div>
        </div>

        {/* Logistics Info Card */}
        <div className="p-4 border border-border/60 rounded-2xl bg-muted/20 flex flex-col justify-between hover:border-brand-accent/30 transition-colors">
          <span className="text-caption text-muted-foreground-lighter block">Category / SKU</span>
          <div className="mt-2 space-y-2">
            <span className="text-xs font-semibold text-foreground block truncate">
              {product.category}
            </span>
            <span className="text-micro font-mono text-muted-foreground-lighter block truncate">
              {product.sku}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic SKU Variants Picker */}
      <ProductVariantSelector
        variantConfig={variantConfig}
        product={product}
        selectedOptions={selectedOptions}
        activePrice={activePrice}
        activeStock={activeStock}
        activeVariant={activeVariant}
        handleOptionSelect={handleOptionSelect}
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/40 mt-auto">
        <Button variant="outlined" color="primary" shape="circle" onClick={onClose}>
          Close
        </Button>
        {onEdit && (
          <Button
            variant="contained"
            shape="circle"
            startIcon={<Pencil />}
            onClick={() => {
              onEdit(product);
              onClose();
            }}
          >
            Edit Details
          </Button>
        )}
      </div>
    </div>
  );
}
