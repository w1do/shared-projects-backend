"use client";

import { formatCurrency } from "@/lib/utils";
import { Edit2, Star, Trash2, TrendingUp } from "lucide-react";
import Image from "next/image";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Badge } from "@/components/ui/data-display/badge";
import { AvatarGroup, type AvatarGroupItem } from "@/components/ui/data-display/avatar-group";
import type { Collection } from "@/lib/admin/mocks/types";
import { useProductsQuery } from "@/hooks/admin/products";

const statusColorMap: Record<Collection["status"], "success" | "warning" | "neutral"> = {
  Active: "success",
  Draft: "warning",
  Archived: "neutral",
};

interface CollectionCardProps {
  collection: Collection;
  onEditClick: (collection: Collection) => void;
  onDeleteClick: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

export function CollectionCard({
  collection,
  onEditClick,
  onDeleteClick,
  onToggleFeatured,
}: CollectionCardProps) {
  const { data: products = [] } = useProductsQuery();
  const associatedProducts = products.filter((p) => collection.products.includes(p.id));
  const productItems: AvatarGroupItem[] = associatedProducts.map((p) => ({
    id: p.id,
    src: p.image,
    alt: p.name,
    fallback: p.name.slice(0, 2).toUpperCase(),
    tooltip: p.name,
  }));

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        <div className="relative">
          <div className="aspect-banner relative w-full overflow-hidden bg-muted transition-all duration-500 group-hover:opacity-95">
            {collection.banner && (
              <Image
                src={collection.banner}
                alt={collection.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            )}
            <div className="absolute right-4 top-4 z-10">
              <Badge
                variant="soft"
                shape="circle"
                size="sm"
                color={statusColorMap[collection.status]}
                className="font-normal border-transparent"
              >
                {collection.status}
              </Badge>
            </div>
            {collection.featured && (
              <div className="absolute left-4 top-4 z-10 flex size-8 items-center justify-center rounded-full border border-border/50 bg-card/90 text-warning shadow-md">
                <Star className="size-4 fill-warning" />
              </div>
            )}
          </div>

          {collection.thumbnail && (
            <div className="absolute -bottom-16 right-16 size-36 overflow-hidden rounded-2xl border-2 border-card bg-muted shadow-md">
              <Image
                src={collection.thumbnail}
                alt={`${collection.name} thumbnail`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6 pt-6">
          <h3
            className="truncate font-openrunde text-heading text-foreground"
            title={collection.name}
          >
            {collection.name}
          </h3>
          <p className="mt-2 truncate font-mono text-caption text-muted-foreground-lighter">
            /{collection.slug}
          </p>

          <p className="mt-4 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
            {collection.description || "No description provided for this collection."}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <AvatarGroup items={productItems} max={4} emptyLabel="No products" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
            <div className="flex flex-col">
              <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground-lighter">
                Revenue
              </span>
              <span className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                {formatCurrency(collection.revenue)}
                {collection.growthYoY !== 0 && (
                  <span
                    className={`flex items-center text-caption font-medium ${
                      collection.growthYoY >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    <TrendingUp className="mr-1 size-4" />
                    {collection.growthYoY}%
                  </span>
                )}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground-lighter">
                Views
              </span>
              <span className="mt-2 text-sm font-semibold text-foreground">
                {new Intl.NumberFormat("en-US").format(collection.views)}
              </span>
            </div>
          </div>
        </div>

        {/* Hover Actions Overlay (centered over the whole card) */}
        <div className="absolute inset-0 z-20 flex items-center justify-center gap-4 bg-primary/20 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
          <IconButton
            type="button"
            shape="circle"
            variant="contained"
            color="surface"
            onClick={() => onEditClick(collection)}
            title="Edit collection"
          >
            <Edit2 />
          </IconButton>
          <IconButton
            type="button"
            shape="circle"
            variant="contained"
            color="surface"
            onClick={() => onToggleFeatured(collection.id)}
            title={collection.featured ? "Remove featured" : "Mark featured"}
          >
            <Star className={collection.featured ? "fill-warning text-warning" : ""} />
          </IconButton>
          <IconButton
            type="button"
            shape="circle"
            variant="contained"
            color="surface"
            onClick={() => onDeleteClick(collection.id)}
            title="Delete collection"
          >
            <Trash2 />
          </IconButton>
        </div>
      </div>
    </>
  );
}
