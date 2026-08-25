import { Badge } from "@/components/ui/data-display/badge";
import type { Product } from "@/lib/admin/mocks/types";
import { BestSellerRow } from "./BestSellerRow";

type BestSellersProps = {
  products: Product[];
};

export function BestSellers({ products }: BestSellersProps) {
  const max = Math.max(...products.map((p) => p.revenue), 1);
  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-openrunde text-heading leading-tight text-foreground">
            Best-selling products
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">Trailing period · by revenue</p>
        </div>
        <Badge variant="soft" color="muted" shape="circle">
          {Math.min(products.length, 3)} products
        </Badge>
      </div>
      <ul className="mt-6 space-y-4">
        {products.slice(0, 3).map((p) => (
          <BestSellerRow key={p.id} product={p} maxRevenue={max} />
        ))}
      </ul>
    </div>
  );
}
