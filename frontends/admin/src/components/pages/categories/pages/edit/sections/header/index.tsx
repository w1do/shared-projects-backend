"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface EditCategoryHeaderProps {
  categoryName: string;
  isSubmitting: boolean;
}

export function EditCategoryHeader({ categoryName, isSubmitting }: EditCategoryHeaderProps) {
  const t = useConsoleText();
  return (
    <PageHeader
      title={t("console.categories.edit.title").replace("{name}", categoryName)}
      description={t("console.categories.edit.subtitle")}
      breadcrumbItems={[
        { label: t("console.common.breadcrumb-admin"), href: "/admin" },
        { label: t("console.nav.group.content"), href: "/admin/categories" },
        { label: t("console.nav.categories"), href: "/admin/categories" },
        {
          label: categoryName
            ? t("console.categories.edit.breadcrumb").replace("{name}", categoryName)
            : t("console.categories.edit.breadcrumb-plain"),
        },
      ]}
      actions={
        <>
          <Button
            type="submit"
            variant="contained"
            shape="circle"
            startIcon={<Check />}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("console.categories.saving")
              : t("console.categories.edit.save")}
          </Button>
        </>
      }
    />
  );
}
