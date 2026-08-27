import { Progress } from "@/components/ui/feedback/progress";
import { Badge } from "@/components/ui/data-display/badge";
import type { Category } from "@/lib/admin/mocks/types";

type CategorySalesItem = {
  name: string;
  revenue: number;
  /** Optional units sold. Falls back to productCount when omitted. */
  sales?: number;
  productCount?: number;
};

type CategorySalesProps = {
  categories: Array<Category | CategorySalesItem>;
  /** Human-readable range label shown in the widget subtitle. */
  rangeLabel?: string;
};

function resolveUnits(category: Category | CategorySalesItem) {
  if ("sales" in category && typeof category.sales === "number")
    return category.sales;
  if ("productCount" in category && typeof category.productCount === "number") {
    return category.productCount;
  }
  return 0;
}

export function CategorySales({
  categories,
  rangeLabel = "Selected range",
}: CategorySalesProps) {
  const categoriesWithUnits = categories
    .map((c) => ({
      name: c.name,
      sales: resolveUnits(c),
      revenue: c.revenue || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalSales = categoriesWithUnits.reduce((acc, c) => acc + c.sales, 0);
  const totalRevenue = categoriesWithUnits.reduce(
    (acc, c) => acc + c.revenue,
    0,
  );

  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-openrunde text-heading leading-tight text-foreground">
            Category sales
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Units sold by category · {rangeLabel}
          </p>
        </div>
        <Badge variant="soft" color="primary" shape="circle">
          {totalSales.toLocaleString()} units
        </Badge>
      </div>
      <ul>
        {categoriesWithUnits.slice(0, 6).map((c, idx) => {
          const isLead = idx === 0;
          const share =
            totalRevenue > 0
              ? ((c.revenue / totalRevenue) * 100).toFixed(1)
              : "0.0";
          return (
            <li
              key={c.name}
              className="grid items-center gap-2 mt-6 grid-cols-category-sales-row"
            >
              <span
                className="text-body text-foreground truncate block"
                title={c.name}
              >
                {c.name}
              </span>
              <Progress
                value={Number(share)}
                colors={isLead ? "destructive" : "default"}
              />
              <span className="text-right font-openrunde text-caption text-foreground">
                {share}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
