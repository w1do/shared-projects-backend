import { Mail, MessageCircle, Instagram, Phone, type LucideIcon } from "lucide-react";
import type { TicketChannel, TicketPriority, TicketStatus } from "@/lib/admin/mocks/support";

export const STATUS_OPTIONS = [
  { value: "all", label: "All Tickets" },
  { value: "Open", label: "Open" },
  { value: "Pending", label: "Pending" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
];

export type StatusFilter = TicketStatus | "all";

export const statusBadgeColor = (
  status: TicketStatus,
): "danger" | "accent" | "success" | "muted" => {
  switch (status) {
    case "Open":
      return "danger";
    case "Pending":
      return "accent";
    case "Resolved":
      return "success";
    case "Closed":
    default:
      return "muted";
  }
};

/** Priority dot color token (background class). */
export const priorityDotClass = (priority: TicketPriority): string => {
  switch (priority) {
    case "Urgent":
      return "bg-destructive";
    case "High":
      return "bg-warning";
    case "Normal":
      return "bg-primary";
    case "Low":
    default:
      return "bg-muted-foreground-lighter/50";
  }
};

export const channelIcon: Record<TicketChannel, LucideIcon> = {
  Email: Mail,
  "Live Chat": MessageCircle,
  Instagram: Instagram,
  WhatsApp: Phone,
};
