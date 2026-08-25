import type { Campaign } from "../types";
import { initialCampaigns } from "../campaigns-data";
import { readStoredCampaigns } from "@/lib/admin/campaigns/store";

export const mockCampaigns: Campaign[] = initialCampaigns;

if (typeof window !== "undefined") {
  const stored = [...readStoredCampaigns()];
  mockCampaigns.length = 0;
  mockCampaigns.push(...stored);
}
