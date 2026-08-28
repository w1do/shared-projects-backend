import type { Metadata } from "next";

import BrandsPage from "@/components/pages/brands";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.brands")} · Ætheria Admin`,
  description: t("console.meta.brands-description"),
};

/**
 * Client-driven brands list (same pattern as products/dashboard):
 * no SSR seed so useBrandsQuery isPending can drive the full-page skeleton.
 */
export default function BrandsRoute() {
  return <BrandsPage />;
}
