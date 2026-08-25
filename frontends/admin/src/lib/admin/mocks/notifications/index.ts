import type { AdminNotification } from "./types";

export * from "./types";

const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();
const hoursAgo = (hours: number) => minutesAgo(hours * 60);
const daysAgo = (days: number) => hoursAgo(days * 24);

/**
 * Operational notifications surfaced in the admin notification center —
 * orders, inventory, customers, promotions, support, and system events.
 */
export const mockNotifications: AdminNotification[] = [
  {
    id: "ntf-01",
    type: "order",
    title: "New order AET-10482",
    description: "Mai Tran placed a $412.00 order paid via Visa.",
    createdAt: minutesAgo(8),
    read: false,
    href: "/admin/orders",
    actionLabel: "View order",
  },
  {
    id: "ntf-02",
    type: "support",
    title: "Urgent ticket opened",
    description: "TCK-2042 — Serum arrived with a broken pump.",
    createdAt: minutesAgo(35),
    read: false,
    href: "/admin/support",
    actionLabel: "Open ticket",
  },
  {
    id: "ntf-03",
    type: "inventory",
    title: "Low stock alert",
    description: "Prism Light Serum dropped below 16 units.",
    createdAt: minutesAgo(52),
    read: false,
    href: "/admin/inventory",
    actionLabel: "Restock",
  },
  {
    id: "ntf-04",
    type: "customer",
    title: "New Platinum member",
    description: "Marcus Chen reached Platinum tier this month.",
    createdAt: hoursAgo(3),
    read: false,
    href: "/admin/customers",
    actionLabel: "View profile",
  },
  {
    id: "ntf-05",
    type: "promotion",
    title: "Promotion ending soon",
    description: "ARCTIC15 ends in 3 days — pacing at 78% of cap.",
    createdAt: hoursAgo(6),
    read: true,
    href: "/admin/promotions",
    actionLabel: "Review",
  },
  {
    id: "ntf-06",
    type: "system",
    title: "Export ready",
    description: "Your orders CSV export finished and is ready to download.",
    createdAt: hoursAgo(9),
    read: true,
  },
  {
    id: "ntf-07",
    type: "order",
    title: "Refund processed",
    description: "AET-10477 was refunded $233.20 to the customer.",
    createdAt: daysAgo(1),
    read: false,
    href: "/admin/orders",
    actionLabel: "View order",
  },
  {
    id: "ntf-08",
    type: "inventory",
    title: "Back in stock",
    description: "Golden Glow Essence has been replenished to 120 units.",
    createdAt: daysAgo(1),
    read: true,
    href: "/admin/inventory",
  },
  {
    id: "ntf-09",
    type: "system",
    title: "New sign-in detected",
    description: "A new device signed in from Ho Chi Minh City.",
    createdAt: daysAgo(2),
    read: true,
  },
  {
    id: "ntf-10",
    type: "customer",
    title: "Review milestone",
    description: "Bichup Self-Generating Essence passed 500 reviews.",
    createdAt: daysAgo(4),
    read: true,
    href: "/admin/products",
  },
  {
    id: "ntf-11",
    type: "promotion",
    title: "Campaign launched",
    description: "GLOW25 went live across Instagram and TikTok.",
    createdAt: daysAgo(6),
    read: true,
    href: "/admin/promotions",
  },
];
