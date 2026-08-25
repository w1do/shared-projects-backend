import type { Campaign } from "@/lib/admin/mocks/types";
import type { CampaignFormValues } from "@/lib/admin/schemas/content/campaign-form-schema";
import { getAdminCampaignById, getAdminCampaigns } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";
import {
  createStoredCampaign,
  deleteStoredCampaign,
  findStoredCampaign,
  readStoredCampaigns,
  updateStoredCampaign,
} from "@/lib/admin/campaigns/store";
import { getCampaignCapabilities } from "./capabilities";

export { getCampaignCapabilities };

function assertCampaignWriteAllowed(): void {
  const caps = getCampaignCapabilities();
  if (!caps.write) {
    throw new Error(
      caps.writeReason ?? "Campaign writes are not available in the current data mode.",
    );
  }
}

/**
 * Canonical campaign list loader for TanStack Query.
 * Mock latency comes from mockNetworkDelay so list pages can share skeleton UX.
 */
export async function listCampaigns(): Promise<Campaign[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    if (typeof window === "undefined") {
      return getAdminCampaigns();
    }
    return readStoredCampaigns();
  }
  return getAdminCampaigns();
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  if (!shouldUseAdminApi()) {
    if (typeof window === "undefined") {
      return getAdminCampaignById(id);
    }
    return findStoredCampaign(id);
  }
  return getAdminCampaignById(id);
}

export async function createCampaign(values: CampaignFormValues): Promise<Campaign> {
  assertCampaignWriteAllowed();
  return createStoredCampaign(values);
}

export async function updateCampaign(
  id: string,
  values: CampaignFormValues,
): Promise<Campaign | null> {
  assertCampaignWriteAllowed();
  return updateStoredCampaign(id, values);
}

export async function deleteCampaign(id: string): Promise<void> {
  assertCampaignWriteAllowed();
  deleteStoredCampaign(id);
}

/** Client rehydrate after SSR seed. */
export function rehydrateCampaigns(serverList: Campaign[] = []): Campaign[] {
  if (shouldUseAdminApi() || typeof window === "undefined") return serverList;
  return readStoredCampaigns();
}

/** @deprecated Prefer rehydrateCampaigns */
export function rehydrateMockCampaigns(): Campaign[] {
  return readStoredCampaigns();
}
