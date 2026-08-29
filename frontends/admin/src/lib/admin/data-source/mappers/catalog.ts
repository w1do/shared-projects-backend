import type { Category } from "@/lib/admin/types/catalog";
import type { ApiCategory } from "../api-types";
import { money, statusMap } from "./shared";
import { semanticColors } from "@/lib/theme-colors";
import { type FlatNode, type TreeNode, flattenTree } from "../category-tree";

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

