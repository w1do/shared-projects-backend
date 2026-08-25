"use client";

import Link from "next/link";
import { Eye, Pencil, Trash } from "lucide-react";
import type { Brand } from "@/lib/admin/mocks/types";
import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Badge } from "@/components/ui/data-display/badge";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Card } from "@/components/ui/data-display/card";
import { cn, formatCurrency } from "@/lib/utils";

interface BrandCardProps {
  brand: Brand;
  details: Partial<BrandFormValues> | undefined;
  productCount: number;
  onDeleteClick: (id: string) => void;
  onPreview: (brand: Brand) => void;
}

export function BrandCard({
  brand,
  details,
  productCount,
  onDeleteClick,
  onPreview,
}: BrandCardProps) {
  const logoUrl = details?.logo?.[0] || details?.thumbnail;
  const description = details?.description || "No description provided for this brand.";

  const handleDelete = () => {
    // Parent opens a confirm dialog before running the delete mutation.
    onDeleteClick(brand.id);
  };

  return (
    <Card
      className={cn(
        "group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl border-border bg-card p-6 shadow-subtle transition-all duration-300",
        "hover:shadow-subtle-3",
        "focus-within:ring-2 focus-within:ring-ring",
      )}
    >
      {/* Primary whole-card activation (under explicit actions) */}
      <Button
        type="button"
        variant="ghost"
        colors="surface"
        size="auto"
        shape="rectangle"
        onClick={() => onPreview(brand)}
        className="absolute inset-0 z-10 h-auto w-auto cursor-pointer rounded-2xl p-0 hover:bg-transparent active:scale-100 focus-visible:ring-0 focus-visible:ring-offset-0"
        aria-label={`Preview brand ${brand.name}`}
      />

      {/* Hover / keyboard action overlay — visual only; clicks pass through except on actions */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-primary/30 backdrop-blur-xs transition-opacity duration-300",
          "pointer-events-none opacity-0",
          "group-hover:opacity-100 group-focus-within:opacity-100",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center gap-4",
            "pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto",
          )}
        >
          <IconButton
            type="button"
            shape="circle"
            variant="contained"
            colors="surface"
            title="Quick view"
            onClick={() => onPreview(brand)}
          >
            <Eye className="size-4" />
          </IconButton>
          <IconButton
            shape="circle"
            variant="contained"
            colors="surface"
            title="Edit brand"
            component={Link}
            href={`/admin/brands/${brand.id}/edit`}
          >
            <Pencil className="size-4" />
          </IconButton>
          <IconButton
            type="button"
            shape="circle"
            variant="contained"
            colors="surface"
            title="Delete brand"
            onClick={handleDelete}
          >
            <Trash className="size-4" />
          </IconButton>
        </div>
      </div>

      <div className="relative z-0 flex items-start justify-between gap-4">
        <Avatar
          src={logoUrl}
          alt={brand.name}
          fallback={brand.monogram || brand.name.substring(0, 2)}
          shape="rounded"
          className="h-12 w-20 shrink-0 border border-border/60"
        />

        <Badge variant="tonal" color="neutral" shape="circle" size="sm">
          {productCount} {productCount === 1 ? "product" : "products"}
        </Badge>
      </div>

      <div className="relative z-0 mt-6 flex grow flex-col gap-2">
        <h3 className="font-serif text-heading-sm font-semibold leading-tight text-foreground transition-colors duration-300 group-hover:text-brand-accent group-focus-within:text-brand-accent">
          {brand.name}
        </h3>
        <p className="line-clamp-2 text-caption leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="relative z-0 mt-6 flex shrink-0 items-center justify-between border-t border-border/40 pt-4 text-caption">
        <div className="flex flex-col">
          <span className="text-micro font-semibold uppercase tracking-wider text-muted-foreground-lighter">
            Revenue
          </span>
          <span className="mt-2 font-openrunde font-semibold text-foreground">
            {formatCurrency(brand.revenue)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-micro font-semibold uppercase tracking-wider text-muted-foreground-lighter">
            Growth
          </span>
          <span
            className={cn(
              "mt-2 font-semibold",
              brand.delta >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {brand.delta >= 0 ? "+" : ""}
            {brand.delta}%
          </span>
        </div>
      </div>
    </Card>
  );
}
