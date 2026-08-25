"use client";

import { formatCurrency } from "@/lib/utils";
import { useWatch } from "react-hook-form";
import Image from "next/image";
import { Star, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { Badge } from "@/components/ui/data-display/badge";
import { AvatarGroup, type AvatarGroupItem } from "@/components/ui/data-display/avatar-group";
import type { Collection } from "@/lib/admin/mocks/types";
import type { CollectionFormValues } from "@/lib/admin/schemas/catalog/collection-form-schema";
import { useProductsQuery } from "@/hooks/admin/products";

const statusColorMap: Record<Collection["status"], "success" | "warning" | "neutral"> = {
  Active: "success",
  Draft: "warning",
  Archived: "neutral",
};

export function CollectionLivePreview() {
  const values = useWatch<CollectionFormValues>() as CollectionFormValues;
  const { data: products = [] } = useProductsQuery();

  const name = values.name?.trim() || "Collection name";
  const slug = values.slug?.trim() || "collection-slug";
  const status = values.status ?? "Active";
  const selectedProducts = products.filter((p) => values.products?.includes(p.id));
  const productItems: AvatarGroupItem[] = selectedProducts.map((p) => ({
    id: p.id,
    src: p.image,
    alt: p.name,
    fallback: p.name.slice(0, 2).toUpperCase(),
    tooltip: p.name,
  }));

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium leading-tight text-foreground">Live Preview</h2>
        <p className="text-xs text-muted-foreground-lighter">
          A real-time look at the storefront collection card.
        </p>
      </div>

      <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3">
        <div className="relative">
          <div className="aspect-banner relative w-full overflow-hidden bg-muted">
            {values.banner ? (
              <Image
                src={values.banner}
                alt={name}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-caption text-muted-foreground-lighter">
                Banner preview
              </div>
            )}
            <div className="absolute right-4 top-4">
              <Badge
                variant="soft"
                shape="circle"
                size="sm"
                color={statusColorMap[status]}
                className="font-normal border-transparent"
              >
                {status}
              </Badge>
            </div>
            {values.featured && (
              <div className="absolute left-4 top-4 flex size-8 items-center justify-center rounded-full border border-border/50 bg-card/90 text-warning shadow-md">
                <Star className="size-4 fill-warning" />
              </div>
            )}
          </div>

          {values.thumbnail && (
            <div className="absolute -bottom-12 right-8 size-20 overflow-hidden rounded-2xl border-2 border-card bg-muted shadow-md">
              <Image
                src={values.thumbnail}
                alt={`${name} thumbnail`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col p-6 pt-6">
          <h3 className="truncate font-openrunde text-heading text-foreground" title={name}>
            {name}
          </h3>
          <p className="mt-1 truncate font-mono text-caption text-muted-foreground-lighter">
            /{slug}
          </p>

          <div className="mt-2 flex items-center gap-4">
            <AvatarGroup items={productItems} max={4} emptyLabel="No products selected yet" />
          </div>
        </div>
      </div>
    </Card>
  );
}
