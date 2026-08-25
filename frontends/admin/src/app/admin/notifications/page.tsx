import type { Metadata } from "next";

import NotificationsPage from "@/components/pages/notifications";

export const metadata: Metadata = {
  title: "Notifications · Ætheria Admin",
  description: "Stay on top of orders, inventory, customers, and system events as they happen.",
};

export default function AdminNotificationsPage() {
  return <NotificationsPage />;
}
