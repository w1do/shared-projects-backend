"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { CategoryTreeSelect } from "@/components/ui/inputs/category-tree-select";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
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
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<BlogFormValues>();

  return (
    <Card variant="form-section">
      <div className="flex flex-col gap-2">
        <h2 className="text-heading font-medium text-foreground leading-tight">Article basics</h2>
        <p className="text-xs text-muted-foreground-lighter">
          The headline, hook, and how readers will find this story.
        </p>
      </div>

      <Input label="Title" error={errors.title?.message} {...register("title")} />
      <Textarea
        label="Subtitle"
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
            label="Category"
            options={CATEGORY_OPTIONS}
            ariaLabel="Article category"
            error={errors.category?.message}
          />
        )}
        <Input
          label="Tags"
          labelRight={
            <span className="text-caption text-muted-foreground-lighter">comma separated</span>
          }
          placeholder="skincare, guide, serum"
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
                label="Project categories"
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
