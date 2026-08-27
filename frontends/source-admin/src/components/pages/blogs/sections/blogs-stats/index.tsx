"use client";

import { Newspaper, FolderTree, PenLine, Clock } from "lucide-react";
import { KpiStatCard, type KpiStat } from "@/components/shared";
import type { Article } from "@/lib/admin/mocks/magazine";
import { computeBlogsKpiValues } from "@/lib/admin/blogs-kpi";
import { tf } from "@/lib/admin/console-texts";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface BlogsStatsProps {
  articles: Article[];
}

export function BlogsStats({ articles }: BlogsStatsProps) {
  const t = useConsoleText();
  const values = computeBlogsKpiValues(articles);

  const kpis: KpiStat[] = [
    {
      label: t("console.blogs.stats.published"),
      value: `${values.publishedCount}`,
      icon: Newspaper,
    },
    {
      label: t("console.blogs.stats.categories"),
      value: `${values.categoriesCount}`,
      icon: FolderTree,
    },
    {
      label: t("console.blogs.stats.authors"),
      value: `${values.authorsCount}`,
      icon: PenLine,
    },
    {
      label: t("console.blogs.stats.avg-read"),
      value: tf("console.blogs.minutes", { count: values.averageReadMinutes }),
      icon: Clock,
      accent: true,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiStatCard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
