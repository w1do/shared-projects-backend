"use client";

import { FormStickyHeader } from "@/components/shared/layout/FormStickyHeader";

interface AddCollectionStickyHeaderProps {
  isSticky: boolean;
  isSubmitting: boolean;
  onAutoFill: () => void;
}

export function AddCollectionStickyHeader({
  isSticky,
  isSubmitting,
  onAutoFill,
}: AddCollectionStickyHeaderProps) {
  return (
    <FormStickyHeader
      isSticky={isSticky}
      isSubmitting={isSubmitting}
      title="Create collection"
      backHref="/admin/collections"
      backLabel="Back to collections"
      submitLabel="Save collection"
      submitLabelShort="Save"
      submittingLabel="Saving…"
      submitIcon="check"
      onAutoFill={onAutoFill}
      disableBackWhileSubmitting
    />
  );
}
