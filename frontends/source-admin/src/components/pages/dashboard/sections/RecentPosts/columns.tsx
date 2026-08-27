import { Badge } from "@/components/ui/data-display/badge";
import { ColumnDef } from "@/components/ui/data-display/data-grid";
import { t } from "@/lib/admin/console-texts";

export type RecentPostRow = {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "published" | "archived" | string;
  publishedAt?: string | null;
};

const statusBadgeProps: Record<
  string,
  { color: "success" | "info" | "neutral" | "secondary" }
> = {
  published: { color: "success" },
  scheduled: { color: "info" },
  draft: { color: "neutral" },
  archived: { color: "secondary" },
};

function statusLabel(status: string): string {
  if (status === "draft") return t("console.post-status.draft");
  if (status === "scheduled") return t("console.post-status.scheduled");
  if (status === "published") return t("console.post-status.published");
  if (status === "archived") return t("console.post-status.archived");
  return status;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const columns: ColumnDef<RecentPostRow>[] = [
  {
    field: "title",
    headerName: t("console.dashboard.column.title"),
    cellClassName: "px-0 py-4",
    headerClassName: "px-0",
    renderCell: ({ row: post }) => (
      <div className="text-caption font-medium text-foreground truncate max-w-80">
        {post.title}
      </div>
    ),
  },
  {
    field: "status",
    headerName: t("console.dashboard.column.status"),
    width: 140,
    cellClassName: "py-4",
    renderCell: ({ row: post }) => {
      const badgeInfo = statusBadgeProps[post.status] || { color: "neutral" };
      return (
        <Badge variant="soft" color={badgeInfo.color} shape="circle">
          {statusLabel(post.status)}
        </Badge>
      );
    },
  },
  {
    field: "publishedAt",
    headerName: t("console.dashboard.column.published"),
    width: 160,
    align: "right",
    headerClassName: "text-right pr-0",
    cellClassName: "text-right pr-0 py-4 text-xs text-muted-foreground",
    renderCell: ({ row: post }) => formatDate(post.publishedAt),
  },
];
