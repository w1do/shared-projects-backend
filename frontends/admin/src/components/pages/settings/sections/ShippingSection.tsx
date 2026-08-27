"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/inputs/switch";
import { Badge } from "@/components/ui/data-display/badge";
import type { ShippingZone } from "@/lib/admin/mocks/settings";
import { formatCurrency } from "@/lib/utils";
import { useSaveSettingsSectionMutation } from "@/hooks/admin/settings";
import { SettingsSection } from "./shared/SettingsSection";
import { useConsoleText } from "@/lib/admin/use-console-text";

export function ShippingSection({ initial }: { initial: ShippingZone[] }) {
  const t = useConsoleText();
  const [zones, setZones] = useState<ShippingZone[]>(initial);
  const saveMutation = useSaveSettingsSectionMutation();

  const toggle = (id: string, enabled: boolean) => {
    const next = zones.map((z) => (z.id === id ? { ...z, enabled } : z));
    setZones(next);
    const zone = next.find((z) => z.id === id);
    saveMutation.mutate(
      { section: "shipping", value: next },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            toast.error(result.reason ?? t("console.settings.shipping.save-failed"));
            setZones(zones);
            return;
          }
          toast.success(
            t(
              enabled
                ? "console.settings.shipping.activated"
                : "console.settings.shipping.paused",
            ).replace("{name}", zone?.name ?? ""),
          );
        },
        onError: () => {
          toast.error(t("console.settings.shipping.save-failed"));
          setZones(zones);
        },
      },
    );
  };

  return (
    <SettingsSection
      icon={Truck}
      title={t("console.settings.shipping.title")}
      description={t("console.settings.shipping.description")}
    >
      {zones.map((zone) => (
        <div
          key={zone.id}
          className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-muted/15 p-4 transition-colors duration-200 hover:border-border hover:bg-muted/30 sm:flex-row sm:items-center"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-medium text-foreground">{zone.name}</p>
            <p className="mt-2 truncate text-caption text-muted-foreground">{zone.regions}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="soft" shape="circle" size="sm">
              {t("console.settings.shipping.flat").replace("{rate}", formatCurrency(zone.rate))}
            </Badge>
            {zone.freeThreshold !== null ? (
              <Badge variant="soft" color="accent" shape="circle" size="sm">
                {t("console.settings.shipping.free-over").replace(
                  "{threshold}",
                  formatCurrency(zone.freeThreshold),
                )}
              </Badge>
            ) : null}
          </div>
          <Switch checked={zone.enabled} onCheckedChange={(value) => toggle(zone.id, value)} />
        </div>
      ))}
    </SettingsSection>
  );
}
