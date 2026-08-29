"use client";

import { type ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/navigation/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { AdminFooter } from "./AdminFooter";
import { FloatingActions } from "./floating";
import { AdminModalsProvider, useAdminModals } from "./modals";
import { InviteMemberDialog } from "@/components/pages/settings/sections/invite-member-dialog";
import type { TeamMember } from "@/lib/admin/mocks/settings";
import { QueryProvider } from "@/components/providers/QueryProvider";

function AdminShellModals() {
  const { isOpen, closeModal } = useAdminModals();

  const handleInvited = (member: TeamMember) => {
    window.dispatchEvent(new CustomEvent("team-member-invited", { detail: member }));
  };

  return (
    <>
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
