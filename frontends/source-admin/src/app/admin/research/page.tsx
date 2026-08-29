import type { Metadata } from "next";

import ResearchPage from "@/components/pages/research";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.research")} · Ætheria Admin`,
  description: t("console.research.subtitle"),
};

export default function ResearchPageRoute() {
  return <ResearchPage />;
}
