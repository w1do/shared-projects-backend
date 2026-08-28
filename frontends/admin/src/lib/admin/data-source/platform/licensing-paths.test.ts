import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LICENSING_BASE,
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
} from "./licensing-paths.ts";
import { PAY_BASE } from "./pay-paths.ts";

test("база licensing — PAY_BASE + /licensing: admin-маршруты живут под pay-префиксом gateway", () => {
  assert.equal(LICENSING_BASE, `${PAY_BASE}/licensing`);
});

test("пути организаций и планов строятся от {project}-плейсхолдера", () => {
  assert.equal(
    licensingOrganizationsPath(),
    "/api/admin/v1/projects/{project}/pay/licensing/organizations",
  );
  assert.equal(
    licensingOrganizationPath(7),
    "/api/admin/v1/projects/{project}/pay/licensing/organizations/7",
  );
  assert.equal(licensingPlansPath(), "/api/admin/v1/projects/{project}/pay/licensing/plans");
  assert.equal(licensingPlanPath(3), "/api/admin/v1/projects/{project}/pay/licensing/plans/3");
  assert.equal(
    licensingPlanFeaturesPath(3),
    "/api/admin/v1/projects/{project}/pay/licensing/plans/3/features",
  );
  assert.equal(
    licensingPlanFeaturePath(3, 9),
    "/api/admin/v1/projects/{project}/pay/licensing/plans/3/features/9",
  );
  assert.equal(
    licensingSigningKeyPath(),
    "/api/admin/v1/projects/{project}/pay/licensing/signing-key",
  );
});

test("курсор добавляется query-параметром и экранируется", () => {
  assert.equal(
    licensingOrganizationsPath("abc+/="),
    "/api/admin/v1/projects/{project}/pay/licensing/organizations?cursor=abc%2B%2F%3D",
  );
  assert.equal(
    licensingPlansPath("next"),
    "/api/admin/v1/projects/{project}/pay/licensing/plans?cursor=next",
  );
});

test("фильтры лицензий кодируются в filter[...]-параметры laravel-query-builder", () => {
  assert.equal(licensingLicensesPath(), "/api/admin/v1/projects/{project}/pay/licensing/licenses");
  assert.equal(
    licensingLicensesPath({ organizationId: 5 }),
    "/api/admin/v1/projects/{project}/pay/licensing/licenses?filter%5Borganization_id%5D=5",
  );
  assert.equal(
    licensingLicensesPath({ status: "revoked", cursor: "c1" }),
    "/api/admin/v1/projects/{project}/pay/licensing/licenses?filter%5Bstatus%5D=revoked&cursor=c1",
  );
});

test("пути лицензии экранируют идентификатор", () => {
  assert.equal(
    licensingLicensePath("01J/ULID"),
    "/api/admin/v1/projects/{project}/pay/licensing/licenses/01J%2FULID",
  );
  assert.equal(
    licensingLicenseRevokePath("01J"),
    "/api/admin/v1/projects/{project}/pay/licensing/licenses/01J/revoke",
  );
});

test("действия perpetual-лицензии строятся от пути лицензии", () => {
  assert.equal(
    licensingLicenseRenewPath("01J"),
    "/api/admin/v1/projects/{project}/pay/licensing/licenses/01J/renew",
  );
  assert.equal(
    licensingLicenseRevealKeyPath("01J"),
    "/api/admin/v1/projects/{project}/pay/licensing/licenses/01J/reveal-key",
  );
  assert.equal(
    licensingLicenseOfflineActivationPath("01J"),
    "/api/admin/v1/projects/{project}/pay/licensing/licenses/01J/offline-activation",
  );
});

test("установки: список с фильтром «кто отстал» и отзыв копии", () => {
  assert.equal(
    licensingLicenseInstallationsPath("01J"),
    "/api/admin/v1/projects/{project}/pay/licensing/licenses/01J/installations",
  );
  assert.equal(
    licensingLicenseInstallationsPath("01J", "1.4.7"),
    "/api/admin/v1/projects/{project}/pay/licensing/licenses/01J/installations?filter%5Bapp_version_below%5D=1.4.7",
  );
  assert.equal(
    licensingInstallationRevokePath(9),
    "/api/admin/v1/projects/{project}/pay/licensing/installations/9/revoke",
  );
});

test("каталог релизов: список с курсором и путь релиза", () => {
  assert.equal(
    licensingReleasesPath(),
    "/api/admin/v1/projects/{project}/pay/licensing/releases",
  );
  assert.equal(
    licensingReleasesPath("next"),
    "/api/admin/v1/projects/{project}/pay/licensing/releases?cursor=next",
  );
  assert.equal(
    licensingReleasePath(4),
    "/api/admin/v1/projects/{project}/pay/licensing/releases/4",
  );
});
