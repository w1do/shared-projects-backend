"use client";

import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { toast } from "sonner";
import type { Category } from "@/lib/admin/types/catalog";
import { exportCategoriesToPDF } from "@/lib/admin/categories/pdf/export";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface CategoriesHeaderProps {
  categories: Category[];
}

export function CategoriesHeader({ categories }: CategoriesHeaderProps) {
  const t = useConsoleText();
  const handleExport = () => {
    if (categories.length === 0) {
      toast.error(t("console.categories.export-empty"));
      return;
    }

    toast.success(t("console.categories.export-started"));
    exportCategoriesToPDF(categories);
  };

  return (
    <PageHeader
      title={t("console.nav.categories")}
      description={t("console.categories.subtitle")}
      breadcrumbItems={[
        { label: t("console.common.breadcrumb-admin"), href: "/admin" },
        { label: t("console.nav.group.content"), href: "/admin/categories" },
        { label: t("console.nav.categories") },
      ]}
      actions={
        <>
          <Button
            variant="outlined"
            shape="circle"
            startIcon={<Download className="size-4" />}
            onClick={handleExport}
          >
            {t("console.categories.export")}
          </Button>
          <Button
            variant="contained"
            shape="circle"
            startIcon={<Plus className="size-4" />}
            component={Link}
            href="/admin/categories/add"
          >
            {t("console.categories.add")}
          </Button>
        </>
      }
    />
  );
}
