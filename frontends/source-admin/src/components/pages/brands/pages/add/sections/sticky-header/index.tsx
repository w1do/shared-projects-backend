"use client";

import { FormStickyHeader } from "@/components/shared/layout/FormStickyHeader";

interface AddBrandStickyHeaderProps {
  isSticky: boolean;
  isSubmitting: boolean;
  onAutoFill: () => void;
  onPreview?: () => void;
}

export function AddBrandStickyHeader({
  isSticky,
  isSubmitting,
  onAutoFill,
  onPreview,
}: AddBrandStickyHeaderProps) {
  return (
    <FormStickyHeader
      isSticky={isSticky}
      isSubmitting={isSubmitting}
      title="Create brand"
      backHref="/admin/brands"
      backLabel="Back to brands"
      submitLabel="Save brand"
      submitLabelShort="Save"
      submittingLabel="Saving…"
      submitIcon="check"
      onAutoFill={onAutoFill}
      onPreview={onPreview}
      disableBackWhileSubmitting
    />
  );
}
