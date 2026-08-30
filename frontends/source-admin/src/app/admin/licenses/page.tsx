import type { Metadata } from "next";

import LicensesPage from "@/components/pages/licensing/pages/licenses";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.licenses")} · Ætheria Admin`,
  description: t("console.meta.licenses-description"),
};

export default function LicensesPageRoute() {
  return <LicensesPage />;
}
