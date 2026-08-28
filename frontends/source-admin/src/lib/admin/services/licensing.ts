/**
 * Фасад лицензирования: сгруппированные операции admin-API модуля.
 * Hooks раздела работают через него, не через data-source напрямую.
 */

import * as platformLicensing from "@/lib/admin/data-source/platform/licensing";

export type {
  IssueLicenseInput,
  LicensesPathFilters,
  LicenseStatusFilter,
  LicensingCursorPage,
  OfflineActivationInput,
  PlatformIssuedLicense,
  PlatformLicense,
  PlatformLicenseDetails,
  PlatformLicenseInstallation,
  PlatformLicensingOrganization,
  PlatformLicensingPlan,
  PlatformLicensingPlanFeature,
  PlatformLicensingRelease,
  PlatformLicensingSigningKey,
  PlatformOfflineActivation,
  PlatformRevealedKey,
  RenewLicenseInput,
  UpsertLicensingOrganizationInput,
  UpsertLicensingPlanFeatureInput,
  UpsertLicensingPlanInput,
  UpsertLicensingReleaseInput,
} from "@/lib/admin/data-source/platform/licensing";

/** Организации-покупатели: список и CRUD анкеты. */
export const licensingOrganizations = {
  list: (cursor?: string) =>
    platformLicensing.getLicensingOrganizations(cursor),
  create: (input: platformLicensing.UpsertLicensingOrganizationInput) =>
    platformLicensing.createLicensingOrganization(input),
  update: (
    id: number,
    input: platformLicensing.UpsertLicensingOrganizationInput,
  ) => platformLicensing.updateLicensingOrganization(id, input),
  remove: (id: number) => platformLicensing.deleteLicensingOrganization(id),
};

/** Планы поставки: CRUD и фичи (базовые + пер-организационные). */
export const licensingPlans = {
  list: (cursor?: string) => platformLicensing.getLicensingPlans(cursor),
  get: (id: number) => platformLicensing.getLicensingPlan(id),
  create: (input: platformLicensing.UpsertLicensingPlanInput) =>
    platformLicensing.createLicensingPlan(input),
  update: (id: number, input: platformLicensing.UpsertLicensingPlanInput) =>
    platformLicensing.updateLicensingPlan(id, input),
  remove: (id: number) => platformLicensing.deleteLicensingPlan(id),
  addFeature: (
    planId: number,
    input: platformLicensing.UpsertLicensingPlanFeatureInput,
  ) => platformLicensing.createLicensingPlanFeature(planId, input),
  updateFeature: (
    planId: number,
    featureId: number,
    input: platformLicensing.UpsertLicensingPlanFeatureInput,
  ) => platformLicensing.updateLicensingPlanFeature(planId, featureId, input),
  removeFeature: (planId: number, featureId: number) =>
    platformLicensing.deleteLicensingPlanFeature(planId, featureId),
};

/**
 * Perpetual-лицензии: список с фильтрами, выпуск (ключ один раз), продление,
 * показ ключа, офлайн-активация, отзыв, установки и ключ подписи.
 */
export const licensingLicenses = {
  list: (filters?: platformLicensing.LicensesPathFilters) =>
    platformLicensing.getLicenses(filters),
  get: (id: string) => platformLicensing.getLicense(id),
  issue: (input: platformLicensing.IssueLicenseInput) =>
    platformLicensing.issueLicense(input),
  renew: (id: string, input: platformLicensing.RenewLicenseInput) =>
    platformLicensing.renewLicense(id, input),
  revealKey: (id: string) => platformLicensing.revealLicenseKey(id),
  offlineActivate: (
    id: string,
    input: platformLicensing.OfflineActivationInput,
  ) => platformLicensing.offlineActivateLicense(id, input),
  revoke: (id: string) => platformLicensing.revokeLicense(id),
  installations: (id: string, appVersionBelow?: string) =>
    platformLicensing.getLicenseInstallations(id, appVersionBelow),
  revokeInstallation: (installationId: number) =>
    platformLicensing.revokeLicenseInstallation(installationId),
  signingKey: () => platformLicensing.getLicensingSigningKey(),
};

/** Каталог релизов поставки: список и CRUD. */
export const licensingReleases = {
  list: (cursor?: string) => platformLicensing.getLicensingReleases(cursor),
  create: (input: platformLicensing.UpsertLicensingReleaseInput) =>
    platformLicensing.createLicensingRelease(input),
  update: (id: number, input: platformLicensing.UpsertLicensingReleaseInput) =>
    platformLicensing.updateLicensingRelease(id, input),
  remove: (id: number) => platformLicensing.deleteLicensingRelease(id),
};
