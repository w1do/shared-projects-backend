import ProductsPage from "@/components/pages/products";

export const metadata = {
  title: "Products · Ætheria Admin",
  description: "Manage the multi-brand beauty catalog: pricing, stock health, and status.",
};

/**
 * Client-driven catalog list (same pattern as dashboard):
 * no SSR seed so useProductsQuery isPending can drive the full-page skeleton.
 */
export default function ProductsRoute() {
  return <ProductsPage />;
}
