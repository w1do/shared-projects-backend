import type { Metadata } from "next";

import InstructsPage from "@/components/pages/instructs";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.instructs")} · Ætheria Admin`,
  description: t("console.instructs.subtitle"),
};

export default function InstructsPageRoute() {
  return <InstructsPage />;
}
