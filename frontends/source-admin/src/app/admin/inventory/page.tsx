import type { Metadata } from "next";

import InventoryPage from "@/components/pages/inventory";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.inventory")} · Ætheria Admin`,
  description: t("console.meta.inventory-description"),
};

/**
 * Client-driven inventory list (same pattern as products/dashboard):
 * no SSR seed so useInventoryQuery isPending can drive the full-page skeleton.
 */
export default function AdminInventoryPage() {
  return <InventoryPage />;
}
