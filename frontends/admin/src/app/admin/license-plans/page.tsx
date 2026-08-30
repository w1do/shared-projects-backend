import type { Metadata } from "next";

import PlansPage from "@/components/pages/licensing/pages/plans";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.license-plans")} · Ætheria Admin`,
  description: t("console.meta.license-plans-description"),
};

export default function PlansPageRoute() {
  return <PlansPage />;
}
