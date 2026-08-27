"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/data-display/badge";
import type { PaymentProvider } from "@/lib/admin/mocks/settings";
import { useSaveSettingsSectionMutation } from "@/hooks/admin/settings";
import { SettingsSection } from "./shared/SettingsSection";
import { SettingsToggleRow } from "./shared/SettingsToggleRow";
import { useConsoleText } from "@/lib/admin/use-console-text";

export function PaymentsSection({ initial }: { initial: PaymentProvider[] }) {
  const t = useConsoleText();
  const [providers, setProviders] = useState<PaymentProvider[]>(initial);
  const saveMutation = useSaveSettingsSectionMutation();

  const toggle = (id: string, enabled: boolean) => {
    const next = providers.map((p) => (p.id === id ? { ...p, enabled } : p));
    setProviders(next);
    const provider = next.find((p) => p.id === id);
    saveMutation.mutate(
      { section: "payments", value: next },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            toast.error(result.reason ?? t("console.settings.payments.save-failed"));
            setProviders(providers);
            return;
          }
          toast.success(
            t(
              enabled
                ? "console.settings.payments.enabled"
                : "console.settings.payments.disabled",
            ).replace("{name}", provider?.name ?? ""),
          );
        },
        onError: () => {
          toast.error(t("console.settings.payments.save-failed"));
          setProviders(providers);
        },
      },
    );
  };

  return (
    <SettingsSection
      icon={CreditCard}
      title={t("console.settings.payments.title")}
      description={t("console.settings.payments.description")}
    >
      {providers.map((provider) => (
        <SettingsToggleRow
          key={provider.id}
          title={provider.name}
          description={provider.description}
          checked={provider.enabled}
          onCheckedChange={(value) => toggle(provider.id, value)}
          trailing={
            <Badge
              variant="soft"
              color={provider.mode === "live" ? "success" : "muted"}
              shape="circle"
              size="sm"
            >
              {provider.mode === "live"
                ? t("console.settings.payments.mode-live")
                : t("console.settings.payments.mode-test")}
            </Badge>
          }
        />
      ))}
    </SettingsSection>
  );
}
