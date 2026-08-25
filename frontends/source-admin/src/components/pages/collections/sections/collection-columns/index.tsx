"use client";

import { formatCurrency } from "@/lib/utils";
import { Star } from "lucide-react";
import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";
import { Badge } from "@/components/ui/data-display/badge";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Avatar } from "@/components/ui/data-display/avatar";
import { AvatarGroup, type AvatarGroupItem } from "@/components/ui/data-display/avatar-group";
import { Sparkline } from "@/components/icons/Sparkline";
import type { Collection } from "@/lib/admin/mocks/types";
import { CollectionRowActions } from "../collection-row-actions";

export interface CollectionColumnsOptions {
  onEditClick: (collection: Collection) => void;
  onDeleteClick: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  products?: Array<{
    id: string;
    name: string;
    brand: string;
    price: number;
    image?: string;
    gradient?: string[];
  }>;
}

function buildTrendData(collection: Collection) {
  const hash = collection.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return [10, 15, 8, 14, 22, 19, 25, 22, 28, 30, 27, 35].map((value, index) =>
    Math.round(value + (hash % (index + 1))),
  );
}

export const getCollectionColumns = ({
  onEditClick,
  onDeleteClick,
  onToggleFeatured,
  products = [],
}: CollectionColumnsOptions): ColumnDef<Collection>[] => [
  {
    field: "name",
    headerName: "Collection",
    width: "288px",
    sortable: true,
    renderCell: ({ row }) => {
      return (
        <div className="flex items-center gap-4">
          <Avatar
            src={row.thumbnail}
            alt={row.name}
            fallback={row.name.slice(0, 2).toUpperCase()}
            size="lg"
            shape="rounded"
            className="border border-border/60 shadow-inner"
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-body-lg font-semibold text-foreground">{row.name}</span>
            <span className="truncate font-mono text-caption text-muted-foreground-lighter">
              /{row.slug}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    field: "products",
    headerName: "Products In Collection",
    width: "224px",
    renderCell: ({ row }) => {
      const associatedProducts =
        row.productItems ?? products.filter((p) => row.products.includes(p.id));
      const productItems: AvatarGroupItem[] = associatedProducts.map((p) => ({
        id: p.id,
        src: p.image,
        alt: p.name,
        fallback: p.name.slice(0, 2).toUpperCase(),
        gradient: p.gradient ? (p.gradient as unknown as readonly [string, string]) : undefined,
        tooltip: (
          <>
            <span className="font-semibold">{p.name}</span>
            <span className="text-border-hover">
              {p.brand} • {formatCurrency(p.price)}
            </span>
          </>
        ),
      }));

      return (
        <AvatarGroup items={productItems} max={3} tooltipVariant="rich" emptyLabel="No products" />
      );
    },
  },
  {
    field: "revenue",
    headerName: "Revenue",
    width: "144px",
    sortable: true,
    cellClassName: "text-body-lg font-medium text-foreground",
    renderCell: ({ value }) => formatCurrency(value as number),
  },
  {
    field: "views",
    headerName: "Views & Trend",
    width: "176px",
    sortable: true,
    renderCell: ({ row }) => (
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-body font-semibold text-foreground">
            {new Intl.NumberFormat("en-US").format(row.views)}
          </span>
          <span className="text-caption text-muted-foreground-lighter">views</span>
        </div>
        <Sparkline
          data={row.viewTrend?.length ? row.viewTrend : buildTrendData(row)}
          positive={row.growthYoY >= 0}
          label={`${row.name} views trend`}
        />
      </div>
    ),
  },
  {
    field: "growthYoY",
    headerName: "Growth YoY",
    width: "144px",
    sortable: true,
    renderCell: ({ row }) => (
      <Badge variant="soft" shape="circle" color={row.growthYoY >= 0 ? "success" : "destructive"}>
        {row.growthYoY >= 0 ? "+" : ""}
        {row.growthYoY}%
      </Badge>
    ),
  },
  {
    field: "featured",
    headerName: "Featured",
    width: "112px",
    renderCell: ({ row }) => (
      <IconButton
        variant="ghost"
        size="sm"
        isActive={row.featured}
        activeColor="warning"
        onClick={() => onToggleFeatured(row.id)}
        title={row.featured ? "Remove featured" : "Mark featured"}
      >
        <Star />
      </IconButton>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: "80px",
    align: "right",
    headerClassName: "pr-4 md:pr-6",
    cellClassName: "pr-4 md:pr-6 text-right",
    renderCell: ({ row }) => (
      <CollectionRowActions
        collection={row}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onToggleFeatured={onToggleFeatured}
      />
    ),
  },
];
