"use client";

import { useEffect, useState } from "react";
import { Store, CreditCard, Truck, Receipt, Bell, Users, ShieldCheck, Languages, Blocks } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/data-display/tabs";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { useStoreSettingsQuery } from "@/hooks/admin/settings/use-settings-query";
import { mockStoreSettings, type StoreSettings } from "@/lib/admin/mocks/settings";
import { SettingsLoadingState } from "./loading";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { cn } from "@/lib/utils";

import { GeneralSection } from "./sections/GeneralSection";
import { PaymentsSection } from "./sections/PaymentsSection";
import { ShippingSection } from "./sections/ShippingSection";
import { TaxesSection } from "./sections/TaxesSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { SecuritySection } from "./sections/SecuritySection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { ServicesSection } from "./sections/ServicesSection";

const TABS = [
  { value: "general", labelKey: "console.settings.tab.general", icon: Store },
  { value: "payments", labelKey: "console.settings.tab.payments", icon: CreditCard },
  { value: "shipping", labelKey: "console.settings.tab.shipping", icon: Truck },
  { value: "taxes", labelKey: "console.settings.tab.taxes", icon: Receipt },
  { value: "notifications", labelKey: "console.settings.tab.notifications", icon: Bell },
  { value: "security", labelKey: "console.settings.tab.security", icon: ShieldCheck },
  { value: "languages", labelKey: "console.settings.tab.languages", icon: Languages },
  { value: "services", labelKey: "console.settings.tab.services", icon: Blocks },
] as const;

export default function SettingsPage({
  initialSettings,
}: {
  initialSettings?: StoreSettings;
} = {}) {
  const t = useConsoleText();
  const hasSeed = initialSettings !== undefined;
  const { data, isPending } = useStoreSettingsQuery({
    initialData: hasSeed ? initialSettings : undefined,
  });

  const settings = data ?? initialSettings ?? mockStoreSettings;
  const [isMockLoading, setIsMockLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMockLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const showSkeleton = (hasSeed ? false : isPending) || isMockLoading;

  return (
    <div className="relative min-h-screen w-full">
      {/* Skeleton Loading Layer (On top, blocks interactions when active) */}
      <div
        className={cn(
          "transition-opacity duration-500 absolute inset-x-0 top-0 z-50 bg-background pointer-events-none",
          showSkeleton ? "opacity-100" : "opacity-0 invisible",
        )}
      >
        <SettingsLoadingState />
      </div>

      {/* Actual Content Layer (Pre-rendered in the background so everything is ready) */}
      <div
        className={cn(
          "transition-opacity duration-500",
          showSkeleton ? "opacity-0 pointer-events-none invisible" : "opacity-100",
        )}
      >
        <div className="flex flex-col gap-8">
          <PageHeader
            title={t("console.settings.title")}
            description={t("console.settings.subtitle")}
            breadcrumbItems={[
              { label: t("console.common.breadcrumb-admin"), href: "/admin" },
              { label: t("console.nav.group.workspace"), href: "/admin/settings" },
              { label: t("console.settings.title") },
            ]}
          />

          <Tabs
            variant="underline"
            color="secondary"
            shape="rectangle"
            defaultValue="general"
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

            <TabsContent value="general">
              <GeneralSection initial={settings.general} />
            </TabsContent>
            <TabsContent value="payments">
              <PaymentsSection initial={settings.payments} />
            </TabsContent>
            <TabsContent value="shipping">
              <ShippingSection initial={settings.shipping} />
            </TabsContent>
            <TabsContent value="taxes">
              <TaxesSection initial={settings.taxes} />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationsSection initial={settings.notifications} />
            </TabsContent>
            <TabsContent value="security">
              <SecuritySection initial={settings.security} />
            </TabsContent>
            <TabsContent value="languages">
              <LanguagesSection />
            </TabsContent>
            <TabsContent value="services">
              <ServicesSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
