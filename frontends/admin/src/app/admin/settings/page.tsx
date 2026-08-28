import type { Metadata } from "next";

import SettingsPage from "@/components/pages/settings";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.settings")} · Ætheria Admin`,
  description: t("console.meta.settings-description"),
};

export default function SettingsPageRoute() {
  return <SettingsPage />;
}
