import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { ColumnDef } from "@/components/ui/data-display/data-grid";
import { Order } from "@/lib/admin/mocks/types";
import { formatCurrency } from "@/lib/utils";

const statusBadgeProps: Record<
  string,
  {
    color: "success" | "error" | "secondary" | "neutral" | "info";
    className?: string;
  }
> = {
  Paid: { color: "success" },
  Processing: { color: "info" },
  Shipped: { color: "secondary" },
  Pending: { color: "neutral" },
  Refunded: { color: "error" },
};

export const columns: ColumnDef<Order>[] = [
  {
    field: "customer",
    headerName: "Customer",
    width: 220,
    cellClassName: "px-0 py-4",
    headerClassName: "px-0",
    renderCell: ({ row: o }) => (
      <div className="flex items-center gap-4">
        <Avatar src={o.customer.avatarUrl}>{o.customer.initials}</Avatar>
        <div className="min-w-0">
          <div className="text-caption font-medium text-foreground truncate">
            {o.customer.name}
          </div>
          <div className="text-xs text-muted-foreground-lighter truncate">
            {o.id} · {o.placedAt}
          </div>
        </div>
      </div>
    ),
  },
  {
    field: "items",
    headerName: "Items",
    headerClassName: "hidden md:table-cell",
    cellClassName: "py-4 hidden md:table-cell",
    renderCell: ({ row: o }) => (
      <div>
        <div className="truncate text-xs text-muted-foreground max-w-60 w-full">
          {o.items}
        </div>
        <div className="text-xs text-muted-foreground-lighter">
          {o.itemCount} item{o.itemCount > 1 ? "s" : ""}
        </div>
      </div>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    cellClassName: "py-4",
    renderCell: ({ row: o }) => {
      const badgeInfo = statusBadgeProps[o.status] || { color: "neutral" };
      return (
        <Badge variant="soft" color={badgeInfo.color} shape="circle">
          {o.status}
        </Badge>
      );
    },
  },
  {
    field: "total",
    headerName: "Total",
    width: 120,
    align: "right",
    headerClassName: "text-right pr-0",
    cellClassName:
      "text-right pr-0 py-4 font-openrunde text-base text-foreground",
    renderCell: ({ row: o }) => formatCurrency(o.total),
  },
];
