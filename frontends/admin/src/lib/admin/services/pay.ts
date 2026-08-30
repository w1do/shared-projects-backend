/**
 * Фасад оплаты: сгруппированные операции admin-API pay.
 * Hooks разделов работают через него, не через data-source напрямую.
 */

import * as platformPay from "@/lib/admin/data-source/platform/pay";

export type {
  PayInterval,
  PaymentsPathFilters,
  PaymentStatusFilter,
  PlatformPayment,
  PlatformPayPlan,
  PlatformSubscription,
  PlatformSubscriptionSubject,
  RefundPaymentInput,
  SubscriptionAction,
  SubscriptionsPathFilters,
  UpsertPayPlanInput,
} from "@/lib/admin/data-source/platform/pay";

/** Транзакции оплат: список, подтверждение и возврат. */
export const payments = {
  list: (filters?: platformPay.PaymentsPathFilters) =>
    platformPay.getPayments(filters),
  confirm: (id: string) => platformPay.confirmPayment(id),
  refund: (id: string, input?: platformPay.RefundPaymentInput) =>
    platformPay.refundPayment(id, input),
};

/** Подписки: список с отбором по типу предмета и действия оператора. */
export const subscriptions = {
  list: (filters?: platformPay.SubscriptionsPathFilters) =>
    platformPay.getSubscriptions(filters),
  change: (id: string, action: platformPay.SubscriptionAction) =>
    platformPay.changeSubscription(id, action),
};

/** Тарифные планы подписок: список, создание, правка и архивирование. */
export const payPlans = {
  list: (cursor?: string) => platformPay.getPayPlans(cursor),
  create: (input: platformPay.UpsertPayPlanInput) =>
    platformPay.createPayPlan(input),
  update: (id: number, input: platformPay.UpsertPayPlanInput) =>
    platformPay.updatePayPlan(id, input),
  archive: (id: number) => platformPay.archivePayPlan(id),
};
