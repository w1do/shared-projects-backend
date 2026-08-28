import { Metadata } from "next";
import { UnauthorizedScreen } from "@/components/pages/unauthorized/UnauthorizedScreen";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.unauthorized.title")} | Ætheria Admin`,
  description: t("console.meta.unauthorized-description"),
};

export default function UnauthorizedPage() {
  return <UnauthorizedScreen />;
}
