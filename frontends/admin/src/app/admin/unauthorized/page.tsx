import { Metadata } from "next";
import { UnauthorizedScreen } from "@/components/pages/unauthorized/UnauthorizedScreen";

export const metadata: Metadata = {
  title: "Access Denied | Ætheria Admin",
  description: "You do not have the required permissions to view this page.",
};

export default function UnauthorizedPage() {
  return <UnauthorizedScreen />;
}
