"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminModals } from "@/components/layout/modals";

/**
 * Deep-link entry for Launch campaign.
 * Opens the shared CampaignLaunchModal via admin modals context, then returns
 * to the campaigns workspace so layout stays inside the admin shell.
 */
export default function CampaignLaunchDeepLinkPage() {
  const router = useRouter();
  const { openModal } = useAdminModals();

  useEffect(() => {
    openModal("campaignLaunch");
    router.replace("/admin/campaigns");
  }, [openModal, router]);

  return (
    <div className="flex min-h-40 items-center justify-center text-body text-muted-foreground">
      Opening launch dialog…
    </div>
  );
}
