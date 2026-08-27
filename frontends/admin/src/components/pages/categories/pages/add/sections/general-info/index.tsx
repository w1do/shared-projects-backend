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
import { useConsoleText } from "@/lib/admin/use-console-text";

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
  const t = useConsoleText();
  const extraLocales = (locales ?? []).slice(1);
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CategoryFormValues>();

  const statusOptions = [
    { value: "Active", label: t("console.categories.status.active") },
    { value: "Draft", label: t("console.categories.status.draft") },
    { value: "Archived", label: t("console.categories.status.archived") },
  ];

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium leading-tight text-foreground">
          {t("console.categories.form.details")}
        </h2>
        <p className="text-xs text-muted-foreground-lighter">
          {t("console.categories.form.details-hint")}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          {...register("name")}
          label={
            extraLocales.length > 0 && locales
              ? t("console.categories.form.name-default").replace(
                  "{locale}",
                  locales[0].toUpperCase(),
                )
              : t("console.categories.form.name")
          }
          placeholder={t("console.categories.form.name-placeholder")}
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
                label={t("console.categories.form.name-locale").replace(
                  "{locale}",
                  locale.toUpperCase(),
                )}
                placeholder={t("console.categories.form.name-locale-placeholder")}
                data-testid={`category-name-${locale}`}
              />
            )}
          />
        ))}

        <Input
          {...register("slug")}
          label={t("console.categories.form.slug")}
          placeholder={t("console.categories.form.slug-placeholder")}
          labelRight={
            !isEdit && (
              <Button
                type="button"
                variant="text"
                size="xs"
                color="surface"
                onClick={() => setAutoSlug(!autoSlug)}
              >
                {autoSlug
                  ? t("console.categories.form.slug-manual")
                  : t("console.categories.form.slug-auto")}
              </Button>
            )
          }
          error={errors.slug?.message}
        />

        <Textarea
          {...register("description")}
          label={t("console.categories.form.description")}
          placeholder={t("console.categories.form.description-placeholder")}
          error={errors.description?.message}
        />

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              label={t("console.categories.form.status")}
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
                label={t("console.categories.form.parent")}
                allowRoot
                rootLabel={t("console.categories.move.root")}
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
