/**
 * Чистые построители путей pay-API — без зависимостей, чтобы работать и в
 * node-тестах. `{project}` подставляет api-client из cookie; явный
 * `projectKey` строит путь проекта-источника для «Скопировать с проекта».
 */
export const PAY_BASE = "/api/admin/v1/projects/{project}/pay";

export function payBaseFor(projectKey?: string): string {
  return projectKey
    ? `/api/admin/v1/projects/${encodeURIComponent(projectKey)}/pay`
    : PAY_BASE;
}

export function paymentProvidersPath(): string {
  return `${PAY_BASE}/providers`;
}

export function paymentProviderPath(
  provider: string,
  projectKey?: string,
): string {
  return `${payBaseFor(projectKey)}/providers/${encodeURIComponent(provider)}`;
}

export type PaymentStatusFilter =
  | "created"
  | "pending"
  | "succeeded"
  | "failed"
  | "canceled"
  | "refunded_partial"
  | "refunded_full";

export type PaymentsPathFilters = {
  status?: PaymentStatusFilter;
  cursor?: string;
};

export type SubscriptionsPathFilters = {
  subjectType?: string;
  cursor?: string;
};

function withQuery(
  path: string,
  params: Record<string, string | undefined>,
): string {
  const query = Object.entries(params)
    .filter(
      (entry): entry is [string, string] =>
        entry[1] !== undefined && entry[1] !== "",
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
  return query ? `${path}?${query}` : path;
}

export function paymentsPath(filters: PaymentsPathFilters = {}): string {
  return withQuery(`${PAY_BASE}/payments`, {
    status: filters.status,
    cursor: filters.cursor,
  });
}

export function paymentConfirmPath(id: string): string {
  return `${PAY_BASE}/payments/${encodeURIComponent(id)}/confirm`;
}

export function paymentRefundPath(id: string): string {
  return `${PAY_BASE}/payments/${encodeURIComponent(id)}/refund`;
}

export function subscriptionsPath(
  filters: SubscriptionsPathFilters = {},
): string {
  return withQuery(`${PAY_BASE}/subscriptions`, {
    subject_type: filters.subjectType,
    cursor: filters.cursor,
  });
}

export function subscriptionActionPath(id: string, action: string): string {
  return `${PAY_BASE}/subscriptions/${encodeURIComponent(id)}/${encodeURIComponent(action)}`;
}

export function plansPath(cursor?: string): string {
  return withQuery(`${PAY_BASE}/plans`, { cursor });
}

export function planPath(id: number): string {
  return `${PAY_BASE}/plans/${id}`;
}

export function planArchivePath(id: number): string {
  return `${PAY_BASE}/plans/${id}/archive`;
}
