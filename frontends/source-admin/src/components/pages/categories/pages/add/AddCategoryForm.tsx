"use client";

import * as React from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getCatalogCapabilities } from "@/lib/admin/services";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import {
  categoryFormSchema,
  mockCategoryFormSchema,
  CategoryFormValues,
} from "@/lib/admin/schemas/catalog/category-form-schema";
import {
  defaultCategoryFormValues,
  sampleCategoryFormValues,
  slugifyCategoryName,
} from "@/lib/admin/categories/form";
import type { Category } from "@/lib/admin/mocks/types";
import { useCreateCategoryForm } from "@/hooks/admin/categories";
import { useStickyThreshold } from "@/hooks/use-sticky-threshold";
import { useConsoleText } from "@/lib/admin/use-console-text";

// Sections
import { AddCategoryHeader } from "./sections/header";
import { AddCategoryStickyHeader } from "./sections/sticky-header";
import { GeneralInfoSection } from "./sections/general-info";
import { VisualSection } from "./sections/visual";
import { CategoryLivePreview } from "./sections/category-preview";
import { useCategoriesQuery } from "@/hooks/admin/categories";
import { useProjectLocalesQuery } from "@/hooks/admin/localization";

export function AddCategoryForm({ initialCategories }: { initialCategories?: Category[] } = {}) {
  const t = useConsoleText();
  const isSticky = useStickyThreshold();
  // Дерево для выбора родителя грузится на клиенте: серверный рендер не знает
  // текущего проекта (он в cookie браузера).
  const { data: projectLocales } = useProjectLocalesQuery();
  const { data: categories = initialCategories ?? [] } = useCategoriesQuery(
    initialCategories ? { initialData: initialCategories } : {},
  );
  const [autoSlug, setAutoSlug] = React.useState(true);
  const { submit, isSubmitting } = useCreateCategoryForm();

  // Живой режим — базовая схема без денежных полей; демо-шаблон хранит метрики.
  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(
      shouldUseAdminApi() ? categoryFormSchema : mockCategoryFormSchema,
    ) as Resolver<CategoryFormValues>,
    defaultValues: defaultCategoryFormValues,
  });

  const parentOptions = React.useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        depth: category.depth ?? 0,
        parentId: category.parentId ?? null,
      })),
    [categories],
  );

  React.useEffect(() => {
    if (projectLocales?.[0]) methods.setValue("defaultLocale", projectLocales[0]);
  }, [projectLocales, methods]);

  const name = methods.watch("name");

  React.useEffect(() => {
    if (!autoSlug) return;
    methods.setValue("slug", slugifyCategoryName(name ?? ""), {
      shouldValidate: Boolean(name),
    });
  }, [name, autoSlug, methods]);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      await submit(data);
    } catch {
      // Errors are toasted inside the form hook.
    }
  };

  const handleAutoFill = () => {
    if (!getCatalogCapabilities().autoFill) {
      toast.info(t("console.categories.autofill-mock-only"));
      return;
    }
    setAutoSlug(false);
    methods.reset(sampleCategoryFormValues);
    toast.success(t("console.categories.autofill-applied"));
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="relative">
        <AddCategoryStickyHeader
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          onAutoFill={handleAutoFill}
        />

        <div className="flex flex-col gap-8">
          <AddCategoryHeader isSubmitting={isSubmitting} onAutoFill={handleAutoFill} />

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <GeneralInfoSection
                autoSlug={autoSlug}
                setAutoSlug={setAutoSlug}
                parentOptions={parentOptions}
                locales={projectLocales}
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
