"use client";

import { type ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/navigation/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { AdminFooter } from "./AdminFooter";
import { FloatingActions } from "./floating";
import { AdminModalsProvider, useAdminModals } from "./modals";
import { PromotionFormModal } from "@/components/pages/promotions/sections/promotion-form-modal";
import { CampaignLaunchModal } from "@/components/pages/campaigns/sections/campaign-launch-modal";
import { InviteMemberDialog } from "@/components/pages/settings/sections/invite-member-dialog";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import type { TeamMember } from "@/lib/admin/mocks/settings";
import { useCreatePromotionMutation } from "@/hooks/admin/promotions";
import { toast } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";

function AdminShellModals() {
  const { isOpen, closeModal } = useAdminModals();
  const createPromotionMutation = useCreatePromotionMutation();

  const handleSubmitPromotion = async (promotion: Promotion) => {
    try {
      await createPromotionMutation.mutateAsync(promotion);
    } catch {
      toast.error("Could not save promotion.");
      return;
    }
  };

  const handleInvited = (member: TeamMember) => {
    window.dispatchEvent(new CustomEvent("team-member-invited", { detail: member }));
  };

  return (
    <>
      <PromotionFormModal
        promotion={null}
        isOpen={isOpen.promotion}
        onClose={() => closeModal("promotion")}
        onSubmit={handleSubmitPromotion}
      />

      <CampaignLaunchModal
        isOpen={isOpen.campaignLaunch}
        onClose={() => closeModal("campaignLaunch")}
      />

      <InviteMemberDialog
        isOpen={isOpen.inviteMember}
        onClose={() => closeModal("inviteMember")}
        onInvited={handleInvited}
      />
    </>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AdminModalsProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background relative">
            <AdminSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <AdminTopbar />
              <main className="flex flex-1 flex-col px-4 py-8 md:px-24 md:py-10">
                <div className="mx-auto w-full flex-1">{children}</div>
                <AdminFooter />
              </main>
            </div>

            <FloatingActions />
          </div>

          <AdminShellModals />
        </SidebarProvider>
      </AdminModalsProvider>
    </QueryProvider>
  );
}
