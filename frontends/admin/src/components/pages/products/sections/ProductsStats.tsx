import type { ProductFull } from "@/lib/admin/mock";
import { formatCurrency } from "@/lib/admin/products-helpers";
import { Package, CheckCircle, AlertCircle, Coins } from "lucide-react";

function restockCount(products: ProductFull[]): number {
  return products.filter((p) => p.stockStatus !== "In Stock").length;
}

export function ProductsStats({ products }: { products: ProductFull[] }) {
  const active = products.filter((p) => p.status === "Active").length;
  const catalogValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const stats = [
    {
      label: "Total products",
      value: products.length.toString(),
      icon: Package,
    },
    {
      label: "Active",
      value: active.toString(),
      icon: CheckCircle,
    },
    {
      label: "Need restock",
      value: restockCount(products).toString(),
      icon: AlertCircle,
      warn: true,
    },
    {
      label: "Catalog value",
      value: formatCurrency(catalogValue),
      icon: Coins,
    },
  ];

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-start justify-between border-b border-r border-border/60 p-6"
          >
            {/* Left Column: Text Content */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span
                className={
                  "font-openrunde text-heading-lg " +
                  (stat.warn ? "text-brand-accent" : "text-foreground")
                }
              >
                {stat.value}
              </span>
            </div>

            {/* Right Column: Premium Icon Container */}
            <div
              className={`flex size-16 items-center justify-center rounded-xl shrink-0 bg-accent text-brand-accent`}
            >
              <Icon className="size-8" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
