import { kpis, recentOrders, revenueSeries } from "@/lib/admin/mocks/dashboard";
import { bestSellers, campaigns as mockCampaigns, lowStock } from "@/lib/admin/mocks/products";
import { brands as mockBrands } from "@/lib/admin/mocks/brands";
import { mockCategories } from "@/lib/admin/mocks/taxonomy/categories";
import type { Brand, Campaign, Category, Order } from "@/lib/admin/mocks/types";
import { adminApiGet, type ApiPage } from "../api-client";
import type {
  ApiBestSeller,
  ApiBrand,
  ApiCategory,
  ApiDashboardStats,
  ApiInventoryItem,
  ApiOrderSummary,
  ApiRevenuePoint,
} from "../api-types";
import {
  flattenCategories,
  mapBestSeller,
  mapBrand,
  mapCategory,
  mapDashboard,
  mapInventoryItem,
  mapOrder,
} from "../mappers";
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
  let brands: Brand[] = mockBrands;
  let categories: Category[] = mockCategories;
  // No campaigns analytics endpoint yet — keep curated mock summaries.
  const campaigns: Campaign[] = mockCampaigns;

  try {
    const page = await adminApiGet<ApiPage<ApiBrand>>("/api/v1/brands?page=0&size=200");
    brands = page.items.map(mapBrand);
  } catch {
    // Keep mock brand performance series.
  }

  try {
    const tree = await adminApiGet<ApiCategory[]>("/api/v1/categories?view=tree");
    categories = flattenCategories(tree).map(mapCategory);
  } catch {
    // Keep mock category sales series.
  }

  return { campaigns, brands, categories };
}

export async function getAdminDashboardData() {
  return fromSource(async () => {
    const [stats, apiRevenue, apiBestSellers, apiLowStock, apiRecentOrders, widgets] =
      await Promise.all([
        adminApiGet<ApiDashboardStats>("/api/v1/dashboard/stats"),
        adminApiGet<ApiRevenuePoint[]>("/api/v1/dashboard/revenue-series?range=30d"),
        adminApiGet<ApiBestSeller[]>("/api/v1/dashboard/best-sellers?limit=5"),
        adminApiGet<ApiInventoryItem[]>("/api/v1/dashboard/low-stock?limit=5"),
        adminApiGet<ApiOrderSummary[]>("/api/v1/dashboard/recent-orders?limit=5"),
        loadWidgetSeries(),
      ]);

    const dashboard = mapDashboard(stats, apiRevenue);

    return {
      ...dashboard,
      bestSellers: apiBestSellers.map(mapBestSeller) as typeof bestSellers,
      lowStock: apiLowStock
        .map((item) => mapInventoryItem(item))
        .map((item) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          sku: item.sku,
          unitsLeft: item.stock,
          threshold: item.threshold,
        })),
      recentOrders: apiRecentOrders.map((order): Order => {
        const mapped = mapOrder(order);
        return {
          id: mapped.id,
          customer: {
            name: mapped.customer.name,
            initials: mapped.customer.initials,
            avatarUrl: mapped.customer.avatarUrl,
          },
          items: mapped.items.map((item) => item.name).join(", ") || "Order items",
          itemCount: mapped.items.length || 1,
          status: mapped.status,
          total: mapped.total,
          placedAt: mapped.placedAt,
        };
      }),
      campaigns: widgets.campaigns,
      brands: widgets.brands,
      categories: widgets.categories,
    };
  }, mockDashboardData);
}

export type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;
