"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { CategoryFormValues } from "@/lib/admin/schemas/catalog/category-form-schema";
import { iconOptions } from "@/components/pages/categories/config/icons";
import { gradientPresets } from "@/lib/admin/shared/gradient-presets";
import { useConsoleText } from "@/lib/admin/use-console-text";

export function VisualSection() {
  const t = useConsoleText();
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CategoryFormValues>();

  const gradients = gradientPresets.map((preset) => ({
    id: `category-preset-${preset.name}`,
    start: preset.start,
    end: preset.end,
  }));

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium leading-tight text-foreground">
          {t("console.categories.form.visual-title")}
        </h2>
        <p className="text-xs text-muted-foreground-lighter">
          {t("console.categories.form.visual-subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-4 border-t border-border/40 pt-8">
        <AdminDynamicStyles gradients={gradients} />
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          {t("console.categories.form.visual-design")}
        </h4>

        <Controller
          control={control}
          name="thumbnail"
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground block">
                {t("console.categories.form.thumbnail")}
              </Label>
              <ImageUploader
                value={field.value ? [field.value] : []}
                onChange={(images) => field.onChange(images[0] || "")}
                maxFiles={1}
                multiple={false}
                placeholder={t("console.categories.form.thumbnail-placeholder")}
                description={t("console.categories.form.thumbnail-hint")}
                aspectRatio="square"
                previewClassName="aspect-square w-full max-w-48"
                error={errors.thumbnail?.message}
              />
            </div>
          )}
        />

        {/* Cover Gradient Presets */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("console.categories.form.gradient-preset")}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {gradientPresets.map((preset) => (
              <Button
                key={preset.name}
                type="button"
                variant="outlined"
                color="surface"
                className="h-10 rounded-xl relative overflow-hidden hover:scale-105"
                onClick={() => {
                  setValue("coverGradientStart", preset.start);
                  setValue("coverGradientEnd", preset.end);
                }}
                title={preset.name}
              >
                <div
                  className="absolute inset-0 opacity-80 admin-gradient-swatch"
                  data-admin-gradient={`category-preset-${preset.name}`}
                />
                <span className="text-caption font-medium text-primary-foreground z-10 drop-shadow">
                  {preset.name}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Icon Selector */}
        <Controller
          control={control}
          name="iconName"
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground block">
                {t("console.categories.form.icon")}
              </Label>
              <div
                className="grid grid-cols-6 gap-2"
                role="group"
                aria-label={t("console.categories.form.icon")}
              >
                {iconOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = field.value === opt.name;
                  return (
                    <IconButton
                      key={opt.name}
                      type="button"
                      variant={isSelected ? "soft" : "outlined"}
                      color={isSelected ? "primary" : "surface"}
                      shape="rounded"
                      onClick={() => field.onChange(opt.name)}
                    >
                      <Icon className="size-4" />
                    </IconButton>
                  );
                })}
              </div>
              {errors.iconName?.message && (
                <p className="ui-form-help-text font-medium text-destructive">
                  {errors.iconName.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Порядок сортировки. Торговых метрик у платформы нет — полей нет. */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            min="1"
            className="text-xs"
            {...register("displayOrder")}
            label={t("console.categories.form.display-order")}
            error={errors.displayOrder?.message}
          />
        </div>
      </div>
    </Card>
  );
}
