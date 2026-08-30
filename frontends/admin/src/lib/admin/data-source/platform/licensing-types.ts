/** Типы licensing-API панели: организации, планы, лицензии, установки, релизы. */

import type {
  LicensesPathFilters,
  LicenseStatusFilter,
} from "./licensing-paths";

export type { LicensesPathFilters, LicenseStatusFilter };

export type { LicensingCursorPage } from "./cursor-page";
export { getCursorPage } from "./cursor-page";

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
