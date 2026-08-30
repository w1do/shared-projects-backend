"use client";

import { useLicensingAccessQuery } from "@/hooks/admin/licensing";

import { LicensingPageShell } from "../../LicensingPageShell";
import { OrganizationsSection } from "../../sections/OrganizationsSection";

export default function OrganizationsPage() {
  const { data: access } = useLicensingAccessQuery();
  const canManage = access?.canManage ?? false;

  return (
    <LicensingPageShell
      titleKey="console.nav.organizations"
      descriptionKey="console.licensing.organizations.description"
      canManage={canManage}
      accessLoaded={access !== undefined}
    >
      <OrganizationsSection canManage={canManage} />
    </LicensingPageShell>
  );
}
