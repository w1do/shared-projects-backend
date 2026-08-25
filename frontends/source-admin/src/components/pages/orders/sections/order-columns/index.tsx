"use client";

import { Avatar } from "@/components/ui/data-display/avatar";
import { AvatarGroup, type AvatarGroupItem } from "@/components/ui/data-display/avatar-group";
import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";
import { formatPlacedTime } from "@/components/pages/orders/utils";
import { StatusBadge } from "../order-status-badge";
import { OrderRowActions } from "../order-row-actions";

interface OrderColumnsOptions {
  onOrderClick: (order: DetailedOrder) => void;
  onUpdateStatus: (orderId: string, newStatus: DetailedOrder["status"]) => void;
}

export const getOrderColumns = ({
  onOrderClick,
  onUpdateStatus,
}: OrderColumnsOptions): ColumnDef<DetailedOrder>[] => [
  {
    field: "id",
    headerName: "Order ID",
    width: 144,
    headerClassName: "pl-4 md:pl-6",
    cellClassName: "pl-4 md:pl-6",
    renderCell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-foreground">{row.id}</span>
    ),
  },
  {
    field: "customer",
    headerName: "Customer",
    width: 256,
    renderCell: ({ row }) => (
      <div className="flex items-center gap-4">
        <Avatar
          src={row.customer.avatarUrl}
          className="size-8 border border-border/80"
          fallbackClassName="bg-primary/10 text-primary font-semibold text-caption"
        >
          {row.customer.initials}
        </Avatar>
        <div className="flex min-w-0 flex-col gap-2 text-caption">
          <span className="max-w-40 truncate font-semibold text-foreground">
            {row.customer.name}
          </span>
          <span className="max-w-40 truncate text-muted-foreground-lighter">
            {row.customer.email}
          </span>
        </div>
      </div>
    ),
  },
  {
    field: "items",
    headerName: "Items Purchased",
    renderCell: ({ row }) => {
      const itemsCount = row.items.reduce((acc, item) => acc + item.quantity, 0);
      const itemAvatars: AvatarGroupItem[] = row.items.map((item) => ({
        id: item.id,
        src: item.image,
        alt: item.name,
        fallback: item.brand.slice(0, 1),
        gradient: item.gradient,
        tooltip: item.name,
      }));

      return (
        <div className="flex items-center gap-4">
          <AvatarGroup items={itemAvatars} max={3} gradientTextTone="paper" />
          <span className="text-muted-foreground-lighter font-medium text-caption">
            {itemsCount} item{itemsCount > 1 ? "s" : ""} ordered
          </span>
        </div>
      );
    },
  },
  {
    field: "placedAt",
    headerName: "Placed At",
    width: 144,
    sortable: true,
    renderCell: ({ row }) => (
      <span className="text-muted-foreground text-caption">{formatPlacedTime(row.placedAt)}</span>
    ),
  },
  {
    field: "status",
    headerName: "Order Status",
    width: 136,
    renderCell: ({ row }) => <StatusBadge status={row.status} />,
  },
  {
    field: "paymentMethod",
    headerName: "Method",
    width: 136,
    renderCell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-caption">
        {row.paymentMethod === "Credit Card" ? "Visa/AMEX" : row.paymentMethod}
      </span>
    ),
  },
  {
    field: "total",
    headerName: "Grand Total",
    width: 136,
    sortable: true,
    renderCell: ({ row }) => (
      <span className="font-semibold text-foreground text-xs">${row.total.toFixed(2)}</span>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 80,
    align: "right",
    headerClassName: "pr-4 md:pr-6",
    cellClassName: "pr-4 md:pr-6",
    renderCell: ({ row }) => (
      <OrderRowActions order={row} onOrderClick={onOrderClick} onUpdateStatus={onUpdateStatus} />
    ),
  },
];
