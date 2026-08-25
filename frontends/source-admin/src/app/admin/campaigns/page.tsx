import CampaignsPage from "@/components/pages/campaigns";

export const metadata = {
  title: "Campaigns | Ætheria Admin",
  description:
    "Launch and monitor unified marketing campaigns linking curated collections with dedicated promotions.",
};

/**
 * Client-driven campaigns list (same pattern as products/collections/brands):
 * no SSR seed so useCampaignsQuery isPending can drive the full-page skeleton.
 */
export default function CampaignsRoute() {
  return <CampaignsPage />;
}
