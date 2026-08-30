import type { Metadata } from "next";

import SeoPage from "@/components/pages/seo";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.seo")} · Ætheria Admin`,
  description: t("console.meta.seo-description"),
};

export default function SeoPageRoute() {
  return <SeoPage />;
}
