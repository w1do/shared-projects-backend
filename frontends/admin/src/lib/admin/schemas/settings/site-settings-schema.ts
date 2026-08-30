import * as z from "zod";

import { t } from "@/lib/admin/console-texts";

/** Главные настройки сайта: поля проекта и настройки его витрины. */
export const siteSettingsFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, {
        message: t("console.settings.general.validation.name-required"),
      })
      .max(80, { message: t("console.settings.general.validation.name-max") }),
    description: z
      .string()
      .max(500, {
        message: t("console.settings.general.validation.description-max"),
      })
      .default(""),
    projectType: z.string().min(1, {
      message: t("console.settings.general.validation.project-type"),
    }),
    timezone: z
      .string()
      .min(1, { message: t("console.settings.general.validation.timezone") }),
    currencies: z
      .array(z.string())
      .min(1, { message: t("console.settings.general.validation.currencies") }),
    currencyDefault: z
      .string()
      .min(1, { message: t("console.settings.general.validation.currency") }),
    language: z
      .string()
      .min(1, { message: t("console.settings.general.validation.language") }),
  })
  .refine((values) => values.currencies.includes(values.currencyDefault), {
    path: ["currencyDefault"],
    message: t("console.settings.general.validation.currency-in-list"),
  });

export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;
