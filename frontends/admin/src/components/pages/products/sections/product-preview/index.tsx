"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { ProductFull } from "@/lib/admin/mock";
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import { defaultGradients } from "@/lib/theme-colors";
import { ProductPreviewStorefront } from "./components/ProductPreviewStorefront";
import { ProductPreviewDetails } from "./components/ProductPreviewDetails";

interface ProductPreviewModalProps {
  product: ProductFull | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: ProductFull) => void;
  /** Optional variant config for the previewed product (from services / parent). */
  variantConfig?: ProductVariantConfig;
}

export function ProductPreviewModal({
  product,
  isOpen,
  onClose,
  onEdit,
  variantConfig,
}: ProductPreviewModalProps) {
  if (!product) return null;

  const gradientId = `preview-modal-${product.id}`;
  const grad0 = product.gradient?.[0] || defaultGradients.productWarm[0];
  const grad1 = product.gradient?.[1] || defaultGradients.productWarm[1];

  return (
    <>
      <AdminDynamicStyles gradients={[{ id: gradientId, start: grad0, end: grad1 }]} />
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent size="wide" padding="none" radius="3xl" scroll>
          <DialogTitle className="sr-only">Product Preview - {product.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed preview of product statistics, variants and logistics info.
          </DialogDescription>

          <div className="grid grid-cols-1 md:grid-cols-12 min-h-126">
            {/* Left Column: Storefront Mockup Preview */}
            <ProductPreviewStorefront
              key={`storefront-${product.id}`}
              product={product}
              gradientId={gradientId}
              variantConfig={variantConfig}
            />

            {/* Right Column: Logistics, Metrics & Actions */}
            <ProductPreviewDetails
              key={`details-${product.id}`}
              product={product}
              onClose={onClose}
              onEdit={onEdit}
              variantConfig={variantConfig}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
