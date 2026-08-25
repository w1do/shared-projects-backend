"use client";

import { formatCurrency } from "@/lib/utils";
import { formatAdminNumber as formatNumber } from "@/lib/admin/formatters";
import { Warehouse } from "lucide-react";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";
import { Progress } from "@/components/ui/feedback/progress";
import type { InventoryItem } from "@/lib/admin/mocks/types";
import { InventoryRowActions } from "../inventory-row-actions";

export interface InventoryColumnsOptions {
  onEditClick: (item: InventoryItem) => void;
  onQuickAdjust: (id: string, delta: number) => void;
}

export const getInventoryColumns = ({
  onEditClick,
  onQuickAdjust,
}: InventoryColumnsOptions): ColumnDef<InventoryItem>[] => [
  {
    field: "name",
    headerName: "Product",
    width: "320px",
    sortable: true,
    headerClassName: "pl-4 md:pl-6",
    cellClassName: "pl-4 md:pl-6",
    renderCell: ({ row }) => (
      <div className="flex items-center gap-4">
        <Avatar src={row.image} alt={row.name} size="lg" shape="rounded">
          <Warehouse className="size-4" />
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-body-lg font-semibold text-foreground">{row.name}</p>
          <Badge variant="soft" color="neutral" size="sm">
            {row.brand}
          </Badge>
        </div>
      </div>
    ),
  },
  {
    field: "stock",
    headerName: "Stock Level",
    width: "224px",
    sortable: true,
    renderCell: ({ row }) => {
      const healthRatio = Math.min(
        100,
        row.threshold > 0 ? (row.stock / (row.threshold * 2)) * 100 : 100,
      );
      return (
        <div className="flex w-40 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-body font-semibold text-foreground">
              {formatNumber(row.stock)} units
            </span>
            <span className="text-caption text-muted-foreground-lighter">
              alert at {row.threshold}
            </span>
          </div>
          <Progress
            value={healthRatio}
            colors={row.stockStatus === "Out of Stock" ? "destructive" : "primary"}
          />
        </div>
      );
    },
  },
  {
    field: "stockStatus",
    headerName: "Status",
    width: "128px",
    renderCell: ({ row }) => (
      <Badge
        variant="soft"
        color={
          row.stockStatus === "Out of Stock"
            ? "error"
            : row.stockStatus === "Low Stock"
              ? "secondary"
              : "success"
        }
        shape="circle"
      >
        {row.stockStatus}
      </Badge>
    ),
  },
  {
    field: "incoming",
    headerName: "Incoming",
    width: "144px",
    sortable: true,
    renderCell: ({ row }) =>
      row.incoming > 0 ? (
        <Badge variant="soft" color="success" shape="circle">
          +{formatNumber(row.incoming)} incoming
        </Badge>
      ) : (
        <span className="text-xs italic text-muted-foreground-lighter">-</span>
      ),
  },
  {
    field: "price",
    headerName: "Price",
    width: "112px",
    sortable: true,
    cellClassName: "text-body text-muted-foreground",
    renderCell: ({ value }) => formatCurrency(value as number),
  },
  {
    field: "value",
    headerName: "Stock Value",
    width: "144px",
    sortable: true,
    cellClassName: "text-body-lg font-semibold text-foreground",
    renderCell: ({ row }) => formatCurrency(row.stock * row.price),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: "80px",
    align: "right",
    headerClassName: "pr-16 md:pr-6",
    cellClassName: "pr-16 md:pr-6 text-right",
    renderCell: ({ row }) => (
      <InventoryRowActions item={row} onEditClick={onEditClick} onQuickAdjust={onQuickAdjust} />
    ),
  },
];
