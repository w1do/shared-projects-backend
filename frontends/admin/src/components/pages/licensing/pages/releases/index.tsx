"use client";

import { useLicensingAccessQuery } from "@/hooks/admin/licensing";

import { LicensingPageShell } from "../../LicensingPageShell";
import { ReleasesSection } from "../../sections/ReleasesSection";

export default function ReleasesPage() {
  const { data: access } = useLicensingAccessQuery();
  const canManage = access?.canManage ?? false;

  return (
    <LicensingPageShell
      titleKey="console.nav.releases"
      descriptionKey="console.licensing.releases.description"
      canManage={canManage}
      accessLoaded={access !== undefined}
    >
      <ReleasesSection canManage={canManage} />
    </LicensingPageShell>
  );
}
