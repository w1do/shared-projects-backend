"use client";

import { useState } from "react";
import { CreditCard, Settings } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import {
  usePaymentsSettingsQuery,
  useUpdatePaymentsSettingsMutation,
} from "@/hooks/admin/settings";
import { PaymentProviderModal } from "./payments-provider-modal";
import { SettingsSection } from "./shared/SettingsSection";
import { useConsoleText } from "@/lib/admin/use-console-text";

const PLATEGA_PROVIDER = "platega";
const PLATEGA_NAME = "Platega";

/** Платёжная система проекта: единственный поддерживаемый шлюз — Platega. */
export function PaymentsSection() {
  const t = useConsoleText();
  const { data: settings } = usePaymentsSettingsQuery();
  const update = useUpdatePaymentsSettingsMutation();
  const [isProviderModalOpen, setProviderModalOpen] = useState(false);

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
          <p className="truncate text-body font-medium text-foreground">{PLATEGA_NAME}</p>
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
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          aria-label={t("console.settings.payments.provider.configure")}
          onClick={() => setProviderModalOpen(true)}
        >
          <Settings size={16} />
        </IconButton>
      </div>

      <PaymentProviderModal
        provider={PLATEGA_PROVIDER}
        providerName={PLATEGA_NAME}
        isOpen={isProviderModalOpen}
        onClose={() => setProviderModalOpen(false)}
      />
    </SettingsSection>
  );
}
