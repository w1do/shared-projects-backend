"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";
import { updateOrderTimeline } from "@/components/pages/orders/utils";
import { useOrdersQuery } from "./use-orders-query";
import { useUpdateOrderStatusMutation } from "./use-order-mutations";

type Options = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the products/dashboard pattern.
   */
  initialOrders?: DetailedOrder[];
};

/** Orders page data + status updates via TanStack Query. */
export function useOrdersPage(options: Options = {}) {
  const { initialOrders } = options;
  const hasSeed = initialOrders !== undefined;

  const { data, isPending } = useOrdersQuery({
    initialData: hasSeed ? initialOrders : undefined,
  });
  const statusMutation = useUpdateOrderStatusMutation();
  const orders = data ?? initialOrders ?? [];

  const [selectedOrder, setSelectedOrder] = useState<DetailedOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openOrder = (order: DetailedOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const updateStatus = (orderId: string, newStatus: DetailedOrder["status"]) => {
    const current = orders.find((order) => order.id === orderId);
    if (!current) return;

    const patched = updateOrderTimeline(current, newStatus);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(patched);
    }

    statusMutation.mutate(
      { id: orderId, status: newStatus, patchedOrder: patched },
      {
        onSuccess: () => toast.success(`Order ${orderId} marked as ${newStatus}`),
        onError: () => toast.error("Could not update order status."),
      },
    );
  };

  return {
    orders,
    /** No cached data yet — show full-page OrdersLoadingState. */
    isPending: hasSeed ? false : isPending,
    selectedOrder,
    isModalOpen,
    openOrder,
    closeModal,
    updateStatus,
  };
}
