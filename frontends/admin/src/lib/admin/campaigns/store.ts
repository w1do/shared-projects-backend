import type { Campaign } from "@/lib/admin/mocks/types";
import { initialCampaigns } from "@/lib/admin/mocks/campaigns-data";
import { createVersionedLocalStore } from "@/lib/admin/shared/local-store";
import { storageKey } from "@/lib/site-config";

const campaignListStorageKey = storageKey("campaigns");
const campaignSeedVersionKey = storageKey("campaigns-seed-version");
const currentCampaignSeedVersion = "1";

const campaignStore = createVersionedLocalStore<Campaign>({
  storageKey: campaignListStorageKey,
  seedVersionKey: campaignSeedVersionKey,
  seedVersion: currentCampaignSeedVersion,
  seed: initialCampaigns,
});

export function readStoredCampaigns(): Campaign[] {
  return campaignStore.read();
}

export function saveStoredCampaigns(campaigns: Campaign[]) {
  campaignStore.save(campaigns);
}

export function createStoredCampaign(
  values: Omit<
    Campaign,
    "id" | "revenue" | "views" | "roas" | "performanceTrend" | "conversions" | "cap" | "spend"
  >,
): Campaign {
  const campaigns = readStoredCampaigns();
  const id = `camp-${values.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;

  const campaign: Campaign = {
    ...values,
    id,
    revenue: 0,
    views: 0,
    roas: 0,
    conversions: 0,
    cap: 1000,
    spend: 0,
    performanceTrend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 5),
  };

  saveStoredCampaigns([campaign, ...campaigns]);
  return campaign;
}

export function deleteStoredCampaign(id: string): Campaign[] {
  const nextCampaigns = readStoredCampaigns().filter((c) => c.id !== id);
  saveStoredCampaigns(nextCampaigns);
  return nextCampaigns;
}

export function findStoredCampaign(id: string): Campaign | null {
  return readStoredCampaigns().find((c) => c.id.toLowerCase() === id.toLowerCase()) ?? null;
}

export function updateStoredCampaign(
  id: string,
  values: Omit<
    Campaign,
    "id" | "revenue" | "views" | "roas" | "performanceTrend" | "conversions" | "cap" | "spend"
  >,
): Campaign | null {
  const campaigns = readStoredCampaigns();
  const target = campaigns.find((c) => c.id.toLowerCase() === id.toLowerCase());

  if (!target) {
    return null;
  }

  const nextCampaign: Campaign = {
    ...target,
    ...values,
  };

  saveStoredCampaigns(campaigns.map((c) => (c.id === target.id ? nextCampaign : c)));
  return nextCampaign;
}
