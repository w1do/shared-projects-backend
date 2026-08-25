import BrandsPage from "@/components/pages/brands";

export const metadata = {
  title: "Brands · Ætheria Admin",
  description: "Manage luxury cosmetics brand portfolio and portfolio statistics.",
};

/**
 * Client-driven brands list (same pattern as products/dashboard):
 * no SSR seed so useBrandsQuery isPending can drive the full-page skeleton.
 */
export default function BrandsRoute() {
  return <BrandsPage />;
}
