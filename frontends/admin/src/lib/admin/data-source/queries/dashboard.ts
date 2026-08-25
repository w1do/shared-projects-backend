import { kpis, recentOrders, revenueSeries } from "@/lib/admin/mocks/dashboard";
import { bestSellers, campaigns as mockCampaigns, lowStock } from "@/lib/admin/mocks/products";
import { brands as mockBrands } from "@/lib/admin/mocks/brands";
import { mockCategories } from "@/lib/admin/mocks/taxonomy/categories";
import type { Brand, Campaign, Category } from "@/lib/admin/mocks/types";
import * as platformAnalytics from "../platform/analytics";
import { defaultPeriod } from "../platform/analytics";
import * as platformContent from "../platform/content";
import type { PlatformTopPageRow } from "../platform/types";
import {
  categoryToApiCategory,
  revenueToPoints,
  toDashboardStats,
} from "../platform/mappers";
import { flattenCategories, mapCategory, mapDashboard } from "../mappers";
import { fromSource } from "./shared";

const mockDashboardData = {
  kpis,
  revenueSeries,
  bestSellers,
  lowStock,
  recentOrders,
  campaigns: mockCampaigns,
  brands: mockBrands,
  categories: mockCategories,
  topPages: [] as PlatformTopPageRow[],
};

/**
 * Optional widget series. Dashboard stats endpoints do not yet expose
 * campaign/brand/category breakdowns; brands/categories hydrate from catalog
 * list APIs when available, otherwise fall back to curated mocks.
 */
async function loadWidgetSeries(): Promise<{
  campaigns: Campaign[];
  brands: Brand[];
  categories: Category[];
}> {
  // Брендов и кампаний в платформе нет — эти виджеты остаются на демо-данных.
  const brands: Brand[] = mockBrands;
  const campaigns: Campaign[] = mockCampaigns;
  let categories: Category[] = mockCategories;

  try {
    const tree = await platformContent.listCategories();
    categories = flattenCategories(
      tree.map((node, index) => categoryToApiCategory(node, index)),
    ).map(mapCategory);
  } catch {
    // Keep mock category sales series.
  }

  return { campaigns, brands, categories };
}

/**
 * dashboard → analytics-service: обзор, выручка и топ-страницы за период.
 * Виджеты без аналога в платформе (бестселлеры, остатки, последние заказы)
 * остаются на демо-данных вёрстки — см. docs/admin-console.md.
 */
export async function getAdminDashboardData() {
  return fromSource(async () => {
    const period = defaultPeriod();
    const [overview, revenueRows, topPages, widgets] = await Promise.all([
      platformAnalytics.getOverview(period),
      platformAnalytics.getRevenue(period),
      platformAnalytics.getTopPages(period),
      loadWidgetSeries(),
    ]);

    const dashboard = mapDashboard(
      toDashboardStats(overview, revenueRows),
      revenueToPoints(revenueRows),
    );

    return {
      ...dashboard,
      topPages,
      bestSellers,
      lowStock,
      recentOrders,
      campaigns: widgets.campaigns,
      brands: widgets.brands,
      categories: widgets.categories,
    };
  }, mockDashboardData);
}

export type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;
