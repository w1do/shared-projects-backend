import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { brandThumbnailPath } from "@/lib/admin/brands/initial";
import { AreaChart } from "@/components/ui/charts/area-chart";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import { formatCurrency } from "@/lib/utils";
import { Avatar } from "@/components/ui/data-display/avatar";
import type { Brand } from "@/lib/admin/mocks/types";

type BrandPerformanceProps = {
  brands: Brand[];
};

export function BrandPerformance({ brands }: BrandPerformanceProps) {
  const featuredBrands = brands.slice(0, 6);

  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-openrunde text-heading leading-tight text-foreground">
            Brand performance
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Top performers across {brands.length} brands
          </p>
        </div>
        <Button variant="outlined" shape="circle" size="sm">
          Manage brands
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featuredBrands.map((b) => {
          const up = b.delta >= 0;
          return (
            <div
              key={b.id}
              className="rounded-2xl border border-border/70 bg-card p-4 hover:border-foreground/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <Avatar
                  src={brandThumbnailPath(b.id)}
                  alt={b.name}
                  fallback={b.monogram}
                  size="default"
                  shape="circle"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-caption font-medium text-foreground">{b.name}</div>
                  <div className="text-xs text-muted-foreground-lighter">{b.share}% of total</div>
                </div>
                <Badge
                  variant="soft"
                  color={up ? "success" : "error"}
                  shape="circle"
                  startIcon={
                    up ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )
                  }
                >
                  {Math.abs(b.delta).toFixed(1)}%
                </Badge>
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div className="font-openrunde text-heading leading-none text-foreground">
                  {formatCurrency(b.revenue)}
                </div>
                <div className="h-10 w-24">
                  <AreaChart
                    sparkline={true}
                    data={b.trend}
                    name={b.name}
                    height={40}
                    strokeWidth={2}
                    colors={["var(--color-brand-accent)"]}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
