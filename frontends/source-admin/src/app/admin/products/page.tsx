import type { Metadata } from "next";

import ProductsPage from "@/components/pages/products";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.products")} · Ætheria Admin`,
  description: t("console.meta.products-description"),
};

/**
 * Client-driven catalog list (same pattern as dashboard):
 * no SSR seed so useProductsQuery isPending can drive the full-page skeleton.
 */
export default function ProductsRoute() {
  return <ProductsPage />;
}
