import type { ApiVariant } from "../api-types";

export const money = (value: number | string | undefined | null) => Number(value ?? 0);

export const titleCase = (value: string | undefined | null) =>
  (value ?? "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AE";

export const statusMap = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
} as const;

export const stockStatusMap = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
} as const;

export const orderStatusMap = {
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  REFUNDED: "Refunded",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
} as const;

const reservedVariantAttributeKeys = new Set([
  "id",
  "price",
  "currency",
  "discount_percentage",
  "stock_quantity",
]);

export function prettifyAttributeName(name: string) {
  return name
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function variantAttributes(variant: ApiVariant) {
  return Object.fromEntries(
    Object.entries(variant.attributes ?? {}).filter(
      ([key]) => !reservedVariantAttributeKeys.has(key),
    ),
  );
}
