"use client";

import { Building2, KeyRound, Layers, Rocket } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/data-display/tabs";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { useLicensingAccessQuery } from "@/hooks/admin/licensing";
import { useConsoleText } from "@/lib/admin/use-console-text";

import { OrganizationsSection } from "./sections/OrganizationsSection";
import { PlansSection } from "./sections/PlansSection";
import { LicensesSection } from "./sections/LicensesSection";
import { ReleasesSection } from "./sections/ReleasesSection";

const TABS = [
  {
    value: "organizations",
    labelKey: "console.licensing.tabs.organizations",
    icon: Building2,
  },
  { value: "plans", labelKey: "console.licensing.tabs.plans", icon: Layers },
  {
    value: "licenses",
    labelKey: "console.licensing.tabs.licenses",
    icon: KeyRound,
  },
  {
    value: "releases",
    labelKey: "console.licensing.tabs.releases",
    icon: Rocket,
  },
] as const;

/** Раздел «Лицензирование»: организации, планы, лицензии и релизы проекта. */
export default function LicensingPage() {
  const t = useConsoleText();
  const { data: access } = useLicensingAccessQuery();
  const canManage = access?.canManage ?? false;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("console.licensing.title")}
        description={t("console.licensing.description")}
        breadcrumbItems={[
          { label: t("console.common.breadcrumb-admin"), href: "/admin" },
          { label: t("console.nav.group.commerce"), href: "/admin/licensing" },
          { label: t("console.licensing.title") },
        ]}
      />

      {access !== undefined && !canManage && (
        <p
          className="text-caption text-muted-foreground-lighter"
          data-testid="licensing-read-only"
        >
          {t("console.licensing.read-only")}
        </p>
      )}

      <Tabs
        variant="underline"
        color="secondary"
        shape="rectangle"
        defaultValue="organizations"
        className="flex flex-col gap-8"
      >
        <TabsList>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1">
                <Icon className="size-4" />
                {t(tab.labelKey)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="organizations">
          <OrganizationsSection canManage={canManage} />
        </TabsContent>
        <TabsContent value="plans">
          <PlansSection canManage={canManage} />
        </TabsContent>
        <TabsContent value="licenses">
          <LicensesSection canManage={canManage} />
        </TabsContent>
        <TabsContent value="releases">
          <ReleasesSection canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
