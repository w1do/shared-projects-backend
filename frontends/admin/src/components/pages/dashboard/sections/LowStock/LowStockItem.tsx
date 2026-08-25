import { Progress } from "@/components/ui/feedback/progress";
import { Avatar } from "@/components/ui/data-display/avatar";
import type { LowStock } from "@/lib/admin/mocks/types";

type LowStockItemProps = {
  item: LowStock;
};

function monogramFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "—";
}

export function LowStockItem({ item }: LowStockItemProps) {
  const pct = Math.min(100, (item.unitsLeft / Math.max(1, item.threshold)) * 100);

  return (
    <li className="grid items-center gap-4 rounded-2xl border border-border/70 p-2 grid-cols-widget-product-row">
      <Avatar
        src={item.image || undefined}
        alt={item.name}
        fallback={monogramFromName(item.name)}
        size="xl"
        shape="rounded"
        className="size-14 border border-border/70"
        fallbackClassName="bg-muted text-xs font-semibold text-muted-foreground"
        fallbackShadow="none"
      />
      <div className="min-w-0">
        <div className="truncate text-caption font-medium text-foreground">{item.name}</div>
        <div className="text-xs text-muted-foreground-lighter">
          {item.brand} · {item.sku}
        </div>
        <Progress value={pct} colors="destructive" size="sm" className="mt-2" />
      </div>
      <div className="text-right shrink-0">
        <div className="font-openrunde text-2xl text-ring">{item.unitsLeft}</div>
        <div className="text-xs text-muted-foreground-lighter">of {item.threshold}</div>
      </div>
    </li>
  );
}
