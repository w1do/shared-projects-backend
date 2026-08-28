import * as z from "zod";
import type { SecuritySettings } from "@/lib/admin/mocks/settings";
import { t } from "@/lib/admin/console-texts";

/** Allowed idle session lengths in minutes (matches SESSION_TIMEOUT_OPTIONS). */
export const sessionTimeoutMinutes = [15, 30, 60, 240, 480] as const;

export type SessionTimeoutMinutes = (typeof sessionTimeoutMinutes)[number];

export const securitySettingsSchema = z.object({
  twoFactor: z.boolean(),
  loginAlerts: z.boolean(),
  sessionTimeout: z.coerce
    .number({ message: t("console.settings.security.validation.timeout-invalid") })
    .refine(
      (value): value is SessionTimeoutMinutes =>
        (sessionTimeoutMinutes as readonly number[]).includes(value),
      {
        message: t("console.settings.security.validation.timeout-unknown"),
      },
    ),
});

export type SecuritySettingsFormValues = z.infer<typeof securitySettingsSchema>;

export function toSecuritySettingsFormValues(
  settings: SecuritySettings,
): SecuritySettingsFormValues {
  return {
    twoFactor: settings.twoFactor,
    loginAlerts: settings.loginAlerts,
    sessionTimeout: settings.sessionTimeout as SessionTimeoutMinutes,
  };
}

export function fromSecuritySettingsFormValues(
  values: SecuritySettingsFormValues,
): SecuritySettings {
  return {
    twoFactor: values.twoFactor,
    loginAlerts: values.loginAlerts,
    sessionTimeout: values.sessionTimeout,
  };
}
