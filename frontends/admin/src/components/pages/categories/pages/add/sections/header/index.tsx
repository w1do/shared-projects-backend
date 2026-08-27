"use client";

import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface AddCategoryHeaderProps {
  isSubmitting: boolean;
  onAutoFill: () => void;
}

export function AddCategoryHeader({ isSubmitting, onAutoFill }: AddCategoryHeaderProps) {
  const t = useConsoleText();
  return (
    <PageHeader
      title={t("console.categories.add")}
      description={t("console.categories.add-subtitle")}
      breadcrumbItems={[
        { label: t("console.common.breadcrumb-admin"), href: "/admin" },
        { label: t("console.nav.group.catalog"), href: "/admin/products" },
        { label: t("console.nav.categories"), href: "/admin/categories" },
        { label: t("console.categories.add") },
      ]}
      actions={
        <>
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            startIcon={<Sparkles />}
            onClick={onAutoFill}
            disabled={isSubmitting}
          >
            {t("console.categories.autofill")}
          </Button>

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
