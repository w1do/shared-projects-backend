"use client";

import { FormStickyHeader } from "@/components/shared/layout/FormStickyHeader";

interface AddCategoryStickyHeaderProps {
  isSticky: boolean;
  isSubmitting: boolean;
  onAutoFill: () => void;
}

export function AddCategoryStickyHeader({
  isSticky,
  isSubmitting,
  onAutoFill,
}: AddCategoryStickyHeaderProps) {
  return (
    <FormStickyHeader
      isSticky={isSticky}
      isSubmitting={isSubmitting}
      title="Create category"
      backHref="/admin/categories"
      backLabel="Back to categories"
      submitLabel="Save category"
      submitLabelShort="Save"
      submittingLabel="Saving…"
      submitIcon="check"
      onAutoFill={onAutoFill}
      disableBackWhileSubmitting
    />
  );
}
