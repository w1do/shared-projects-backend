import type { Brand } from "@/lib/admin/mocks/types";

export type BrandPerformanceFilter = "all" | "positive" | "negative";

export type BrandSortConfig = {
  field: string;
  order: "asc" | "desc";
} | null;

export const brandPerformanceFilterOptions = [
  { value: "all", label: "All performance" },
  { value: "positive", label: "Positive growth" },
  { value: "negative", label: "Declining trend" },
] satisfies Array<{ value: BrandPerformanceFilter; label: string }>;

export function getNextBrandSortConfig(current: BrandSortConfig, field: string): BrandSortConfig {
  if (current?.field !== field) {
    return { field, order: "asc" };
  }

  if (current.order === "asc") {
    return { field, order: "desc" };
  }

  return null;
}

export function filterBrands(
  brands: Brand[],
  searchTerm: string,
  performanceFilter: BrandPerformanceFilter,
) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  return brands.filter((brand) => {
    const matchesSearch = brand.name.toLowerCase().includes(normalizedSearchTerm);
    const matchesPerformance =
      performanceFilter === "all" ||
      (performanceFilter === "positive" && brand.delta >= 0) ||
      (performanceFilter === "negative" && brand.delta < 0);

    return matchesSearch && matchesPerformance;
  });
}

export function sortBrands(brands: Brand[], sortConfig: BrandSortConfig) {
  if (!sortConfig) {
    return brands;
  }

  const { field, order } = sortConfig;
  const factor = order === "asc" ? 1 : -1;

  return [...brands].sort((a, b) => {
    const valueA = a[field as keyof Brand];
    const valueB = b[field as keyof Brand];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return valueA.localeCompare(valueB) * factor;
    }

    if (typeof valueA === "number" && typeof valueB === "number") {
      return (valueA - valueB) * factor;
    }

    return 0;
  });
}
