import type { Brand, Category, Collection } from "@/lib/admin/mocks/types";
import type { ApiBrand, ApiCategory, ApiCollection } from "../api-types";
import { initials, money, statusMap } from "./shared";
import { semanticColors } from "@/lib/theme-colors";
import { type FlatNode, type TreeNode, flattenTree } from "../category-tree";

export function mapBrand(brand: ApiBrand): Brand {
  return {
    id: brand.id,
    name: brand.name,
    monogram: brand.monogram ?? initials(brand.name).slice(0, 2),
    revenue: money(brand.revenue),
    share: money(brand.share),
    trend: brand.trend?.length ? brand.trend : [10, 12, 11, 14, 16, 15],
    delta: money(brand.delta),
  };
}

export function mapCategory(category: ApiCategory & { depth?: number }): Category {
  return {
    id: category.id,
    name: category.name,
    nameTranslations: category.nameTranslations,
    slug: category.slug,
    parentId: category.parentId ?? null,
    depth: category.depth ?? 0,
    description: "",
    productCount: category.productCount ?? 0,
    status: statusMap[category.status],
    coverGradient: [semanticColors.accent, semanticColors.brandAccentHover],
    thumbnail: "/categories/icons/cleansers-toners.svg",
    revenue: money(category.revenue),
    growthYoY: money(category.growthYoY),
    displayOrder: category.displayOrder,
    createdAt: category.createdAt ?? new Date().toISOString(),
  };
}

/**
 * Дерево категорий → плоский список в префиксном порядке с уровнем вложенности.
 * Обход — в `data-source/category-tree.ts`, он покрыт юнит-тестами.
 */
export function flattenCategories(categories: ApiCategory[]): FlatNode<ApiCategory>[] {
  return flattenTree(
    categories as unknown as (ApiCategory & TreeNode)[],
  ) as FlatNode<ApiCategory>[];
}

export function mapCollection(collection: ApiCollection, revenueOverride?: number): Collection {
  const products = collection.products?.map((product) => product.id) ?? [];
  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description ?? "",
    productCount: collection.productCount ?? products.length,
    status: statusMap[collection.status],
    banner: "/categories/icons/serums-treatments.svg",
    thumbnail: "/categories/icons/serums-treatments.svg",
    revenue: revenueOverride ?? money(collection.revenue),
    views: collection.views ?? 0,
    growthYoY: money(collection.growthYoY),
    viewTrend: collection.viewTrend,
    featured: Boolean(collection.featured),
    products,
    productItems: collection.products?.map((product) => ({
      id: product.id,
      name: product.name,
      brand: "Aetheria",
      price: money(product.price),
      image: product.imageUrl ?? undefined,
      gradient: [semanticColors.accent, semanticColors.brandAccentHover],
    })),
    createdAt: collection.createdAt ?? new Date().toISOString(),
    updatedAt: collection.updatedAt ?? new Date().toISOString(),
  };
}
