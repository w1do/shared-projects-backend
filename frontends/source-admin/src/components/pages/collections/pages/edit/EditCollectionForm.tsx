"use client";

import * as React from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  collectionFormSchema,
  type CollectionFormValues,
} from "@/lib/admin/schemas/catalog/collection-form-schema";
import {
  createCollectionFormValues,
  defaultCollectionFormValues,
  slugifyCollectionName,
} from "@/lib/admin/collections/form";
import type { Collection, ProductFull } from "@/lib/admin/mocks/types";
import { useEditCollectionPage, useUpdateCollectionForm } from "@/hooks/admin/collections";
import { useStickyThreshold } from "@/hooks/use-sticky-threshold";

// Sections
import { EditCollectionHeader } from "@/components/pages/collections/pages/edit/sections/header";
import { EditCollectionStickyHeader } from "@/components/pages/collections/pages/edit/sections/sticky-header";
import { CollectionEditFallback } from "@/components/pages/collections/pages/edit/sections/fallback";
import { GeneralInfoSection } from "@/components/pages/collections/pages/add/sections/general-info";
import { VisualSection } from "@/components/pages/collections/pages/add/sections/visual";
import { ProductsSection } from "@/components/pages/collections/pages/add/sections/products";
import { CollectionLivePreview } from "@/components/pages/collections/pages/add/sections/collection-preview";

interface EditCollectionFormProps {
  collectionId: string;
  initialCollection?: Collection | null;
  products?: ProductFull[];
}

export function EditCollectionForm({
  collectionId,
  initialCollection,
  products: initialProducts = [],
}: EditCollectionFormProps) {
  const isSticky = useStickyThreshold();
  const { collection, products, isResolving, notFound } = useEditCollectionPage({
    collectionId,
    initialCollection,
    initialProducts,
  });
  const { submit, isSubmitting } = useUpdateCollectionForm(collectionId);

  const methods = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema) as Resolver<CollectionFormValues>,
    defaultValues: defaultCollectionFormValues,
  });

  const collectionRevision = collection?.id ?? "";
  React.useEffect(() => {
    if (!collection) return;
    methods.reset(createCollectionFormValues(collection));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by collectionRevision
  }, [collectionRevision, methods]);

  const name = methods.watch("name");

  React.useEffect(() => {
    methods.setValue("slug", slugifyCollectionName(name ?? ""), {
      shouldValidate: Boolean(name),
    });
  }, [name, methods]);

  const onSubmit = async (data: CollectionFormValues) => {
    if (!collection) return;
    try {
      await submit(data);
    } catch {
      // Errors are toasted inside the form hook.
    }
  };

  if (isResolving) {
    return <CollectionEditFallback variant="loading" collectionId={collectionId} />;
  }

  if (notFound || !collection) {
    return <CollectionEditFallback variant="not-found" collectionId={collectionId} />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="relative">
        <EditCollectionStickyHeader
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          collectionName={collection.name}
        />

        <div className="flex flex-col gap-8">
          <EditCollectionHeader collectionName={collection.name} isSubmitting={isSubmitting} />

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
