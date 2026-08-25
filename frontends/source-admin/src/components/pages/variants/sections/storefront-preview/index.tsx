"use client";

import type { ProductVariantOption, ProductVariantItem } from "@/lib/admin/mocks/variants";
import { Card } from "@/components/ui/data-display/card";
import { Badge } from "@/components/ui/data-display/badge";
import { OptionSelectors } from "./components/OptionSelectors";
import { useStorefrontPreview } from "@/components/pages/variants/hooks/use-storefront-preview";
import { StatusDot } from "@/components/ui/feedback/status-dot";
import { Avatar } from "@/components/ui/data-display/avatar";
import { formatCurrency } from "@/lib/utils";
import { getStockConfig } from "@/lib/admin/products-helpers";

interface StorefrontPreviewProps {
  options: ProductVariantOption[];
  items: ProductVariantItem[];
  productName: string;
  productImage: string;
}

export function StorefrontPreview({
  options,
  items,
  productName,
  productImage,
}: StorefrontPreviewProps) {
  const {
    selectedValues,
    activeVariant,
    isOptionValueAvailable,
    handleSelectValue,
    productMeta,
    filteredOptions,
  } = useStorefrontPreview({ options, items, productName });

  const hasVariants = filteredOptions.length > 0;
  const stockConfig = getStockConfig(activeVariant?.stock);

  return (
    <Card className="p-4 border-border bg-card rounded-3xl shadow-subtle-3 flex flex-col gap-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <StatusDot color="success" ping />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Storefront Live Preview
          </span>
        </div>
      </div>

      {!hasVariants ? (
        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-border/80 text-xs text-muted-foreground-lighter text-center">
          Define options to preview storefront.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Top Row: Thumbnail + Product info (Text, description, price/qty) */}
          <div className="flex items-start gap-4">
            {/* Thumbnail Image */}
            <div className="size-24 shrink-0 group">
              <Avatar
                src={activeVariant?.image || productImage}
                alt={productName}
                fallback={productName.charAt(0) || "V"}
                shape="rounded"
                size="full"
              />
            </div>

            {/* Product Detail Info & Price/Stock */}
            <div className="min-w-0 flex-1 flex flex-col justify-between min-h-20">
              <div>
                <h3 className="font-openrunde text-base text-foreground font-semibold leading-tight truncate">
                  {productName}
                </h3>
                <p className="text-caption text-muted-foreground line-clamp-2 mt-1 leading-snug">
                  {productMeta.description}
                </p>
              </div>

              {/* Price and Stock info inline */}
              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/60">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-foreground leading-none">
                    {activeVariant ? formatCurrency(activeVariant.price) : "—"}
                  </span>
                  {activeVariant && (
                    <span className="text-caption text-muted-foreground-lighter line-through">
                      {formatCurrency(activeVariant.price * productMeta.compareMultiplier)}
                    </span>
                  )}
                </div>

                {/* Stock info badge */}
                <Badge
                  variant="soft"
                  shape="circle"
                  color={stockConfig.color}
                  startIcon={<StatusDot color={stockConfig.color} ping={stockConfig.ping} />}
                >
                  {stockConfig.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Bottom Row: List Option Variants */}
          <div className="border-t border-border/40 pt-4">
            <OptionSelectors
              options={filteredOptions}
              selectedValues={selectedValues}
              isOptionValueAvailable={isOptionValueAvailable}
              handleSelectValue={handleSelectValue}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
