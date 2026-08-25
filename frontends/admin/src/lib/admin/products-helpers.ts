import { toast } from "sonner";
import { formatCurrency as formatSharedCurrency } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD, resolveStockStatus } from "@/lib/admin/shared/stock-status";
import type { ProductFull } from "./mocks/types";

type BadgeColor = "success" | "danger" | "error" | "accent" | "muted";

export type StatusFilter = "All" | ProductFull["status"];

export const statusFilters: StatusFilter[] = ["All", "Active", "Draft", "Archived"];

export const statusBadge: Record<ProductFull["status"], { colors: BadgeColor; label: string }> = {
  Active: { colors: "success", label: "Active" },
  Draft: { colors: "muted", label: "Draft" },
  Archived: { colors: "accent", label: "Archived" },
};

export const stockBadge: Record<
  ProductFull["stockStatus"],
  { colors: BadgeColor; className?: string }
> = {
  "In Stock": { colors: "success" },
  "Low Stock": {
    colors: "muted",
    className: "bg-accent text-brand-accent border-transparent",
  },
  "Out of Stock": { colors: "error" },
};

/** Re-export shared currency formatter for product PDF/table callers. */
export function formatCurrency(value: number): string {
  return formatSharedCurrency(value);
}

export function matchesQuery(product: ProductFull, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = (product.name + " " + product.brand + " " + product.sku).toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function countByStatus(products: ProductFull[], status: StatusFilter): number {
  if (status === "All") return products.length;
  return products.filter((p) => p.status === status).length;
}

export type SortField = "name" | "price" | "stock" | "revenue" | "createdAt";
export type SortOrder = "asc" | "desc";

export type SortConfig = {
  field: SortField;
  order: SortOrder;
};

export function sortProducts(items: ProductFull[], config: SortConfig): ProductFull[] {
  const copy = [...items];
  const { field, order } = config;

  copy.sort((a, b) => {
    let comparison = 0;
    if (field === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (field === "price") {
      comparison = a.price - b.price;
    } else if (field === "stock") {
      comparison = a.stock - b.stock;
    } else if (field === "revenue") {
      comparison = a.revenue - b.revenue;
    } else if (field === "createdAt") {
      comparison = a.createdAt.localeCompare(b.createdAt);
    }

    return order === "asc" ? comparison : -comparison;
  });

  return copy;
}

export function generateSku(name: string, brand: string, category: string): string {
  const brandCode = brand
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)[0]
    .substring(0, 3)
    .toUpperCase();

  const nameWords = name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/);
  let nameCode = "";
  if (nameWords.length >= 2) {
    nameCode = nameWords
      .slice(0, 2)
      .map((w) => w.substring(0, 3).toUpperCase())
      .join("-");
  } else if (nameWords.length === 1 && nameWords[0]) {
    nameCode = nameWords[0].substring(0, 4).toUpperCase();
  }

  const categoryCode = category
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .substring(0, 3)
    .toUpperCase();

  return `${brandCode}-${nameCode}-${categoryCode}`.replace(/-+/g, "-").toUpperCase();
}

export function executeSkuGeneration({
  name,
  brand,
  category,
  onSuccess,
}: {
  name?: string;
  brand?: string;
  category?: string;
  onSuccess: (sku: string) => void;
}) {
  const missingFields = [];
  if (!name) missingFields.push("Product Name");
  if (!brand) missingFields.push("Brand");
  if (!category) missingFields.push("Category");

  if (missingFields.length > 0) {
    toast.error("Cannot generate SKU", {
      description: `Please fill in: ${missingFields.join(", ")} first.`,
      position: "bottom-center",
    });
    return;
  }

  const generatedSKU = generateSku(name!, brand!, category!);
  onSuccess(generatedSKU);

  toast.success("SKU generated successfully", {
    description: `Generated SKU: ${generatedSKU}`,
    position: "bottom-center",
  });
}

export function getStockConfig(stock?: number) {
  if (stock === undefined) {
    return {
      color: "error" as const,
      label: "Unavailable",
      ping: false,
    };
  }

  const status = resolveStockStatus(stock);

  if (status === "Out of Stock") {
    return {
      color: "error" as const,
      label: "Out of Stock",
      ping: false,
    };
  }

  if (status === "Low Stock") {
    return {
      color: "warning" as const,
      label: `Low (${stock})`,
      ping: true,
    };
  }

  return {
    color: "success" as const,
    label: "In Stock",
    ping: false,
  };
}

// Keep threshold visible for callers that need the numeric boundary.
export { LOW_STOCK_THRESHOLD };
