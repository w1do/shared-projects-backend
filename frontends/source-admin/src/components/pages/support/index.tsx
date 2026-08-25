"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { type SupportTicket, type TicketStatus } from "@/lib/admin/mocks/support";
import { useSupportPage } from "@/hooks/admin/support";

import { SupportStats } from "./sections/support-stats";
import { SupportInbox } from "./sections/support-inbox";
import { SupportLoadingState } from "./loading";

interface SupportPageProps {
  /** Optional seed for tests; omit in production so skeleton can show. */
  initialTickets?: SupportTicket[];
}

/** Support page — inbox via useSupportPage (TanStack Query). */
export default function SupportPage({ initialTickets }: SupportPageProps = {}) {
  const {
    tickets,
    filtered,
    selectedTicket,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectTicket,
    updateStatus,
    sendMessage,
    isPending,
  } = useSupportPage(initialTickets !== undefined ? { initialTickets } : {});

  if (isPending) {
    return <SupportLoadingState />;
  }

  const handleSelect = (ticket: SupportTicket) => {
    selectTicket(ticket.id);
  };

  const handleSend = (body: string) => {
    if (!selectedTicket) return;
    sendMessage(selectedTicket.id, body);
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (!selectedTicket) return;
    updateStatus(selectedTicket.id, status);
    toast.success(`Ticket ${selectedTicket.id} marked as ${status}`);
  };

  const handleNewTicket = () => toast.info("Opening the new ticket composer…");

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Support"
        description="Resolve customer tickets, returns, and post-purchase requests in one shared inbox."
        breadcrumbItems={[
          { label: "Admin", href: "/admin" },
          { label: "Commerce", href: "/admin/orders" },
          { label: "Support" },
        ]}
        actions={
          <Button
            variant="contained"
            color="primary"
            shape="circle"
            size="md"
            startIcon={<Plus />}
            onClick={handleNewTicket}
          >
            New Ticket
          </Button>
        }
      />

      <SupportStats tickets={tickets} />

      <SupportInbox
        tickets={filtered}
        selectedTicket={selectedTicket}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearch={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onSelect={handleSelect}
        onSend={handleSend}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
