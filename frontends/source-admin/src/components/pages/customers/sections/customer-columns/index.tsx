"use client";

import { Eye, Ban, Trash2, Undo2 } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";
import type { CustomerTier, DetailedCustomer } from "@/lib/admin/mocks/customers";
import { t } from "@/lib/admin/console-texts";
import {
  customerSkinConcernLabel,
  customerSkinTypeLabel,
  customerTierLabel,
} from "@/components/pages/customers/utils";

const tierColorSystemMap: Record<CustomerTier, "primary" | "warning" | "neutral"> = {
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
  /** Колонка уровня лояльности — только когда данные её несут (демо-шаблон). */
  showTier?: boolean;
}

export const getCustomerColumns = ({
  onCustomerClick,
  onToggleBlocked,
  onDeleteCustomer,
  showTier = true,
}: CustomerColumnsOptions): ColumnDef<DetailedCustomer>[] => [
  {
    field: "id",
    headerName: t("console.customers.column.id"),
    width: 144,
    headerClassName: "pl-4 md:pl-6",
    cellClassName: "pl-4 md:pl-6",
    renderCell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-foreground">{row.id}</span>
    ),
  },
  {
    field: "name",
    headerName: t("console.customers.column.name"),
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
  ...(showTier
    ? [
        {
          field: "tier",
          headerName: t("console.customers.column.tier"),
          width: 160,
          renderCell: ({ row }) =>
            row.tier ? (
              <Badge
                variant="soft"
                shape="circle"
                size="sm"
                color={tierColorSystemMap[row.tier]}
                className="font-semibold border-transparent"
              >
                {customerTierLabel(row.tier)}
              </Badge>
            ) : null,
        } satisfies ColumnDef<DetailedCustomer>,
      ]
    : []),
  {
    field: "skinProfile",
    headerName: t("console.customers.column.skin-profile"),
    width: 224,
    renderCell: ({ row }) => (
      <div className="flex flex-col gap-2 items-start text-caption">
        <Badge variant="soft" size="sm" color={skinTypeColorSystemMap[row.skinProfile.skinType]}>
          {customerSkinTypeLabel(row.skinProfile.skinType)}
        </Badge>
        <span className="text-muted-foreground-lighter truncate max-w-48">
          {row.skinProfile.skinConcerns.map(customerSkinConcernLabel).join(", ")}
        </span>
      </div>
    ),
  },
  {
    field: "totalOrders",
    headerName: t("console.customers.column.orders"),
    width: 128,
    sortable: true,
    renderCell: ({ row }) => (
      <span className="text-foreground font-semibold text-xs">
        {t("console.customers.orders-count").replace("{count}", String(row.totalOrders))}
      </span>
    ),
  },
  {
    field: "totalSpent",
    headerName: t("console.customers.column.spent"),
    width: 128,
    sortable: true,
    renderCell: ({ row }) => (
      <span className="font-semibold text-foreground text-xs">${row.totalSpent.toFixed(2)}</span>
    ),
  },
  {
    field: "joinedAt",
    headerName: t("console.customers.column.joined"),
    width: 160,
    sortable: true,
    renderCell: ({ row }) => (
      <span className="text-muted-foreground text-caption">
        {new Date(row.joinedAt).toLocaleDateString("ru-RU", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    field: "actions",
    headerName: t("console.common.actions"),
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
          aria-label={t("console.customers.action.view")}
        >
          <Eye />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          shape="circle"
          onClick={() => onToggleBlocked(row)}
          aria-label={
            row.status === "Active"
              ? t("console.customers.action.block")
              : t("console.customers.action.unblock")
          }
        >
          {row.status === "Active" ? <Ban /> : <Undo2 />}
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          shape="circle"
          color="error"
          onClick={() => onDeleteCustomer(row)}
          aria-label={t("console.customers.action.delete")}
        >
          <Trash2 />
        </IconButton>
      </div>
    ),
  },
];
