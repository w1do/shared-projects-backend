import OrdersPage from "@/components/pages/orders";

export const metadata = {
  title: "Orders | Ætheria Admin",
  description: "Fulfill shipments, process returns, and capture payments.",
};

/**
 * Client-driven orders list (same pattern as products/dashboard):
 * no SSR seed so useOrdersQuery isPending can drive the full-page skeleton.
 */
export default function OrdersPageRoute() {
  return <OrdersPage />;
}
