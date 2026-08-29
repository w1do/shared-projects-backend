import { Metadata } from "next";
import { LoginScreen } from "@/components/pages/auth/LoginScreen";
import { t } from "@/lib/admin/console-texts";

export const metadata: Metadata = {
  title: `${t("console.login.title")} | Ætheria Admin`,
  description: t("console.meta.login-description"),
};

export default function LoginPage() {
  return <LoginScreen />;
}
