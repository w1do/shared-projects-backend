import type { SupportTicket } from "./types";
import { semanticColors } from "@/lib/theme-colors";

/**
 * Support inbox tickets — earlier batch (mostly resolved and closed).
 */
export const earlierSupportTickets: SupportTicket[] = [
  {
    id: "TCK-2035",
    subject: "Loyalty points not applied",
    customer: {
      name: "Noa Levi",
      email: "noa.levi@telaviv.org",
      initials: "NL",
      gradient: [semanticColors.accent, semanticColors.warning],
    },
    status: "Pending",
    priority: "Normal",
    channel: "Email",
    assignee: "Lena Fischer",
    createdAt: "2026-06-03T09:40:00Z",
    updatedAt: "2026-06-05T10:05:00Z",
    unread: false,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Noa Levi",
        body: "My Solar Quartz order didn't credit the 2× loyalty points from the weekend promo.",
        sentAt: "2026-06-03T09:40:00Z",
      },
    ],
  },
  {
    id: "TCK-2030",
    subject: "Allergy question about fragrance",
    customer: {
      name: "Hana Kobayashi",
      email: "hana.k@tokyolink.jp",
      initials: "HK",
      gradient: [semanticColors.accent, semanticColors.chart3],
    },
    status: "Resolved",
    priority: "Low",
    channel: "Instagram",
    assignee: "Marco Bianchi",
    createdAt: "2026-05-30T14:10:00Z",
    updatedAt: "2026-06-01T08:00:00Z",
    unread: false,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Hana Kobayashi",
        body: "Is the Velvet Hour night cream fragrance-free? I have sensitive skin.",
        sentAt: "2026-05-30T14:10:00Z",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "Marco Bianchi",
        body: "It uses a very mild botanical scent. We also offer a fragrance-free variant — linking it here.",
        sentAt: "2026-05-30T14:32:00Z",
      },
      {
        id: "m3",
        author: "customer",
        authorName: "Hana Kobayashi",
        body: "Perfect, thank you so much!",
        sentAt: "2026-05-30T14:40:00Z",
      },
    ],
  },
  {
    id: "TCK-2024",
    subject: "Wrong shade delivered",
    customer: {
      name: "Alexander Wright",
      email: "alex.wright@creative-lab.co",
      initials: "AW",
      gradient: [semanticColors.muted, semanticColors.primary],
    },
    status: "Closed",
    priority: "Normal",
    channel: "Email",
    orderId: "AET-10477",
    assignee: "Lena Fischer",
    createdAt: "2026-05-25T16:00:00Z",
    updatedAt: "2026-05-28T12:00:00Z",
    unread: false,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Alexander Wright",
        body: "I ordered the warm beige tint but received the cool tone instead.",
        sentAt: "2026-05-25T16:00:00Z",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "Lena Fischer",
        body: "So sorry about that! A replacement is on the way and you can keep the wrong item.",
        sentAt: "2026-05-25T16:20:00Z",
      },
    ],
  },
];
