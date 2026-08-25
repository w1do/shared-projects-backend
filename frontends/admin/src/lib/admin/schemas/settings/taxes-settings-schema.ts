import * as z from "zod";
import type { TaxSettings } from "@/lib/admin/mocks/settings";

export const taxesSettingsSchema = z.object({
  pricesIncludeTax: z.boolean(),
  autoCalculate: z.boolean(),
  defaultRate: z.coerce
    .number({ message: "Enter a valid tax rate." })
    .min(0, { message: "Rate cannot be negative." })
    .max(100, { message: "Rate cannot exceed 100%." }),
  taxId: z
    .string()
    .trim()
    .min(1, { message: "Tax registration ID is required." })
    .max(40, { message: "Tax ID must be 40 characters or fewer." }),
});

export type TaxesSettingsFormValues = z.infer<typeof taxesSettingsSchema>;

export function toTaxesSettingsFormValues(settings: TaxSettings): TaxesSettingsFormValues {
  return {
    pricesIncludeTax: settings.pricesIncludeTax,
    autoCalculate: settings.autoCalculate,
    defaultRate: settings.defaultRate,
    taxId: settings.taxId,
  };
}

export function fromTaxesSettingsFormValues(
  values: TaxesSettingsFormValues,
  current: TaxSettings,
): TaxSettings {
  return {
    ...current,
    pricesIncludeTax: values.pricesIncludeTax,
    autoCalculate: values.autoCalculate,
    defaultRate: values.defaultRate,
    taxId: values.taxId,
  };
}
