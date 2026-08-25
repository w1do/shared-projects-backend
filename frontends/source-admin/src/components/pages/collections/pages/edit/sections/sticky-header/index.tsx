"use client";

import { FormStickyHeader } from "@/components/shared/layout/FormStickyHeader";

interface EditCollectionStickyHeaderProps {
  isSticky: boolean;
  isSubmitting: boolean;
  collectionName?: string;
}

export function EditCollectionStickyHeader({
  isSticky,
  isSubmitting,
  collectionName,
}: EditCollectionStickyHeaderProps) {
  return (
    <FormStickyHeader
      isSticky={isSticky}
      isSubmitting={isSubmitting}
      title={collectionName ? `Edit ${collectionName}` : "Edit collection"}
      backHref="/admin/collections"
      backLabel="Back to collections"
      submitLabel="Save changes"
      submitLabelShort="Save"
      submittingLabel="Saving…"
      submitIcon="check"
      disableBackWhileSubmitting
    />
  );
}
