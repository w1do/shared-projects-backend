/** Типы pay-API панели: платежи, подписки и тарифные планы подписок. */

import type {
  PaymentsPathFilters,
  PaymentStatusFilter,
  SubscriptionsPathFilters,
} from "./pay-paths";

export type {
  PaymentsPathFilters,
  PaymentStatusFilter,
  SubscriptionsPathFilters,
};

export type PlatformPayment = {
  id: string;
  subject_key: string;
  amount_minor: number;
  refunded_minor: number;
  currency: string;
  status: PaymentStatusFilter;
  provider: string;
  redirect_url: string | null;
  description: string | null;
  subscription_id: string | null;
  created_at: string | null;
};

export type PayInterval = "day" | "month" | "year";

export type PlatformSubscriptionSubject = {
  type: string;
  id: string;
  code: string;
  name: string;
  price_minor?: number | null;
  currency?: string | null;
  interval?: PayInterval | null;
};

export type PlatformSubscription = {
  id: string;
  subscriber: { type: string; id: string };
  status: string;
  grants_access: boolean;
  current_period_ends_at: string | null;
  subject: PlatformSubscriptionSubject | null;
};

/** Действия оператора над подпиской — набор из `SubscriptionAction::adminValues()`. */
export type SubscriptionAction = "cancel" | "resume" | "pause" | "delete";

export type PlatformPayPlan = {
  id: number;
  code: string;
  name: string;
  price_minor: number;
  currency: string;
  interval: PayInterval;
  archived: boolean;
  options: Record<string, unknown>;
  features: string[];
};

export type UpsertPayPlanInput = {
  code: string;
  name: string;
  price_minor: number;
  currency?: string;
  interval?: PayInterval;
  options?: Record<string, unknown>;
  features?: string[];
};

/** Пустой возврат означает полный: сумма не передаётся, а не равна нулю. */
export type RefundPaymentInput = { amount_minor?: number };
