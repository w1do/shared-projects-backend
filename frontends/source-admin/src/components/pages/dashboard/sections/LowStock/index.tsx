import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import type { LowStock as LowStockItemType } from "@/lib/admin/mocks/types";
import { LowStockItem } from "./LowStockItem";

type LowStockProps = {
  items: LowStockItemType[];
};

export function LowStock({ items }: LowStockProps) {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-ring" />
            <h3 className="font-openrunde text-heading leading-tight text-foreground">Low stock</h3>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{items.length} SKUs below threshold</p>
        </div>
        <Button variant="text">Restock all</Button>
      </div>
      <ul className="mt-6 space-y-4">
        {items.map((s) => (
          <LowStockItem key={s.id} item={s} />
        ))}
      </ul>
    </div>
  );
}
