"use client";

import { GeneralInfoSection } from "@/components/pages/products/pages/add/sections/general-info";
import { MediaSection } from "@/components/pages/products/pages/add/sections/media";
import { PricingSection } from "@/components/pages/products/pages/add/sections/pricing";
import { ThumbnailSection } from "@/components/pages/products/pages/add/sections/thumbnail";
import { StatusSection } from "@/components/pages/products/pages/add/sections/status";
import { CollectionsSection } from "@/components/pages/products/pages/add/sections/collections";
import { VariantLinksSection } from "@/components/pages/products/pages/add/sections/variant-links";
import { ContentBlocksSection } from "@/components/pages/products/pages/add/sections/content-blocks";
import { SidebarSettings } from "@/components/pages/products/pages/add/sections/sidebar-settings";
import type { ProductFormOptions } from "@/lib/admin/products/product-form";

/**
 * Shared two-column layout composing every product form section. Reused by both
 * the add and edit product flows so the field set always stays in sync.
 */
export function ProductFormBody({
  brandOptions,
  categoryOptions,
  collectionOptions,
  productId,
}: ProductFormOptions & { productId?: string }) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left column */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <GeneralInfoSection />
        <MediaSection />
        <PricingSection />
        <CollectionsSection collectionOptions={collectionOptions} />
        <ContentBlocksSection />
        <VariantLinksSection productId={productId} />
      </div>

      {/* Right column - sidebar */}
      <div className="lg:col-span-1">
        <div className="flex flex-col gap-6 lg:sticky lg:top-32">
          <ThumbnailSection />
          <StatusSection />
          <SidebarSettings brandOptions={brandOptions} categoryOptions={categoryOptions} />
        </div>
      </div>
    </div>
  );
}
