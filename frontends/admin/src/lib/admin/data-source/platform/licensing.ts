/**
 * Licensing-API панели: организации-покупатели, планы поставки с фичами,
 * perpetual-лицензии (выпуск/продление/показ ключа/офлайн-активация/отзыв),
 * установки, каталог релизов и публичный ключ подписи проекта.
 *
 * Списки — курсорная пагинация платформы (per_page = 50, без total):
 * страница отдаётся вместе с курсорами, дальше листает вызывающий.
 */

import { t } from "@/lib/admin/console-texts";
import {
  AdminApiError,
  adminApiGet,
  adminApiSend,
  resolvePath,
  toEnvelope,
} from "../api-client";
import { apiBaseUrl, getAuthToken } from "../session";
import {
  licensingInstallationRevokePath,
  licensingLicenseInstallationsPath,
  licensingLicenseOfflineActivationPath,
  licensingLicensePath,
  licensingLicenseRenewPath,
  licensingLicenseRevealKeyPath,
  licensingLicenseRevokePath,
  licensingLicensesPath,
  licensingOrganizationPath,
  licensingOrganizationsPath,
  licensingPlanFeaturePath,
  licensingPlanFeaturesPath,
  licensingPlanPath,
  licensingPlansPath,
  licensingReleasePath,
  licensingReleasesPath,
  licensingSigningKeyPath,
  type LicensesPathFilters,
  type LicenseStatusFilter,
} from "./licensing-paths";

export type { LicensesPathFilters, LicenseStatusFilter };

/** Курсорная страница платформы: элементы + курсоры, без total. */
export type LicensingCursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
};

export type PlatformLicensingOrganization = {
  id: number;
  name: string;
  contact_first_name: string;
  contact_last_name: string;
  phone: string | null;
  email: string;
  telegram: string | null;
  activity: string | null;
  employees_count: number | null;
  usage_purpose: string | null;
  created_at: string | null;
};

/** Upsert анкеты: непереданное поле сервер не трогает (Optional-семантика). */
export type UpsertLicensingOrganizationInput = {
  name: string;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  phone?: string | null;
  telegram?: string | null;
  activity?: string | null;
  employees_count?: number | null;
  usage_purpose?: string | null;
};

export type PlatformLicensingPlanFeature = {
  id: number;
  plan_id?: number;
  /** null — базовая фича плана, число — переопределение этой организации. */
  organization_id: number | null;
  code: string;
  name: string;
};

export type PlatformLicensingPlan = {
  id: number;
  code: string;
  name: string;
  price_minor: number | null;
  currency: string | null;
  interval: "day" | "month" | "year" | null;
  features: PlatformLicensingPlanFeature[];
  overrides: PlatformLicensingPlanFeature[];
};

/** Цена периода — вся тройка или ничего; инвариант держит бэкенд. */
export type UpsertLicensingPlanInput = {
  code: string;
  name: string;
  price_minor?: number | null;
  currency?: string | null;
  interval?: "day" | "month" | "year" | null;
};

export type UpsertLicensingPlanFeatureInput = {
  code: string;
  name: string;
  organization_id?: number | null;
};

export type PlatformLicense = {
  id: string;
  /** Полный ключ недоступен после выпуска — только префикс для поиска. */
  key_prefix: string;
  status: LicenseStatusFilter;
  organization: { id: number; name: string } | null;
  plan: { id: number; code: string; name: string } | null;
  edition: string;
  features: string[];
  entitled_version: string | null;
  /** Дата конца окна обновлений (Y-m-d) — лицензия при этом бессрочна. */
  updates_until: string;
  max_installations: number;
  active_installations: number;
  /** Ключ авто-выпущенной лицензии ещё не показан — доступен reveal-key. */
  reveal_available: boolean;
  note: string | null;
  issued_at: string | null;
  revoked_at: string | null;
};

export type PlatformLicenseInstallation = {
  id: number;
  install_id: string;
  domain: string;
  app_version: string | null;
  last_ip: string | null;
  last_seen_at: string | null;
  status: "active" | "revoked";
  revoked_at: string | null;
};

export type PlatformLicenseDetails = PlatformLicense & {
  installations: PlatformLicenseInstallation[];
};

/** Ответ выпуска — единственное место с полным ключом. */
export type PlatformIssuedLicense = PlatformLicense & { key: string };

export type IssueLicenseInput = {
  organization_id: number;
  plan_id: number;
  updates_until: string;
  max_installations?: number;
  entitled_version?: string | null;
  note?: string | null;
};

export type RenewLicenseInput = { updates_until: string };

export type OfflineActivationInput = {
  install_id: string;
  domain: string;
  app_version?: string | null;
};

export type PlatformOfflineActivation = {
  token: string;
  install_id: string;
  domain: string;
};

export type PlatformRevealedKey = { key: string };

export type PlatformLicensingRelease = {
  id: number;
  version: string;
  train: string;
  repository: string;
  released_at: string;
  is_security: boolean;
  min_upgrade_from: string | null;
  changelog_url: string | null;
};

export type UpsertLicensingReleaseInput = {
  version: string;
  train: string;
  repository: string;
  released_at: string;
  is_security?: boolean;
  min_upgrade_from?: string | null;
  changelog_url?: string | null;
};

export type PlatformLicensingSigningKey = { public_key: string };

/** GET курсорной страницы: конверт платформы + meta-курсоры. */
async function getCursorPage<T>(path: string): Promise<LicensingCursorPage<T>> {
  const url = `${apiBaseUrl()}${resolvePath(path)}`;
  const token = getAuthToken();

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new AdminApiError(t("console.api.unreachable"), "network", 0);
  }

  let meta:
    | { next_cursor?: string | null; prev_cursor?: string | null }
    | undefined;
  try {
    meta = ((await response.clone().json()) as { meta?: typeof meta })?.meta;
  } catch {
    meta = undefined;
  }

  const envelope = await toEnvelope<T[]>(response);
  return {
    items: envelope.data ?? [],
    nextCursor: meta?.next_cursor ?? null,
    prevCursor: meta?.prev_cursor ?? null,
  };
}

// ----------------------------------------------------------- организации

export function getLicensingOrganizations(cursor?: string) {
  return getCursorPage<PlatformLicensingOrganization>(
    licensingOrganizationsPath(cursor),
  );
}

export function createLicensingOrganization(
  input: UpsertLicensingOrganizationInput,
) {
  return adminApiSend<PlatformLicensingOrganization>(
    licensingOrganizationsPath(),
    {
      method: "POST",
      body: input,
    },
  );
}

export function updateLicensingOrganization(
  id: number,
  input: UpsertLicensingOrganizationInput,
) {
  return adminApiSend<PlatformLicensingOrganization>(
    licensingOrganizationPath(id),
    {
      method: "PUT",
      body: input,
    },
  );
}

export function deleteLicensingOrganization(id: number) {
  return adminApiSend<null>(licensingOrganizationPath(id), {
    method: "DELETE",
  });
}

// ----------------------------------------------------------------- планы

export function getLicensingPlans(cursor?: string) {
  return getCursorPage<PlatformLicensingPlan>(licensingPlansPath(cursor));
}

export function getLicensingPlan(id: number) {
  return adminApiGet<PlatformLicensingPlan>(licensingPlanPath(id));
}

export function createLicensingPlan(input: UpsertLicensingPlanInput) {
  return adminApiSend<PlatformLicensingPlan>(licensingPlansPath(), {
    method: "POST",
    body: input,
  });
}

export function updateLicensingPlan(
  id: number,
  input: UpsertLicensingPlanInput,
) {
  return adminApiSend<PlatformLicensingPlan>(licensingPlanPath(id), {
    method: "PUT",
    body: input,
  });
}

export function deleteLicensingPlan(id: number) {
  return adminApiSend<null>(licensingPlanPath(id), { method: "DELETE" });
}

export function createLicensingPlanFeature(
  planId: number,
  input: UpsertLicensingPlanFeatureInput,
) {
  return adminApiSend<PlatformLicensingPlanFeature>(
    licensingPlanFeaturesPath(planId),
    {
      method: "POST",
      body: input,
    },
  );
}

export function updateLicensingPlanFeature(
  planId: number,
  featureId: number,
  input: UpsertLicensingPlanFeatureInput,
) {
  return adminApiSend<PlatformLicensingPlanFeature>(
    licensingPlanFeaturePath(planId, featureId),
    { method: "PUT", body: input },
  );
}

export function deleteLicensingPlanFeature(planId: number, featureId: number) {
  return adminApiSend<null>(licensingPlanFeaturePath(planId, featureId), {
    method: "DELETE",
  });
}

// -------------------------------------------------------------- лицензии

export function getLicenses(filters?: LicensesPathFilters) {
  return getCursorPage<PlatformLicense>(licensingLicensesPath(filters));
}

export function issueLicense(input: IssueLicenseInput) {
  return adminApiSend<PlatformIssuedLicense>(licensingLicensesPath(), {
    method: "POST",
    body: input,
  });
}

export function getLicense(id: string) {
  return adminApiGet<PlatformLicenseDetails>(licensingLicensePath(id));
}

export function renewLicense(id: string, input: RenewLicenseInput) {
  return adminApiSend<PlatformLicense>(licensingLicenseRenewPath(id), {
    method: "POST",
    body: input,
  });
}

/** Однократный показ ключа авто-выпущенной лицензии: повтор — доменная 422. */
export function revealLicenseKey(id: string) {
  return adminApiSend<PlatformRevealedKey>(licensingLicenseRevealKeyPath(id), {
    method: "POST",
  });
}

export function offlineActivateLicense(
  id: string,
  input: OfflineActivationInput,
) {
  return adminApiSend<PlatformOfflineActivation>(
    licensingLicenseOfflineActivationPath(id),
    { method: "POST", body: input },
  );
}

export function revokeLicense(id: string) {
  return adminApiSend<PlatformLicense>(licensingLicenseRevokePath(id), {
    method: "POST",
  });
}

// ------------------------------------------------------------- установки

export function getLicenseInstallations(id: string, appVersionBelow?: string) {
  return adminApiGet<PlatformLicenseInstallation[]>(
    licensingLicenseInstallationsPath(id, appVersionBelow),
  );
}

export function revokeLicenseInstallation(installationId: number) {
  return adminApiSend<PlatformLicenseInstallation>(
    licensingInstallationRevokePath(installationId),
    { method: "POST" },
  );
}

// ---------------------------------------------------------------- релизы

export function getLicensingReleases(cursor?: string) {
  return getCursorPage<PlatformLicensingRelease>(licensingReleasesPath(cursor));
}

export function createLicensingRelease(input: UpsertLicensingReleaseInput) {
  return adminApiSend<PlatformLicensingRelease>(licensingReleasesPath(), {
    method: "POST",
    body: input,
  });
}

export function updateLicensingRelease(
  id: number,
  input: UpsertLicensingReleaseInput,
) {
  return adminApiSend<PlatformLicensingRelease>(licensingReleasePath(id), {
    method: "PUT",
    body: input,
  });
}

export function deleteLicensingRelease(id: number) {
  return adminApiSend<null>(licensingReleasePath(id), { method: "DELETE" });
}

export function getLicensingSigningKey() {
  return adminApiGet<PlatformLicensingSigningKey>(licensingSigningKeyPath());
}
