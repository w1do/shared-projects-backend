import type { Metadata } from "next";

import OrdersPage from "@/components/pages/orders";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.orders")} · Ætheria Admin`,
  description: t("console.meta.orders-description"),
};

/**
 * Client-driven orders list (same pattern as products/dashboard):
 * no SSR seed so useOrdersQuery isPending can drive the full-page skeleton.
 */
export default function OrdersPageRoute() {
  return <OrdersPage />;
}
