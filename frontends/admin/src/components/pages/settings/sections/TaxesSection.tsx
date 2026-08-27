"use client";

import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt } from "lucide-react";
import { toast } from "sonner";
import { useSaveSettingsSectionMutation } from "@/hooks/admin/settings";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import type { TaxSettings } from "@/lib/admin/mocks/settings";
import {
  taxesSettingsSchema,
  fromTaxesSettingsFormValues,
  toTaxesSettingsFormValues,
  type TaxesSettingsFormValues,
} from "@/lib/admin/schemas/settings/taxes-settings-schema";
import { SettingsSection } from "./shared/SettingsSection";
import { SettingsToggleRow } from "./shared/SettingsToggleRow";
import { useConsoleText } from "@/lib/admin/use-console-text";

export function TaxesSection({ initial }: { initial: TaxSettings }) {
  const t = useConsoleText();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaxesSettingsFormValues>({
    resolver: zodResolver(taxesSettingsSchema) as Resolver<TaxesSettingsFormValues>,
    defaultValues: toTaxesSettingsFormValues(initial),
    mode: "onChange",
  });

  const saveSettingsMutation = useSaveSettingsSectionMutation();

  const onSubmit = async (_values: TaxesSettingsFormValues) => {
    // No settings service.updateTaxSettings yet — mock success until settings API is wired.
    const result = await saveSettingsMutation.mutateAsync({
      section: "taxes",
      value: fromTaxesSettingsFormValues(_values, initial),
    });
    if (!result.ok) {
      toast.error(result.reason ?? t("console.settings.save-failed"));
      return;
    }
    toast.success(t("console.settings.taxes.saved"));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingsSection
        icon={Receipt}
        title={t("console.settings.taxes.title")}
        description={t("console.settings.taxes.description")}
        footer={
          <Button type="submit" variant="contained" shape="circle" disabled={isSubmitting}>
            {isSubmitting ? t("console.settings.saving") : t("console.settings.save")}
          </Button>
        }
      >
        <Controller
          name="pricesIncludeTax"
          control={control}
          render={({ field }) => (
            <SettingsToggleRow
              title={t("console.settings.taxes.prices-include")}
              description={t("console.settings.taxes.prices-include-description")}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          name="autoCalculate"
          control={control}
          render={({ field }) => (
            <SettingsToggleRow
              title={t("console.settings.taxes.auto-calculate")}
              description={t("console.settings.taxes.auto-calculate-description")}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <Input
            label={t("console.settings.taxes.default-rate")}
            type="number"
            step="0.01"
            min={0}
            max={100}
            error={errors.defaultRate?.message}
            {...register("defaultRate")}
          />
          <Input
            label={t("console.settings.taxes.tax-id")}
            error={errors.taxId?.message}
            {...register("taxId")}
          />
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
          <p className="text-caption font-semibold uppercase tracking-widest text-muted-foreground-lighter">
            {t("console.settings.taxes.regional-rates")}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {initial.regions.map((region) => (
              <div
                key={region.id}
                className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-body text-foreground">{region.name}</span>
                <span className="text-body font-medium tabular-nums text-muted-foreground">
                  {region.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </SettingsSection>
    </form>
  );
}
