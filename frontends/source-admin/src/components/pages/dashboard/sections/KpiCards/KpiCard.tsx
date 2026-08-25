import { AreaChart } from "@/components/ui/charts/area-chart";
import { Badge } from "@/components/ui/data-display/badge";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface KpiItem {
  label: string;
  value: string;
  delta: number;
  accent: boolean;
  spark: number[];
}

interface KpiCardProps {
  item: KpiItem;
}

export function KpiCard({ item }: KpiCardProps) {
  const up = item.delta >= 0;
  const accent = item.accent;
  const color = accent ? "var(--color-ring)" : "var(--color-primary)";

  return (
    <div
      className={
        "relative flex flex-col justify-between rounded-3xl p-6 " +
        (accent ? "bg-accent text-foreground" : "bg-card shadow-subtle-3")
      }
    >
      <div className="flex items-start justify-between">
        <span className={"text-xs " + (accent ? "text-ring" : "text-muted-foreground")}>
          {item.label}
        </span>
        <Badge
          variant="soft"
          color={up ? (accent ? "accent" : "success") : "danger"}
          shape="circle"
          startIcon={up ? <ArrowUpRight /> : <ArrowDownRight />}
        >
          {Math.abs(item.delta).toFixed(1)}%
        </Badge>
      </div>
      <div className="mt-6 flex items-end justify-between gap-4 min-w-0 w-full">
        <div className="min-w-0 flex-1">
          <div className="font-openrunde text-heading-lg leading-none text-foreground truncate">
            {item.value}
          </div>
          <div
            className={"text-xs mt-1 " + (accent ? "text-ring" : "text-muted-foreground-lighter")}
          >
            vs. prior 30 days
          </div>
        </div>
        <div className="h-12 w-24 shrink-0">
          <AreaChart data={item.spark} colors={[color]} height={48} sparkline />
        </div>
      </div>
    </div>
  );
}
