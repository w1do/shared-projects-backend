import { Metadata } from "next";
import { LoginScreen } from "@/components/pages/auth/LoginScreen";

export const metadata: Metadata = {
  title: "Sign in | Ætheria Admin",
  description: "Sign in to the Ætheria operations console for multi-brand beauty commerce.",
};

export default function LoginPage() {
  const showDemo = process.env.NEXT_PUBLIC_ADMIN_IS_DEMO === "true";
  return <LoginScreen showDemo={showDemo} />;
}
