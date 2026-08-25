"use client";

import { Eye, Ban, Trash2, Undo2 } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";

const tierColorSystemMap: Record<DetailedCustomer["tier"], "primary" | "warning" | "neutral"> = {
  Platinum: "primary",
  Gold: "warning",
  Silver: "neutral",
  Bronze: "neutral",
};

const skinTypeColorSystemMap: Record<
  DetailedCustomer["skinProfile"]["skinType"],
  "error" | "primary" | "success" | "secondary" | "neutral"
> = {
  Sensitive: "error",
  Dry: "primary",
  Oily: "success",
  Combination: "secondary",
  Normal: "neutral",
};

interface CustomerColumnsOptions {
  onCustomerClick: (customer: DetailedCustomer) => void;
  /** Блокировка/разблокировка пользователя проекта. */
  onToggleBlocked: (customer: DetailedCustomer) => void;
  onDeleteCustomer: (customer: DetailedCustomer) => void;
}

export const getCustomerColumns = ({
  onCustomerClick,
  onToggleBlocked,
  onDeleteCustomer,
}: CustomerColumnsOptions): ColumnDef<DetailedCustomer>[] => [
  {
    field: "id",
    headerName: "Customer ID",
    width: 144,
    headerClassName: "pl-4 md:pl-6",
    cellClassName: "pl-4 md:pl-6",
    renderCell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-foreground">{row.id}</span>
    ),
  },
  {
    field: "name",
    headerName: "Customer",
    width: 256,
    renderCell: ({ row }) => {
      const gradientId = `customer-row-${row.id}`;
      return (
        <div className="flex items-center gap-4">
          <AdminDynamicStyles
            gradients={[{ id: gradientId, start: row.gradient[0], end: row.gradient[1] }]}
          />
          <Avatar src={row.avatarUrl} data-admin-gradient={gradientId}>
            {row.avatar}
          </Avatar>
          <div className="flex min-w-0 flex-col gap-2 text-caption">
            <span className="max-w-40 truncate font-semibold text-foreground">{row.name}</span>
            <span className="max-w-40 truncate text-muted-foreground-lighter">{row.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    field: "tier",
    headerName: "Loyalty Tier",
    width: 160,
    renderCell: ({ row }) => (
      <Badge
        variant="soft"
        shape="circle"
        size="sm"
        color={tierColorSystemMap[row.tier]}
        className="font-semibold border-transparent"
      >
        {row.tier}
      </Badge>
    ),
  },
  {
    field: "skinProfile",
    headerName: "Skin Profile",
    width: 224,
    renderCell: ({ row }) => (
      <div className="flex flex-col gap-2 items-start text-caption">
        <Badge variant="soft" size="sm" color={skinTypeColorSystemMap[row.skinProfile.skinType]}>
          {row.skinProfile.skinType}
        </Badge>
        <span className="text-muted-foreground-lighter truncate max-w-48">
          {row.skinProfile.skinConcerns.join(", ")}
        </span>
      </div>
    ),
  },
  {
    field: "totalOrders",
    headerName: "Orders",
    width: 128,
    sortable: true,
    renderCell: ({ row }) => (
      <span className="text-foreground font-semibold text-xs">
        {row.totalOrders} order{row.totalOrders > 1 ? "s" : ""}
      </span>
    ),
  },
  {
    field: "totalSpent",
    headerName: "Total Spent",
    width: 128,
    sortable: true,
    renderCell: ({ row }) => (
      <span className="font-semibold text-foreground text-xs">${row.totalSpent.toFixed(2)}</span>
    ),
  },
  {
    field: "joinedAt",
    headerName: "Joined Date",
    width: 160,
    sortable: true,
    renderCell: ({ row }) => (
      <span className="text-muted-foreground text-caption">
        {new Date(row.joinedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 168,
    align: "right",
    headerClassName: "pr-4 md:pr-6",
    cellClassName: "pr-4 md:pr-6",
    renderCell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <IconButton
          variant="ghost"
          size="sm"
          shape="circle"
          onClick={() => onCustomerClick(row)}
          aria-label="View profile"
        >
          <Eye />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          shape="circle"
          onClick={() => onToggleBlocked(row)}
          aria-label={row.status === "Active" ? "Block customer" : "Unblock customer"}
        >
          {row.status === "Active" ? <Ban /> : <Undo2 />}
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          shape="circle"
          color="error"
          onClick={() => onDeleteCustomer(row)}
          aria-label="Delete customer"
        >
          <Trash2 />
        </IconButton>
      </div>
    ),
  },
];
