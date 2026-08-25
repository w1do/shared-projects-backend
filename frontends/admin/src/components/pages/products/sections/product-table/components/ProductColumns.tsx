import * as React from "react";
import { MoreHorizontal, Pencil, Eye, Archive, Trash2 } from "lucide-react";
import type { ProductFull } from "@/lib/admin/mock";
import { formatCurrency, statusBadge, stockBadge } from "@/lib/admin/products-helpers";
import { Badge } from "@/components/ui/data-display/badge";
import { IconButton } from "@/components/ui/inputs/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";
import { ProductInfoCell } from "./ProductInfoCell";

export interface ProductColumnsOptions {
  onPreview?: (product: ProductFull) => void;
  onEdit?: (product: ProductFull) => void;
  onArchive?: (product: ProductFull) => void;
  onDelete?: (product: ProductFull) => void;
  userRole?: string;
}

export const getProductColumns = ({
  onPreview,
  onEdit,
  onArchive,
  onDelete,
  userRole,
}: ProductColumnsOptions = {}): ColumnDef<ProductFull>[] => [
  {
    field: "name",
    headerName: "Product",
    width: "360px",
    sortable: true,
    renderCell: ({ row, index }) => <ProductInfoCell product={row} priority={index < 4} />,
  },
  {
    field: "stock",
    headerName: "Stock",
    width: "128px",
    sortable: true,
    renderCell: ({ row }) => {
      const stock = stockBadge[row.stockStatus] || { colors: "muted" as const, className: "" };
      return (
        <div className="flex flex-col items-start gap-1">
          <Badge variant="soft" size="sm" colors={stock.colors} shape="circle">
            {row.stockStatus}
          </Badge>
          <span className="text-xs text-muted-foreground-lighter">{row.stock} units</span>
        </div>
      );
    },
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: "128px",
    sortable: true,
    headerClassName: "hidden xl:table-cell",
    cellClassName: "hidden xl:table-cell font-mono text-xs text-muted-foreground",
    renderCell: ({ value }) =>
      formatDate(value instanceof Date ? value.toISOString() : String(value ?? "")),
  },
  {
    field: "status",
    headerName: "Status",
    width: "128px",
    headerClassName: "hidden sm:table-cell",
    cellClassName: "hidden sm:table-cell",
    renderCell: ({ value }) => {
      const s = String(value ?? "") as ProductFull["status"];
      const status = statusBadge[s] || {
        colors: "muted" as const,
        label: s || "Unknown",
      };
      return (
        <Badge variant="soft" colors={status.colors} shape="circle">
          {status.label}
        </Badge>
      );
    },
  },
  {
    field: "price",
    headerName: "Price",
    width: "96px",
    sortable: true,
    align: "right",
    cellClassName: "font-openrunde text-base text-foreground",
    renderCell: ({ value }) => formatCurrency(value as number),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: "80px",
    align: "right",
    headerClassName: "w-20 pr-4 md:pr-6",
    cellClassName: "w-20 pr-4 md:pr-6 text-right",
    renderCell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton variant="ghost" size="sm" shape="circle" aria-label="Product actions">
            <MoreHorizontal />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onPreview?.(row)}>
            <Eye />
            Quick preview
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit?.(row)}>
            <Pencil />
            Edit product
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {userRole !== "staff" && (
            <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(row)}>
              <Trash2 />
              Delete product
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
