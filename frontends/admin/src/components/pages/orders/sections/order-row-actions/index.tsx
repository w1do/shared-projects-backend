"use client";

import { Eye, MoreHorizontal, RotateCcw, Check } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";

interface OrderRowActionsProps {
  order: DetailedOrder;
  onOrderClick: (order: DetailedOrder) => void;
  onUpdateStatus: (orderId: string, newStatus: DetailedOrder["status"]) => void;
}

const NEXT_STATUS_ACTION: Partial<
  Record<DetailedOrder["status"], { label: string; next: DetailedOrder["status"] }>
> = {
  Pending: { label: "Confirm Paid", next: "Paid" },
  Paid: { label: "Start Processing", next: "Processing" },
  Processing: { label: "Mark Shipped", next: "Shipped" },
};

export function OrderRowActions({ order, onOrderClick, onUpdateStatus }: OrderRowActionsProps) {
  const advance = NEXT_STATUS_ACTION[order.status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton variant="ghost" size="sm" shape="circle" aria-label="Order actions">
          <MoreHorizontal className="size-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" size="sm">
        <DropdownMenuItem onClick={() => onOrderClick(order)}>
          <Eye className="size-4" />
          <span>View details</span>
        </DropdownMenuItem>

        {advance && (
          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, advance.next)}>
            <Check className="size-4" />
            <span>{advance.label}</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => onUpdateStatus(order.id, "Refunded")}
          disabled={order.status === "Refunded"}
          variant="destructive"
        >
          <RotateCcw className="size-4" />
          <span>Refund order</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
