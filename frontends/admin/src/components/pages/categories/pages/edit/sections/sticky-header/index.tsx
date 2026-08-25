"use client";

import { FormStickyHeader } from "@/components/shared/layout/FormStickyHeader";

interface EditCategoryStickyHeaderProps {
  isSticky: boolean;
  isSubmitting: boolean;
  categoryName?: string;
}

export function EditCategoryStickyHeader({
  isSticky,
  isSubmitting,
  categoryName,
}: EditCategoryStickyHeaderProps) {
  return (
    <FormStickyHeader
      isSticky={isSticky}
      isSubmitting={isSubmitting}
      title={categoryName ? `Edit ${categoryName}` : "Edit category"}
      backHref="/admin/categories"
      backLabel="Back to categories"
      submitLabel="Save changes"
      submitLabelShort="Save"
      submittingLabel="Saving…"
      submitIcon="check"
      disableBackWhileSubmitting
    />
  );
}
