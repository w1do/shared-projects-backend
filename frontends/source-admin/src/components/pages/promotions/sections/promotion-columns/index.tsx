"use client";

import { Badge } from "@/components/ui/data-display/badge";
import { Progress } from "@/components/ui/feedback/progress";
import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import { statusBadgeColor } from "@/components/pages/promotions/config/filters";
import { formatPromoDate, formatReward, usagePercent } from "@/components/pages/promotions/utils";
import { PromotionRowActions } from "../promotion-row-actions";

interface PromotionColumnsOptions {
  onViewDetails: (promotion: Promotion) => void;
  onEdit: (promotion: Promotion) => void;
  onToggleStatus: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
}

export const getPromotionColumns = ({
  onViewDetails,
  onEdit,
  onToggleStatus,
  onDelete,
}: PromotionColumnsOptions): ColumnDef<Promotion>[] => [
  {
    field: "code",
    headerName: "Code",
    width: 224,
    headerClassName: "pl-4 md:pl-6",
    cellClassName: "pl-4 md:pl-6",
    renderCell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-2">
        <span className="w-fit rounded-lg bg-muted px-2 py-2 font-mono text-xs font-semibold text-foreground">
          {row.code}
        </span>
        <span className="max-w-48 truncate text-caption text-muted-foreground-lighter">
          {row.title}
        </span>
      </div>
    ),
  },
  {
    field: "type",
    headerName: "Type",
    width: 168,
    renderCell: ({ row }) => (
      <Badge color="muted" shape="circle">
        {row.type}
      </Badge>
    ),
  },
  {
    field: "reward",
    headerName: "Reward",
    width: 144,
    renderCell: ({ row }) => (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-foreground">{formatReward(row)}</span>
        <span className="text-caption text-muted-foreground-lighter">
          {row.minSpend > 0 ? `Min $${row.minSpend}` : "No minimum"}
        </span>
      </div>
    ),
  },
  {
    field: "used",
    headerName: "Usage",
    width: 192,
    sortable: true,
    renderCell: ({ row }) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-caption text-muted-foreground">
          <span>{row.used.toLocaleString()}</span>
          <span className="text-muted-foreground-lighter">{usagePercent(row)}%</span>
        </div>
        <Progress value={usagePercent(row)} size="sm" />
      </div>
    ),
  },
  {
    field: "endsAt",
    headerName: "Schedule",
    width: 168,
    sortable: true,
    renderCell: ({ row }) => (
      <div className="flex flex-col gap-2 text-caption">
        <span className="text-muted-foreground">{formatPromoDate(row.startsAt)}</span>
        <span className="text-muted-foreground-lighter">to {formatPromoDate(row.endsAt)}</span>
      </div>
    ),
  },
  {
    field: "revenue",
    headerName: "Revenue",
    width: 136,
    sortable: true,
    renderCell: ({ row }) => (
      <span className="font-sans text-base text-foreground">
        ${row.revenue.toLocaleString("en-US")}
      </span>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 136,
    renderCell: ({ row }) => (
      <Badge color={statusBadgeColor(row.status)} shape="circle">
        {row.status}
      </Badge>
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
      <PromotionRowActions
        promotion={row}
        onViewDetails={onViewDetails}
        onEdit={onEdit}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />
    ),
  },
];
