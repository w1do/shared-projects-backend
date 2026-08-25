import { Progress } from "@/components/ui/feedback/progress";
import { Avatar } from "@/components/ui/data-display/avatar";
import type { Product } from "@/lib/admin/mocks/types";

interface BestSellerRowProps {
  product: Product;
  maxRevenue: number;
}

function monogramFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "—";
}

export function BestSellerRow({ product, maxRevenue }: BestSellerRowProps) {
  return (
    <li className="grid items-center gap-4 rounded-2xl border border-border/70 p-2 grid-cols-widget-product-row">
      <Avatar
        src={product.image || undefined}
        alt={product.name}
        fallback={monogramFromName(product.name)}
        size="xl"
        shape="rounded"
        className="size-14 border border-border/70"
        fallbackClassName="bg-muted text-xs font-semibold text-muted-foreground"
        fallbackShadow="none"
      />
      <div className="min-w-0">
        <div className="truncate text-caption font-medium text-foreground">{product.name}</div>
        <div className="text-xs text-muted-foreground-lighter">
          {product.brand} · {product.category} · {product.unitsSold.toLocaleString()} sold
        </div>
        <Progress value={(product.revenue / maxRevenue) * 100} size="sm" className="mt-2" />
      </div>
      <div className="text-right">
        <div className="font-openrunde text-base text-foreground">
          ${product.revenue.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground-lighter">${product.price}</div>
      </div>
    </li>
  );
}
