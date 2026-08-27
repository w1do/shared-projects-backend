import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { t } from "@/lib/admin/console-texts";
import { columns, type RecentPostRow } from "./columns";

export type { RecentPostRow };

type RecentPostsProps = {
  posts: RecentPostRow[];
};

export function RecentPosts({ posts }: RecentPostsProps) {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="font-openrunde text-heading leading-tight text-foreground">
            {t("console.dashboard.recent-posts")}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("console.dashboard.recent-posts-subtitle")}
          </p>
        </div>
        <Button
          component="Link"
          href="/admin/blogs"
          variant="text"
          endIcon={<ArrowUpRight />}
        >
          {t("console.dashboard.view-all")}
        </Button>
      </div>

      <div className="overflow-x-auto min-w-0">
        <DataGrid
          rows={posts.slice(0, 5)}
          columns={columns}
          variant="plain"
          rowClassName="hover:bg-transparent border-border/40"
          emptyState={
            <div className="py-8 text-center text-caption text-muted-foreground-lighter">
              {t("console.dashboard.recent-posts-empty")}
            </div>
          }
        />
      </div>
    </div>
  );
}
