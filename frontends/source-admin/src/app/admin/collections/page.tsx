import type { Metadata } from "next";

import CollectionsPage from "@/components/pages/collections";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.collections")} · Ætheria Admin`,
  description: t("console.meta.collections-description"),
};

/**
 * Client-driven collections list (same pattern as products/dashboard):
 * no SSR seed so useCollectionsQuery isPending can drive the full-page skeleton.
 */
export default function AdminCollectionsPage() {
  return <CollectionsPage />;
}
