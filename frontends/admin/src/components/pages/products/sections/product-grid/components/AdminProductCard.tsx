"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Pencil, Archive, Trash2, DollarSign, ShoppingBag, Layers } from "lucide-react";
import type { ProductFull } from "@/lib/admin/mock";
import { formatCurrency, statusBadge, stockBadge } from "@/lib/admin/products-helpers";
import { Badge } from "@/components/ui/data-display/badge";
import { Card } from "@/components/ui/data-display/card";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Avatar } from "@/components/ui/data-display/avatar";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import { defaultGradients } from "@/lib/theme-colors";

interface AdminProductCardProps {
  product: ProductFull;
  selected: boolean;
  onToggle: (id: string) => void;
  onPreview?: (product: ProductFull) => void;
  onArchive?: (product: ProductFull) => void;
  onDelete?: (product: ProductFull) => void;
  userRole?: string;
  priority?: boolean;
}

export function AdminProductCard({
  product,
  selected,
  onToggle,
  onPreview,
  onArchive,
  onDelete,
  userRole,
  priority,
}: AdminProductCardProps) {
  const initials = (product.name || "").substring(0, 2).toUpperCase() || "PR";
  const grad0 = product.gradient?.[0] || defaultGradients.productWarm[0];
  const grad1 = product.gradient?.[1] || defaultGradients.productWarm[1];

  const status = statusBadge[product.status] || { colors: "muted" as const, label: product.status };
  const stock = stockBadge[product.stockStatus] || { colors: "muted" as const, className: "" };
  const gradientId = `product-card-${product.id}`;

  return (
    <>
      <AdminDynamicStyles gradients={[{ id: gradientId, start: grad0, end: grad1 }]} />
      <Card
        className="flex flex-col overflow-hidden bg-card border border-border/40 rounded-3xl shadow-subtle group select-none relative z-0 transition-all duration-300 hover:shadow-subtle-3 hover:-translate-y-1 cursor-pointer"
        onClick={() => onToggle(product.id)}
      >
        <div className="absolute top-4 left-4 z-20" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggle(product.id)}
            aria-label={`Select ${product.name}`}
            size="medium"
            shape="circle"
          />
        </div>

        {/* Image / Gradient Preview */}
        <div className="relative aspect-square overflow-hidden bg-muted border-b border-border/20">
          <Avatar
            src={product.image || undefined}
            alt={product.name}
            size="full"
            shape="square"
            priority={priority}
            data-admin-gradient={gradientId}
          >
            {initials}
          </Avatar>

          {/* Badges Overlay */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
            <Badge variant="solid" colors={status.colors} shape="circle">
              {status.label}
            </Badge>
            <Badge variant="soft" colors={stock.colors} shape="circle">
              {product.stockStatus}
            </Badge>
          </div>

          {/* Hover Actions Menu */}
          <div className="absolute inset-0 bg-primary/30 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            <div
              className="flex items-center justify-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                type="button"
                size="sm"
                shape="circle"
                variant="contained"
                colors="surface"
                title="Quick view"
                onClick={() => onPreview?.(product)}
              >
                <Eye />
              </IconButton>
              <IconButton
                component={Link}
                href={`/admin/products/${product.id}/edit`}
                size="sm"
                shape="circle"
                variant="contained"
                colors="surface"
                title="Edit product"
              >
                <Pencil />
              </IconButton>

              {userRole !== "staff" && (
                <IconButton
                  type="button"
                  size="sm"
                  shape="circle"
                  variant="contained"
                  colors="error"
                  title="Delete product"
                  onClick={() => onDelete?.(product)}
                >
                  <Trash2 />
                </IconButton>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6 flex flex-col gap-4 flex-1">
          <div className="flex-1">
            <span className="uppercase font-semibold tracking-wider text-muted-foreground-lighter leading-none block text-caption">
              {product.brand}
            </span>
            <h3 className="font-medium text-foreground leading-snug text-xl group-hover:text-ring transition-colors duration-200 text-line-2 mt-2">
              {product.name}
            </h3>
            <div className="flex items-center text-xs text-muted-foreground-lighter gap-2">
              <Layers className="h-4 w-4" />
              <span>
                {product.variants} variant{product.variants > 1 ? "s" : ""}
              </span>
              <span className="mx-1 text-border/40">·</span>
              <span>SKU: {product.sku}</span>
            </div>
          </div>

          {/* Revenue & Price Stats */}
          <div className="border-t border-border/30 pt-4 flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="uppercase font-semibold tracking-wider text-muted-foreground-lighter text-caption">
                QTY
              </span>
              <div className="flex items-center gap-2 mt-2">
                <ShoppingBag className="size-4 text-foreground/75" />
                <span className="text-xs font-semibold text-foreground">{product.stock} units</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="uppercase font-semibold tracking-wider text-muted-foreground-lighter text-caption">
                PRICE
              </span>
              <div className="flex items-center gap-2 mt-2">
                {product.id.length % 3 === 0 && (
                  <span className="text-xl line-through text-muted-foreground-lighter font-medium">
                    {formatCurrency(Math.round(product.price * 1.3))}
                  </span>
                )}
                <div className="flex items-center text-foreground font-semibold">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-2xl font-openrunde">
                    {formatCurrency(product.price).replace("$", "")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
