import type { Metadata } from "next";

import SubscriptionsPage from "@/components/pages/subscriptions";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.subscriptions")} · Ætheria Admin`,
  description: t("console.meta.subscriptions-description"),
};

export default function SubscriptionsPageRoute() {
  return <SubscriptionsPage />;
}
