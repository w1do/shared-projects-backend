import { ColumnDef } from "@/components/ui/data-display/data-grid";
import { t } from "@/lib/admin/console-texts";

export type TopPageRow = {
  /** Ключ строки DataGrid — путь страницы уникален в выборке. */
  id: string;
  path: string;
  hits: number;
  sessions: number;
};

export const columns: ColumnDef<TopPageRow>[] = [
  {
    field: "path",
    headerName: t("console.dashboard.column.page"),
    cellClassName: "px-0 py-4",
    headerClassName: "px-0",
    renderCell: ({ row: page }) => (
      <div className="text-caption font-medium text-foreground truncate max-w-48">
        {page.path}
      </div>
    ),
  },
  {
    field: "hits",
    headerName: t("console.dashboard.column.hits"),
    width: 100,
    align: "right",
    headerClassName: "text-right",
    cellClassName: "text-right py-4 text-xs text-muted-foreground",
    renderCell: ({ row: page }) => page.hits.toLocaleString("ru-RU"),
  },
  {
    field: "sessions",
    headerName: t("console.dashboard.column.sessions"),
    width: 100,
    align: "right",
    headerClassName: "text-right pr-0",
    cellClassName: "text-right pr-0 py-4 text-xs text-muted-foreground",
    renderCell: ({ row: page }) => page.sessions.toLocaleString("ru-RU"),
  },
];
