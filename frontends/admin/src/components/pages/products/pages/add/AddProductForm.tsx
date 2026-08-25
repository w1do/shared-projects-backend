"use client";

import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ProductFormHeader,
  ProductFormStickyHeader,
  ProductFormBody,
} from "@/components/pages/products/sections/product-form";
import { useStickyHeader } from "@/hooks/use-sticky-header";
import {
  productFormSchema,
  ProductFormValues,
} from "@/lib/admin/schemas/catalog/product-form-schema";
import { defaultFormValues, sampleProductData } from "@/lib/admin/products/autofill-data";
import { buildProductFormOptions } from "@/lib/admin/products/product-form";
import { useCreateProductForm } from "@/hooks/admin/products";
import { getCatalogCapabilities, isAdminApiMode } from "@/lib/admin/services";
import type { Brand, Category, Collection } from "@/lib/admin/mocks/types";
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";

export function AddProductForm({
  brands = [],
  categories = [],
  collections = [],
  variantGroups = [],
}: {
  brands?: Brand[];
  categories?: Category[];
  collections?: Collection[];
  variantGroups?: ProductVariantConfig[];
}) {
  const isSticky = useStickyHeader();
  const { submit, isSubmitting } = useCreateProductForm();
  const apiMode = isAdminApiMode();
  const { autoFill } = getCatalogCapabilities();

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as Resolver<ProductFormValues>,
    defaultValues: defaultFormValues,
  });

  const { brandOptions, categoryOptions, collectionOptions } = buildProductFormOptions(
    { brands, categories, collections },
    apiMode,
  );

  const handleAutoFill = () => {
    if (!autoFill) {
      toast.info("Auto-fill is only available in mock template mode.");
      return;
    }
    methods.reset(sampleProductData);
    toast.success("Auto-filled with sample luxury serum data");
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submit)} className="relative">
        <ProductFormStickyHeader
          title="Add product"
          submitLabel="Save Product"
          submitLabelShort="Save"
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          onAutoFill={handleAutoFill}
        />

        <div className="flex flex-col gap-8">
          <ProductFormHeader
            title="Add product"
            submitLabel="Save Product"
            savingLabel="Saving..."
            isSubmitting={isSubmitting}
            onAutoFill={handleAutoFill}
          />

          <ProductFormBody
            brandOptions={brandOptions}
            categoryOptions={categoryOptions}
            collectionOptions={collectionOptions}
          />
        </div>
      </form>
    </FormProvider>
  );
}
