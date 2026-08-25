import VariantsPage from "@/components/pages/variants";

export const metadata = {
  title: "Variant Links · Ætheria Admin",
  description: "Connect standalone catalog products into option switchers on the storefront.",
};

/**
 * Client-driven variant links page (same pattern as products/dashboard):
 * no SSR seed so useVariantsQuery isPending can drive the full-page skeleton.
 */
export default function VariantsRoute() {
  return <VariantsPage />;
}
