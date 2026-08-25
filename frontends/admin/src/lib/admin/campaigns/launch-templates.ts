import type { CampaignFormValues } from "@/lib/admin/schemas/content/campaign-form-schema";
import type { Campaign } from "@/lib/admin/mocks/types";
import { initialCampaigns } from "@/lib/admin/mocks/campaigns-data";
import { readStoredCampaigns } from "@/lib/admin/campaigns/store";

export type CampaignLaunchTemplate = {
  id: string;
  title: string;
  tagline: string;
  insight: string;
  channel: string;
  budget: number;
  roas: number;
  image: string;
  badge?: string;
  sourceCampaignId?: string;
  prefill: CampaignFormValues;
};

function isoDateOffset(daysFromToday: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

function campaignDurationDays(campaign: Campaign): number {
  if (!campaign.startsAt || !campaign.endsAt) return 14;
  const start = new Date(campaign.startsAt).getTime();
  const end = new Date(campaign.endsAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 14;
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.min(60, Math.max(2, days || 14));
}

function toPrefill(campaign: Campaign, nameSuffix = "— relaunch"): CampaignFormValues {
  const duration = campaignDurationDays(campaign);
  return {
    name: `${campaign.name} ${nameSuffix}`.trim(),
    description: campaign.description || "",
    status: "Draft",
    channel: campaign.channel || "",
    budget: campaign.budget ?? 5000,
    startsAt: isoDateOffset(1),
    endsAt: isoDateOffset(1 + duration),
    promotionIds: [...(campaign.promotionIds ?? [])],
    collectionIds: [...(campaign.collectionIds ?? [])],
    banner: campaign.banner || "",
    thumbnail: campaign.thumbnail || "",
  };
}

/**
 * Launch templates are derived from real stored campaigns (same store as the
 * Campaigns page). Launch only edits schedule — templates must already carry
 * name, promotions, collections, and creative.
 */
export function getCampaignLaunchTemplates(): CampaignLaunchTemplate[] {
  const campaigns = typeof window !== "undefined" ? readStoredCampaigns() : [...initialCampaigns];

  const proven = campaigns
    .filter(
      (campaign) =>
        Boolean(campaign.name) &&
        (campaign.promotionIds?.length ?? 0) > 0 &&
        (campaign.collectionIds?.length ?? 0) > 0,
    )
    .slice()
    .sort((a, b) => (b.roas ?? 0) - (a.roas ?? 0));

  return proven.map((campaign) => {
    const isActive = campaign.status === "Active";
    return {
      id: `from-${campaign.id}`,
      title: campaign.name,
      tagline: campaign.description || "Reuse this campaign’s channel mix and linked assets.",
      insight: isActive
        ? `Live campaign · ${campaign.roas ? `${campaign.roas.toFixed(1)}× ROAS` : "pacing in market"}`
        : `${campaign.status ?? "Draft"} · ${campaign.channel}`,
      channel: campaign.channel,
      budget: campaign.budget ?? 0,
      roas: campaign.roas ?? 0,
      image: campaign.banner || campaign.thumbnail || "",
      badge: isActive ? "Proven" : campaign.status,
      sourceCampaignId: campaign.id,
      prefill: toPrefill(campaign),
    };
  });
}

export function getLaunchTemplateById(
  id: string | null | undefined,
): CampaignLaunchTemplate | null {
  if (!id) return null;
  return getCampaignLaunchTemplates().find((template) => template.id === id) ?? null;
}
