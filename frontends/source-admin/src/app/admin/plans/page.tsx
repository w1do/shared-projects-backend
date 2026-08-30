import type { Metadata } from "next";

import PlansPage from "@/components/pages/plans";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.plans")} · Ætheria Admin`,
  description: t("console.meta.plans-description"),
};

export default function PlansPageRoute() {
  return <PlansPage />;
}
