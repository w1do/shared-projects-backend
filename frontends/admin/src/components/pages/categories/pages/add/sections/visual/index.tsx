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

export function VisualSection() {
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
          Visual & Performance
        </h2>
        <p className="text-xs text-muted-foreground-lighter">
          Pick a cover gradient and icon, then seed the merchandising metrics for this category.
        </p>
      </div>

      <div className="flex flex-col gap-4 border-t border-border/40 pt-8">
        <AdminDynamicStyles gradients={gradients} />
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Visual Design
        </h4>

        <Controller
          control={control}
          name="thumbnail"
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground block">
                Thumbnail Image (1:1)
              </Label>
              <ImageUploader
                value={field.value ? [field.value] : []}
                onChange={(images) => field.onChange(images[0] || "")}
                maxFiles={1}
                multiple={false}
                placeholder="Upload category thumbnail"
                description="Square cover shown on category cards (1:1)"
                aspectRatio="square"
                previewClassName="aspect-square w-full max-w-48"
                error={errors.thumbnail?.message}
              />
            </div>
          )}
        />

        {/* Cover Gradient Presets */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Cover Gradient Preset</span>
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
                Category Icon
              </Label>
              <div className="grid grid-cols-6 gap-2" role="group" aria-label="Category icon">
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

        {/* Sort Order and Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            min="1"
            className="text-xs"
            {...register("displayOrder")}
            label="Display Order"
            error={errors.displayOrder?.message}
          />

          <Input
            type="number"
            step="0.1"
            className="text-xs"
            {...register("growthYoY")}
            label="Growth YoY (%)"
            error={errors.growthYoY?.message}
          />
        </div>

        <Input
          type="number"
          className="text-xs"
          {...register("revenue")}
          label="Revenue ($)"
          error={errors.revenue?.message}
        />
      </div>
    </Card>
  );
}
