import type { RecentPostRow } from "@/components/pages/dashboard/sections/RecentPosts";
import type { TopPageRow } from "@/components/pages/dashboard/sections/TopPages";
import { kpis, revenueSeries } from "@/lib/admin/mocks/dashboard";
import { mockArticles } from "@/lib/admin/mocks/magazine";
import * as platformAnalytics from "../platform/analytics";
import { defaultPeriod } from "../platform/analytics";
import * as platformContent from "../platform/content";
import type { PlatformPost, PlatformTopPageRow } from "../platform/types";
import { revenueToPoints, toDashboardStats } from "../platform/mappers";
import { mapDashboard } from "../mappers";
import { fromSource } from "./shared";

/** Демо-режим: свежие материалы — статьи вёрстки, топ страниц пуст. */
const mockDashboardData = {
  kpis,
  revenueSeries,
  topPages: [] as TopPageRow[],
  recentPosts: mockArticles.map(
    (article): RecentPostRow => ({
      id: article.id,
      title: article.title,
      status: article.status ?? "published",
      publishedAt: article.publishedAt,
    }),
  ),
};

function toTopPageRow(row: PlatformTopPageRow): TopPageRow {
  return {
    id: row.path,
    path: row.path,
    hits: Number(row.hits) || 0,
    sessions: Number(row.sessions) || 0,
  };
}

function toRecentPostRow(post: PlatformPost): RecentPostRow {
  return {
    id: String(post.id),
    title: post.title,
    status: post.status,
    publishedAt: post.published_at ?? post.scheduled_at ?? null,
  };
}

/** Свежие материалы: последние посты проекта; сбой content не валит дашборд. */
async function loadRecentPosts(): Promise<RecentPostRow[]> {
  try {
    const posts = await platformContent.listPosts();
    return posts
      .map(toRecentPostRow)
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  } catch {
    return [];
  }
}

/**
 * dashboard → analytics-service (обзор, выручка, топ-страницы за период) +
 * content-service (свежие материалы). Демо-виджеты шаблона (бестселлеры,
 * остатки, заказы, кампании, бренды) живой дашборд не запрашивает и не рендерит.
 */
export async function getAdminDashboardData() {
  return fromSource(async () => {
    const period = defaultPeriod();
    const [overview, revenueRows, topPages, recentPosts] = await Promise.all([
      platformAnalytics.getOverview(period),
      platformAnalytics.getRevenue(period),
      platformAnalytics.getTopPages(period),
      loadRecentPosts(),
    ]);

    const dashboard = mapDashboard(
      toDashboardStats(overview, revenueRows),
      revenueToPoints(revenueRows),
    );

    return {
      ...dashboard,
      topPages: topPages.map(toTopPageRow),
      recentPosts,
    };
  }, mockDashboardData);
}

export type AdminDashboardData = Awaited<
  ReturnType<typeof getAdminDashboardData>
>;
