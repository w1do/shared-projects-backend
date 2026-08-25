export type TicketStatus = "Open" | "Pending" | "Resolved" | "Closed";
export type TicketPriority = "Urgent" | "High" | "Normal" | "Low";
export type TicketChannel = "Email" | "Live Chat" | "Instagram" | "WhatsApp";

export type TicketMessage = {
  id: string;
  author: "customer" | "agent";
  authorName: string;
  body: string;
  sentAt: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  customer: {
    name: string;
    email: string;
    initials: string;
    gradient: [string, string];
  };
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  orderId?: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  unread: boolean;
  messages: TicketMessage[];
};
