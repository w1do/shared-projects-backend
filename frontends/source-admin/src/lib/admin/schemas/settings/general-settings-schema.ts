import * as z from "zod";
import type { GeneralSettings } from "@/lib/admin/mocks/settings";
import { t } from "@/lib/admin/console-texts";

export const currencyCodes = ["USD", "EUR", "GBP", "VND"] as const;
export const weightUnits = ["kg", "lb"] as const;

export const generalSettingsSchema = z.object({
  storeName: z
    .string()
    .trim()
    .min(1, { message: t("console.settings.general.validation.store-name-required") })
    .max(80, { message: t("console.settings.general.validation.store-name-max") }),
  supportEmail: z
    .string()
    .trim()
    .min(1, { message: t("console.settings.general.validation.email-required") })
    .email({ message: t("console.settings.general.validation.email-invalid") }),
  phone: z
    .string()
    .trim()
    .min(1, { message: t("console.settings.general.validation.phone-required") })
    .max(40, { message: t("console.settings.general.validation.phone-max") }),
  description: z
    .string()
    .max(500, { message: t("console.settings.general.validation.description-max") })
    .default(""),
  currency: z.enum(currencyCodes, {
    message: t("console.settings.general.validation.currency"),
  }),
  timezone: z.string().min(1, { message: t("console.settings.general.validation.timezone") }),
  weightUnit: z.enum(weightUnits, {
    message: t("console.settings.general.validation.weight-unit"),
  }),
  storefrontUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().url().safeParse(value).success, {
      message: t("console.settings.general.validation.storefront-url"),
    })
    .default(""),
});

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

export function toGeneralSettingsFormValues(settings: GeneralSettings): GeneralSettingsFormValues {
  return {
    storeName: settings.storeName,
    supportEmail: settings.supportEmail,
    phone: settings.phone,
    description: settings.description,
    currency: settings.currency,
    timezone: settings.timezone,
    weightUnit: settings.weightUnit,
    storefrontUrl: settings.storefrontUrl ?? "",
  };
}

export function fromGeneralSettingsFormValues(values: GeneralSettingsFormValues): GeneralSettings {
  return {
    storeName: values.storeName,
    supportEmail: values.supportEmail,
    phone: values.phone,
    description: values.description,
    currency: values.currency,
    timezone: values.timezone,
    weightUnit: values.weightUnit,
    storefrontUrl: values.storefrontUrl || undefined,
  };
}
