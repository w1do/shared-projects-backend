"use client";

import * as React from "react";
import { Progress } from "@/components/ui/feedback/progress";
import { AreaChart } from "@/components/ui/charts/area-chart";
import { TrendingUp, TrendingDown } from "lucide-react";
import { semanticColors } from "@/lib/theme-colors";

interface BrandPreviewAnalyticsProps {
  name: string;
  share: number;
  delta: number;
  trend: number[];
  seoSlug: string;
  seoTitle: string;
  seoDesc: string;
}

export function BrandPreviewAnalytics({
  name,
  share,
  delta,
  trend,
  seoSlug,
  seoTitle,
  seoDesc,
}: BrandPreviewAnalyticsProps) {
  return (
    <div className="space-y-8 outline-none mt-0">
      {/* Analytics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 border border-border/60 rounded-3xl bg-muted/30 flex flex-col justify-between min-h-32">
          <span className="text-caption text-muted-foreground-lighter block">
            YoY Revenue Growth
          </span>
          <div className="flex items-center gap-2 mt-4">
            {delta >= 0 ? (
              <div className="h-8 w-8 rounded-full bg-success-bg text-success flex items-center justify-center shrink-0">
                <TrendingUp size={16} />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <TrendingDown size={16} />
              </div>
            )}
            <span
              className={`text-heading font-semibold font-openrunde ${delta >= 0 ? "text-success" : "text-destructive"}`}
            >
              {delta >= 0 ? "+" : ""}
              {delta}%
            </span>
          </div>
        </div>

        <div className="p-4 border border-border/60 rounded-3xl bg-muted/30 flex flex-col justify-between min-h-32">
          <span className="text-caption text-muted-foreground-lighter block">Market share</span>
          <div className="flex flex-col gap-2 mt-4">
            <span className="text-heading font-semibold text-foreground font-openrunde">
              {share}%
            </span>
            <Progress value={share} size="sm" className="w-full h-1" />
          </div>
        </div>

        <div className="p-4 border border-border/60 rounded-3xl bg-muted/30 flex flex-col justify-between sm:col-span-2 min-h-32">
          <div className="flex items-center justify-between">
            <span className="text-caption text-muted-foreground-lighter">12 Months Trend</span>
            <span className="text-xs text-muted-foreground font-medium">Performance Delta</span>
          </div>
          <div className="h-6 w-full mt-4">
            <AreaChart
              data={trend}
              sparkline={true}
              colors={delta >= 0 ? [semanticColors.success] : [semanticColors.destructive]}
              height="100%"
            />
          </div>
        </div>
      </div>

      {/* Google SEO Preview */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground-lighter uppercase tracking-wider">
          Search Engine Result (Google)
        </h3>
        <div className="bg-muted/50 p-4 rounded-3xl border border-border/60 space-y-1">
          <span className="text-xs text-muted-foreground block truncate">
            https://aetheria.com › brands › {seoSlug}
          </span>
          <span className="font-serif text-sm font-semibold text-info block hover:underline cursor-pointer truncate">
            {seoTitle}
          </span>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{seoDesc}</p>
        </div>
      </div>
    </div>
  );
}
