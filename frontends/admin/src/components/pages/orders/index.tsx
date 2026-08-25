"use client";

import { PageHeader } from "@/components/shared/layout/PageHeader";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";
import { useOrdersPage } from "@/hooks/admin/orders";

import { OrdersStats } from "./sections/orders-stats";
import { OrdersPanel } from "./sections/orders-panel";
import { OrderDetailModal } from "./sections/order-detail-modal";
import { OrdersLoadingState } from "./loading";

interface OrdersPageProps {
  /** Optional seed for tests; omit in production so skeleton can show. */
  initialOrders?: DetailedOrder[];
}

/**
 * Orders page — list + status updates via useOrdersPage (TanStack Query).
 * Full-page skeleton mirrors layout while the list query is pending.
 */
export default function OrdersPage({ initialOrders }: OrdersPageProps = {}) {
  const { orders, isPending, selectedOrder, isModalOpen, openOrder, closeModal, updateStatus } =
    useOrdersPage(initialOrders !== undefined ? { initialOrders } : {});

  if (isPending) {
    return <OrdersLoadingState />;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Orders"
        description="Oversee transaction logs, check fulfillment timelines, approve payments, or issue client refunds."
        breadcrumbItems={[
          { label: "Admin", href: "/admin" },
          { label: "Commerce", href: "/admin/orders" },
          { label: "Orders" },
        ]}
      />

      <OrdersStats orders={orders} />

      <OrdersPanel orders={orders} onOrderClick={openOrder} onUpdateStatus={updateStatus} />

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={closeModal}
        onUpdateStatus={updateStatus}
      />
    </div>
  );
}
