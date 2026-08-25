import type { Promotion, PromotionStatus } from "@/lib/admin/mocks/promotions";

export const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "Percentage", label: "Percentage" },
  { value: "Fixed Amount", label: "Fixed Amount" },
  { value: "Free Shipping", label: "Free Shipping" },
  { value: "Tiered Reward", label: "Tiered Reward" },
  { value: "Gift With Purchase", label: "Gift With Purchase" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "Paused", label: "Paused" },
  { value: "Expired", label: "Expired" },
  { value: "Draft", label: "Draft" },
];

export type StatusFilter = PromotionStatus | "all";
export type TypeFilter = Promotion["type"] | "all";

/** Map a promotion status to a Badge color token. */
export const statusBadgeColor = (
  status: PromotionStatus,
): "success" | "info" | "accent" | "muted" | "danger" => {
  switch (status) {
    case "Active":
      return "success";
    case "Scheduled":
      return "info";
    case "Paused":
      return "accent";
    case "Expired":
      return "danger";
    case "Draft":
    default:
      return "muted";
  }
};
