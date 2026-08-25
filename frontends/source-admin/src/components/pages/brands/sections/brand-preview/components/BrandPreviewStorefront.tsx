"use client";

import * as React from "react";
import { Badge } from "@/components/ui/data-display/badge";
import { Avatar } from "@/components/ui/data-display/avatar";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { Product } from "@/lib/admin/mocks/types";
import { formatCurrency } from "@/lib/utils";
import { getStockConfig } from "@/lib/admin/products-helpers";

interface BrandPreviewStorefrontProps {
  name: string;
  description: string;
  filteredProducts: Product[];
}

export function BrandPreviewStorefront({
  name,
  description,
  filteredProducts,
}: BrandPreviewStorefrontProps) {
  // Extract gradients to generate dynamic stylesheets without inline style background
  const productStyles = React.useMemo(() => {
    return filteredProducts.map((p) => ({
      id: `preview-prod-${p.id}`,
      start: p.gradient[0],
      end: p.gradient[1],
    }));
  }, [filteredProducts]);

  return (
    <div className="space-y-8 outline-none mt-0">
      <AdminDynamicStyles gradients={productStyles} />

      {/* Story/Description Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground-lighter uppercase tracking-wider">
          The Brand Philosophy
        </h3>
        {description ? (
          <div
            className="text-body-lg text-muted-foreground leading-relaxed max-w-3xl font-light [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : (
          <p className="text-body-lg text-muted-foreground-lighter italic font-light">
            No custom luxury brand story written yet. Auto-filled placeholder details will show on
            storefront listings.
          </p>
        )}
      </div>

      {/* Products Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground-lighter uppercase tracking-wider">
            Signature Collections
          </h3>
          <span className="text-caption text-muted-foreground-lighter">Storefront Preview</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group border border-border/50 rounded-3xl bg-background hover:bg-muted/30 p-4 transition-all duration-300 hover:shadow-subtle cursor-pointer flex flex-col gap-4"
            >
              {/* Mock product image container */}
              <div className="aspect-square w-full relative">
                <Avatar
                  src={product.image || undefined}
                  alt={product.name}
                  size="full"
                  shape="rounded"
                  data-admin-gradient={`preview-prod-${product.id}`}
                >
                  {product.name.slice(0, 2).toUpperCase()}
                </Avatar>
                {(() => {
                  const stockConfig = getStockConfig(product.stock);
                  return (
                    <Badge
                      variant="contained"
                      color={stockConfig.color}
                      size="sm"
                      className="absolute top-2 left-2 "
                    >
                      {stockConfig.label}
                    </Badge>
                  );
                })()}
                {product.discount !== undefined && product.discount > 0 && (
                  <Badge
                    variant="contained"
                    color="error"
                    size="sm"
                    shape="circle"
                    className="absolute top-2 right-2 font-mono"
                  >
                    -{product.discount}%
                  </Badge>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-caption text-muted-foreground-lighter font-serif italic">
                  {product.category}
                </span>
                <span className="text-body font-semibold text-foreground mt-2 truncate group-hover:text-brand-accent transition-colors duration-200">
                  {product.name}
                </span>
                <div className="flex items-center justify-between mt-1 text-body font-medium text-muted-foreground font-openrunde">
                  <span>{formatCurrency(product.price)}</span>
                  {product.stock !== undefined && (
                    <span className="text-caption text-muted-foreground-lighter font-sans">
                      Qty: {product.stock}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
