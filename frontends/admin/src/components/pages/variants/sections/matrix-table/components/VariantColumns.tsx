import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ProductVariantItem } from "@/lib/admin/mocks/variants";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Badge } from "@/components/ui/data-display/badge";
import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";

export interface VariantColumnsOptions {
  baseProductName: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const getVariantColumns = ({
  baseProductName,
  onEdit,
  onDelete,
}: VariantColumnsOptions): ColumnDef<ProductVariantItem>[] => [
  {
    field: "combinationText",
    headerName: "Variant Combinations",
    width: 220,
    renderCell: ({ row }) => {
      const combinationText = Object.entries(row.options)
        .map(([_, val]) => val)
        .join(" · ");
      return <span className="text-foreground font-semibold">{combinationText}</span>;
    },
  },
  {
    field: "sku",
    headerName: "SKU",
    width: 150,
    renderCell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">{row.sku || "—"}</span>
    ),
  },
  {
    field: "price",
    headerName: "Price ($)",
    width: 90,
    renderCell: ({ row }) => (
      <span className="text-foreground font-medium">{`$${row.price.toFixed(2)}`}</span>
    ),
  },
  {
    field: "stock",
    headerName: "Stock",
    width: 80,
    renderCell: ({ row }) => <span className="text-muted-foreground font-normal">{row.stock}</span>,
  },
  {
    field: "status",
    headerName: "Status",
    width: 110,
    renderCell: ({ row }) => {
      const status = row.status || "Out of Stock";
      let badgeColor: "success" | "neutral" | "error" | "warning" = "neutral";
      if (status === "Active") badgeColor = "success";
      else if (status === "Out of Stock") badgeColor = "error";
      else if (status === "Disabled") badgeColor = "neutral";
      else if (status === "Draft") badgeColor = "warning";

      return (
        <Badge variant="soft" color={badgeColor} size="sm">
          {status}
        </Badge>
      );
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 90,
    align: "center",
    renderCell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(row.id)}
          title="Edit variant"
          className="hover:bg-muted"
        >
          <Pencil size={14} className="text-muted-foreground-lighter hover:text-foreground" />
        </IconButton>
        <IconButton
          type="button"
          variant="ghost"
          colors="error"
          size="sm"
          onClick={() => onDelete(row.id)}
          title="Remove variant"
          className="hover:bg-error/10 text-error/80 hover:text-error"
        >
          <Trash2 size={14} />
        </IconButton>
      </div>
    ),
  },
];
