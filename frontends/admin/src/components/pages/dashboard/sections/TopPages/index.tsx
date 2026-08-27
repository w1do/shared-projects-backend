import { DataGrid } from "@/components/ui/data-display/data-grid";
import { t } from "@/lib/admin/console-texts";
import { columns, type TopPageRow } from "./columns";

export type { TopPageRow };

type TopPagesProps = {
  rows: TopPageRow[];
};

export function TopPages({ rows }: TopPagesProps) {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="font-openrunde text-heading leading-tight text-foreground">
            {t("console.dashboard.top-pages")}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("console.dashboard.top-pages-subtitle")}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto min-w-0">
        <DataGrid
          rows={rows.slice(0, 5)}
          columns={columns}
          variant="plain"
          rowClassName="hover:bg-transparent border-border/40"
          emptyState={
            <div className="py-8 text-center text-caption text-muted-foreground-lighter">
              {t("console.dashboard.top-pages-empty")}
            </div>
          }
        />
      </div>
    </div>
  );
}
