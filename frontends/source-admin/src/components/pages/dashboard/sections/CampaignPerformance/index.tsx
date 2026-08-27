import { Button } from "@/components/ui/inputs/button";
import { Progress } from "@/components/ui/feedback/progress";
import type { Campaign } from "@/lib/admin/mocks/types";

type CampaignPerformanceProps = {
  campaigns: Campaign[];
};

export function CampaignPerformance({ campaigns }: CampaignPerformanceProps) {
  const activeCount = campaigns.filter(
    (c) => !c.status || c.status === "Active",
  ).length;

  return (
    <div className="flex h-full flex-col rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-openrunde text-heading leading-tight text-foreground">
            Campaigns
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            {activeCount} active · pacing healthy
          </p>
        </div>
        <Button variant="text" color="primary" size="sm">
          New
        </Button>
      </div>
      <div className="mt-6 flex flex-1 flex-col gap-4">
        {campaigns.map((c) => {
          const spend = c.spend ?? 0;
          const conversions = c.conversions ?? 0;
          const cap = c.cap ?? 0;
          const roas = c.roas ?? 0;
          const pct = Math.min(100, (conversions / Math.max(1, cap)) * 100);
          return (
            <div key={c.id} className="rounded-2xl border border-border/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-caption font-medium text-foreground">
                    {c.name}
                  </div>
                  <div className="text-xs text-muted-foreground-lighter">
                    {c.channel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-openrunde text-base text-foreground">
                    {roas.toFixed(1)}×
                  </div>
                  <div className="text-xs text-muted-foreground-lighter">
                    ROAS
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>${spend.toLocaleString()} spent</span>
                <span>
                  {conversions.toLocaleString()} / {cap.toLocaleString()}
                </span>
              </div>
              <Progress value={pct} size="sm" className="mt-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
