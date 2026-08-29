/** Licensing-API: perpetual-лицензии, их установки, каталог релизов и ключ подписи. */

import { adminApiGet, adminApiSend } from "../api-client";
import {
  licensingInstallationRevokePath,
  licensingLicenseInstallationsPath,
  licensingLicenseOfflineActivationPath,
  licensingLicensePath,
  licensingLicenseRenewPath,
  licensingLicenseRevealKeyPath,
  licensingLicenseRevokePath,
  licensingLicensesPath,
  licensingReleasePath,
  licensingReleasesPath,
  licensingSigningKeyPath,
} from "./licensing-paths";
import {
  getCursorPage,
  type IssueLicenseInput,
  type LicensesPathFilters,
  type OfflineActivationInput,
  type PlatformIssuedLicense,
  type PlatformLicense,
  type PlatformLicenseDetails,
  type PlatformLicenseInstallation,
  type PlatformLicensingRelease,
  type PlatformLicensingSigningKey,
  type PlatformOfflineActivation,
  type PlatformRevealedKey,
  type RenewLicenseInput,
  type UpsertLicensingReleaseInput,
} from "./licensing-types";

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
