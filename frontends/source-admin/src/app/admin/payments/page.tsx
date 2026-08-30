import type { Metadata } from "next";

import PaymentsPage from "@/components/pages/payments";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.payments")} · Ætheria Admin`,
  description: t("console.meta.payments-description"),
};

export default function PaymentsPageRoute() {
  return <PaymentsPage />;
}
