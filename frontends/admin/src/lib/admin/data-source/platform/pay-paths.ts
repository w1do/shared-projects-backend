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
