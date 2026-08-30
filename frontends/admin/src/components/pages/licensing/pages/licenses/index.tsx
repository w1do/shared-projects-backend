"use client";

import { useLicensingAccessQuery } from "@/hooks/admin/licensing";

import { LicensingPageShell } from "../../LicensingPageShell";
import { LicensesSection } from "../../sections/LicensesSection";

export default function LicensesPage() {
  const { data: access } = useLicensingAccessQuery();
  const canManage = access?.canManage ?? false;

  return (
    <LicensingPageShell
      titleKey="console.nav.licenses"
      descriptionKey="console.licensing.licenses.description"
      canManage={canManage}
      accessLoaded={access !== undefined}
    >
      <LicensesSection canManage={canManage} />
    </LicensingPageShell>
  );
}
