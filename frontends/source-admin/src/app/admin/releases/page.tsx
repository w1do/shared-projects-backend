import type { Metadata } from "next";

import ReleasesPage from "@/components/pages/licensing/pages/releases";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.releases")} · Ætheria Admin`,
  description: t("console.meta.releases-description"),
};

export default function ReleasesPageRoute() {
  return <ReleasesPage />;
}
