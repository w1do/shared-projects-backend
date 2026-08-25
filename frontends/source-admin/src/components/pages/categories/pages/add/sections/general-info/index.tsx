"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Select } from "@/components/ui/inputs/select";
import { Button } from "@/components/ui/inputs/button";
import type { CategoryFormValues } from "@/lib/admin/schemas/catalog/category-form-schema";
import {
  CategoryTreeSelect,
  type CategoryTreeOption,
} from "@/components/ui/inputs/category-tree-select";

interface GeneralInfoSectionProps {
  autoSlug: boolean;
  setAutoSlug: (value: boolean) => void;
  isEdit?: boolean;
  /** Дерево категорий проекта для выбора родителя (режим api). */
  parentOptions?: CategoryTreeOption[];
  /** Локали проекта; первая — по умолчанию. Не-дефолтные дают поля имени по локалям. */
  locales?: string[];
  /** Узлы, недопустимые как родитель: сам узел и его поддерево. */
  disabledParentIds?: Set<string>;
}

export function GeneralInfoSection({
  autoSlug,
  setAutoSlug,
  isEdit = false,
  parentOptions,
  disabledParentIds,
  locales,
}: GeneralInfoSectionProps) {
  const extraLocales = (locales ?? []).slice(1);
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CategoryFormValues>();

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Draft", label: "Draft" },
    { value: "Archived", label: "Archived" },
  ];

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium leading-tight text-foreground">Category Details</h2>
        <p className="text-xs text-muted-foreground-lighter">
          Define how this category is named and surfaced across the catalog.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          {...register("name")}
          label={
            extraLocales.length > 0 && locales
              ? `Category Name (${locales[0].toUpperCase()} · default)`
              : "Category Name"
          }
          placeholder="e.g., Serums & Ampoules"
          error={errors.name?.message}
        />

        {extraLocales.map((locale) => (
          <Controller
            key={locale}
            control={control}
            name={`nameTranslations.${locale}`}
            render={({ field }) => (
              <Input
                value={field.value ?? ""}
                onChange={field.onChange}
                label={`Category Name (${locale.toUpperCase()})`}
                placeholder="Leave empty to fall back to the default locale"
                data-testid={`category-name-${locale}`}
              />
            )}
          />
        ))}

        <Input
          {...register("slug")}
          label="Slug"
          placeholder="e.g., serums-ampoules"
          labelRight={
            !isEdit && (
              <Button
                type="button"
                variant="text"
                size="xs"
                color="surface"
                onClick={() => setAutoSlug(!autoSlug)}
              >
                {autoSlug ? "Manual edit" : "Auto sync"}
              </Button>
            )
          }
          error={errors.slug?.message}
        />

        <Textarea
          {...register("description")}
          label="Description"
          placeholder="Describe this category..."
          error={errors.description?.message}
        />

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              label="Status"
              value={field.value}
              options={statusOptions}
              onChange={(e) => field.onChange(e.target.value)}
              error={errors.status?.message}
            />
          )}
        />

        {parentOptions && (
          <Controller
            control={control}
            name="parentId"
            render={({ field }) => (
              <CategoryTreeSelect
                mode="single"
                label="Parent category"
                allowRoot
                options={parentOptions}
                disabledIds={disabledParentIds}
                value={field.value ? field.value : null}
                onChange={(value) => field.onChange(value ?? "")}
                error={errors.parentId?.message}
                data-testid="category-parent"
              />
            )}
          />
        )}
      </div>
    </Card>
  );
}
