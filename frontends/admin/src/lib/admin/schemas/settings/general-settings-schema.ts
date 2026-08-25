import * as z from "zod";
import type { GeneralSettings } from "@/lib/admin/mocks/settings";

export const currencyCodes = ["USD", "EUR", "GBP", "VND"] as const;
export const weightUnits = ["kg", "lb"] as const;

export const generalSettingsSchema = z.object({
  storeName: z
    .string()
    .trim()
    .min(1, { message: "Store name is required." })
    .max(80, { message: "Store name must be 80 characters or fewer." }),
  supportEmail: z
    .string()
    .trim()
    .min(1, { message: "Support email is required." })
    .email({ message: "Enter a valid email address." }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "Phone number is required." })
    .max(40, { message: "Phone number must be 40 characters or fewer." }),
  description: z
    .string()
    .max(500, { message: "Description must be 500 characters or fewer." })
    .default(""),
  currency: z.enum(currencyCodes, { message: "Select a currency." }),
  timezone: z.string().min(1, { message: "Select a timezone." }),
  weightUnit: z.enum(weightUnits, { message: "Select a weight unit." }),
  storefrontUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().url().safeParse(value).success, {
      message: "Enter a valid storefront URL.",
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
