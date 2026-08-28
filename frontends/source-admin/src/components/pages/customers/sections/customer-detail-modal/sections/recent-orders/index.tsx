"use client";

import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { StatusBadge } from "@/components/pages/orders/sections/order-status-badge";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface CustomerRecentOrdersProps {
  customer: DetailedCustomer;
}

export function RecentOrdersSection({ customer }: CustomerRecentOrdersProps) {
  const t = useConsoleText();

  return (
    <div className="flex flex-col gap-4">
      <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
        {t("console.customers.detail.recent-orders")}
      </span>
      <div className="flex flex-col gap-4">
        {customer.recentOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 border border-border/40 rounded-xl hover:border-border/80 transition-colors text-caption"
          >
            <div className="flex flex-col gap-2">
              <span className="font-mono font-semibold text-foreground">{order.id}</span>
              <span className="text-muted-foreground-lighter">
                {new Date(order.placedAt).toLocaleDateString("ru-RU", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-semibold text-foreground">${order.total.toFixed(2)}</span>
              <StatusBadge status={order.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
