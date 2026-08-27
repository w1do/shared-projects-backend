import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import type { Order } from "@/lib/admin/mocks/types";
import { columns } from "./columns";

type RecentOrdersProps = {
  orders: Order[];
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="font-openrunde text-heading leading-tight text-foreground">
            Recent orders
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Latest activity from the storefront
          </p>
        </div>
        <Button variant="text" endIcon={<ArrowUpRight />}>
          View all
        </Button>
      </div>

      <div className="overflow-x-auto min-w-0">
        <DataGrid
          rows={orders.slice(0, 5)}
          columns={columns}
          variant="plain"
          rowClassName="hover:bg-transparent border-border/40"
        />
      </div>
    </div>
  );
}
