export type PromotionType =
  | "Percentage"
  | "Fixed Amount"
  | "Free Shipping"
  | "Tiered Reward"
  | "Gift With Purchase";

export type PromotionStatus = "Active" | "Scheduled" | "Paused" | "Expired" | "Draft";

export type Promotion = {
  id: string;
  /** Customer-facing coupon code, e.g. "GLOW25". */
  code: string;
  title: string;
  description: string;
  type: PromotionType;
  /** Percentage points, dollar amount, or tier multiplier depending on `type`. */
  rewardValue: number;
  minSpend: number;
  channel: string;
  status: PromotionStatus;
  /** Redemptions used so far. */
  used: number;
  /** Redemption cap. */
  limit: number;
  /** Revenue influenced by the promotion, in USD. */
  revenue: number;
  startsAt: string;
  endsAt: string;
  /** Highlighted as the spotlight campaign at the top of the page. */
  featured?: boolean;
  gradient: [string, string];
};
