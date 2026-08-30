"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface AddCategoryHeaderProps {
  isSubmitting: boolean;
}

export function AddCategoryHeader({ isSubmitting }: AddCategoryHeaderProps) {
  const t = useConsoleText();
  return (
    <PageHeader
      title={t("console.categories.add")}
      description={t("console.categories.add-subtitle")}
      breadcrumbItems={[
        { label: t("console.common.breadcrumb-admin"), href: "/admin" },
        { label: t("console.nav.group.content"), href: "/admin/categories" },
        { label: t("console.nav.categories"), href: "/admin/categories" },
        { label: t("console.categories.add") },
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
            {isSubmitting ? t("console.categories.saving") : t("console.categories.save")}
          </Button>
        </>
      }
    />
  );
}
