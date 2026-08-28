/**
 * Чистые построители путей licensing-API — без зависимостей, чтобы работать
 * и в node-тестах (как pay-paths). База — PAY_BASE + "/licensing": admin-маршруты
 * модуля живут под pay-префиксом gateway, сервисный гейт при этом — licensing.
 */
export const LICENSING_BASE = "/api/admin/v1/projects/{project}/pay/licensing";

export type LicenseStatusFilter = "active" | "revoked";

export type LicensesPathFilters = {
  organizationId?: number;
  status?: LicenseStatusFilter;
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

export function licensingOrganizationsPath(cursor?: string): string {
  return withQuery(`${LICENSING_BASE}/organizations`, { cursor });
}

export function licensingOrganizationPath(id: number): string {
  return `${LICENSING_BASE}/organizations/${id}`;
}

export function licensingPlansPath(cursor?: string): string {
  return withQuery(`${LICENSING_BASE}/plans`, { cursor });
}

export function licensingPlanPath(id: number): string {
  return `${LICENSING_BASE}/plans/${id}`;
}

export function licensingPlanFeaturesPath(planId: number): string {
  return `${LICENSING_BASE}/plans/${planId}/features`;
}

export function licensingPlanFeaturePath(
  planId: number,
  featureId: number,
): string {
  return `${LICENSING_BASE}/plans/${planId}/features/${featureId}`;
}

export function licensingLicensesPath(filters?: LicensesPathFilters): string {
  return withQuery(`${LICENSING_BASE}/licenses`, {
    "filter[organization_id]":
      filters?.organizationId === undefined
        ? undefined
        : String(filters.organizationId),
    "filter[status]": filters?.status,
    cursor: filters?.cursor,
  });
}

export function licensingLicensePath(id: string): string {
  return `${LICENSING_BASE}/licenses/${encodeURIComponent(id)}`;
}

export function licensingLicenseRenewPath(id: string): string {
  return `${licensingLicensePath(id)}/renew`;
}

export function licensingLicenseRevealKeyPath(id: string): string {
  return `${licensingLicensePath(id)}/reveal-key`;
}

export function licensingLicenseOfflineActivationPath(id: string): string {
  return `${licensingLicensePath(id)}/offline-activation`;
}

export function licensingLicenseInstallationsPath(
  id: string,
  appVersionBelow?: string,
): string {
  return withQuery(`${licensingLicensePath(id)}/installations`, {
    "filter[app_version_below]": appVersionBelow,
  });
}

export function licensingLicenseRevokePath(id: string): string {
  return `${licensingLicensePath(id)}/revoke`;
}

export function licensingInstallationRevokePath(installationId: number): string {
  return `${LICENSING_BASE}/installations/${installationId}/revoke`;
}

export function licensingReleasesPath(cursor?: string): string {
  return withQuery(`${LICENSING_BASE}/releases`, { cursor });
}

export function licensingReleasePath(id: number): string {
  return `${LICENSING_BASE}/releases/${id}`;
}

export function licensingSigningKeyPath(): string {
  return `${LICENSING_BASE}/signing-key`;
}
