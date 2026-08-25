"use client";

import { Badge } from "@/components/ui/data-display/badge";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";

interface StatusBadgeProps {
  status: DetailedOrder["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "Paid":
      return (
        <Badge color="success" shape="circle">
          Paid
        </Badge>
      );
    case "Processing":
      return (
        <Badge color="primary" shape="circle">
          Processing
        </Badge>
      );
    case "Shipped":
      return (
        <Badge color="info" shape="circle">
          Shipped
        </Badge>
      );
    case "Refunded":
      return (
        <Badge color="error" shape="circle">
          Refunded
        </Badge>
      );
    case "Pending":
    default:
      return (
        <Badge color="secondary" shape="circle">
          Pending
        </Badge>
      );
  }
}
