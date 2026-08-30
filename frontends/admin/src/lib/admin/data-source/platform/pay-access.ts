/**
 * Права оператора в разделах оплаты — чистые проверки без зависимостей
 * (node-тестируемы). Имена прав объявляет PayManifest.
 */
export const PAY_PERMISSIONS = {
  paymentsConfirm: "pay.payments.confirm",
  paymentsRefund: "pay.payments.refund",
  subscriptionsManage: "pay.subscriptions.manage",
  plansManage: "pay.plans.manage",
} as const;

export type PayPermission =
  (typeof PAY_PERMISSIONS)[keyof typeof PAY_PERMISSIONS];

/** `*` — полный доступ (owner/admin); иначе нужно явное право. */
export function hasPayPermission(
  permissions: readonly string[] | null | undefined,
  permission: PayPermission,
): boolean {
  const list = permissions ?? [];
  return list.includes("*") || list.includes(permission);
}
