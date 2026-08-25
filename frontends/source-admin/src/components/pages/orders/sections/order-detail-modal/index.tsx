"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/inputs/button";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { Separator } from "@/components/ui/data-display/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { Skeleton } from "@/components/ui/data-display/skeleton";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";
import { StatusBadge } from "../order-status-badge";
import { OrderDetailLoadingState } from "./loading/OrderDetailLoadingState";
import { TimelineStepper } from "./sections/timeline-stepper";
import { OrderItemsList } from "./sections/order-items-list";
import { CustomerCard } from "./sections/customer-card";
import { FulfillmentActions } from "./sections/fulfillment-actions";
import { FinancialBreakdown } from "./sections/financial-breakdown";

interface OrderDetailModalProps {
  order: DetailedOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: DetailedOrder["status"]) => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}: OrderDetailModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!order) return null;
  const orderDate = new Date(order.placedAt).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="wide" padding="none" radius="3xl" scroll className="overflow-hidden">
        <div className="flex flex-col max-h-modal-scroll min-h-0 w-full">
          <DialogHeader className="border-b border-border/50 p-6 pb-4 text-left flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-caption font-semibold tracking-wide text-muted-foreground-lighter uppercase">
                  Order Detail
                </span>
                <DialogTitle className="flex items-center gap-2 text-heading font-semibold">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-6 w-32 rounded-sm animate-pulse" />
                      <Skeleton className="h-6 w-16 rounded-full animate-pulse" />
                      <span className="sr-only">Loading order details...</span>
                    </>
                  ) : (
                    <>
                      {order.id}
                      <StatusBadge status={order.status} />
                    </>
                  )}
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2 mr-6">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-24 rounded-full" />
                  </div>
                ) : (
                  <>
                    <FulfillmentActions
                      status={order.status}
                      onUpdateStatus={(newStatus) => onUpdateStatus(order.id, newStatus)}
                    />
                    <Button
                      variant="contained"
                      shape="circle"
                      startIcon={<FileText className="size-4" />}
                      onClick={() => toast.success(`Generating PDF invoice for ${order.id}...`)}
                    >
                      Invoice
                    </Button>
                  </>
                )}
              </div>
            </div>
            {isLoading ? (
              <div className="text-caption text-muted-foreground-lighter mt-2">
                <Skeleton className="h-4 w-48 rounded-sm" />
              </div>
            ) : (
              <DialogDescription className="text-caption text-muted-foreground-lighter mt-2">
                Placed on {orderDate}
              </DialogDescription>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 min-h-0">
            {isLoading ? (
              <OrderDetailLoadingState />
            ) : (
              <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7 flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                        Items Summary ({order.items.reduce((acc, item) => acc + item.quantity, 0)})
                      </span>
                      <span className="text-caption font-medium text-muted-foreground-lighter">
                        SKU Code
                      </span>
                    </div>
                    <OrderItemsList items={order.items} />
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-4">
                    <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                      Logistics & Carrier
                    </span>
                    <div className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/40 text-caption">
                      <div className="flex flex-col gap-2">
                        <span className="text-muted-foreground-lighter font-medium">Method</span>
                        <span className="text-muted-foreground font-semibold">
                          {order.shippingMethod}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className="text-muted-foreground-lighter font-medium">
                          Tracking Code
                        </span>
                        {order.trackingNumber ? (
                          <span className="font-mono font-semibold text-foreground">
                            {order.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground-lighter italic font-medium">
                            No tracking ID yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <FinancialBreakdown
                    subtotal={order.subtotal}
                    shippingFee={order.shippingFee}
                    tax={order.tax}
                    discount={order.discount}
                    total={order.total}
                  />
                </div>
                <div className="md:col-span-5 flex flex-col gap-6">
                  <CustomerCard customer={order.customer} paymentMethod={order.paymentMethod} />
                  <Separator />
                  <div className="flex flex-col gap-4">
                    <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                      Activity Log
                    </span>
                    <TimelineStepper timeline={order.timeline} />
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
