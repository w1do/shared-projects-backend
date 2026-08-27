import * as z from "zod";
import type { TaxSettings } from "@/lib/admin/mocks/settings";
import { t } from "@/lib/admin/console-texts";

export const taxesSettingsSchema = z.object({
  pricesIncludeTax: z.boolean(),
  autoCalculate: z.boolean(),
  defaultRate: z.coerce
    .number({ message: t("console.settings.taxes.validation.rate-invalid") })
    .min(0, { message: t("console.settings.taxes.validation.rate-min") })
    .max(100, { message: t("console.settings.taxes.validation.rate-max") }),
  taxId: z
    .string()
    .trim()
    .min(1, { message: t("console.settings.taxes.validation.tax-id-required") })
    .max(40, { message: t("console.settings.taxes.validation.tax-id-max") }),
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
