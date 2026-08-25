"use client";

import { FormStickyHeader } from "@/components/shared/layout/FormStickyHeader";

interface ProductFormStickyHeaderProps {
  title: string;
  submitLabel: string;
  submitLabelShort?: string;
  submittingLabel?: string;
  isSticky: boolean;
  isSubmitting: boolean;
  onAutoFill?: () => void;
}

export function ProductFormStickyHeader({
  title,
  submitLabel,
  submitLabelShort,
  submittingLabel = "Saving…",
  isSticky,
  isSubmitting,
  onAutoFill,
}: ProductFormStickyHeaderProps) {
  return (
    <FormStickyHeader
      isSticky={isSticky}
      isSubmitting={isSubmitting}
      title={title}
      backHref="/admin/products"
      backLabel="Back to products"
      submitLabel={submitLabel}
      submitLabelShort={submitLabelShort}
      submittingLabel={submittingLabel}
      onAutoFill={onAutoFill}
    />
  );
}
