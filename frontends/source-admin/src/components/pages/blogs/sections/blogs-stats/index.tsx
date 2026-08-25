"use client";

import { Newspaper, FolderTree, PenLine, Clock } from "lucide-react";
import { KpiStatCard, type KpiStat } from "@/components/shared";
import type { Article } from "@/lib/admin/mocks/magazine";

interface BlogsStatsProps {
  articles: Article[];
}

export function BlogsStats({ articles }: BlogsStatsProps) {
  const categories = new Set(articles.map((a) => a.category)).size;
  const authors = new Set(articles.map((a) => a.author.name)).size;
  const avgRead =
    articles.length > 0
      ? Math.round(articles.reduce((sum, a) => sum + a.readingTimeMin, 0) / articles.length)
      : 0;

  const kpis: KpiStat[] = [
    {
      label: "Published Articles",
      value: `${articles.length}`,
      delta: "+3 this month",
      icon: Newspaper,
      trend: [4, 6, 5, 7, 8, 9, 10, 11, 11, 12],
    },
    {
      label: "Categories",
      value: `${categories}`,
      delta: "Active topics",
      icon: FolderTree,
      trend: [2, 3, 3, 4, 4, 5, 5, 5, 5, 5],
    },
    {
      label: "Contributors",
      value: `${authors}`,
      delta: "Editorial team",
      icon: PenLine,
      trend: [1, 2, 2, 3, 3, 4, 4, 4, 4, 4],
    },
    {
      label: "Avg. Read Time",
      value: `${avgRead} min`,
      delta: "Per article",
      icon: Clock,
      trend: [6, 6, 7, 7, 8, 8, 7, 8, 8, 8],
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
