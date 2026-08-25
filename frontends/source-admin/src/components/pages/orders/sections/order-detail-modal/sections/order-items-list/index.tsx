"use client";

import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { DetailedOrderItem } from "@/lib/admin/mocks/orders";

interface OrderItemsListProps {
  items: DetailedOrderItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  const gradients = items.map((item) => ({
    id: `order-item-${item.id}`,
    start: item.gradient[0],
    end: item.gradient[1],
  }));

  return (
    <div className="flex flex-col">
      <AdminDynamicStyles gradients={gradients} />
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 justify-between py-4 px-2 border-b border-border/40 last:border-b-0 rounded-xl hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-4 min-w-0">
            {/* Product Thumbnail with Gradient or Image */}
            <div
              className={`size-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-border/40 ${
                item.image ? "bg-transparent" : "admin-gradient-swatch"
              }`}
              data-admin-gradient={item.image ? undefined : `order-item-${item.id}`}
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="size-full object-cover" />
              ) : (
                <span className="text-primary-foreground text-xs font-bold font-sans">
                  {item.brand.slice(0, 2)}
                </span>
              )}
            </div>

            {/* Product Text */}
            <div className="flex min-w-0 flex-col gap-2 text-caption">
              <span className="max-w-64 truncate text-xs font-semibold text-foreground">
                {item.name}
              </span>
              <span className="font-medium text-muted-foreground-lighter">
                {item.brand} • ${item.price.toFixed(2)} each
              </span>
              <span className="font-semibold text-primary">Quantity: {item.quantity}</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 text-caption">
            <span className="font-mono text-muted-foreground-lighter">{item.sku}</span>
            <span className="font-semibold text-foreground text-xs">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
