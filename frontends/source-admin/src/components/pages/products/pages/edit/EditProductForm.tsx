"use client";

import * as React from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  buildProductFormDefaults,
  buildProductFormOptions,
} from "@/lib/admin/products/product-form";
import { useUpdateProductForm } from "@/hooks/admin/products";
import { isAdminApiMode } from "@/lib/admin/services";
import type { Brand, Category, Collection, ProductFull } from "@/lib/admin/mocks/types";
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";

export function EditProductForm({
  product,
  brands = [],
  categories = [],
  collections = [],
  variantGroups = [],
}: {
  product: ProductFull;
  brands?: Brand[];
  categories?: Category[];
  collections?: Collection[];
  variantGroups?: ProductVariantConfig[];
}) {
  const isSticky = useStickyHeader();
  const { submit, isSubmitting } = useUpdateProductForm(product.id);

  const apiMode = isAdminApiMode();
  const options = React.useMemo(
    () => buildProductFormOptions({ brands, categories, collections }, apiMode),
    [brands, categories, collections, apiMode],
  );

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as Resolver<ProductFormValues>,
    defaultValues: buildProductFormDefaults(product, options, variantGroups),
  });

  // Reset only when product identity/revision or taxonomy options change — not on every query ref.
  const productRevision = `${product.id}:${product.updatedAt ?? ""}`;
  React.useEffect(() => {
    methods.reset(buildProductFormDefaults(product, options, variantGroups));
    // product is closed over; revision key gates when we re-apply defaults.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional revision gate
  }, [productRevision, options, methods, variantGroups]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submit)} className="relative">
        <ProductFormStickyHeader
          title={product.name}
          submitLabel="Save Changes"
          submitLabelShort="Save"
          isSticky={isSticky}
          isSubmitting={isSubmitting}
        />

        <div className="flex flex-col gap-8">
          <ProductFormHeader
            title="Edit product"
            submitLabel="Save Changes"
            savingLabel="Saving..."
            isSubmitting={isSubmitting}
          />

          <ProductFormBody
            brandOptions={options.brandOptions}
            categoryOptions={options.categoryOptions}
            collectionOptions={options.collectionOptions}
            productId={product.id}
          />
        </div>
      </form>
    </FormProvider>
  );
}
