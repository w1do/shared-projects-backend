import type { Metadata } from "next";

import CitiesPage from "@/components/pages/cities";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.cities")} · Ætheria Admin`,
  description: t("console.meta.cities-description"),
};

export default function CitiesPageRoute() {
  return <CitiesPage />;
}
