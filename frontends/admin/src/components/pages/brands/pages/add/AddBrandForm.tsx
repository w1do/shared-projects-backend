"use client";

import * as React from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getCatalogCapabilities } from "@/lib/admin/services";
import { brandFormSchema, BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import { defaultBrandFormValues, sampleBrandFormValues } from "@/lib/admin/brands/form";
import { useCreateBrandForm } from "@/hooks/admin/brands";
import { useStickyThreshold } from "@/hooks/use-sticky-threshold";

// Components
import { AddBrandHeader } from "./sections/header";
import { AddBrandStickyHeader } from "./sections/sticky-header";
import { GeneralInfoSection } from "./sections/general-info";
import { BrandMediaSection } from "./sections/media";
import { StatusSection } from "./sections/status";
import { BrandThumbnailSection } from "./sections/thumbnail";
import { SEOSection } from "./sections/seo";
import { BrandPreviewModal } from "@/components/pages/brands/sections/brand-preview";

export function AddBrandForm() {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const isSticky = useStickyThreshold();
  const { submit, isSubmitting } = useCreateBrandForm();

  const methods = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema) as Resolver<BrandFormValues>,
    defaultValues: defaultBrandFormValues,
  });

  const onSubmit = async (data: BrandFormValues) => {
    try {
      await submit(data);
    } catch {
      // Errors are toasted inside the form hook.
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleAutoFill = () => {
    if (!getCatalogCapabilities().autoFill) {
      toast.info("Auto-fill is only available in mock template mode.");
      return;
    }
    methods.reset(sampleBrandFormValues);
    toast.success("Auto-filled with sample luxury K-Beauty brand data (HERA)");
  };

  const formValues = methods.watch();

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="relative">
        <AddBrandStickyHeader
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          onAutoFill={handleAutoFill}
          onPreview={handlePreview}
        />

        <div className="flex flex-col gap-8">
          <AddBrandHeader
            isSubmitting={isSubmitting}
            onAutoFill={handleAutoFill}
            onPreview={handlePreview}
          />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column: Core information details */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <GeneralInfoSection />
              <BrandMediaSection />
              <SEOSection />
            </div>

            {/* Right Column: Settings and Sidebar controls */}
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
        brandData={formValues}
      />
    </FormProvider>
  );
}
