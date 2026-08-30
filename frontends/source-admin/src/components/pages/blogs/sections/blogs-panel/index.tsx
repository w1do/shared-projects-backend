"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { DataTableFooter } from "@/components/shared/data-table/DataTableFooter";
import { listStateMessage } from "@/lib/admin/data-source/list-state";
import type { Article } from "@/lib/admin/types/magazine";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { usePagination } from "@/hooks/admin/pagination";
import { ArticleCard } from "./components/ArticleCard";
import { categoryOptions, filterArticles, statusOptions } from "@/components/pages/blogs/utils";

interface BlogsPanelProps {
  articles: Article[];
  /** Данные ещё идут: пустое состояние показывать рано. */
  isLoading?: boolean;
  onOpen: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

export function BlogsPanel({
  articles,
  isLoading = false,
  onOpen,
  onEdit,
  onDelete,
}: BlogsPanelProps) {
  const t = useConsoleText();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const options = useMemo(() => categoryOptions(articles), [articles]);
  const statuses = useMemo(() => statusOptions(articles), [articles]);
  const filtered = useMemo(
    () => filterArticles(articles, searchTerm, category, status),
    [articles, searchTerm, category, status],
  );

  const pagination = usePagination(filtered);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-sm w-full">
          <Input
            placeholder={t("console.blogs.search-placeholder")}
            startIcon={<Search />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          {statuses && (
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statuses}
              placeholder={t("console.blogs.filter.all-statuses")}
              className="w-40"
              data-testid="blogs-status-filter"
            />
          )}
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={options}
            placeholder={t("console.blogs.filter.all-categories")}
            className="w-40"
          />
        </div>
      </div>

      {pagination.items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-12 text-center text-xs text-muted-foreground-lighter">
          {listStateMessage(
            isLoading,
            t("console.common.loading"),
            t("console.blogs.empty-filtered"),
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pagination.items.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <DataTableFooter pagination={pagination} itemLabel={t("console.blogs.footer-unit")} />
    </div>
  );
}
