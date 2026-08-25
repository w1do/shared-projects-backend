import type { DetailedOrder } from "@/lib/admin/mocks/orders";

export const STATUS_TABS = ["all", "Paid", "Processing", "Shipped", "Refunded", "Pending"] as const;

export const PAYMENT_OPTIONS = [
  { value: "all", label: "All Payments" },
  { value: "Credit Card", label: "Credit Card" },
  { value: "PayPal", label: "PayPal" },
  { value: "Apple Pay", label: "Apple Pay" },
  { value: "Bank Transfer", label: "Bank Transfer" },
];

export const VALUE_OPTIONS = [
  { value: "all", label: "Any Amount" },
  { value: "under-100", label: "Under $100" },
  { value: "100-300", label: "$100 - $300" },
  { value: "over-300", label: "Over $300" },
];

export type PaymentFilter = "all" | DetailedOrder["paymentMethod"];
export type ValueFilter = "all" | "under-100" | "100-300" | "over-300";
export type SortField = "placedAt" | "total";
