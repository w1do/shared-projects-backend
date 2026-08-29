import type { RecentPostRow } from "@/components/pages/dashboard/sections/RecentPosts";
import type { TopPageRow } from "@/components/pages/dashboard/sections/TopPages";
import * as platformAnalytics from "../platform/analytics";
import { defaultPeriod } from "../platform/analytics";
import * as platformContent from "../platform/content";
import type { PlatformPost, PlatformTopPageRow } from "../platform/types";
import { revenueToPoints, toDashboardStats } from "../platform/mappers";
import { mapDashboard } from "../mappers";

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
 * content-service (свежие материалы).
 */
export async function getAdminDashboardData() {
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
}

export type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;
