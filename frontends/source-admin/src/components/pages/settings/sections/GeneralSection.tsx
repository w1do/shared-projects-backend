"use client";

import { useEffect } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store } from "lucide-react";
import { toast } from "sonner";
import { useSaveSettingsSectionMutation } from "@/hooks/admin/settings";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Select } from "@/components/ui/inputs/select";
import type { GeneralSettings } from "@/lib/admin/mocks/settings";
import {
  generalSettingsSchema,
  fromGeneralSettingsFormValues,
  toGeneralSettingsFormValues,
  type GeneralSettingsFormValues,
} from "@/lib/admin/schemas/settings/general-settings-schema";
import { SettingsSection } from "./shared/SettingsSection";
import { useConsoleText } from "@/lib/admin/use-console-text";
import {
  CURRENCY_OPTIONS,
  TIMEZONE_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
} from "@/components/pages/settings/config/options";

const STOREFRONT_URL_KEY = "storefront_live_url";

export function GeneralSection({ initial }: { initial: GeneralSettings }) {
  const t = useConsoleText();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema) as Resolver<GeneralSettingsFormValues>,
    defaultValues: toGeneralSettingsFormValues(initial),
    mode: "onChange",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedUrl = localStorage.getItem(STOREFRONT_URL_KEY);
    if (savedUrl) {
      setValue("storefrontUrl", savedUrl, { shouldDirty: false, shouldValidate: true });
    }
  }, [setValue]);

  const saveSettingsMutation = useSaveSettingsSectionMutation();

  const onSubmit = async (values: GeneralSettingsFormValues) => {
    if (typeof window !== "undefined" && values.storefrontUrl) {
      localStorage.setItem(STOREFRONT_URL_KEY, values.storefrontUrl);
      window.dispatchEvent(
        new CustomEvent("storefront-url-updated", { detail: values.storefrontUrl }),
      );
    }

    // No settings service.updateSettings yet — mock success until settings API is wired.
    const result = await saveSettingsMutation.mutateAsync({
      section: "general",
      value: fromGeneralSettingsFormValues(values),
    });
    if (!result.ok) {
      toast.error(result.reason ?? t("console.settings.save-failed"));
      return;
    }
    toast.success(t("console.settings.general.saved"));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingsSection
        icon={Store}
        title={t("console.settings.general.title")}
        description={t("console.settings.general.description")}
        footer={
          <Button type="submit" variant="contained" shape="circle" disabled={isSubmitting}>
            {isSubmitting ? t("console.settings.saving") : t("console.settings.save")}
          </Button>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Input
            label={t("console.settings.general.store-name")}
            error={errors.storeName?.message}
            {...register("storeName")}
          />
          <Input
            label={t("console.settings.general.support-email")}
            type="email"
            error={errors.supportEmail?.message}
            {...register("supportEmail")}
          />
          <Input
            label={t("console.settings.general.phone")}
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select
                label={t("console.settings.general.currency")}
                options={CURRENCY_OPTIONS}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.currency?.message}
              />
            )}
          />
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <Select
                label={t("console.settings.general.timezone")}
                options={TIMEZONE_OPTIONS}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.timezone?.message}
              />
            )}
          />
          <Controller
            name="weightUnit"
            control={control}
            render={({ field }) => (
              <Select
                label={t("console.settings.general.weight-unit")}
                options={WEIGHT_UNIT_OPTIONS}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.weightUnit?.message}
              />
            )}
          />
          <div className="sm:col-span-2">
            <Input
              label={t("console.settings.general.storefront-url")}
              placeholder="https://aetheria.studio"
              error={errors.storefrontUrl?.message}
              {...register("storefrontUrl")}
            />
          </div>
        </div>
        <Textarea
          label={t("console.settings.general.store-description")}
          error={errors.description?.message}
          {...register("description")}
        />
      </SettingsSection>
    </form>
  );
}
