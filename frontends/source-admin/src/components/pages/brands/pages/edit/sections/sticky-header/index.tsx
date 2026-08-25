"use client";

import { FormStickyHeader } from "@/components/shared/layout/FormStickyHeader";

interface EditBrandStickyHeaderProps {
  isSticky: boolean;
  isSubmitting: boolean;
  brandName?: string;
  onPreview?: () => void;
}

export function EditBrandStickyHeader({
  isSticky,
  isSubmitting,
  brandName,
  onPreview,
}: EditBrandStickyHeaderProps) {
  return (
    <FormStickyHeader
      isSticky={isSticky}
      isSubmitting={isSubmitting}
      title={brandName ? `Edit ${brandName}` : "Edit brand"}
      backHref="/admin/brands"
      backLabel="Back to brands"
      submitLabel="Save changes"
      submitLabelShort="Save"
      submittingLabel="Saving…"
      submitIcon="check"
      onPreview={onPreview}
      disableBackWhileSubmitting
    />
  );
}
