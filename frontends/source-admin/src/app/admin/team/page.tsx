import { Metadata } from "next";
import TeamPage from "@/components/pages/team";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.nav.team")} | Ætheria Admin`,
  description: t("console.meta.team-description"),
};

export default function TeamPageRoute() {
  return <TeamPage />;
}
