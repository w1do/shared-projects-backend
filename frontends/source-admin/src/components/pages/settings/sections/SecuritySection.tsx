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

export function SecuritySection({ initial }: { initial: SecuritySettings }) {
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
      toast.error(result.reason ?? "Could not save settings.");
      return;
    }
    toast.success("Security settings saved.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingsSection
        icon={ShieldCheck}
        title="Security"
        description="Protect the workspace with stronger sign-in requirements and alerts."
        footer={
          <Button type="submit" variant="contained" shape="circle" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        }
      >
        <Controller
          name="twoFactor"
          control={control}
          render={({ field }) => (
            <SettingsToggleRow
              title="Two-factor authentication"
              description="Require a verification code in addition to a password."
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
              title="Login alerts"
              description="Email the owner when a new device signs in."
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
              label="Session timeout"
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
