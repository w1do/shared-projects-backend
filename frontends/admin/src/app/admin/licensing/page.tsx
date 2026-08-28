import type { Metadata } from "next";

import LicensingPage from "@/components/pages/licensing";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.licensing")} · Ætheria Admin`,
  description: t("console.meta.licensing-description"),
};

export default function LicensingPageRoute() {
  return <LicensingPage />;
}
