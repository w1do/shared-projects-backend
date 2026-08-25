import * as React from "react";
import { Button } from "@/components/ui/inputs/button";
import { Layers } from "lucide-react";
import type { ProductFull } from "@/lib/admin/mock";
import type { ProductVariantConfig, ProductVariantItem } from "@/lib/admin/mocks/variants";

interface ProductVariantSelectorProps {
  variantConfig: ProductVariantConfig | undefined;
  product: ProductFull;
  selectedOptions: Record<string, string>;
  activePrice: number;
  activeStock: number;
  activeVariant: ProductVariantItem | undefined;
  handleOptionSelect: (optionName: string, value: string) => void;
}

export function ProductVariantSelector({
  variantConfig,
  product,
  selectedOptions,
  activePrice,
  activeStock,
  activeVariant,
  handleOptionSelect,
}: ProductVariantSelectorProps) {
  if (!variantConfig || variantConfig.items.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Layers size={14} className="text-muted-foreground-lighter" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground-lighter">
            SKU Variants
          </h4>
        </div>
        <div className="p-4 text-center text-xs text-muted-foreground-lighter border border-border/60 rounded-2xl bg-muted/20">
          No variant options configured for this product.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground-lighter flex items-center gap-2">
          <Layers size={14} />
          Variant Interactive Explorer
        </h4>
        <span className="text-micro text-muted-foreground-lighter">
          {variantConfig.items.length} options defined
        </span>
      </div>

      {/* Option Selectors */}
      <div className="space-y-4">
        {variantConfig.options.map((option) => (
          <div key={option.name} className="space-y-2">
            <span className="text-micro font-semibold text-muted-foreground-lighter uppercase tracking-wider block">
              {option.name}
            </span>
            <div className="flex flex-wrap gap-2">
              {option.values.map((val) => {
                const isSelected = selectedOptions[option.name] === val;
                return (
                  <Button
                    key={val}
                    type="button"
                    onClick={() => handleOptionSelect(option.name, val)}
                    variant="contained"
                    color={isSelected ? "secondary" : "surface"}
                    size="sm"
                    shape="rounded"
                  >
                    {val}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
