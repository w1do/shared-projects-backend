"use client";

import { useLicensingAccessQuery } from "@/hooks/admin/licensing";

import { LicensingPageShell } from "../../LicensingPageShell";
import { PlansSection } from "../../sections/PlansSection";

export default function PlansPage() {
  const { data: access } = useLicensingAccessQuery();
  const canManage = access?.canManage ?? false;

  return (
    <LicensingPageShell
      titleKey="console.nav.license-plans"
      descriptionKey="console.licensing.plans.description"
      canManage={canManage}
      accessLoaded={access !== undefined}
    >
      <PlansSection canManage={canManage} />
    </LicensingPageShell>
  );
}
