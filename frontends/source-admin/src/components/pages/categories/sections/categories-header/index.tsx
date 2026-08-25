"use client";

import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { toast } from "sonner";
import type { Category } from "@/lib/admin/mocks/types";
import { exportCategoriesToPDF } from "@/lib/admin/categories/pdf/export";

interface CategoriesHeaderProps {
  categories: Category[];
}

export function CategoriesHeader({ categories }: CategoriesHeaderProps) {
  const handleExport = () => {
    if (categories.length === 0) {
      toast.error("There are no categories to export yet.");
      return;
    }

    toast.success("Generating categories taxonomy PDF report...");
    exportCategoriesToPDF(categories);
  };

  return (
    <PageHeader
      title="Categories"
      description="Structure product taxonomy, configure collection hierarchies, and track category-wise sales metrics."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Catalog", href: "/admin/products" },
        { label: "Categories" },
      ]}
      actions={
        <>
          <Button
            variant="outlined"
            shape="circle"
            startIcon={<Download className="size-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="contained"
            shape="circle"
            startIcon={<Plus className="size-4" />}
            component={Link}
            href="/admin/categories/add"
          >
            Add category
          </Button>
        </>
      }
    />
  );
}
