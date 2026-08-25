"use client";

import * as React from "react";
import { Badge } from "@/components/ui/data-display/badge";
import { Avatar } from "@/components/ui/data-display/avatar";
import type { ProductFull } from "@/lib/admin/mock";
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import { formatCurrency } from "@/lib/admin/products-helpers";

interface ProductPreviewStorefrontProps {
  product: ProductFull;
  gradientId: string;
  /** Optional variant config from parent; empty when not provided. */
  variantConfig?: ProductVariantConfig;
}

export function ProductPreviewStorefront({
  product,
  gradientId,
  variantConfig,
}: ProductPreviewStorefrontProps) {
  const initials = (product.name || "").substring(0, 2).toUpperCase() || "PR";

  return (
    <div className="md:col-span-5 p-6 border-r border-border/40 flex flex-col justify-between gap-6 relative select-none min-h-100 overflow-hidden group/storefront">
      {/* Full-bleed Product Visual Background */}
      <div className="absolute inset-0 z-0">
        <Avatar
          src={product.image || undefined}
          alt={product.name}
          size="full"
          shape="square"
          className="transition-transform duration-1000 ease-out group-hover/storefront:scale-105"
          fallbackClassName="text-5xl w-full h-full"
          data-admin-gradient={gradientId}
        >
          {initials}
        </Avatar>
      </div>

      <div className="absolute top-4 left-4 z-20">
        <Badge variant="contained" colors="secondary" shape="circle">
          Storefront View
        </Badge>
      </div>

      {/* Spacer to push content down */}
      <div className="flex-1" />

      {/* Storefront Info Details */}
      <div className="bg-background/90 backdrop-blur-md border border-background/60 p-4 rounded-2xl shadow-subtle-2 space-y-2 relative z-20">
        <div>
          <span className="uppercase font-semibold tracking-wider text-muted-foreground-lighter text-micro block leading-none">
            {product.brand}
          </span>
          <h3 className="font-serif text-2xl font-semibold text-foreground mt-2 leading-tight">
            {product.name}
          </h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold font-openrunde text-foreground">
            {formatCurrency(product.price)}
          </span>
          <span className="text-caption text-muted-foreground-lighter">MSRP</span>
        </div>

        {/* Color/Option swatches mockup */}
        {variantConfig && variantConfig.options.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-micro font-semibold text-muted-foreground-lighter uppercase tracking-wider block">
              Available {variantConfig.options[0].name}
            </span>
            <div className="flex flex-wrap gap-6">
              {variantConfig.options[0].values.map((val, idx) => (
                <Badge key={idx} variant="soft" colors="primary" shape="circle">
                  {val}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
