"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Tooltip } from "@/components/ui/overlay/tooltip";
import type { ColumnDef } from "@/components/ui/data-display/data-grid";
import type { ParsedItem } from "@/lib/admin/inventory-import-helpers";

const renderErrors = (errors: string[]) => (
  <div className="space-y-2">
    <p className="font-semibold text-destructive text-micro">Errors:</p>
    {errors.map((err, i) => (
      <p key={i} className="text-micro">
        • {err}
      </p>
    ))}
  </div>
);

interface ColumnConfigProps {
  onRemoveItem: (id: string) => void;
  showFile: boolean;
}

export function getImportColumns({
  onRemoveItem,
  showFile,
}: ColumnConfigProps): ColumnDef<ParsedItem>[] {
  return [
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: ({ row }) =>
        row.isValid ? (
          <Badge variant="soft" color="success" size="sm">
            Valid
          </Badge>
        ) : (
          <Tooltip title={renderErrors(row.errors)}>
            <div className="cursor-help">
              <Badge variant="soft" color="error" size="sm">
                Invalid
              </Badge>
            </div>
          </Tooltip>
        ),
    },
    {
      field: "name",
      headerName: "Product Name",
      width: 240,
      renderCell: ({ row }) => (
        <div className="truncate max-w-56">
          <Tooltip title={row.name}>
            <span className="font-medium text-foreground">
              {row.name || <span className="text-destructive">Empty Name</span>}
            </span>
          </Tooltip>
          {showFile && (
            <div className="text-micro text-muted-foreground truncate font-normal">
              File: {row.fileName}
            </div>
          )}
        </div>
      ),
    },
    {
      field: "sku",
      headerName: "SKU",
      width: 140,
      renderCell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.sku || <span className="text-destructive">Empty SKU</span>}
        </span>
      ),
    },
    {
      field: "brand_category",
      headerName: "Brand & Category",
      width: 120,
      renderCell: ({ row }) => (
        <div>
          <div className="text-xs text-foreground font-medium">{row.brand}</div>
          <div className="text-micro text-muted-foreground">{row.category}</div>
        </div>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 90,
      renderCell: ({ row }) => <span className="font-medium">${row.price.toFixed(2)}</span>,
    },
    {
      field: "stock",
      headerName: "Stock / Incoming",
      width: 130,
      renderCell: ({ row }) => (
        <div>
          <div className="text-xs text-foreground">
            On hand: <strong>{row.stock}</strong>
          </div>
          <div className="text-micro text-muted-foreground">
            Incoming: {row.incoming} | Limit: {row.threshold}
          </div>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: ({ row }) => (
        <IconButton
          type="button"
          variant="ghost"
          color="error"
          size="sm"
          shape="circle"
          aria-label="Remove item"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveItem(row.id);
          }}
        >
          <Trash2 className="size-4" />
        </IconButton>
      ),
    },
  ];
}
