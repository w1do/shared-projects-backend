import InventoryPage from "@/components/pages/inventory";

export const metadata = {
  title: "Inventory · Ætheria Admin",
  description: "Track stock levels, alert thresholds, and replenishment.",
};

/**
 * Client-driven inventory list (same pattern as products/dashboard):
 * no SSR seed so useInventoryQuery isPending can drive the full-page skeleton.
 */
export default function AdminInventoryPage() {
  return <InventoryPage />;
}
