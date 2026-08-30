"use client";

import * as React from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/inputs/button";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  useSaveGeneralSettingsMutation,
  useSiteSettingsQuery,
} from "@/hooks/admin/settings";
import { useProjectCardQuery } from "@/hooks/admin/project";
import {
  siteSettingsFormSchema,
  type SiteSettingsFormValues,
} from "@/lib/admin/schemas/settings/site-settings-schema";
import type { ConsoleTextKey } from "@/lib/admin/console-texts";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { SettingsSection } from "./shared/SettingsSection";

const PROJECT_TYPE_LABELS: Record<string, ConsoleTextKey> = {
  blog: "console.settings.general.project-type-blog",
  shop: "console.settings.general.project-type-shop",
  corporate: "console.settings.general.project-type-corporate",
  landing: "console.settings.general.project-type-landing",
};

const EMPTY_FORM: SiteSettingsFormValues = {
  name: "",
  description: "",
  projectType: "",
  timezone: "",
  currencies: [],
  currencyDefault: "",
  language: "",
};

/** Главные настройки сайта: поля проекта и настройки его витрины (режим api). */
export function GeneralSection() {
  const t = useConsoleText();
  const { data: project } = useProjectCardQuery();
  const { data: settings } = useSiteSettingsQuery();
  const save = useSaveGeneralSettingsMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema) as Resolver<SiteSettingsFormValues>,
    defaultValues: EMPTY_FORM,
  });

  // Данные приходят двумя запросами: форма заполняется, когда пришли оба
  React.useEffect(() => {
    if (!project || !settings) return;

    reset({
      name: project.name,
      description: project.description ?? "",
      projectType: settings.project_type,
      timezone: settings.timezone,
      currencies: settings.currencies,
      currencyDefault: settings.currency_default,
      language: settings.language,
    });
  }, [project, settings, reset]);

  const options = settings?.options;
  const selectedCurrencies = watch("currencies");

  const onSubmit = (values: SiteSettingsFormValues) =>
    save.mutate(
      {
        project: { name: values.name, description: values.description },
        settings: {
          project_type: values.projectType,
          timezone: values.timezone,
          language: values.language,
          currency_default: values.currencyDefault,
          currencies: values.currencies,
        },
      },
      {
        onSuccess: () => toast.success(t("console.settings.general.saved")),
        onError: (error: Error) =>
          toast.error(error.message || t("console.settings.save-failed")),
      },
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingsSection
        icon={Store}
        title={t("console.settings.general.title")}
        description={t("console.settings.general.description")}
        footer={
          <Button
            type="submit"
            variant="contained"
            shape="circle"
            disabled={save.isPending || !settings}
          >
            {save.isPending ? t("console.settings.saving") : t("console.settings.save")}
          </Button>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Input
            label={t("console.settings.general.site-name")}
            error={errors.name?.message}
            {...register("name")}
          />
          <Controller
            name="projectType"
            control={control}
            render={({ field }) => (
              <Select
                label={t("console.settings.general.project-type")}
                options={(options?.project_types ?? []).map((type) => ({
                  value: type,
                  label: PROJECT_TYPE_LABELS[type] ? t(PROJECT_TYPE_LABELS[type]) : type,
                }))}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                error={errors.projectType?.message}
              />
            )}
          />
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <Select
                label={t("console.settings.general.timezone")}
                options={(options?.timezones ?? []).map((zone) => ({
                  value: zone,
                  label: zone,
                }))}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                error={errors.timezone?.message}
              />
            )}
          />
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <Select
                label={t("console.settings.general.default-language")}
                options={(options?.locales ?? []).map((locale) => ({
                  value: locale,
                  label: locale.toUpperCase(),
                }))}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                error={errors.language?.message}
              />
            )}
          />
          <Controller
            name="currencies"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("console.settings.general.currencies")}
                </span>
                <div className="flex items-center gap-4">
                  {(options?.currencies ?? []).map((code) => (
                    <label key={code} className="flex items-center gap-2 text-caption">
                      <Checkbox
                        checked={field.value.includes(code)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked
                              ? [...field.value, code]
                              : field.value.filter((value) => value !== code),
                          )
                        }
                      />
                      {code}
                    </label>
                  ))}
                </div>
                {errors.currencies && (
                  <span className="ui-form-help-text font-medium text-destructive">
                    {errors.currencies.message}
                  </span>
                )}
              </div>
            )}
          />
          <Controller
            name="currencyDefault"
            control={control}
            render={({ field }) => (
              <Select
                label={t("console.settings.general.currency")}
                options={selectedCurrencies.map((code) => ({ value: code, label: code }))}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                error={errors.currencyDefault?.message}
              />
            )}
          />
        </div>
        <Textarea
          label={t("console.settings.general.site-description")}
          error={errors.description?.message}
          {...register("description")}
        />
      </SettingsSection>
    </form>
  );
}
