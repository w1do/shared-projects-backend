"use client";

import { FormStickyHeader } from "@/components/shared/layout/FormStickyHeader";

interface AddCampaignStickyHeaderProps {
  isSticky: boolean;
  isSubmitting: boolean;
  onAutoFill?: () => void;
  title?: string;
  submitLabel?: string;
}

export function AddCampaignStickyHeader({
  isSticky,
  isSubmitting,
  onAutoFill,
  title = "Create Campaign",
  submitLabel = "Launch Campaign",
}: AddCampaignStickyHeaderProps) {
  return (
    <FormStickyHeader
      isSticky={isSticky}
      isSubmitting={isSubmitting}
      title={title}
      backHref="/admin/campaigns"
      backLabel="Back to campaigns"
      submitLabel={submitLabel}
      submitLabelShort="Save"
      submittingLabel="Saving…"
      submitIcon="check"
      onAutoFill={onAutoFill}
      disableBackWhileSubmitting
    />
  );
}
