import type { ProductFull } from "@/lib/admin/mocks/types";
import { getAdminDashboardData } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { readStoredProducts } from "@/lib/admin/products/store";

export type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;

function deriveBestSellers(products: ProductFull[]) {
  return [...products]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      sku: product.sku,
      price: product.price,
      unitsSold: product.unitsSold,
      revenue: product.revenue,
      gradient: product.gradient,
      image: product.image,
    }));
}

function deriveLowStock(products: ProductFull[]) {
  return products
    .filter((product) => product.stockStatus !== "In Stock")
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map((product) => ({
      id: `ls-${product.id}`,
      name: product.name,
      brand: product.brand,
      sku: product.sku,
      unitsLeft: product.stock,
      threshold: 40,
      image: product.image,
    }));
}

/**
 * Dashboard payload for TanStack Query.
 * Mock mode rebuilds best-sellers / low-stock from the live product catalog (localStorage).
 * Campaign / brand / category widgets keep the dashboard seed shape (performance metrics).
 *
 * Mock latency is applied once via getAdminDashboardData → fromSource.
 * Catalog derive reads the store synchronously to avoid stacking a second delay.
 */
export async function getDashboardData(): Promise<AdminDashboardData> {
  if (shouldUseAdminApi()) {
    return getAdminDashboardData();
  }

  const base = await getAdminDashboardData();
  const products = readStoredProducts();

  return {
    ...base,
    bestSellers: deriveBestSellers(products) as typeof base.bestSellers,
    lowStock: deriveLowStock(products) as typeof base.lowStock,
  };
}
