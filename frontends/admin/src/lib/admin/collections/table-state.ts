import type { Collection } from "@/lib/admin/mocks/types";

export type CollectionStatusFilter = "all" | Collection["status"];

export type CollectionSortConfig = {
  field: string;
  order: "asc" | "desc";
} | null;

export const collectionStatusFilterOptions = [
  { value: "all", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Draft", label: "Draft" },
  { value: "Archived", label: "Archived" },
] satisfies Array<{ value: CollectionStatusFilter; label: string }>;

// Revenue/views/growth feel more natural starting from the highest value first.
const descendingFirstFields = new Set(["revenue", "views", "growthYoY"]);

export function getNextCollectionSortConfig(
  current: CollectionSortConfig,
  field: string,
): CollectionSortConfig {
  if (current?.field !== field) {
    return { field, order: descendingFirstFields.has(field) ? "desc" : "asc" };
  }

  if (current.order === "asc") {
    return { field, order: "desc" };
  }

  return null;
}

export function filterCollections(
  collections: Collection[],
  searchTerm: string,
  statusFilter: CollectionStatusFilter,
) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  return collections.filter((collection) => {
    const matchesSearch =
      collection.name.toLowerCase().includes(normalizedSearchTerm) ||
      (collection.description?.toLowerCase().includes(normalizedSearchTerm) ?? false);
    const matchesStatus = statusFilter === "all" || collection.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}

export function sortCollections(collections: Collection[], sortConfig: CollectionSortConfig) {
  if (!sortConfig) {
    return collections;
  }

  const { field, order } = sortConfig;
  const factor = order === "asc" ? 1 : -1;

  return [...collections].sort((a, b) => {
    const valueA = a[field as keyof Collection];
    const valueB = b[field as keyof Collection];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return valueA.localeCompare(valueB) * factor;
    }

    if (typeof valueA === "number" && typeof valueB === "number") {
      return (valueA - valueB) * factor;
    }

    return 0;
  });
}
