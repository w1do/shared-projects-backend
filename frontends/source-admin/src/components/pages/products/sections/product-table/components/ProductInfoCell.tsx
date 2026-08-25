"use client";

import * as React from "react";
import type { ProductFull } from "@/lib/admin/mock";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import { Avatar } from "@/components/ui/data-display/avatar";

export function ProductInfoCell({
  product,
  priority,
}: {
  product: ProductFull;
  priority?: boolean;
}) {
  const initials = (product.name || "").substring(0, 2).toUpperCase() || "PR";
  const gradientId = `product-row-${product.id}`;
  const grad0 = product.gradient?.[0] || "var(--color-border)";
  const grad1 = product.gradient?.[1] || "var(--color-border-hover)";

  return (
    <div className="flex min-w-0 items-center gap-4">
      <AdminDynamicStyles gradients={[{ id: gradientId, start: grad0, end: grad1 }]} />
      <Avatar
        src={product.image || undefined}
        alt={product.name}
        size="lg"
        shape="rounded"
        priority={priority}
        data-admin-gradient={gradientId}
      >
        {initials}
      </Avatar>
      <div className="min-w-0">
        <div className="truncate text-base font-medium text-foreground">{product.name}</div>
        <div className="truncate text-xs text-muted-foreground-lighter">
          {product.variants} variant{product.variants > 1 ? "s" : ""} · {product.brand} ·{" "}
          {product.category}
        </div>
      </div>
    </div>
  );
}
