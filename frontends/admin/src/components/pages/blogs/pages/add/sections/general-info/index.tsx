"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { CategoryTreeSelect } from "@/components/ui/inputs/category-tree-select";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { CATEGORY_OPTIONS } from "@/components/pages/blogs/pages/add/constants";
import { FormSelectField } from "@/components/pages/blogs/pages/add/components/FormSelectField";

export type PlatformCategoryOption = {
  id: string;
  name: string;
  depth: number;
  parentId?: string | null;
};

export function GeneralInfoSection({
  platformCategories,
}: {
  /** Дерево категорий проекта (режим api); в mock-режиме не передаётся. */
  platformCategories?: PlatformCategoryOption[];
}) {
  const t = useConsoleText();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<BlogFormValues>();

  return (
    <Card variant="form-section">
      <div className="flex flex-col gap-2">
        <h2 className="text-heading font-medium text-foreground leading-tight">
          {t("console.blogs.form.basics-title")}
        </h2>
        <p className="text-xs text-muted-foreground-lighter">
          {t("console.blogs.form.basics-subtitle")}
        </p>
      </div>

      <Input
        label={t("console.blogs.form.title-label")}
        error={errors.title?.message}
        {...register("title")}
      />
      <Textarea
        label={t("console.blogs.form.subtitle-label")}
        rows={2}
        error={errors.subtitle?.message}
        {...register("subtitle")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Редакционная рубрика — только в mock-режиме: в режиме api рубрика
            приходит из привязки к категориям проекта ниже. */}
        {!platformCategories && (
          <FormSelectField
            name="category"
            label={t("console.blogs.form.category-label")}
            options={CATEGORY_OPTIONS}
            ariaLabel={t("console.blogs.form.category-aria")}
            error={errors.category?.message}
          />
        )}
        <Input
          label={t("console.blogs.form.tags-label")}
          labelRight={
            <span className="text-caption text-muted-foreground-lighter">
              {t("console.blogs.form.tags-hint")}
            </span>
          }
          placeholder={t("console.blogs.form.tags-placeholder")}
          error={errors.tags?.message}
          {...register("tags")}
        />
      </div>

      {platformCategories && (
        <div data-testid="post-categories">
          <Controller
            control={control}
            name="categoryIds"
            render={({ field }) => (
              <CategoryTreeSelect
                mode="multiple"
                label={t("console.blogs.form.project-categories")}
                options={platformCategories}
                value={field.value ?? []}
                onChange={field.onChange}
                data-testid="post-categories-select"
              />
            )}
          />
        </div>
      )}
    </Card>
  );
}
