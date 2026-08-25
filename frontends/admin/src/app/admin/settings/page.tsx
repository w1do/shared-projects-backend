import type { Metadata } from "next";

import SettingsPage from "@/components/pages/settings";

export const metadata: Metadata = {
  title: "Settings · Ætheria Admin",
  description:
    "Configure your store profile, payments, shipping, taxes, team access, and security in one workspace.",
};

export default function SettingsPageRoute() {
  return <SettingsPage />;
}
