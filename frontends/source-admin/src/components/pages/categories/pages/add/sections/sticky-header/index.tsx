"use client";

import { FormStickyHeader } from "@/components/shared/layout/FormStickyHeader";
import { useConsoleText } from "@/lib/admin/use-console-text";

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
  const t = useConsoleText();
  return (
    <FormStickyHeader
      isSticky={isSticky}
      isSubmitting={isSubmitting}
      title={t("console.categories.add")}
      backHref="/admin/categories"
      backLabel={t("console.categories.back")}
      submitLabel={t("console.categories.save")}
      submitLabelShort={t("console.common.save")}
      submittingLabel={t("console.categories.saving-ellipsis")}
      submitIcon="check"
      onAutoFill={onAutoFill}
      disableBackWhileSubmitting
    />
  );
}
