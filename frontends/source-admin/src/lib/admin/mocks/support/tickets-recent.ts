import type { SupportTicket } from "./types";
import { semanticColors } from "@/lib/theme-colors";

/**
 * Support inbox tickets — recent batch (returns, order issues, guidance).
 */
export const recentSupportTickets: SupportTicket[] = [
  {
    id: "TCK-2042",
    subject: "Serum arrived with a broken pump",
    customer: {
      name: "Mai Tran",
      email: "mai.tran@aetheria.com",
      initials: "MT",
      gradient: [semanticColors.accent, semanticColors.brandAccent],
    },
    status: "Open",
    priority: "Urgent",
    channel: "Email",
    orderId: "AET-10482",
    assignee: "Unassigned",
    createdAt: "2026-06-06T08:12:00Z",
    updatedAt: "2026-06-07T07:40:00Z",
    unread: true,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Mai Tran",
        body: "Hi! My Radiant Glow serum came with a cracked pump and it leaked over the box. Can I get a replacement?",
        sentAt: "2026-06-06T08:12:00Z",
      },
      {
        id: "m2",
        author: "customer",
        authorName: "Mai Tran",
        body: "I've attached a photo of the packaging. The product itself still looks sealed.",
        sentAt: "2026-06-06T08:14:00Z",
      },
    ],
  },
  {
    id: "TCK-2041",
    subject: "Which moisturizer suits oily skin?",
    customer: {
      name: "Soo-jin Park",
      email: "soojin.park@kbeauty.co.kr",
      initials: "SP",
      gradient: [semanticColors.infoBg, semanticColors.info],
    },
    status: "Pending",
    priority: "Normal",
    channel: "Live Chat",
    assignee: "Lena Fischer",
    createdAt: "2026-06-05T15:30:00Z",
    updatedAt: "2026-06-06T09:10:00Z",
    unread: false,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Soo-jin Park",
        body: "Could you recommend a lightweight moisturizer for oily, acne-prone skin?",
        sentAt: "2026-06-05T15:30:00Z",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "Lena Fischer",
        body: "Absolutely! The Arctic Marine Gel-Cream is oil-free and great for that. Want me to share a sample link?",
        sentAt: "2026-06-05T15:48:00Z",
      },
    ],
  },
  {
    id: "TCK-2039",
    subject: "Refund status for returned order",
    customer: {
      name: "Elena Rossi",
      email: "elena.rossi@milanodesign.it",
      initials: "ER",
      gradient: [semanticColors.successBg, semanticColors.success],
    },
    status: "Open",
    priority: "High",
    channel: "WhatsApp",
    orderId: "AET-10477",
    assignee: "Marco Bianchi",
    createdAt: "2026-06-04T11:05:00Z",
    updatedAt: "2026-06-06T18:22:00Z",
    unread: true,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Elena Rossi",
        body: "I returned my order five days ago but haven't seen the refund yet. Could you check?",
        sentAt: "2026-06-04T11:05:00Z",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "Marco Bianchi",
        body: "Thanks for your patience, Elena. The warehouse confirmed receipt — refunds post within 3 business days.",
        sentAt: "2026-06-04T13:20:00Z",
      },
      {
        id: "m3",
        author: "customer",
        authorName: "Elena Rossi",
        body: "Understood, thank you. I'll keep an eye on my account.",
        sentAt: "2026-06-04T13:35:00Z",
      },
    ],
  },
];
