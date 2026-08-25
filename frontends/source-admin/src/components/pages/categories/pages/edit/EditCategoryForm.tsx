"use client";

import * as React from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  categoryFormSchema,
  CategoryFormValues,
} from "@/lib/admin/schemas/catalog/category-form-schema";
import { createCategoryFormValues, defaultCategoryFormValues } from "@/lib/admin/categories/form";
import type { Category } from "@/lib/admin/mocks/types";
import { useEditCategoryPage, useUpdateCategoryForm } from "@/hooks/admin/categories";
import { useStickyThreshold } from "@/hooks/use-sticky-threshold";

// Sections
import { EditCategoryHeader } from "./sections/header";
import { EditCategoryStickyHeader } from "./sections/sticky-header";
import { GeneralInfoSection } from "../add/sections/general-info";
import { VisualSection } from "../add/sections/visual";
import { CategoryLivePreview } from "../add/sections/category-preview";
import { descendantIds } from "@/lib/admin/data-source/category-tree";
import { useProjectLocalesQuery } from "@/hooks/admin/localization";
import { CategoryEditFallback } from "./sections/fallback";

interface EditCategoryFormProps {
  categoryId: string;
  initialCategory?: Category | null;
  initialCategories?: Category[];
}

export function EditCategoryForm({
  categoryId,
  initialCategory,
  initialCategories = [],
}: EditCategoryFormProps) {
  const isSticky = useStickyThreshold();
  const { data: projectLocales } = useProjectLocalesQuery();
  const { category, categories, isResolving, notFound } = useEditCategoryPage({
    categoryId,
    initialCategory,
    initialCategories,
  });
  const { submit, isSubmitting } = useUpdateCategoryForm(categoryId);

  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema) as Resolver<CategoryFormValues>,
    defaultValues: defaultCategoryFormValues,
  });

  const categoryRevision = category?.id ?? "";
  React.useEffect(() => {
    if (!category) return;
    methods.reset({ ...createCategoryFormValues(category), defaultLocale: projectLocales?.[0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by categoryRevision
  }, [categoryRevision, methods]);

  const onSubmit = async (data: CategoryFormValues) => {
    if (!category) return;
    try {
      await submit(data);
    } catch {
      // Errors are toasted inside the form hook.
    }
  };

  if (isResolving) {
    return <CategoryEditFallback variant="loading" categoryId={categoryId} />;
  }

  if (notFound || !category) {
    return <CategoryEditFallback variant="not-found" categoryId={categoryId} />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="relative">
        <EditCategoryStickyHeader
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          categoryName={category.name}
        />

        <div className="flex flex-col gap-8">
          <EditCategoryHeader categoryName={category.name} isSubmitting={isSubmitting} />

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <GeneralInfoSection
                isEdit
                autoSlug={false}
                setAutoSlug={() => {}}
                locales={projectLocales}
                parentOptions={categories.map((item) => ({
                  id: item.id,
                  name: item.name,
                  depth: item.depth ?? 0,
                  parentId: item.parentId ?? null,
                }))}
                disabledParentIds={(() => {
                  const invalid = descendantIds(
                    categories.map((item) => ({ id: item.id, parentId: item.parentId ?? null })),
                    category.id,
                  );
                  invalid.add(category.id);
                  return invalid;
                })()}
              />
              <VisualSection />
            </div>

            <div className="lg:col-span-1">
              <div className="flex flex-col gap-6 lg:sticky lg:top-32">
                <CategoryLivePreview />
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
