"use client";

import { RotateCcw, AlertTriangle, Truck } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";

interface FulfillmentActionsProps {
  status: DetailedOrder["status"];
  onUpdateStatus: (newStatus: DetailedOrder["status"], label: string) => void;
}

const ACTION_CONFIGS: Record<
  string,
  {
    targetStatus: DetailedOrder["status"];
    description: string;
    buttonText: string;
    icon?: React.ReactNode;
  }
> = {
  Pending: {
    targetStatus: "Paid",
    description: "Confirm payment cleared",
    buttonText: "Confirm Payment",
  },
  Paid: {
    targetStatus: "Processing",
    description: "Allocated warehouse items",
    buttonText: "Start Processing",
  },
  Processing: {
    targetStatus: "Shipped",
    description: "Dispatch package",
    buttonText: "Ship Package",
    icon: <Truck className="size-4" />,
  },
};

export function FulfillmentActions({ status, onUpdateStatus }: FulfillmentActionsProps) {
  const currentAction = ACTION_CONFIGS[status];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {currentAction && (
        <Button
          type="button"
          variant="outlined"
          color="primary"
          shape="circle"
          startIcon={currentAction.icon}
          onClick={() => onUpdateStatus(currentAction.targetStatus, currentAction.description)}
        >
          {currentAction.buttonText}
        </Button>
      )}

      {status !== "Refunded" && (
        <Button
          type="button"
          variant="ghost"
          color="error"
          shape="circle"
          onClick={() => onUpdateStatus("Refunded", "Refund customer")}
          startIcon={<RotateCcw className="size-4" />}
        >
          Refund Order
        </Button>
      )}

      {status === "Refunded" && (
        <div className="flex items-center gap-2 text-caption text-muted-foreground-lighter font-medium h-8">
          <AlertTriangle className="size-4 text-warning" />
          <span>Refunded</span>
        </div>
      )}
    </div>
  );
}
