"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/data-display/badge";
import type { PaymentProvider } from "@/lib/admin/mocks/settings";
import { useSaveSettingsSectionMutation } from "@/hooks/admin/settings";
import { SettingsSection } from "./shared/SettingsSection";
import { SettingsToggleRow } from "./shared/SettingsToggleRow";

export function PaymentsSection({ initial }: { initial: PaymentProvider[] }) {
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
            toast.error(result.reason ?? "Could not save payment settings.");
            setProviders(providers);
            return;
          }
          toast.success(`${provider?.name} ${enabled ? "enabled" : "disabled"}.`);
        },
        onError: () => {
          toast.error("Could not save payment settings.");
          setProviders(providers);
        },
      },
    );
  };

  return (
    <SettingsSection
      icon={CreditCard}
      title="Payment providers"
      description="Choose the gateways customers can use at checkout and their environment."
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
              {provider.mode === "live" ? "Live" : "Test"}
            </Badge>
          }
        />
      ))}
    </SettingsSection>
  );
}
