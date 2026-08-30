import type { Metadata } from "next";

import OrganizationsPage from "@/components/pages/licensing/pages/organizations";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.organizations")} · Ætheria Admin`,
  description: t("console.meta.organizations-description"),
};

export default function OrganizationsPageRoute() {
  return <OrganizationsPage />;
}
