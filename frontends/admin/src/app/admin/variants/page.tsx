import type { Metadata } from "next";

import VariantsPage from "@/components/pages/variants";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.variants")} · Ætheria Admin`,
  description: t("console.meta.variants-description"),
};

/**
 * Client-driven variant links page (same pattern as products/dashboard):
 * no SSR seed so useVariantsQuery isPending can drive the full-page skeleton.
 */
export default function VariantsRoute() {
  return <VariantsPage />;
}
