import { EditCampaignForm } from "@/components/pages/campaigns/pages/edit/EditCampaignForm";
import { getAdminCampaignById } from "@/lib/admin/data-source/admin-data";

export const metadata = {
  title: "Edit Campaign | Ætheria Admin",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const campaign = await getAdminCampaignById(id);
  return <EditCampaignForm id={id} initialCampaign={campaign} />;
}
