"use client";

import { Blocks } from "lucide-react";
import { toast } from "sonner";
import {
  useProjectServicesQuery,
  useToggleServiceMutation,
} from "@/hooks/admin/settings";
import { tf } from "@/lib/admin/console-texts";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { SettingsSection } from "./shared/SettingsSection";
import { SettingsToggleRow } from "./shared/SettingsToggleRow";

/** Тексты переключаемых сервисов. `auth` — ядро, платформа его не отдаёт. */
const SERVICE_TEXTS = {
  content: {
    title: "console.settings.services.content.title",
    description: "console.settings.services.content.description",
  },
  analytics: {
    title: "console.settings.services.analytics.title",
    description: "console.settings.services.analytics.description",
  },
  pay: {
    title: "console.settings.services.pay.title",
    description: "console.settings.services.pay.description",
  },
} as const;

/** Управление сервисами проекта: галочки переключаемых сервисов платформы. */
export function ServicesSection() {
  const t = useConsoleText();
  const { data, isPending } = useProjectServicesQuery();
  const toggleMutation = useToggleServiceMutation();

  const services = (data?.services ?? []).filter(
    (row) => row.service !== "auth",
  );
  const canManage = data?.canManage ?? false;

  const serviceTitle = (service: string) => {
    const texts = SERVICE_TEXTS[service as keyof typeof SERVICE_TEXTS];
    return texts ? t(texts.title) : service;
  };

  const toggle = (service: string, enabled: boolean) => {
    toggleMutation.mutate(
      { service, enabled },
      {
        onSuccess: () =>
          toast.success(
            tf(
              enabled
                ? "console.settings.services.enabled"
                : "console.settings.services.disabled",
              { name: serviceTitle(service) },
            ),
          ),
        onError: (error: Error) =>
          toast.error(
            error.message || t("console.settings.services.save-failed"),
          ),
      },
    );
  };

  return (
    <div data-testid="services-section">
      <SettingsSection
        icon={Blocks}
        title={t("console.settings.services.title")}
        description={t("console.settings.services.description")}
      >
        {!isPending && !canManage && (
          <p className="text-caption text-muted-foreground-lighter">
            {t("console.settings.services.read-only")}
          </p>
        )}
        {!isPending && services.length === 0 && (
          <p className="text-caption text-muted-foreground-lighter">
            {t("console.settings.services.empty")}
          </p>
        )}
        {services.map((row) => {
          const texts = SERVICE_TEXTS[row.service as keyof typeof SERVICE_TEXTS];

          return (
            <div key={row.service} data-service={row.service}>
              <SettingsToggleRow
                title={serviceTitle(row.service)}
                description={texts ? t(texts.description) : row.service}
                checked={row.enabled}
                disabled={!canManage || toggleMutation.isPending}
                onCheckedChange={(enabled) => toggle(row.service, enabled)}
                trailing={
                  row.version ? (
                    <span className="text-caption text-muted-foreground-lighter">
                      {row.version}
                    </span>
                  ) : undefined
                }
              />
            </div>
          );
        })}
      </SettingsSection>
    </div>
  );
}
