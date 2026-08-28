"use client";

import { FormStickyHeader } from "@/components/shared/layout/FormStickyHeader";
import { useConsoleText } from "@/lib/admin/use-console-text";

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
  const t = useConsoleText();
  return (
    <FormStickyHeader
      isSticky={isSticky}
      isSubmitting={isSubmitting}
      title={
        categoryName
          ? t("console.categories.edit.sticky-title").replace("{name}", categoryName)
          : t("console.categories.edit.breadcrumb-plain")
      }
      backHref="/admin/categories"
      backLabel={t("console.categories.back")}
      submitLabel={t("console.categories.edit.save")}
      submitLabelShort={t("console.common.save")}
      submittingLabel={t("console.categories.saving-ellipsis")}
      submitIcon="check"
      disableBackWhileSubmitting
    />
  );
}
