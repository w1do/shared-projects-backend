"use client";

import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSaveSettingsSectionMutation } from "@/hooks/admin/settings";
import { Button } from "@/components/ui/inputs/button";
import { Select } from "@/components/ui/inputs/select";
import type { SecuritySettings } from "@/lib/admin/mocks/settings";
import {
  securitySettingsSchema,
  fromSecuritySettingsFormValues,
  toSecuritySettingsFormValues,
  type SecuritySettingsFormValues,
} from "@/lib/admin/schemas/settings/security-settings-schema";
import { SettingsSection } from "./shared/SettingsSection";
import { SettingsToggleRow } from "./shared/SettingsToggleRow";
import { SESSION_TIMEOUT_OPTIONS } from "@/components/pages/settings/config/options";
import { useConsoleText } from "@/lib/admin/use-console-text";

export function SecuritySection({ initial }: { initial: SecuritySettings }) {
  const t = useConsoleText();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsSchema) as Resolver<SecuritySettingsFormValues>,
    defaultValues: toSecuritySettingsFormValues(initial),
    mode: "onChange",
  });

  const saveSettingsMutation = useSaveSettingsSectionMutation();

  const onSubmit = async (_values: SecuritySettingsFormValues) => {
    // No settings service.updateSecuritySettings yet — mock success until settings API is wired.
    // Password-change fields are not present in this section; only workspace security prefs.
    const result = await saveSettingsMutation.mutateAsync({
      section: "security",
      value: fromSecuritySettingsFormValues(_values),
    });
    if (!result.ok) {
      toast.error(result.reason ?? t("console.settings.save-failed"));
      return;
    }
    toast.success(t("console.settings.security.saved"));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingsSection
        icon={ShieldCheck}
        title={t("console.settings.security.title")}
        description={t("console.settings.security.description")}
        footer={
          <Button type="submit" variant="contained" shape="circle" disabled={isSubmitting}>
            {isSubmitting ? t("console.settings.saving") : t("console.settings.save")}
          </Button>
        }
      >
        <Controller
          name="twoFactor"
          control={control}
          render={({ field }) => (
            <SettingsToggleRow
              title={t("console.settings.security.two-factor")}
              description={t("console.settings.security.two-factor-description")}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          name="loginAlerts"
          control={control}
          render={({ field }) => (
            <SettingsToggleRow
              title={t("console.settings.security.login-alerts")}
              description={t("console.settings.security.login-alerts-description")}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          name="sessionTimeout"
          control={control}
          render={({ field }) => (
            <Select
              label={t("console.settings.security.session-timeout")}
              options={SESSION_TIMEOUT_OPTIONS}
              value={String(field.value)}
              onChange={(e) => field.onChange(Number(e.target.value))}
              error={errors.sessionTimeout?.message}
            />
          )}
        />
      </SettingsSection>
    </form>
  );
}
