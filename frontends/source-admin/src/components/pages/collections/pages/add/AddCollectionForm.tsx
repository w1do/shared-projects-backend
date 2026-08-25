"use client";

import * as React from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getCatalogCapabilities } from "@/lib/admin/services";
import {
  collectionFormSchema,
  type CollectionFormValues,
} from "@/lib/admin/schemas/catalog/collection-form-schema";
import {
  defaultCollectionFormValues,
  sampleCollectionFormValues,
  slugifyCollectionName,
} from "@/lib/admin/collections/form";
import type { ProductFull } from "@/lib/admin/mocks/types";
import { useCreateCollectionForm } from "@/hooks/admin/collections";
import { useStickyThreshold } from "@/hooks/use-sticky-threshold";

// Sections
import { AddCollectionHeader } from "@/components/pages/collections/pages/add/sections/header";
import { AddCollectionStickyHeader } from "@/components/pages/collections/pages/add/sections/sticky-header";
import { GeneralInfoSection } from "@/components/pages/collections/pages/add/sections/general-info";
import { VisualSection } from "@/components/pages/collections/pages/add/sections/visual";
import { ProductsSection } from "@/components/pages/collections/pages/add/sections/products";
import { CollectionLivePreview } from "@/components/pages/collections/pages/add/sections/collection-preview";

export function AddCollectionForm({ products = [] }: { products?: ProductFull[] }) {
  const isSticky = useStickyThreshold();
  const { submit, isSubmitting } = useCreateCollectionForm();

  const methods = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema) as Resolver<CollectionFormValues>,
    defaultValues: defaultCollectionFormValues,
  });

  const name = methods.watch("name");

  React.useEffect(() => {
    methods.setValue("slug", slugifyCollectionName(name ?? ""), {
      shouldValidate: Boolean(name),
    });
  }, [name, methods]);

  const onSubmit = async (data: CollectionFormValues) => {
    try {
      await submit(data);
    } catch {
      // Errors are toasted inside the form hook.
    }
  };

  const handleAutoFill = () => {
    if (!getCatalogCapabilities().autoFill) {
      toast.info("Auto-fill is only available in mock template mode.");
      return;
    }
    methods.reset(sampleCollectionFormValues);
    toast.success("Auto-filled with a sample edit (Midnight Recovery Edit)");
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="relative">
        <AddCollectionStickyHeader
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          onAutoFill={handleAutoFill}
        />

        <div className="flex flex-col gap-8">
          <AddCollectionHeader isSubmitting={isSubmitting} onAutoFill={handleAutoFill} />

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <GeneralInfoSection />
              <VisualSection />
              <ProductsSection products={products} />
            </div>

            <div className="lg:col-span-1">
              <div className="flex flex-col gap-6 lg:sticky lg:top-32">
                <CollectionLivePreview />
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
