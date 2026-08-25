import { PieChart } from "lucide-react";
import type { BrandMarketShareSegment } from "@/lib/admin/brands/stats";

interface BrandMarketShareCardProps {
  segments: BrandMarketShareSegment[];
}

export function BrandMarketShareCard({ segments }: BrandMarketShareCardProps) {
  return (
    <div className="flex flex-col justify-between p-6">
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Market Share
          </span>
          <PieChart className="size-4 text-muted-foreground-lighter" />
        </div>

        <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className={`h-full w-admin-progress ${segment.toneClassName}`}
              data-admin-progress={segment.id}
              title={`${segment.name}: ${segment.share}%`}
            />
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted-foreground">
          {segments.map((segment) => (
            <div key={segment.id} className="flex items-center gap-1">
              <span className={`size-2 rounded-full ${segment.toneClassName}`} />
              <span>
                {segment.name} ({segment.share}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
