"use client";

import * as React from "react";
import type { Brand } from "@/lib/admin/mocks/types";
import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import { Badge } from "@/components/ui/data-display/badge";
import { Progress } from "@/components/ui/feedback/progress";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Sparkline } from "@/components/icons/Sparkline";
import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";
import { BrandRowActions } from "./BrandRowActions";

export interface BrandColumnsOptions {
  onDelete: (id: string) => void;
  formatCurrency: (value: number) => string;
  onPreview?: (brand: Brand) => void;
  brandDetails?: Record<string, Partial<BrandFormValues>>;
}

export const getBrandColumns = ({
  onDelete,
  formatCurrency,
  onPreview,
  brandDetails,
}: BrandColumnsOptions): ColumnDef<Brand>[] => [
  {
    field: "name",
    headerName: "Brand",
    width: "280px",
    sortable: true,
    renderCell: ({ row }) => {
      const details = brandDetails?.[row.id];
      const thumbnail = details?.thumbnail || details?.logo?.[0];

      return (
        <div className="flex items-center gap-4">
          <Avatar
            src={thumbnail}
            alt={row.name}
            fallback={row.monogram}
            fallbackShadow="none"
            className="border border-accent/20"
            fallbackClassName="bg-accent/35 text-xs font-semibold text-brand-accent font-serif shadow-none"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-body-lg text-foreground font-semibold truncate">{row.name}</span>
            <span className="text-xs text-muted-foreground-lighter truncate">id: {row.id}</span>
          </div>
        </div>
      );
    },
  },
  {
    field: "revenue",
    headerName: "Revenue",
    width: "140px",
    sortable: true,
    cellClassName: "font-openrunde text-base text-foreground",
    renderCell: ({ value }) => formatCurrency(value as number),
  },
  {
    field: "share",
    headerName: "Market Share",
    width: "200px",
    sortable: true,
    renderCell: ({ row }) => (
      <div className="flex items-center gap-4">
        <Progress value={row.share} className="w-24 shrink-0" />
        <span className="text-xs text-muted-foreground font-medium w-8">{row.share}%</span>
      </div>
    ),
  },
  {
    field: "trend",
    headerName: "Trend (12m)",
    width: "160px",
    renderCell: ({ row }) => (
      <Sparkline
        data={row.trend}
        positive={row.delta >= 0}
        label={`${row.name} trend over 12 months`}
      />
    ),
  },
  {
    field: "delta",
    headerName: "Growth YoY",
    width: "140px",
    sortable: true,
    renderCell: ({ row }) => (
      <Badge variant="soft" shape="circle" colors={row.delta >= 0 ? "success" : "error"}>
        {row.delta >= 0 ? "+" : ""}
        {row.delta}%
      </Badge>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: "80px",
    align: "right",
    headerClassName: "w-20 pr-4 md:pr-6",
    cellClassName: "w-20 pr-4 md:pr-6 text-right",
    renderCell: ({ row }) => (
      <BrandRowActions brand={row} onDelete={onDelete} onPreview={onPreview} />
    ),
  },
];
