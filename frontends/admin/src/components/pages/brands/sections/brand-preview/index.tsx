"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/data-display/tabs";
import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import type { Brand } from "@/lib/admin/mocks/types";
import { buildBrandPreviewProducts } from "@/lib/admin/mocks/brands";
import { useProductsQuery } from "@/hooks/admin/products";

import { BrandPreviewHeader } from "./components/BrandPreviewHeader";
import { BrandPreviewStorefront } from "./components/BrandPreviewStorefront";
import { BrandPreviewAnalytics } from "./components/BrandPreviewAnalytics";

interface BrandPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandData: Partial<BrandFormValues> & Partial<Brand>;
}

const COUNTRY_FLAGS: Record<string, string> = {
  "South Korea": "🇰🇷",
  France: "🇫🇷",
  Japan: "🇯🇵",
  "United States": "🇺🇸",
  Italy: "🇮🇹",
  Switzerland: "🇨🇭",
  "United Kingdom": "🇬🇧",
  Germany: "🇩🇪",
  Australia: "🇦🇺",
  Spain: "🇪🇸",
};

export function BrandPreviewModal({ open, onOpenChange, brandData }: BrandPreviewModalProps) {
  const {
    name = "Unnamed Brand",
    monogram = "UB",
    description = "",
    origin = "",
    revenue = 0,
    share = 0,
    delta = 0,
    status = "Active",
    logo = [],
    thumbnail = "",
    banner = [],
    isFeatured = false,
    metaTitle = "",
    metaDescription = "",
    trend = [12, 18, 14, 22, 28, 26, 32, 30, 34, 40, 38, 44],
  } = brandData;

  const { data: products = [] } = useProductsQuery();

  const flagEmoji = origin ? COUNTRY_FLAGS[origin] || "🌐" : "";

  // Match brand products by name; fall back to shared mock luxury products for empty brands.
  const filteredProducts = React.useMemo(() => {
    const matched = products.filter((p) => p.brand.toLowerCase() === name.toLowerCase());
    if (matched.length > 0) return matched.slice(0, 6);
    return buildBrandPreviewProducts(name);
  }, [name, products]);

  const seoSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const seoTitle = metaTitle || `${name} | Ætheria Beauty`;
  const seoDesc =
    metaDescription ||
    (description
      ? description.replace(/<[^>]*>/g, "").slice(0, 160)
      : "Discover luxury cosmetics and skin perfection. Browse exclusive high-performance beauty collections.");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" padding="none" className="max-h-preview-scroll overflow-y-auto">
        <div className="sr-only">
          <DialogTitle>Preview {name}</DialogTitle>
          <DialogDescription>Visual and financial preview of {name}</DialogDescription>
        </div>

        <BrandPreviewHeader
          name={name}
          monogram={monogram}
          origin={origin}
          status={status}
          logo={logo}
          thumbnail={thumbnail}
          banner={banner}
          isFeatured={isFeatured}
          revenue={revenue}
          share={share}
          flagEmoji={flagEmoji}
        />

        <Tabs
          variant="contained"
          color="primary"
          shape="circle"
          defaultValue="storefront"
          className="w-full p-6 md:p-8 bg-background"
        >
          <div className="flex justify-center mb-6">
            <TabsList size="auto">
              <TabsTrigger value="storefront" className="px-4 md:px-6 py-2">
                Storefront Showcase
              </TabsTrigger>
              <TabsTrigger value="analytics" className="px-4 md:px-6 py-2">
                Performance & SEO
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="storefront" className="outline-none mt-0">
            <BrandPreviewStorefront
              name={name}
              description={description}
              filteredProducts={filteredProducts}
            />
          </TabsContent>

          <TabsContent value="analytics" className="outline-none mt-0">
            <BrandPreviewAnalytics
              name={name}
              share={share}
              delta={delta}
              trend={trend}
              seoSlug={seoSlug}
              seoTitle={seoTitle}
              seoDesc={seoDesc}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
