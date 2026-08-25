import type { Promotion } from "@/lib/admin/mocks/promotions";
import type { TypeFilter, StatusFilter } from "../config/filters";

/** Human-readable reward label, e.g. "25% off" or "$15 off". */
export function formatReward(promo: Promotion): string {
  switch (promo.type) {
    case "Percentage":
      return `${promo.rewardValue}% off`;
    case "Fixed Amount":
      return `$${promo.rewardValue} off`;
    case "Free Shipping":
      return "Free shipping";
    case "Tiered Reward":
      return `${promo.rewardValue}× rewards`;
    case "Gift With Purchase":
      return "Free gift";
    default:
      return "—";
  }
}

/** Compact reward value shown on the spotlight ticket stub. */
export function rewardHeadline(promo: Promotion): { value: string; unit: string } {
  switch (promo.type) {
    case "Percentage":
      return { value: `${promo.rewardValue}`, unit: "% OFF" };
    case "Fixed Amount":
      return { value: `$${promo.rewardValue}`, unit: "OFF" };
    case "Free Shipping":
      return { value: "FREE", unit: "SHIPPING" };
    case "Tiered Reward":
      return { value: `${promo.rewardValue}×`, unit: "POINTS" };
    case "Gift With Purchase":
      return { value: "GIFT", unit: "INCLUDED" };
    default:
      return { value: "—", unit: "" };
  }
}

export const formatPromoDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const usagePercent = (promo: Promotion) =>
  promo.limit > 0 ? Math.min(100, Math.round((promo.used / promo.limit) * 100)) : 0;

export interface PromotionFilterParams {
  searchTerm: string;
  typeFilter: TypeFilter;
  statusFilter: StatusFilter;
}

export function filterPromotions(
  promotions: Promotion[],
  { searchTerm, typeFilter, statusFilter }: PromotionFilterParams,
): Promotion[] {
  const query = searchTerm.trim().toLowerCase();
  return promotions.filter((promo) => {
    const matchesSearch =
      query === "" ||
      promo.code.toLowerCase().includes(query) ||
      promo.title.toLowerCase().includes(query) ||
      promo.channel.toLowerCase().includes(query);
    const matchesType = typeFilter === "all" || promo.type === typeFilter;
    const matchesStatus = statusFilter === "all" || promo.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });
}
