"use client";

import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import {
  usePaymentsSettingsQuery,
  useUpdatePaymentsSettingsMutation,
} from "@/hooks/admin/settings";
import { SettingsSection } from "./shared/SettingsSection";
import { useConsoleText } from "@/lib/admin/use-console-text";

const PLATEGA_PROVIDER = "platega";

/** Платёжная система проекта: единственный поддерживаемый шлюз — Platega. */
export function PaymentsSection() {
  const t = useConsoleText();
  const { data: settings } = usePaymentsSettingsQuery();
  const update = useUpdatePaymentsSettingsMutation();

  const isActive = settings?.provider === PLATEGA_PROVIDER;

  const activate = () => {
    update.mutate(PLATEGA_PROVIDER, {
      onSuccess: () => toast.success(t("console.settings.payments.activated")),
      onError: (error: Error) =>
        toast.error(error.message || t("console.settings.payments.save-failed")),
    });
  };

  return (
    <SettingsSection
      icon={CreditCard}
      title={t("console.settings.payments.title")}
      description={t("console.settings.payments.description")}
    >
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-muted/15 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium text-foreground">Platega</p>
          <p className="mt-2 text-caption text-muted-foreground">
            {t("console.settings.payments.platega-description")}
          </p>
        </div>
        {isActive ? (
          <Badge variant="soft" color="success" shape="circle" size="sm">
            {t("console.settings.payments.active")}
          </Badge>
        ) : (
          <Button
            type="button"
            variant="outlined"
            disabled={!settings || update.isPending}
            onClick={activate}
          >
            {t("console.settings.payments.activate")}
          </Button>
        )}
      </div>
    </SettingsSection>
  );
}
