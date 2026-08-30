/** Pay-API панели: транзакции оплат, подписки и тарифные планы подписок. */

import { adminApiSend } from "../api-client";
import { getCursorPage } from "./cursor-page";
import {
  paymentConfirmPath,
  paymentRefundPath,
  paymentsPath,
  planArchivePath,
  planPath,
  plansPath,
  subscriptionActionPath,
  subscriptionsPath,
} from "./pay-paths";
import type {
  PaymentsPathFilters,
  PlatformPayment,
  PlatformPayPlan,
  PlatformSubscription,
  RefundPaymentInput,
  SubscriptionAction,
  SubscriptionsPathFilters,
  UpsertPayPlanInput,
} from "./pay-types";

// -------------------------------------------------------------- платежи

export function getPayments(filters: PaymentsPathFilters = {}) {
  return getCursorPage<PlatformPayment>(paymentsPath(filters));
}

export function confirmPayment(id: string) {
  return adminApiSend<PlatformPayment>(paymentConfirmPath(id), {
    method: "POST",
  });
}

export function refundPayment(id: string, input: RefundPaymentInput = {}) {
  return adminApiSend<PlatformPayment>(paymentRefundPath(id), {
    method: "POST",
    body: input,
  });
}

// -------------------------------------------------------------- подписки

export function getSubscriptions(filters: SubscriptionsPathFilters = {}) {
  return getCursorPage<PlatformSubscription>(subscriptionsPath(filters));
}

export function changeSubscription(id: string, action: SubscriptionAction) {
  return adminApiSend<PlatformSubscription>(
    subscriptionActionPath(id, action),
    {
      method: "POST",
    },
  );
}

// --------------------------------------------------------- тарифные планы

export function getPayPlans(cursor?: string) {
  return getCursorPage<PlatformPayPlan>(plansPath(cursor));
}

export function createPayPlan(input: UpsertPayPlanInput) {
  return adminApiSend<PlatformPayPlan>(plansPath(), {
    method: "POST",
    body: input,
  });
}

export function updatePayPlan(id: number, input: UpsertPayPlanInput) {
  return adminApiSend<PlatformPayPlan>(planPath(id), {
    method: "PUT",
    body: input,
  });
}

export function archivePayPlan(id: number) {
  return adminApiSend<PlatformPayPlan>(planArchivePath(id), {
    method: "POST",
  });
}
