"use client";

import * as React from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";

import { brandFormSchema, BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import { createBrandFormValues, defaultBrandFormValues } from "@/lib/admin/brands/form";
import type { Brand } from "@/lib/admin/mocks/types";
import { useEditBrandPage, useUpdateBrandForm } from "@/hooks/admin/brands";
import { useStickyThreshold } from "@/hooks/use-sticky-threshold";
import { BrandPreviewModal } from "@/components/pages/brands/sections/brand-preview";

// Components
import { EditBrandHeader } from "./sections/header";
import { EditBrandStickyHeader } from "./sections/sticky-header";
import { GeneralInfoSection } from "@/components/pages/brands/pages/add/sections/general-info";
import { BrandMediaSection } from "@/components/pages/brands/pages/add/sections/media";
import { StatusSection } from "@/components/pages/brands/pages/add/sections/status";
import { BrandThumbnailSection } from "@/components/pages/brands/pages/add/sections/thumbnail";
import { SEOSection } from "@/components/pages/brands/pages/add/sections/seo";

interface EditBrandFormProps {
  brandId: string;
  initialBrand?: Brand | null;
}

export function EditBrandForm({ brandId, initialBrand }: EditBrandFormProps) {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const isSticky = useStickyThreshold();
  const {
    brand: brandObj,
    brandDetails,
    isResolving,
    notFound,
  } = useEditBrandPage({
    brandId,
    initialBrand,
  });
  const { submit, isSubmitting } = useUpdateBrandForm(brandId);

  const methods = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema) as Resolver<BrandFormValues>,
    defaultValues: defaultBrandFormValues,
  });

  // Reset only when the loaded brand identity changes — not on every details object identity.
  const brandRevision = brandObj?.id ?? "";
  React.useEffect(() => {
    if (!brandObj) return;
    methods.reset(createBrandFormValues(brandObj, brandDetails));
    // brandDetails is memoized by brand id in useEditBrandPage.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed by brandRevision
  }, [brandRevision, methods]);

  const formValues = methods.watch();
  const previewData = React.useMemo(() => {
    if (!brandObj) return formValues;
    return {
      ...brandObj,
      ...formValues,
    };
  }, [brandObj, formValues]);

  const onSubmit = async (data: BrandFormValues) => {
    if (!brandObj) return;
    try {
      await submit(data);
    } catch {
      // Errors are toasted inside the form hook.
    }
  };

  if (isResolving) {
    return (
      <div className="flex flex-col gap-8">
        <div className="h-32 animate-pulse rounded-3xl border border-border/40 bg-card shadow-subtle" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-3xl border border-border/40 bg-card shadow-subtle lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-3xl border border-border/40 bg-card shadow-subtle" />
        </div>
      </div>
    );
  }

  if (notFound || !brandObj) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 py-24 bg-card border border-border/40 rounded-3xl shadow-subtle gap-6">
        <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <div>
          <h2 className="text-xl font-medium text-foreground">Brand Not Found</h2>
          <p className="text-xs text-muted-foreground-lighter mt-1 max-w-sm">
            We couldn&apos;t find a cosmetics brand with the ID &quot;{brandId}&quot;. It may have
            been deleted or never existed.
          </p>
        </div>
        <Button
          component="Link"
          href="/admin/brands"
          variant="outlined"
          shape="circle"
          startIcon={<ArrowLeft />}
        >
          Back to brands
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="relative">
        <EditBrandStickyHeader
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          brandName={brandObj.name}
          onPreview={() => setIsPreviewOpen(true)}
        />

        <div className="flex flex-col gap-8">
          <EditBrandHeader
            brandName={brandObj.name}
            isSubmitting={isSubmitting}
            onPreview={() => setIsPreviewOpen(true)}
          />

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <GeneralInfoSection />
              <BrandMediaSection />
              <SEOSection />
            </div>

            <div className="lg:col-span-1">
              <div className="flex flex-col gap-6 lg:sticky lg:top-32">
                <BrandThumbnailSection />
                <StatusSection />
              </div>
            </div>
          </div>
        </div>
      </form>

      <BrandPreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        brandData={previewData}
      />
    </FormProvider>
  );
}
