/**
 * Licensing-API панели: организации-покупатели и планы поставки с фичами.
 * Лицензии, установки и релизы — в `licensing-licenses.ts`, типы — в
 * `licensing-types.ts`; этот модуль остаётся единой точкой входа.
 */

import { adminApiGet, adminApiSend } from "../api-client";
import {
  licensingOrganizationPath,
  licensingOrganizationsPath,
  licensingPlanFeaturePath,
  licensingPlanFeaturesPath,
  licensingPlanPath,
  licensingPlansPath,
} from "./licensing-paths";
import {
  getCursorPage,
  type PlatformLicensingOrganization,
  type PlatformLicensingPlan,
  type PlatformLicensingPlanFeature,
  type UpsertLicensingOrganizationInput,
  type UpsertLicensingPlanFeatureInput,
  type UpsertLicensingPlanInput,
} from "./licensing-types";

export * from "./licensing-types";
export * from "./licensing-licenses";

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
